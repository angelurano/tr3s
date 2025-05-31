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

interface ChatProps {
  spaceId: string;
  users: PresenceUser[];
  notifyInputTyping: (hasText: boolean) => void;
}
export function Chat({ spaceId, users, notifyInputTyping }: ChatProps) {
  const messages: Doc<'messages'> =
    useQuery(api.messages.getSpaceMessages, { spaceId }) || [];

  return (
    <div className='fixed bottom-6 left-1/2 flex -translate-x-1/2 transform'>
      <BoxMessage
        notifyInputTyping={notifyInputTyping}
        onSubmit={(data) => {
          console.log('Mensaje enviado:', data);
        }}
      />
    </div>
  );
}

interface BoxMessageProps {
  onSubmit: (data: CreateMessageSchema) => void;
  notifyInputTyping: (hasText: boolean) => void;
}
function BoxMessage({ notifyInputTyping, onSubmit }: BoxMessageProps) {
  const form = useForm<CreateMessageSchema>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      body: ''
    }
  });

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
                    notifyInputTyping(e.target.value.trim() !== '');
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
