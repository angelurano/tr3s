import { Link } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
} from './ui/breadcrumb';
import { SidebarTrigger } from './ui/sidebar';
import { ContactRound, HomeIcon, Settings } from 'lucide-react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Button } from './ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from './ui/navigation-menu';
import logo from '/logoipsum.svg';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeButton } from './theme/ThemeButton';
import { Notifications } from './Notifications';
import { JoinSpace } from './index/JoinSpace';

export function Header() {
  const isMobile = useIsMobile();

  return (
    <header className='border-border bg-background top-0 z-40 w-full border-b-2 p-2 shadow-sm md:p-4'>
      <div className='mb-0 flex items-center justify-between md:mb-4'>
        <div className='flex items-center gap-1 md:gap-2'>
          <SidebarTrigger className='flex-shrink-0' />
          <ThemeButton variant='noShadow' className='cursor-default' />
          <Notifications />
          <a href='https://tr3s.online' className='hidden items-center md:flex'>
            <img src={logo} alt='Logo' className='h-8' />
          </a>
          <div className='ml-1 md:hidden'>
            <Breadcrumb className='flex overflow-hidden'>
              <BreadcrumbList className='flex flex-nowrap items-center'>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to='/' className='flex items-center gap-1'>
                      <HomeIcon className='size-5 flex-shrink-0' />
                      <span className='hidden truncate sm:inline'>Inicio</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to='/friends' className='flex items-center gap-1'>
                      <ContactRound className='size-5 flex-shrink-0' />
                      <span className='hidden truncate sm:inline'>Amigos</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to='/settings' className='flex items-center gap-1'>
                      <Settings className='size-5 flex-shrink-0' />
                      <span className='hidden truncate sm:inline'>
                        Configuración
                      </span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className='flex items-center gap-1 md:gap-2'>
          <Unauthenticated>
            <SignUpButton mode='modal'>
              <Button
                variant='neutral'
                className='px-2 text-xs md:px-3 md:text-sm'
                size='sm'
              >
                Registrarse
              </Button>
            </SignUpButton>
            <SignInButton mode='modal'>
              <Button className='px-2 text-xs md:px-3 md:text-sm' size='sm'>
                Iniciar sesión
              </Button>
            </SignInButton>
          </Unauthenticated>
          <Authenticated>
            <Button variant='neutral' className='p-1'>
              <UserButton
                showName={!isMobile}
                appearance={{
                  elements: {
                    userButtonTrigger: 'text-foreground!'
                  }
                }}
              />
            </Button>
          </Authenticated>
        </div>
      </div>

      <NavigationMenu viewport className='hidden md:block'>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              asChild
            >
              <Link to='/'>
                <HomeIcon className='mb-0 mr-1 size-4 sm:mr-2' />
                <span className='text-xs sm:text-sm'>Home</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className='flex items-center'>
                <ContactRound className='mb-0 mr-1 size-4 sm:mr-2' />
                <span className='text-xs sm:text-sm'>Amigos</span>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className='grid w-[280px] gap-3 p-4 sm:w-[400px] sm:p-3 md:grid-cols-2'>
                <li>
                  <NavigationMenuLink
                    className='rounded-base hover:border-border block cursor-pointer space-y-1 border-2 border-transparent p-3 text-start'
                    asChild
                  >
                    <Link to='/friends'>
                      <div className='text-sm font-bold leading-none'>
                        Lista de amigos
                      </div>
                      <p className='text-foreground/70 text-sm leading-snug'>
                        Ver y gestionar tus amigos
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <JoinSpace>
                      <button className='rounded-base hover:border-border block cursor-pointer space-y-1 border-2 border-transparent p-3 text-start'>
                        <div className='text-sm font-bold leading-none'>
                          Espacio de amigo
                        </div>
                        <p className='text-foreground/70 text-sm leading-snug'>
                          Únete a un espacio con código
                        </p>
                      </button>
                    </JoinSpace>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem className='ml-auto'>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              asChild
            >
              <Link to='/settings'>
                <Settings className='mb-0 mr-1 size-4 sm:mr-2' />
                <span className='text-xs sm:text-sm'>Configuración</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
