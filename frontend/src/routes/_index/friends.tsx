import { createFileRoute } from '@tanstack/react-router';
import { api } from '@server/_generated/api';
import { useQuery, Authenticated, Unauthenticated } from 'convex/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Search } from 'lucide-react';
import { JoinSpace } from '@/components/index/JoinSpace';
import type { AcceptedFriendsRelations } from '@server/friends';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_index/friends')({
  component: FriendsComponent
});

function FriendsComponent() {
  return (
    <div className='relative flex h-full w-full items-center justify-center'>
      <div className='flex h-full flex-col justify-center space-y-3 px-2 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='space-y-3 px-2'>
              <h1 className='text-2xl'>Mis Amigos</h1>
              <p className='text-muted-foreground'>
                Conecta y gestiona tus amistades
              </p>
            </div>
          </div>
          <JoinSpace>
            <Button className='flex items-center gap-2'>
              <Search className='h-4 w-4' />
              Unirse a Espacio
            </Button>
          </JoinSpace>
        </div>

        <Authenticated>
          <FriendsAuthenticated />
        </Authenticated>
        <Unauthenticated>
          <FriendsGrid />
        </Unauthenticated>
      </div>
    </div>
  );
}

function FriendsAuthenticated() {
  const friendsData: AcceptedFriendsRelations | undefined = useQuery(
    api.friends.getFriendships
  );

  if (!friendsData) {
    return <Skeleton className='h-10/11 w-full' />;
  }

  return <FriendsGrid friendsData={friendsData} />;
}

function FriendsGrid({
  friendsData
}: {
  friendsData?: AcceptedFriendsRelations;
}) {
  const friends = friendsData?.friends || [];

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      <div className='order-2 md:order-1 md:col-span-2 md:row-span-2'>
        <FriendsList friends={friends} />
      </div>

      <div className='order-1 md:order-2'>
        <TotalFriendsCard friends={friends} />
      </div>

      <div className='order-1 md:order-3'>
        <NewConnectionsCard friends={friends} />
      </div>
    </div>
  );
}

interface FriendsListProps {
  friends: AcceptedFriendsRelations['friends'];
}

function FriendsList({ friends }: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <Card className='h-full p-8'>
        <div className='space-y-4 text-center'>
          <div className='bg-secondary-background mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Users className='text-foreground/40 h-8 w-8' />
          </div>
          <div>
            <h3 className='text-foreground text-lg font-semibold'>
              No tienes amigos aún
            </h3>
            <p className='text-foreground/60'>
              Comienza a conectar con otras personas para ver tus amigos aquí
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className='h-full p-6'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-foreground text-xl font-semibold'>
          Lista de Amigos ({friends.length})
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {friends.map((friendship) => (
            <FriendCard
              key={friendship._id}
              friend={friendship.friend}
              lastUpdated={friendship.lastUpdated}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface FriendCardProps {
  friend: {
    _id: string;
    name: string;
    username: string;
    imageUrl: string;
  };
  lastUpdated: number;
}

function FriendCard({ friend, lastUpdated }: FriendCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    return `Hace ${Math.floor(days / 30)} meses`;
  };

  const isRecent = Date.now() - lastUpdated < 24 * 60 * 60 * 1000;

  return (
    <div className='border-border/50 hover:bg-secondary-background/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors'>
      <div className='relative'>
        <Avatar className='h-10 w-10'>
          <AvatarImage
            src={friend.imageUrl}
            alt={friend.name}
            className='object-cover'
          />
          <AvatarFallback className='bg-main/10 text-main text-sm font-medium'>
            {getInitials(friend.name)}
          </AvatarFallback>
        </Avatar>
        <div className='border-background absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 bg-emerald-500'></div>
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <h3 className='text-foreground truncate text-sm font-medium'>
            {friend.name}
          </h3>
          {isRecent && (
            <Badge
              variant='neutral'
              className='bg-emerald-100 text-xs text-emerald-700'
            >
              Nuevo
            </Badge>
          )}
        </div>
        <p className='text-foreground/60 truncate text-xs'>
          @{friend.username}
        </p>
        <p className='text-foreground/40 text-xs'>
          {formatRelativeTime(lastUpdated)}
        </p>
      </div>
    </div>
  );
}

interface FriendsStatsProps {
  friends: AcceptedFriendsRelations['friends'];
}

function TotalFriendsCard({ friends }: FriendsStatsProps) {
  return (
    <Card className='h-full'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Users className='text-main h-5 w-5' />
          Total de Amigos
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='text-main text-2xl font-bold'>{friends.length}</div>
        <p className='text-foreground/60 text-sm'>amigos conectados</p>
      </CardContent>
    </Card>
  );
}

function NewConnectionsCard({ friends }: FriendsStatsProps) {
  const newFriendsCount = friends.filter((f) => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return f.lastUpdated > dayAgo;
  }).length;

  return (
    <Card className='h-full'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <UserPlus className='h-5 w-5 text-emerald-600' />
          Nuevas Conexiones
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='text-2xl font-bold text-emerald-600'>
          {newFriendsCount}
        </div>
        <p className='text-foreground/60 text-sm'>en las últimas 24h</p>
        <Badge
          variant={friends.length > 0 ? 'default' : 'neutral'}
          className={
            friends.length > 0
              ? 'mt-2 border-emerald-200 bg-emerald-100 text-emerald-700'
              : 'mt-2'
          }
        >
          {friends.length > 0 ? 'Conectado' : 'Sin amigos'}
        </Badge>
      </CardContent>
    </Card>
  );
}
