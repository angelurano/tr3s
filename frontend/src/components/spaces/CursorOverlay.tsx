import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { type PresenceUser } from '@/hooks/useSpacePresence';

interface CursorOverlayProps {
  users: PresenceUser[];
}

interface UserCursorProps {
  user: PresenceUser;
}

const colors = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
const cursorColor = colors[Math.floor(Math.random() * colors.length)];

function UserCursor({ user }: UserCursorProps) {
  if (!user.user) return null;

  const { cursorPosition } = user;
  const { name, imageUrl } = user.user;

  const isVisible = cursorPosition.x >= 0 && cursorPosition.y >= 0;

  return (
    <motion.div
      className='pointer-events-none absolute z-50'
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
        x: Math.max(0, cursorPosition.x),
        y: Math.max(0, cursorPosition.y)
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        duration: 0.15,
        opacity: { duration: 0.2 }
      }}
      style={{
        left: 0,
        top: 0
      }}
    >
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        className='drop-shadow-lg'
      >
        <path
          d='M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z'
          fill={`currentColor`}
          className={`text-${cursorColor}`}
          stroke='white'
          strokeWidth='1'
        />
      </svg>

      <div className='-mt-2 ml-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm'>
        <Avatar className='h-4 w-4'>
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback className='h-full w-full bg-main'>
            <div className='h-full w-full bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:5px_5px] bg-center'/>
          </AvatarFallback>
        </Avatar>
        <span className='font-medium'>{name}</span>
        {user.typing && (
          <motion.span
            className='text-yellow-300'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              repeatType: 'reverse'
            }}
          >
            ✏️
          </motion.span>
        )}
      </div>
      {/* Force tailwind to generate these classes */}
      <div className='text-chart-1 text-chart-2 text-chart-3 text-chart-4 text-chart-5 hidden h-0 w-0' />
    </motion.div>
  );
}

export function CursorOverlay({ users }: CursorOverlayProps) {
  return (
    <div className='pointer-events-none absolute inset-0 z-40'>
      <AnimatePresence>
        {users.map((user) => (
          <UserCursor key={user.userId} user={user} />
        ))}
      </AnimatePresence>
    </div>
  );
}
