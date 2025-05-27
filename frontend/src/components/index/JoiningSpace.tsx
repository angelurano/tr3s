import { useQuery, useMutation } from 'convex/react';
import { api } from '@server/_generated/api';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '../ui/button';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay
} from '../ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { ConvexError } from 'convex/values';
import { LoadingDialog } from '../LoadingDialog';

interface JoiningSpaceProps {
  spaceId: string;
  setSpaceJoining?: React.Dispatch<React.SetStateAction<string | null>>;
}

export function JoiningSpace({ spaceId, setSpaceJoining }: JoiningSpaceProps) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false);
        navigate({ to: '/', replace: true });
        setSpaceJoining?.(null);
      }}
    >
      <DialogOverlay />
      <DialogContent>
        <ErrorBoundary FallbackComponent={JoiningSpaceFallback}>
          <JoiningSpaceContent spaceId={spaceId} />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

interface JoiningSpaceContentProps {
  spaceId: string;
}

function JoiningSpaceContent({ spaceId }: JoiningSpaceContentProps) {
  const status = useQuery(api.spaces.getSpaceAccess, { spaceId });

  if (status === undefined) return <LoadingDialog />;

  if (status.canAccess) {
    return <AcceptedSpaceDialog spaceId={spaceId} />;
  }

  if (status.status === 'space_not_found') {
    return <SpaceNotFound />;
  } else if (status.status === 'not_related') {
    return <NotRelatedSpace spaceId={spaceId} />;
  } else if (status.status === 'pending') {
    return <PendingSpace spaceId={spaceId} lastUpdated={status.lastUpdated} />;
  } else if (status.status === 'rejected') {
    return <RejectedSpace spaceId={spaceId} lastUpdated={status.lastUpdated} />;
  }
  return <UnexpectedState />;
}

