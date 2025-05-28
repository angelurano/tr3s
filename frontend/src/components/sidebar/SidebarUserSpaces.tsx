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
import { ChevronRight, LayoutDashboard, Plus } from 'lucide-react';
import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { Link, useMatch } from '@tanstack/react-router';
import CreateSpace from '../index/CreateSpace';
import { SignUpButton } from '@clerk/clerk-react';
import { api } from '@server/_generated/api';
import { getURLImagePicsum } from '@/lib/utils';

export function SidebarUserSpaces() {
  return (
    <>
      <Authenticated>
        <AuthenticatedUserSpaces />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedUserSpaces />
      </Unauthenticated>
    </>
  );
}

function UnauthenticatedUserSpaces() {
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
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function AuthenticatedUserSpaces() {
  const userSpaces = useQuery(api.spaces.getCurrentUserSpaces) || [];
  const match = useMatch({ from: '/spaces/$spaceId', shouldThrow: false });

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
            {userSpaces.map((space) => (
              <SidebarMenuSubItem key={space._id}>
                <SidebarMenuSubButton asChild>
                  <Link
                    to='/spaces/$spaceId'
                    params={{ spaceId: space._id }}
                    disabled={match?.params.spaceId === space._id}
                  >
                    {space.imagePicsumId === -1 ? (
                      <div className='bg-background size-5 flex-shrink-0 rounded-sm border bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:6px_6px] bg-center' />
                    ) : (
                      <img
                        src={getURLImagePicsum(space.imagePicsumId, 50, 50)}
                        alt={space.title}
                        className='bg-background size-5 flex-shrink-0 overflow-hidden rounded-sm border bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:6px_6px] bg-center'
                      />
                    )}
                    <span>{space.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}

            {userSpaces.length < 3 && (
              <SidebarMenuSubItem>
                <CreateSpace>
                  <SidebarMenuSubButton asChild>
                    <button className='w-full cursor-pointer'>
                      <Plus className='size-5 flex-shrink-0' />
                      <span>Crea un espacio</span>
                    </button>
                  </SidebarMenuSubButton>
                </CreateSpace>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
