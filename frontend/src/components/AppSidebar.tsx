import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar';
import { SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Link } from '@tanstack/react-router';
import logo from '/logoipsum.svg';
import { Skeleton } from './ui/skeleton';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip
} from './ui/tooltip';
import {
  LayoutDashboard,
  ChevronRight,
  Plus,
  UsersRound,
  HomeIcon,
  LogOut,
  Settings,
  UserRoundCog
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from './ui/collapsible';
import type { ComponentPropsWithoutRef } from 'react';
import { JoinSpace } from './index/JoinSpace';
import CreateSpace from './index/CreateSpace';

// Interfaces para las props
interface SidebarLogoProps {
  isMobile: boolean;
  isCollapsed: boolean;
}

interface UserFooterProps {
  isCollapsed: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

interface SpaceItem {
  id: string;
  name: string;
}

// Componente principal del sidebar
export function AppSidebar({
  variant = 'sidebar',
  ...props
}: ComponentPropsWithoutRef<typeof Sidebar>) {
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

// Componente del logo/header del sidebar
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

// Componente de navegación de la plataforma
function PlatformNavigation() {
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

// Componente para los espacios del usuario
function UserSpaces() {
  // Simulamos espacios de ejemplo (esto se reemplazaría con datos reales de la API)
  const userSpaces: SpaceItem[] = [
    { id: 'space1', name: 'Example 1' },
    { id: 'space2', name: 'Example 2' }
  ];

  const handleCreateSpace = () => {
    // Implementar lógica para crear un espacio
    console.log('Crear espacio');
    // Aquí podrías abrir el dashboard si está cerrado
  };

  const handleSpaceClick = (spaceId: string) => {
    // Implementar lógica para preguntar al usuario si desea ir al espacio
    console.log(`¿Quieres ir al espacio ${spaceId}?`);
  };

  return (
    <Collapsible asChild className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className='data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground cursor-pointer'>
            <LayoutDashboard className='size-5 flex-shrink-0' />
            <span>Tus espacios</span>
            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className='py-1'>
            <Authenticated>
              {userSpaces.length > 0 ? (
                <>
                  {userSpaces.map((space) => (
                    <SidebarMenuSubItem key={space.id}>
                      <SidebarMenuSubButton
                        asChild
                        onClick={() => handleSpaceClick(space.id)}
                      >
                        {/* TODO: Button to open modal to open space */}
                        <Link to={`/spaces/${space.id}`}>
                          <span>{space.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}

                  {userSpaces.length < 3 && (
                    <SidebarMenuSubItem>
                      <CreateSpace>
                        <SidebarMenuSubButton asChild>
                          <button
                            className='w-full cursor-pointer'
                            onClick={handleCreateSpace}
                          >
                            <Plus className='size-5 flex-shrink-0' />
                            <span>Crea un espacio</span>
                          </button>
                        </SidebarMenuSubButton>
                      </CreateSpace>
                    </SidebarMenuSubItem>
                  )}
                </>
              ) : (
                // Si no tiene espacios, mostrar sólo el botón para crear uno
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <button
                      className='w-full cursor-pointer'
                      onClick={handleCreateSpace}
                    >
                      <Plus className='size-5 flex-shrink-0' />
                      <span>Crea tu primer espacio</span>
                    </button>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}
            </Authenticated>
            <Unauthenticated>
              <SidebarMenuSubItem>
                <SignUpButton mode='modal'>
                  <SidebarMenuSubButton asChild>
                    <div className='flex cursor-pointer'>
                      <Plus className='size-5 flex-shrink-0' />
                      <span>Crea tu primer espacio</span>
                    </div>
                  </SidebarMenuSubButton>
                </SignUpButton>
              </SidebarMenuSubItem>
            </Unauthenticated>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// Componente para los espacios compartidos con amigos
function FriendSpaces() {
  // Variable que determina si el usuario está en un espacio actualmente
  const isInSpace = false; // Cambiar a true cuando esté en un espacio

  const handleInviteFriends = () => {
    // Implementar lógica para invitar amigos
    console.log('Invitar amigos');
    // Aquí se abriría el modal para compartir el código
  };

  return (
    <Collapsible asChild className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className='data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground cursor-pointer'>
            <UsersRound className='size-5 flex-shrink-0' />
            <span>Espacios con amigos</span>
            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className='py-1'>
            <SidebarMenuSubItem>
              <JoinSpace>
                <SidebarMenuSubButton asChild>
                  <span className='cursor-pointer'>Código del Espacio</span>
                </SidebarMenuSubButton>
              </JoinSpace>
            </SidebarMenuSubItem>

            {/* Opción para invitar amigos, solo visible si el usuario está en un espacio */}
            {isInSpace && (
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild onClick={handleInviteFriends}>
                  <Link to='/spaces'>
                    <span>Invitar al espacio</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
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

// Componente para la sección de configuración
function SettingsSection() {
  const handleAccountSettings = () => {
    // Implementar la lógica para abrir la configuración de la cuenta
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

// Componente para el footer con el botón de usuario
function UserFooter({ isCollapsed, isMobile, toggleSidebar }: UserFooterProps) {
  return (
    <SidebarFooter className='min-h-16 justify-center'>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' className='flex w-full'>
            <Authenticated>
              <UserButton
                showName={!isCollapsed}
                appearance={{
                  elements: {
                    rootBox: 'flex flex-1 h-full',
                    userButtonOuterIdentifier: 'order-1',
                    userButtonTrigger: 'text-foreground! flex-1'
                  }
                }}
              />
            </Authenticated>
            <Unauthenticated>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SignInButton mode='modal'>
                      <div
                        className='space-between flex w-full cursor-pointer items-center gap-3'
                        onClick={() => {
                          if (isMobile) toggleSidebar();
                        }}
                      >
                        <Skeleton className='h-8 min-w-8 animate-none rounded-full' />
                        <Skeleton
                          className={`h-4 flex-1 animate-none ${isCollapsed ? 'hidden' : ''}`}
                        />
                      </div>
                    </SignInButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Inicie sesión</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Unauthenticated>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

// Componente principal para la sección de espacios
function SpacesSection() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Espacios</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <UserSpaces />
          <FriendSpaces />
          <SidebarLeaveSpace />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
