'use server';

import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { z } from 'zod';

const loginSchema = z.object({
  credential: z.string(),
  password: z.string(),
});

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string(),
  password_confirmation: z.string(),
});

export async function loginAction(formData: unknown, loginType: 'user' | 'admin' = 'user') {
  const validated = loginSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Invalid form data' };
  }

  const { credential, password } = validated.data;

  try {
    await signIn('credentials', {
      credential,
      password,
      loginType,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials!' };
        default:
          return { error: 'Something went wrong!' };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}

export async function registerAction(formData: unknown) {
  const validated = registerSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, name, phone, password_confirmation } =
    validated.data;

  if (password !== password_confirmation) {
    return { error: 'Passwords do not match!' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone: phone || undefined }],
    },
  });

  if (existingUser) {
    return { error: 'Email or phone already in use!' };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
    },
  });

  // Automatically sign in the user after registration
  try {
    await signIn('credentials', {
      credential: email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Account created, but failed to sign in automatically.' };
    }
    throw error;
  }
}

export async function forgotPasswordAction(formData: unknown) {
  const validated = z.object({ email: z.string().email() }).safeParse(formData);
  if (!validated.success) {
    return { error: 'Invalid email address' };
  }

  const { email } = validated.data;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { success: true };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete any existing OTPs for this email
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    // Create new OTP with 15-minute expiration
    await prisma.passwordReset.create({
      data: {
        email,
        otpHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send email
    const { sendPasswordResetEmail } = await import('@/lib/email');
    await sendPasswordResetEmail(email, otp);

    return { success: true };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { error: 'Failed to send reset email. Please try again.' };
  }
}

export async function resendOtpAction(formData: { email: string }) {
  const { email } = formData;

  try {
    // Check rate limit - last OTP must be at least 60 seconds old
    const lastOtp = await prisma.passwordReset.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const timeSinceLastOtp = Date.now() - lastOtp.createdAt.getTime();
      if (timeSinceLastOtp < 60000) {
        const remainingSeconds = Math.ceil((60000 - timeSinceLastOtp) / 1000);
        return {
          error: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
        };
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete old OTPs
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    // Create new OTP
    await prisma.passwordReset.create({
      data: {
        email,
        otpHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Send email
    const { sendPasswordResetEmail } = await import('@/lib/email');
    await sendPasswordResetEmail(email, otp);

    return { success: true };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { error: 'Failed to resend OTP. Please try again.' };
  }
}

export async function resetPasswordAction(formData: unknown) {
  const validated = z
    .object({
      email: z.string().email(),
      otp: z.string().length(6),
      password: z.string().min(8),
      password_confirmation: z.string(),
    })
    .safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid form data' };
  }

  const { email, otp, password, password_confirmation } = validated.data;

  if (password !== password_confirmation) {
    return { error: 'Passwords do not match' };
  }

  try {
    // Find non-expired OTP
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        email,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!passwordReset) {
      return { error: 'Invalid or expired OTP' };
    }

    // Verify OTP
    const otpMatches = await bcrypt.compare(otp, passwordReset.otpHash);
    if (!otpMatches) {
      return { error: 'Invalid OTP' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete used OTP
    await prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    // Auto sign-in user
    try {
      await signIn('credentials', {
        credential: email,
        password,
        redirect: false,
      });
      return { success: true };
    } catch (error) {
      // Password was reset successfully, but auto sign-in failed
      return { success: true };
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Failed to reset password. Please try again.' };
  }
}
