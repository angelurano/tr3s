import { useState, useEffect, useRef, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';

// Definición de tipos
type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type Message = {
  id: string;
  text: string;
  user: User;
  timestamp: Date;
  expiresAt: Date;
};

// Tiempo de vida de los mensajes en milisegundos (20 segundos)
const MESSAGE_LIFETIME_MS = 20000;

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState<User | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Usuario de ejemplo (en una aplicación real, esto vendría de contexto o props)
  const currentUser: User = useMemo(
    () => ({
      id: '1',
      name: 'Usuario Actual',
      avatarUrl: 'https://i.pravatar.cc/150?u=1'
    }),
    []
  );

  const otherUser: User = useMemo(
    () => ({
      id: '2',
      name: 'Otro Usuario',
      avatarUrl: 'https://i.pravatar.cc/150?u=2'
    }),
    []
  );

  // Efecto para simular recibir mensajes
  useEffect(() => {
    // Simulación - recibir un mensaje después de 3 segundos
    const timer = setTimeout(() => {
      receiveMessage('Hola, ¿cómo estás?', otherUser);
    }, 3000);

    return () => clearTimeout(timer);
  }, [otherUser]);

  // Efecto para eliminar mensajes expirados
  useEffect(() => {
    const interval = setInterval(() => {
      if (isHovering) return; // No eliminar mensajes mientras se hace hover

      const now = new Date();
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.expiresAt > now)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovering]);

  // Función para recibir un mensaje
  const receiveMessage = (text: string, user: User) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + MESSAGE_LIFETIME_MS);

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      user,
      timestamp: now,
      expiresAt
    };

    setMessages((prevMessages) => [newMessage, ...prevMessages]);

    // Simular el fin del estado "typing"
    setIsTyping(null);
  };

  // Función para enviar un mensaje
  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    setInputValue('');

    // Añadir mensaje propio
    receiveMessage(text, currentUser);

    // Simular respuesta y estado de typing
    simulateTypingAndResponse();
  };

  // Función para simular typing y respuesta
  const simulateTypingAndResponse = () => {
    // Mostrar indicador de typing
    setIsTyping(otherUser);

    // Limpiar timeout anterior si existe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Simular respuesta después de un breve delay
    typingTimeoutRef.current = setTimeout(
      () => {
        const responses = [
          'Claro, ¡me parece bien!',
          '¿Podemos hablar más tarde?',
          'Estoy ocupado ahora mismo',
          'Interesante, cuéntame más'
        ];

        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];
        receiveMessage(randomResponse, otherUser);
      },
      2000 + Math.random() * 2000
    ); // Entre 2-4 segundos
  };

  // Función para extender la vida de un mensaje al hacer hover
  const extendMessageLifetime = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        if (message.id === messageId) {
          const now = new Date();
          return {
            ...message,
            expiresAt: new Date(now.getTime() + MESSAGE_LIFETIME_MS)
          };
        }
        return message;
      })
    );
  };

  // Manejador para tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 w-full max-w-md rounded-t-lg p-4 transition-all duration-300',
        isHovering ? 'bg-white/90 shadow-lg dark:bg-gray-800/90' : 'bg-transparent'
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className='flex h-64 flex-col-reverse overflow-y-auto'
        ref={messagesContainerRef}
      >
        {/* Mensajes */}
        {messages.map((message) => (
          <div
            key={message.id}
            className='mb-3 flex items-start'
            onMouseEnter={() => extendMessageLifetime(message.id)}
          >
            <Avatar className='mr-2 size-8 flex-shrink-0'>
              {message.user.avatarUrl ? (
                <AvatarImage
                  src={message.user.avatarUrl}
                  alt={message.user.name}
                />
              ) : (
                <AvatarFallback>
                  {message.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div
              className={cn(
                'max-w-[80%] break-words rounded-lg p-2',
                message.user.id === currentUser.id
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              )}
            >
              <div className='mb-0.5 text-xs text-gray-500'>
                {message.user.name}
              </div>
              <div>{message.text}</div>

              {/* Contador de tiempo restante (solo visible al hacer hover) */}
              {isHovering && (
                <div className='mt-1 text-right text-xs text-gray-400'>
                  {Math.ceil((message.expiresAt.getTime() - Date.now()) / 1000)}
                  s
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Indicador de escritura */}
        {isTyping && (
          <div className='mb-3 flex items-start'>
            <Avatar className='mr-2 size-8 flex-shrink-0'>
              {isTyping.avatarUrl ? (
                <AvatarImage src={isTyping.avatarUrl} alt={isTyping.name} />
              ) : (
                <AvatarFallback>
                  {isTyping.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className='rounded-lg bg-gray-100 p-2'>
              <div className='mb-0.5 text-xs text-gray-500'>
                {isTyping.name}
              </div>
              <div className='flex space-x-1'>
                <div
                  className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entrada de mensajes */}
      <div className='mt-2 flex'>
        <input
          type='text'
          placeholder='Escribe un mensaje...'
          className='flex-1 rounded-l border p-2'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className='rounded-r bg-blue-500 px-4 text-white transition-colors hover:bg-blue-600'
          onClick={sendMessage}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