// TODO: use this component in CreateSpace when redirect
function AcceptedSpaceDialog({ spaceId }: { spaceId: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!spaceId) return;

    const timeoutId = setTimeout(() => {
      navigate({
        to: '/spaces/$spaceId',
        params: { spaceId }
      });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [navigate, spaceId]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <CheckCircle className='h-5 w-5 text-green-500' />
          Ya eres miembro
        </DialogTitle>
        <DialogDescription className='mb-2 space-y-2'>
          <span className='block'>En breve, serás redirigido ...</span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='neutral' className='cursor-pointer'>
            No redirigir
          </Button>
        </DialogClose>
        <Button asChild>
          <Link to='/spaces/$spaceId' params={{ spaceId }}>
            Ir al espacio ya
          </Link>
        </Button>
      </DialogFooter>
    </>
  );
}

function SpaceNotFound() {
  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <AlertCircle className='h-5 w-5 text-red-500' />
          Espacio no encontrado
        </DialogTitle>
        <DialogDescription className='space-y-2'>
          <span className='block text-gray-500'>
            El espacio solicitado no existe o no esta disponible
          </span>
          <span className='block'>
            El espacio al que intentas acceder no existe, ha sido eliminado o no
            esta disponible
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button>Volver al inicio</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

function NotRelatedSpace({ spaceId }: { spaceId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const sendJoinRequest = useMutation(api.spacesUsers.requestJoinSpace);

  const handleJoinRequest = async () => {
    setStatus('loading');
    try {
      await sendJoinRequest({ spaceId });
    } catch (error) {
      // TODO
      console.error('Error al enviar solicitud:', error);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Unirse al espacio</DialogTitle>
        <DialogDescription>
          <span className='mb-4 block text-gray-500'>
            Envía una solicitud para unirte a este espacio
          </span>
          <span className='block'>
            Para colaborar en este espacio, necesitas enviar una solicitud de
            acceso al propietario.
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='neutral' disabled={status === 'loading'}>
            Cerrar
          </Button>
        </DialogClose>
        <Button onClick={handleJoinRequest} disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Enviando solicitud...
            </>
          ) : (
            'Enviar solicitud para unirse'
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

function PendingSpace({
  spaceId,
  lastUpdated
}: {
  spaceId: string;
  lastUpdated?: number;
}) {
  // TODO: use query to get status
  const [isCanceling, setIsCanceling] = useState(false);
  const cancelRequest = useMutation(api.spaces.cancelJoinRequest);

  const timeAgo = lastUpdated
    ? new Date(lastUpdated).toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : 'recientemente';

  const handleCancelRequest = async () => {
    setIsCanceling(true);
    try {
      await cancelRequest({ spaceId });
    } catch (error) {
      // TODO
      console.error('Error al cancelar solicitud:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <Clock className='h-5 w-5 text-amber-500' />
          Solicitud pendiente
        </DialogTitle>
        <DialogDescription className='space-y-2'>
          <span className='block text-gray-500'>
            Tu solicitud está siendo revisada
          </span>
          <span className='block'>
            Has enviado una solicitud para unirte a este espacio {timeAgo}.
          </span>
          <span className='block'>
            Espera a que el propietario del espacio apruebe tu solicitud.
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Loader2 className='my-auto mr-2 h-6 w-6 animate-spin text-gray-500' />
        <Button
          variant='neutral'
          onClick={handleCancelRequest}
          disabled={isCanceling}
        >
          {isCanceling ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Cancelando...
            </>
          ) : (
            'Cancelar solicitud'
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

function RejectedSpace({
  spaceId,
  lastUpdated
}: {
  spaceId: string;
  lastUpdated?: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const requestJoin = useMutation(api.spacesUsers.requestJoinSpace);

  // 5 mins since last rejection
  const rejectedTime = lastUpdated ? new Date(lastUpdated) : new Date();
  const now = new Date();
  const minutesSinceRejected =
    (now.getTime() - rejectedTime.getTime()) / (1000 * 60);
  const canRequestAgain = minutesSinceRejected >= 10;

  const handleRequestAgain = async () => {
    if (!canRequestAgain) return;

    setIsLoading(true);
    try {
      await requestJoin({ spaceId });
      console.log('Nueva solicitud enviada', { spaceId });
    } catch (error) {
      console.error('Error al enviar solicitud nuevamente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <XCircle className='h-5 w-5 text-red-500' />
          Solicitud rechazada
        </DialogTitle>
        <DialogDescription>
          <span className='mb-4 block text-gray-500'>
            No puedes acceder a este espacio
          </span>
          <span className='mb-2 block'>
            Tu solicitud para unirte a este espacio ha sido rechazada.
          </span>
          {!canRequestAgain ? (
            <span className='block text-amber-600'>
              Debes esperar antes de enviar una nueva solicitud.
            </span>
          ) : (
            <span className='block'>
              Puedes volver a enviar una solicitud si lo deseas.
            </span>
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='neutral' disabled={isLoading}>
            Cerrar
          </Button>
        </DialogClose>
        <Button
          onClick={handleRequestAgain}
          disabled={isLoading || !canRequestAgain}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Enviando solicitud...
            </>
          ) : (
            'Volver a solicitar acceso'
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

function UnexpectedState() {
  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <AlertCircle className='h-5 w-5 text-amber-500' />
          Estado desconocido
        </DialogTitle>
        <DialogDescription className='space-y-2'>
          <span className='block text-gray-500'>
            No se puede determinar tu relación con este espacio
          </span>
          <span className='block'>
            Ha ocurrido un error al determinar tu relación con este espacio. Por
            favor, inténtalo de nuevo más tarde.
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='neutral' className='cursor-pointer'>
            Volver al inicio
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

function JoiningSpaceFallback({
  error
  // resetErrorBoundary
}:  {
  error: Error;
  // resetErrorBoundary: () => void;
}) {
  const errorMessage =
    error instanceof ConvexError ? (error.data as string) : error.message;

  if (errorMessage === 'Space not found') {
    return <SpaceNotFound />;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className='mb-2 flex items-center justify-center gap-2'>
          <AlertCircle className='h-5 w-5 text-red-500' />
          <h2 className='text-lg font-semibold'>Error inesperado</h2>
        </DialogTitle>
        <DialogDescription className='space-y-2'>
          <span className='block text-gray-500'>Ha ocurrido un error</span>
          <span className='block'>Error: {error.name}</span>
          <span className='block'>Por favor, intenta de nuevo más tarde.</span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='neutral' className='cursor-pointer'>
            Volver al inicio
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
