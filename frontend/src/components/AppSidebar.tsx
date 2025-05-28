import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import logo from '/logoipsum.svg';
import type { ComponentPropsWithoutRef } from 'react';
import { UserFooter } from './sidebar/SidebarFooter';
import {
  PlatformNavigation,
  SettingsSection,
  SpacesSection
} from './sidebar/SidebarContent';

type AppSidebarProps = ComponentPropsWithoutRef<typeof Sidebar>;

export function AppSidebar({ variant = 'sidebar', ...props }: AppSidebarProps) {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible='icon' variant={variant} {...props}>
      <SidebarLogo isMobile={isMobile} isCollapsed={isCollapsed} />
      <SidebarContent>
        <PlatformNavigation />
        <SpacesSection />
        <SettingsSection />
      </SidebarContent>
      <UserFooter
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
      />
    </Sidebar>
  );
}

interface SidebarLogoProps {
  isMobile: boolean;
  isCollapsed: boolean;
}

function SidebarLogo({ isMobile, isCollapsed }: SidebarLogoProps) {
  return (
    <SidebarHeader className='py-4'>
      <SidebarMenu>
        <SidebarMenuItem>
          <a
            href='https://tr3s.online'
            className='align-center flex justify-center text-xl font-semibold'
          >
            {isMobile && <img src={logo} alt='Logo' className='mr-2 h-6' />}
            <span className={`${isCollapsed ? 'hidden' : 'inline-block'}`}>
              tr
            </span>
            <span>3</span>
            <span className={`${isCollapsed ? 'hidden' : 'inline-block'}`}>
              s
            </span>
          </a>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
