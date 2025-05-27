import { Link } from '@tanstack/react-router';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';
import { HomeIcon, LogOut, Settings, UserRoundCog } from 'lucide-react';

import logo from '../../../../../../../../../../../logoipsum.svg';
import { SidebarUserSpaces } from './SidebarUserSpaces';
import { SidebarFriendSpaces } from './SidebarFriendSpaces';

export function PlatformNavigation() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to='/'>
                <HomeIcon className='size-5 flex-shrink-0' />
                <span>Inicio Aplicación</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href='https://tr3s.online'>
                <div className='flex w-full items-center gap-3'>
                  <img src={logo} alt='Logo' className='w-5 flex-shrink-0' />
                  <span>Inicio Web</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function SpacesSection() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Espacios</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarUserSpaces />
          <SidebarFriendSpaces />
          <SidebarLeaveSpace />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SidebarLeaveSpace() {
  const isInSpace = false;

  if (!isInSpace) return null;

  const handleLeaveSpace = () => {
    console.log('Abandonar espacio');
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild onClick={handleLeaveSpace}>
        <Link to='/'>
          <LogOut />
          <span>Abandonar Espacio</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function SettingsSection() {
  const handleAccountSettings = () => {
    console.log('Configuración de cuenta');
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Configuración</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to='/settings'>
                <Settings className='size-5 flex-shrink-0' />
                <span>Configuración de la App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={handleAccountSettings}>
              <button className='w-full cursor-pointer'>
                <UserRoundCog className='size-5 flex-shrink-0' />
                <span>Configuración de la cuenta</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
