import { ChevronRight, UsersRound } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '../ui/sidebar';
import { JoinSpace } from '../index/JoinSpace';
import { useMatch } from '@tanstack/react-router';

export function SidebarFriendSpaces() {
  const match = useMatch({ from: '/spaces/$spaceId', shouldThrow: false });

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

            {match && (
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  {
                    // TODO: Modal to invite friends, show link and code: match.params.spaceId
                  }
                  <span className='cursor-pointer'>Invitar amigos</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
