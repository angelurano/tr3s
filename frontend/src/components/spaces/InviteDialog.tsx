import { Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';
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
import { Label } from '../ui/label';

interface InviteDialogProps {
  spaceId: string;
  children: React.ReactNode;
}

export function InviteDialog({ spaceId, children }: InviteDialogProps) {
  const [open, setOpen] = useState(false);

  const spaceLink = `${window.location.origin}/spaces/${spaceId}`;

  const copyToClipboard = async (text: string, type: 'código' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type === 'código' ? 'Código' : 'Link'} copiado`);
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error('Error al copiar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar usuarios al espacio</DialogTitle>
          <DialogDescription>
            Comparte el código del espacio o el enlace directo para que otros
            usuarios puedan unirse.
          </DialogDescription>
        </DialogHeader>
        <div className='mb-2 space-y-1'>
          <div>
            <Label>Código del espacio</Label>
            <div className='flex gap-2'>
              <Input value={spaceId} readOnly className='flex-1 truncate' />
              <Button
                variant='default'
                size='icon'
                onClick={() => copyToClipboard(spaceId, 'código')}
              >
                <Copy className='size-4' />
              </Button>
            </div>
          </div>
          <div>
            <Label>Enlace del espacio</Label>
            <div className='flex gap-2'>
              <Input value={spaceLink} readOnly className='flex-1 truncate' />
              <Button
                className='cursor-pointer'
                variant='default'
                size='icon'
                onClick={() => copyToClipboard(spaceLink, 'link')}
              >
                <Copy className='size-4' />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='neutral'
            size='default'
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
