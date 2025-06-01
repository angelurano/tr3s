// import { useQuery, Unauthenticated, Authenticated } from 'convex/react';
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
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  usePaginatedQuery
} from 'convex/react';
import { api } from '@server/_generated/api';
import { SignInButton } from '@clerk/clerk-react';
import type { Doc } from '@server/_generated/dataModel';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

export function Notifications() {
  return (
    <DropdownMenu>
      <Unauthenticated>
        <UnauthenticatedNotifications />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedNotification />
      </Authenticated>
    </DropdownMenu>
  );
}

function UnauthenticatedNotifications() {
  return (
    <>
      <DropdownMenuTrigger asChild>
        <Button
          variant='noShadow'
          className={
            'after:border-main-foreground relative flex size-7 cursor-default p-0 after:absolute after:bottom-[78%] after:left-[78%] after:size-2 after:rounded-full after:border-2 after:bg-red-500 after:content-[""]'
          }
        >
          <Bell className='size-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <SignInButton mode='modal'>
            <DropdownMenuItem className='cursor-pointer'>
              Inicia sesión o regístrate
            </DropdownMenuItem>
          </SignInButton>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}

function AuthenticatedNotification() {
  const { results /*, status, loadMore */ } = usePaginatedQuery(
    api.notification.getUserNotifications,
    {},
    { initialNumItems: 7 }
  );

  const notificationsUnRead = results?.filter(
    (notification) => !notification.read
  );
  return (
    <>
      <DropdownMenuTrigger asChild>
        <Button
          variant='noShadow'
          className={`relative flex size-7 cursor-default p-0 ${
            notificationsUnRead !== undefined && notificationsUnRead.length > 0
              ? 'after:border-main-foreground after:absolute after:bottom-[78%] after:left-[78%] after:size-2 after:rounded-full after:border-2 after:bg-red-500 after:content-[""]'
              : ''
          }`}
        >
          <Bell className='size-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className='space-y-1'>
          <NotificationsList
            notifications={results}
            // status={status}
            // loadMore={loadMore}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}

function NotificationsList({
  notifications
}: {
  notifications: Doc<'notifications'>[] | undefined;
}) {
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
  return (
    <>
      {notifications.map((notification, index) => (
        <Notification key={index} notification={notification} />
      ))}
    </>
  );
}

export type SpaceRequestNotification = Doc<'notifications'> & {
  payload: {
    type: 'spaceRequest';
    data: {
      spaceId: string;
      userId: string;
    };
  };
};
export type FriendRequestNotification = Doc<'notifications'> & {
  payload: {
    type: 'friendRequest';
    data: {
      friendshipId: string;
      fromId: string;
    };
  };
};
function Notification({
  notification
}: {
  notification: Doc<'notifications'>;
}) {
  if (notification.payload === undefined) {
    return <NotificationDefault notification={notification} />;
  }

  if (notification.payload.type === 'spaceRequest') {
    return (
      <NotificationSpaceRequest
        notification={notification as SpaceRequestNotification}
      />
    );
  }

  if (notification.payload.type === 'friendRequest') {
    return (
      <NotificationFriendRequest
        notification={notification as FriendRequestNotification}
      />
    );
  }

  return <NotificationDefault notification={notification} />;
}

function NotificationDefault({
  notification
}: {
  notification: Doc<'notifications'>;
}) {
  const markAsRead = useMutation(api.notification.markAsReadNotification);

  return (
    <DropdownMenuItem
      className={`group relative cursor-pointer text-pretty text-xs ${
        notification.read ? 'bg-background/20' : ''
      }`}
      onClick={async () => {
        if (notification.read) return;
        await markAsRead({ notificationId: notification._id });
      }}
    >
      <span className='pr-2'>{notification.content}</span>
    </DropdownMenuItem>
  );
}

function NotificationSpaceRequest({
  notification
}: {
  notification: SpaceRequestNotification;
}) {
  const markAsRead = useMutation(api.notification.markAsReadNotification);
  const acceptRequest = useMutation(api.spacesUsers.acceptSpaceRequest);
  const rejectRequest = useMutation(api.spacesUsers.rejectSpaceRequest);

  const handleAccept = async () => {
    await acceptRequest({
      spaceId: notification.payload.data.spaceId,
      userId: notification.payload.data.userId
    });
    if (!notification.read)
      await markAsRead({ notificationId: notification._id });
    toast.success('Solicitud aceptada');
  };
  const handleReject = async () => {
    await rejectRequest({
      spaceId: notification.payload.data.spaceId,
      userId: notification.payload.data.userId
    });
    if (!notification.read)
      await markAsRead({ notificationId: notification._id });
    toast.success('Solicitud rechazada');
  };

  return (
    <DropdownMenuItem
      className={`group relative cursor-pointer text-pretty text-xs ${
        notification.read ? 'bg-background/20' : ''
      }`}
      onClick={async () => {
        if (!notification.read)
          await markAsRead({ notificationId: notification._id });
        toast.custom(() => (
          <div className='flex flex-col gap-1'>
            <span className='text-sm font-semibold'>
              Solicitud de acceso al espacio
            </span>
            <span className='text-xs'>{notification.content}</span>
            <div className='flex justify-end gap-2'>
              <Badge
                variant='default'
                className='cursor-pointer'
                onClick={handleReject}
              >
                Rechazar
              </Badge>
              <Badge
                variant='neutral'
                className='cursor-pointer'
                onClick={handleAccept}
              >
                Aceptar
              </Badge>
            </div>
          </div>
        ));
      }}
    >
      <span className='pr-2'>{notification.content}</span>
    </DropdownMenuItem>
  );
}

function NotificationFriendRequest({
  notification
}: {
  notification: FriendRequestNotification;
}) {
  const markAsRead = useMutation(api.notification.markAsReadNotification);
  const acceptFriend = useMutation(api.friends.acceptFriendRequest);
  const rejectFriend = useMutation(api.friends.rejectFriendRequest);

  const handleAccept = async () => {
    await acceptFriend({
      friendshipId: notification.payload.data.friendshipId
    });
    if (!notification.read)
      await markAsRead({ notificationId: notification._id });
    toast.success('Solicitud de amistad aceptada');
  };
  const handleReject = async () => {
    await rejectFriend({
      friendshipId: notification.payload.data.friendshipId
    });
    if (!notification.read)
      await markAsRead({ notificationId: notification._id });
    toast.success('Solicitud de amistad rechazada');
  };

  return (
    <DropdownMenuItem
      className={`group relative cursor-pointer text-pretty text-xs ${
        notification.read ? 'bg-background/20' : ''
      }`}
      onClick={async () => {
        if (!notification.read)
          await markAsRead({ notificationId: notification._id });
        toast.custom(() => (
          <div className='flex flex-col gap-1'>
            <span className='text-sm font-semibold'>Solicitud de amistad</span>
            <span className='text-xs'>{notification.content}</span>
            <div className='flex justify-end gap-2'>
              <Badge
                variant='default'
                className='cursor-pointer'
                onClick={handleReject}
              >
                Rechazar
              </Badge>
              <Badge
                variant='neutral'
                className='cursor-pointer'
                onClick={handleAccept}
              >
                Aceptar
              </Badge>
            </div>
          </div>
        ));
      }}
    >
      <span className='pr-2'>{notification.content}</span>
    </DropdownMenuItem>
  );
}
