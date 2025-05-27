import { Authenticated, Unauthenticated } from 'convex/react';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';
import { SignInButton, UserButton } from '@clerk/clerk-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';

interface UserFooterProps {
  isCollapsed: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export function UserFooter({
  isCollapsed,
  isMobile,
  toggleSidebar
}: UserFooterProps) {
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
