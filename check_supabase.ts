import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkConnections() {
    console.log('--- Checking Supabase Connections ---\n');

    // 1. Check Database (via Prisma)
    try {
        console.log('1. Testing Database Connection...');
        const userCount = await prisma.user.count();
        const coachCount = await prisma.coachProfile.count();
        console.log('✅ Database Connected Successfully!');
        console.log(`   - Total Users: ${userCount}`);
        console.log(`   - Total Coaches: ${coachCount}\n`);
    } catch (error) {
        console.error('❌ Database Connection Failed:');
        console.error(error.message, '\n');
    }

    // 2. Check Storage (via Supabase JS)
    try {
        console.log('2. Testing Storage Configuration...');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            throw error;
        }

        console.log('✅ Storage connected!');
        console.log('   Available Buckets:', buckets.map(b => b.name).join(', ') || 'None');

        const profileBucket = buckets.find(b => b.name === 'profile-pictures');
        if (profileBucket) {
            console.log('   ✅ "profile-pictures" bucket exists.');
        } else {
            console.log('   ⚠️  "profile-pictures" bucket NOT found. You may need to create it for scraping to work.');
        }
        console.log('');
    } catch (error) {
        console.error('❌ Storage Connection Failed:');
        console.error(error.message, '\n');
    } finally {
        await prisma.$disconnect();
    }
}

checkConnections();
