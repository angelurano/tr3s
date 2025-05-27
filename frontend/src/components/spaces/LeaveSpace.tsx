import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '@server/_generated/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';

interface LeaveSpaceDialogProps {
  spaceId: string;
  children: React.ReactNode;
}

export function LeaveSpace({ spaceId }: { spaceId: string }) {
  return (
    <LeaveSpaceDialog spaceId={spaceId}>
      <Button
        variant='noShadow'
        className='flex size-7 rotate-180 cursor-pointer p-0'
      >
        <LogOut className='size-full' />
      </Button>
    </LeaveSpaceDialog>
  );
}

export function LeaveSpaceDialog({ spaceId, children }: LeaveSpaceDialogProps) {
  const navigate = useNavigate();
  const leaveSpace = useMutation(api.spaces.leaveSpace);
  const [isLeaving, setIsLeaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLeaveSpace = async () => {
    if (!spaceId || isLeaving) return;

    setIsLeaving(true);
    try {
      const result = await leaveSpace({ spaceId });

      if (result.wasOwner) {
        toast.info('Espacio desactivado al abandonar');
      } else {
        toast.success('Has abandonado el espacio');
      }

      setOpen(false);
      navigate({ to: '/' });
    } catch (error) {
      console.error('Error al abandonar el espacio:', error);
      toast.error('Error al abandonar el espacio');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Abandonar el espacio?</DialogTitle>
          <DialogDescription>
            Esta acción eliminará tu presencia del espacio. Si eres el
            propietario, el espacio será desactivado temporalmente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='neutral'
            onClick={() => setOpen(false)}
            disabled={isLeaving}
          >
            Cancelar
          </Button>
          <Button
            variant='default'
            onClick={handleLeaveSpace}
            disabled={isLeaving}
          >
            {isLeaving ? 'Abandonando...' : 'Abandonar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/*
export function SidebarLeaveSpace({ spaceId }) {

  if (!spaceId) return null;

  return (
    <LeaveSpaceDialog spaceId={spaceId}>
      <button className='flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
        <LogOut className='size-4' />
        <span>Abandonar Espacio</span>
      </button>
    </LeaveSpaceDialog>
  );
}
*/
