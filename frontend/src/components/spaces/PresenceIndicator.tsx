import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { type PresenceUser } from '@/hooks/useSpacePresence';
import { motion, AnimatePresence } from 'framer-motion';

interface PresenceIndicatorProps {
  users: PresenceUser[];
}

export function PresenceIndicator({ users }: PresenceIndicatorProps) {
  if (users.length === 0) {
    return null;
  }

  const maxVisibleUsers = 2;
  const visibleUsers = users.slice(0, maxVisibleUsers);
  const additionalUsers = users.length - maxVisibleUsers;

  return (
    <motion.div
      className='absolute left-3 top-20 flex flex-col items-start justify-center gap-2'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Badge variant='neutral' className='text-xs'>
        {users.length} online
      </Badge>
      <div className='flex items-center -space-x-1'>
        <AnimatePresence>
          {visibleUsers.map((user, index) => (
            <UserAvatar key={user.userId} user={user} index={index} />
          ))}
        </AnimatePresence>

        {additionalUsers > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className='relative ml-2'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600'>
              +{additionalUsers}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function UserAvatar({ user, index }: { user: PresenceUser; index: number }) {
  if (!user.user) return null;
  const { name, imageUrl } = user.user;

  return (
    <motion.div
      key={user.userId}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: index * 0.1
      }}
      className='relative'
    >
      <Avatar className='h-7 w-7 shadow-sm'>
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className='bg-main h-full w-full'>
          <div className='h-full w-full flex-1 touch-none bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:10px_10px] bg-center' />
        </AvatarFallback>
      </Avatar>

      {user.typing ? (
        <motion.div
          className='absolute -bottom-1 -right-1 z-10 rounded-full p-0'
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <motion.span
            className='block text-xs'
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            ⌨️
          </motion.span>
        </motion.div>
      ) : (
        <div className='absolute bottom-0 right-0 z-10 h-2 w-2 rounded-full border bg-green-700' />
      )}
    </motion.div>
  );
}
