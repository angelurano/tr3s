import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Authenticated, Unauthenticated, useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@server/_generated/api';
import {
  createSpaceSchema,
  type CreateSpaceSchema as CreateSpaceFormValues
} from '@server/schemaShared';
import { useDebounce } from '@/hooks/useDebounce';
import { getURLImagePicsum } from '@/lib/utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingDialog } from '../LoadingDialog';
import { ImagePlus, PencilLine, RefreshCcw, Loader2 } from 'lucide-react';
import { SignInButton } from '@clerk/clerk-react';

type CreateSpaceStatus = 'idle' | 'loading' | 'error';

interface CreateSpaceProps {
  children: ReactNode;
}

export default function CreateSpace({ children }: CreateSpaceProps) {
  return (
    <>
      <Unauthenticated>
        <SignInButton mode='modal'>{children}</SignInButton>
      </Unauthenticated>
      <Authenticated>
        <CreateSpaceModal>{children}</CreateSpaceModal>
      </Authenticated>
    </>
  );
}

function CreateSpaceModal({ children }: { children: ReactNode }) {
  const createSpace = useMutation(api.spaces.createSpace);
  const [createSpaceStatus, setCreateSpaceStatus] =
    useState<CreateSpaceStatus>('idle');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(values: CreateSpaceFormValues) {
    setCreateSpaceStatus('loading');
    try {
      const spaceId = await createSpace({
        title: values.title,
        imagePicsumId: values.imagePicsumId
      });
      navigate({
        to: '/spaces/$spaceId',
        params: { spaceId }
      });
    } catch (error) {
      setCreateSpaceStatus('error');
    }
    /*
    form.reset();
    setSelectedImageId(-1);
    setCustomImageUrl(null);
    */
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {createSpaceStatus === 'idle' && (
          <CreateSpaceForm onSubmit={onSubmit} />
        )}
        {createSpaceStatus === 'loading' && <LoadingDialog />}
      </DialogContent>
    </Dialog>
  );
}

const SPACE_IMAGES_ID = [237, 348, 443, 582, 736, 857];

interface CreateSpaceFormProps {
  onSubmit: (values: CreateSpaceFormValues) => void;
}

