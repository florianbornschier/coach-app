'use client';

import * as React from 'react';
import {
  BookmarkCheckIcon,
  Cog,
  Command,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  UsersIcon,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavCommunity } from '@/components/nav-community';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import Logo from './Logo';
import { NavOffers } from './nav-offers';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: LayoutDashboard,
      isActive: true,
    },
  ],
  offers: [
    {
      title: 'Find Offers',
      url: '#',
      icon: FileBadge,
    },
    {
      title: 'Saved Offers',
      url: '#',
      icon: BookmarkCheckIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: Cog,
    },
  ],
  community: [
    {
      title: 'Community',
      url: '#',
      icon: UsersIcon,
    },
    {
      title: 'Training',
      url: '#',
      icon: GraduationCap,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant='inset'
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              asChild
            >
              <Link href='#'>
                {/* Logo */}
                <Logo />
                {/* <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Acme Inc</span>
                  <span className='truncate text-xs'>Enterprise</span>
                </div> */}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavOffers offers={data.offers} />
        <NavCommunity community={data.community} />
        <NavSecondary
          items={data.navSecondary}
          className='mt-auto'
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
