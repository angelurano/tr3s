import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '../ui/sheet';
import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import { JoiningSpace } from './JoiningSpace';

type SheetSide = 'left' | 'right' | 'bottom' | 'top';

export function JoinSpace({
  children,
  side = 'right'
}: {
  children?: React.ReactNode;
  side?: SheetSide;
}) {
  const [spaceJoining, setSpaceJoining] = useState<string | null>(null);

  return (
    <>
      {spaceJoining && (
        <JoiningSpace
          spaceId={spaceJoining}
          setSpaceJoining={setSpaceJoining}
        />
      )}
      <Sheet>
        <SheetTrigger asChild>
          {children || <Button variant='neutral'>Unirse a un espacio</Button>}
        </SheetTrigger>
        <JoinSpaceApp side={side} setSpaceJoining={setSpaceJoining} />
      </Sheet>
    </>
  );
}

const formSchema = z.object({
  spaceCode: z
    .string()
    .min(1, 'El código del espacio es obligatorio')
    .min(3, 'El código del espacio no es un identificador válido')
});

function JoinSpaceApp({
  setSpaceJoining,
  side = 'right'
}: {
  setSpaceJoining: React.Dispatch<React.SetStateAction<string | null>>;
  side?: SheetSide;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spaceCode: ''
    }
  });

  return (
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Unirse a un espacio</SheetTitle>
        <SheetDescription>
          Para unirte a un espacio, ingresa el código del espacio que te ha sido
          proporcionado por el administrador del espacio. Si no tienes un
          código, contacta al administrador del espacio para obtenerlo.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form
          className='flex w-full flex-col gap-4 p-4'
          onSubmit={form.handleSubmit((data) => {
            setSpaceJoining(data.spaceCode);
            form.reset();
          })}
        >
          <FormField
            control={form.control}
            name='spaceCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código del espacio</FormLabel>
                <FormControl>
                  <Input placeholder='Código del espacio' {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant='default' className='w-full' type='submit'>
            Unirse al espacio
          </Button>
        </form>
      </Form>
      <SheetFooter>
        <SheetClose asChild>
          <Button variant='neutral'>Cancelar</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
}
