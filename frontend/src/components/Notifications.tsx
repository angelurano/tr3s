// import { useQuery } from 'convex/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';

export const Notifications = () => {
  // Notifications get, apply a red dot in the icon if there are new notifications
  const notifications: undefined | string[] = [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='noShadow'
          className={`relative flex size-7 cursor-default p-0 ${
            notifications !== undefined && notifications.length > 0
              ? 'after:border-foreground after:absolute after:bottom-[78%] after:left-[78%] after:size-2 after:rounded-full after:border-2 after:bg-red-500 after:content-[""]'
              : ''
          }`}
        >
          <Bell className='size-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <NotificationsList notifications={notifications} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function NotificationsList({ notifications }: { notifications: string[] }) {
  if (notifications === undefined) {
    return (
      <DropdownMenuItem className='cursor-progress'>
        Cargando...
      </DropdownMenuItem>
    );
  }
  if (notifications.length === 0) {
    return (
      <DropdownMenuItem className='cursor-pointer'>
        No hay notificaciones
      </DropdownMenuItem>
    );
  }
  // TODO: Manage types in each notification, read: clears when user click notify, friend request,
  // TODO: change key
  return (
    <>
      {notifications.map((notification, index) => (
        <DropdownMenuItem key={index} className='cursor-pointer'>
          <span>{notification}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
}
