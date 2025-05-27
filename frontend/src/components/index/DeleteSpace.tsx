import type { ReactNode } from 'react';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@server/_generated/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteSpaceProps {
  children: ReactNode;
  spaceId: string;
  spaceTitle?: string;
}

export default function DeleteSpace({
  children,
  spaceId,
  spaceTitle = 'el espacio'
}: DeleteSpaceProps) {
  const [open, setOpen] = useState(false);
  const deleteSpace = useMutation(api.spaces.deleteSpace);

  const handleDelete = async () => {
    // TODO: Show toast sonner
    try {
      await deleteSpace({ spaceId });
      toast.success('Espacio eliminado correctamente', {
        description: `El espacio "${spaceTitle}" ha sido eliminado permanentemente.`
      });
      setOpen(false);
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Error al eliminar el espacio', {
        description: 'No se pudo eliminar el espacio. Inténtalo de nuevo.'
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            espacio "{spaceTitle}" y todos sus datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-secondary-background text-foreground/50 shadow-0 translate-x-boxShadowX translate-y-boxShadowY hover:text-foreground duration-400 cursor-pointer transition-colors'
          >
            Eliminar
          </AlertDialogAction>
          <AlertDialogCancel className='bg-main'>Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