function CreateSpaceForm({ onSubmit }: CreateSpaceFormProps) {
  const [selectedImageId, setSelectedImageId] = useState<number>(-1);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  const form = useForm<CreateSpaceFormValues>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      title: '',
      imagePicsumId: -1
    }
  });

  const handleImageSelect = (imageId: number) => {
    setSelectedImageId(imageId);
    form.setValue('imagePicsumId', imageId);

    if (SPACE_IMAGES_ID.includes(imageId) || imageId === -1) {
      setCustomImageUrl(null);
    } else {
      setCustomImageUrl(getURLImagePicsum(imageId, 800, 600));
    }
  };

  const handleCustomImageSelect = (imageId: number) => {
    handleImageSelect(imageId);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Crear un nuevo espacio</DialogTitle>
        <DialogDescription>
          Crea un espacio donde podrás colaborar con tu equipo.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del espacio</FormLabel>
                <FormControl>
                  <Input placeholder='Mi espacio colaborativo' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='imagePicsumId'
            render={() => (
              <FormItem>
                <FormLabel>Selecciona una imagen</FormLabel>
                <div className='grid grid-cols-3 grid-rows-[repeat(3,_105px)] gap-4 overflow-y-auto p-1'>
                  <div
                    onClick={() => handleImageSelect(-1)}
                    className={`transform cursor-pointer overflow-hidden border transition-all duration-200 hover:scale-[0.98] ${
                      selectedImageId === -1
                        ? 'ring-foreground ring-3 ring-offset-1'
                        : ''
                    }`}
                  >
                    <div className='bg-background h-full w-full bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:28px_28px] bg-center' />
                  </div>

                  {SPACE_IMAGES_ID.map((imageId) => (
                    <div
                      key={`picsum-${imageId}`}
                      onClick={() => handleImageSelect(imageId)}
                      className={`transform cursor-pointer overflow-hidden border transition-all duration-200 hover:scale-[0.98] ${
                        selectedImageId === imageId
                          ? 'ring-foreground ring-3 ring-offset-1'
                          : ''
                      }`}
                    >
                      <img
                        src={getURLImagePicsum(imageId, 400, 300)}
                        className='h-full w-full object-cover'
                        alt={`Imagen de picsum ${imageId}`}
                      />
                    </div>
                  ))}

                  <div
                    className={`relative transform cursor-pointer overflow-hidden border transition-all duration-200 hover:scale-[0.98] ${
                      selectedImageId !== -1 &&
                      !SPACE_IMAGES_ID.includes(selectedImageId)
                        ? 'ring-foreground ring-3 ring-offset-1'
                        : ''
                    }`}
                  >
                    {customImageUrl && (
                      <img
                        src={customImageUrl}
                        className='h-full w-full object-cover'
                        alt='Imagen personalizada'
                      />
                    )}
                    <CustomImagePicker
                      onImageSelected={handleCustomImageSelect}
                      buttonIcon={customImageUrl ? 'edit' : 'plus'}
                    />
                  </div>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='neutral' type='button'>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type='submit'
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className='transition-colors duration-300'
            >
              Crear espacio
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

const customImageSchema = z.object({
  imageId: z
    .number()
    .int('El ID debe ser un número entero')
    .min(0, 'El ID debe ser mayor o igual a 0')
    .max(1084, 'El ID debe ser menor o igual a 1084')
});

type CustomImageFormValues = z.infer<typeof customImageSchema>;

interface CustomImagePickerProps {
  onImageSelected: (imageId: number) => void;
  buttonIcon?: 'plus' | 'edit';
}

function CustomImagePicker({
  onImageSelected,
  buttonIcon
}: CustomImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [previewCustomImage, setPreviewCustomImage] = useState<string | null>(
    null
  );

  const form = useForm<CustomImageFormValues>({
    resolver: zodResolver(customImageSchema),
    defaultValues: {
      imageId: undefined
    }
  });

  const watchImageId = form.watch('imageId');
  const debouncedImageId = useDebounce(watchImageId, 500);

  useEffect(() => {
    if (watchImageId !== debouncedImageId) {
      setPreviewCustomImage(null);
    }
  }, [watchImageId, debouncedImageId]);

  useEffect(() => {
    const imageId = debouncedImageId;
    // Modificado para permitir ID 0 (imageId >= 0 en lugar de imageId >= 1)
    if (
      imageId !== undefined &&
      !isNaN(imageId) &&
      imageId >= 0 &&
      imageId <= 1084
    ) {
      try {
        const imageUrl = getURLImagePicsum(imageId, 800, 600);
        setPreviewCustomImage(imageUrl);
        form.clearErrors('imageId');
      } catch (error) {
        setPreviewCustomImage(null);
        form.setError('imageId', {
          type: 'manual',
          message: 'No se pudo cargar la imagen'
        });
      }
    } else {
      setPreviewCustomImage(null);
    }
  }, [debouncedImageId, form]);

  const handleSelectImage = (values: CustomImageFormValues) => {
    form.reset();
    setPreviewCustomImage(null);
    setOpen(false);
    onImageSelected(values.imageId);
  };

  const getRandomImage = () => {
    setPreviewCustomImage(null);
    // Modificado para incluir el 0 (Math.floor(Math.random() * 1085) en lugar de ...* 1084) + 1)
    const randomId = Math.floor(Math.random() * 1085);
    form.setValue('imageId', randomId);
    form.clearErrors('imageId');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {buttonIcon === 'plus' ? (
          <div className='bg-secondary-background hover:bg-secondary-background/80 relative flex h-full w-full cursor-pointer items-center justify-center border transition-all'>
            <ImagePlus className='text-foreground h-8 w-8' />
          </div>
        ) : (
          <div className='absolute right-1 top-1 z-20 rounded-full bg-black/40 p-1 transition-all hover:bg-black/60'>
            <PencilLine className='h-4 w-4 text-white' />
          </div>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Elegir imagen personalizada</DialogTitle>
          <DialogDescription>
            Introduce un ID de imagen de Picsum (0-1084). Puedes ver todas las
            imágenes disponibles en{' '}
            <a
              href='https://picsum.photos/images'
              target='_blank'
              rel='noopener noreferrer'
              className='text-main underline'
            >
              picsum.photos
            </a>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='space-y-4'>
            <FormField
              control={form.control}
              name='imageId'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center space-x-2'>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='ID de Picsum (0-1084)'
                        className='flex-1'
                        min={0}
                        max={1084}
                        {...field}
                        onChange={(e) => {
                          if (e.target.value !== '')
                            field.onChange(parseInt(e.target.value));
                          else field.onChange(undefined);
                        }}
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <Button
                      type='button'
                      variant='neutral'
                      size='icon'
                      title='Imagen aleatoria'
                      onClick={getRandomImage}
                      className='transition-transform duration-300 hover:rotate-180'
                    >
                      <RefreshCcw className='h-4 w-4' />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className={`relative h-[246px] overflow-hidden border ${!previewCustomImage ? 'bg-secondary-background/20 flex items-center justify-center' : ''}`}
            >
              {watchImageId !== undefined ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Loader2 className='text-muted-foreground/30 h-8 w-8 animate-spin' />
                </div>
              ) : (
                <span className='text-muted-foreground relative z-10 text-sm'>
                  La vista previa aparecerá aquí
                </span>
              )}
              {previewCustomImage && (
                <img
                  src={previewCustomImage}
                  alt='Vista previa de imagen personalizada'
                  className='relative z-10 h-full w-full object-cover transition-opacity duration-300 ease-in-out'
                />
              )}
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <DialogClose asChild>
                <Button variant='neutral' type='button'>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type='button'
                disabled={!form.formState.isValid || !previewCustomImage}
                className='transition-all duration-300'
                onClick={form.handleSubmit(handleSelectImage)}
              >
                Seleccionar imagen
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
