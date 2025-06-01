import type { PresenceUser } from '@/hooks/useSpacePresence';
import { api } from '@server/_generated/api';
import type { Id } from '@server/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '../ui/form';
import { useForm } from 'react-hook-form';
import {
  createMessageSchema,
  type CreateMessageSchema
} from '@server/schemaShared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, SendHorizontal, SquareArrowDown } from 'lucide-react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import type { MessageResult } from '@server/messages';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { useEffect, useRef, useState } from 'react';

interface ChatProps {
  spaceId: string;
  users: PresenceUser[];
  notifyInputTyping: (hasText: boolean) => void;
}
export function Chat({ spaceId, users, notifyInputTyping }: ChatProps) {
  const currentUserId = useQuery(api.users.getCurrentUserId);
  const messages: MessageResult[] | undefined = useQuery(
    api.messages.getSpaceMessages,
    {
      spaceId: spaceId as Id<'spaces'>
    }
  );
  const sortedMessages = messages ? [...messages].reverse() : undefined;

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const [isNearBottom, setIsNearBottom] = useState(true);

  const checkIsNearBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNear = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(isNear);
    }
  };

  // TODO: optimistic update in sendMessage
  const sendMessages = useMutation(api.messages.sendMessage);

  const handleSendMessage = async (data: CreateMessageSchema) => {
    if (!data.body.trim()) return;

    try {
      const messageId = await sendMessages({
        spaceId: spaceId as Id<'spaces'>,
        body: data.body
      });
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const checkInTheSameMinute = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getHours() === date2.getHours() &&
      date1.getMinutes() === date2.getMinutes()
    );
  };

  useEffect(() => {
    if (sortedMessages && sortedMessages.length > 0) {
      if (isNearBottom) {
        scrollToBottom();
      }
      const container = messagesContainerRef.current;
      if (container) {
        container.addEventListener('scroll', checkIsNearBottom);
        return () => {
          container.removeEventListener('scroll', checkIsNearBottom);
        };
      }
    }
  }, [sortedMessages]);

  return (
    <div className='max-h-3/4 fixed bottom-6 left-1/2 flex w-[250px] -translate-x-1/2 transform flex-col gap-3 sm:w-[320px]'>
      <div
        className='mask-t-from-95% relative flex max-h-full w-full flex-1 flex-col overflow-y-auto scroll-smooth py-1'
        ref={messagesContainerRef}
      >
        {sortedMessages && currentUserId ? (
          sortedMessages.map((message, index, allMessages) => (
            <>
              <Message
                key={message._id}
                message={message}
                timeFormatted={formatTime(message._creationTime)}
                isCurrentUser={message.author._id === currentUserId}
                consecutive={
                  index > 0 &&
                  allMessages[index - 1].author._id === message.author._id &&
                  checkInTheSameMinute(
                    new Date(allMessages[index - 1]._creationTime),
                    new Date(message._creationTime)
                  )
                }
              />
            </>
          ))
        ) : (
          <div className='mt-2'>
            <Loader2 className='text-secondary mx-auto h-6 w-6 animate-spin opacity-75' />
          </div>
        )}
        <div className='sticky bottom-0 left-0 h-0 w-0'>
          <Button
            size='icon'
            variant='noShadow'
            onClick={scrollToBottom}
            hidden={
              !sortedMessages || sortedMessages.length === 0 || isNearBottom
            }
            className='rounded-xs bg-secondary-background text-secondary-foreground absolute bottom-0 left-0 flex h-7 w-7 cursor-pointer items-center justify-center'
          >
            <SquareArrowDown className='h-full w-full p-0' />
          </Button>
        </div>
      </div>
      <BoxMessage
        notifyInputTyping={notifyInputTyping}
        onSubmit={handleSendMessage}
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

  const handleSubmit = (data: CreateMessageSchema) => {
    onSubmit(data);
    form.clearErrors();
    form.reset();
    notifyInputTyping(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='relative flex w-full'
      >
        <FormField
          control={form.control}
          name='body'
          render={({ field }) => (
            <FormItem className='relative flex flex-1 pb-6'>
              <FormControl>
                <Input
                  placeholder='Escribe un mensaje...'
                  {...field}
                  autoComplete='off'
                  onChange={(e) => {
                    field.onChange(e);
                    notifyInputTyping(e.target.value.trim() !== '');
                  }}
                  className='w-full rounded-r-none border-r-0 focus-visible:ring-1 focus-visible:ring-offset-0'
                />
              </FormControl>
              <FormMessage className='absolute bottom-0 w-max text-left' />
            </FormItem>
          )}
        />
        <Button
          variant='noShadow'
          type='submit'
          size='icon'
          className='cursor-pointer rounded-l-none'
        >
          <SendHorizontal />
        </Button>
      </form>
    </Form>
  );
}

interface MessageProps {
  message: MessageResult;
  timeFormatted: string;
  isCurrentUser: boolean;
  consecutive: boolean;
}
function Message({
  message,
  timeFormatted,
  isCurrentUser,
  consecutive
}: MessageProps) {
  return (
    <div
      className={`flex items-start gap-2 px-1 ${isCurrentUser ? 'justify-end' : ''} ${
        consecutive ? 'mt-0' : 'mt-2'
      }`}
    >
      <Avatar
        className={`h-8 w-8 flex-shrink-0 ${isCurrentUser || consecutive ? 'opacity-0' : ''}`}
      >
        <AvatarImage src={message.author.imageUrl} alt={message.author.name} />
        <AvatarFallback className='bg-main h-full w-full'>
          <div className='h-full w-full bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:12px_12px] bg-center' />
        </AvatarFallback>
      </Avatar>
      <div className='max-w-full flex-1'>
        <div
          className={`items-baseline gap-2 ${isCurrentUser ? 'justify-end' : ''} ${consecutive ? 'hidden' : 'flex'}`}
        >
          <span className='text-foreground max-w-5/6 block truncate text-sm font-medium'>
            {isCurrentUser ? 'Tú' : message.author.name}
          </span>
          <span className='text-foreground/60 block text-xs'>
            {timeFormatted}
          </span>
        </div>
        <div
          className={`text-foreground shadow-shadow border-border mt-1 max-w-xs break-words rounded-lg border-2 px-3 py-2 ${isCurrentUser ? 'bg-main text-main-foreground ml-1 rounded-br-none' : 'bg-secondary-background text-secondary-foreground mr-1 rounded-tl-none'}`}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}
