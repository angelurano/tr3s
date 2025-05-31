import type { PresenceUser } from '@/hooks/useSpacePresence';
import { api } from '@server/_generated/api';
import type { Doc } from '@server/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { useForm } from 'react-hook-form';
import {
  createMessageSchema,
  type CreateMessageSchema
} from '@server/schemaShared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { useEffect, useRef } from 'react';

interface ChatProps {
  spaceId: string;
  updateTyping: (isTyping: boolean) => void;
  users: PresenceUser[];
}
export function Chat({ spaceId, updateTyping, users }: ChatProps) {
  const messages: Doc<'messages'> =
    useQuery(api.messages.getSpaceMessages, { spaceId }) || [];

  return (
    <div className='fixed bottom-6 left-1/2 flex -translate-x-1/2 transform'>
      <BoxMessage
        updateTyping={updateTyping}
        onSubmit={(data) => {
          // Aquí se llamaría a la mutación para enviar el mensaje
          console.log('Mensaje enviado:', data);
        }}
      />
    </div>
  );
}

interface BoxMessageProps {
  updateTyping: (isTyping: boolean) => void;
  onSubmit: (data: CreateMessageSchema) => void;
}
function BoxMessage({ updateTyping, onSubmit }: BoxMessageProps) {
  const form = useForm<CreateMessageSchema>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      body: ''
    }
  });
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentTyping = useRef(false);

  const handleTyping = (isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTyping) {
      if (!hasSentTyping.current) {
        updateTyping(true);
        hasSentTyping.current = true;
      }
      typingTimeoutRef.current = setTimeout(() => {
        hasSentTyping.current = false;
        updateTyping(false);
      }, 2500);
    } else if (hasSentTyping.current) {
      updateTyping(false);
      hasSentTyping.current = false;
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (hasSentTyping.current) {
        updateTyping(false);
      }
    };
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='body'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder='Escribe un mensaje...'
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleTyping(e.target.value.trim() !== '');
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

interface MessageProps {
  message: Doc<'messages'>;
}
function Message({ message }: MessageProps) {}
