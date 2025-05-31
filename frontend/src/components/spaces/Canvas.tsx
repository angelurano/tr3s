import { useCallback, useEffect } from 'react';
import { Chat } from './Chat';
import { PresenceIndicator } from './PresenceIndicator';
import { Toolbar } from './Toolbar';
import { UserSection } from './UserSection';
import { CursorOverlay } from './CursorOverlay';
import { useSpacePresence } from '@/hooks/useSpacePresence';
import { TopLeftControls } from './TopLeftControls';

export function Canvas({ spaceId }: { spaceId: string }) {
  const {
    onlineUsers,
    updateCursorPosition,
    notifyMouseInCanvas,
    notifyInputTyping
  } = useSpacePresence(spaceId);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      updateCursorPosition({ x, y });
    },
    [updateCursorPosition]
  );

  const handleMouseEnter = useCallback(() => {
    notifyMouseInCanvas(true);
  }, [notifyMouseInCanvas]);

  const handleMouseLeave = useCallback(() => {
    notifyMouseInCanvas(false);
  }, [notifyMouseInCanvas]);

  useEffect(() => {
    const handleWindowMouseLeave = (event: MouseEvent) => {
      if (
        event.clientX <= 0 ||
        event.clientY <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      ) {
        notifyMouseInCanvas(false);
      }
    };

    const handleWindowFocus = () => {
      notifyMouseInCanvas(false);
    };

    const handleWindowBlur = () => {
      notifyMouseInCanvas(false);
    };

    window.addEventListener('mouseleave', handleWindowMouseLeave);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('mouseleave', handleWindowMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [notifyMouseInCanvas]);

  return (
    <main
      className='relative h-full w-full flex-1 touch-none overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:69px_69px] bg-center'
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CursorOverlay users={onlineUsers} />
      <PresenceIndicator users={onlineUsers} />
      <Toolbar spaceId={spaceId} />
      <UserSection spaceId={spaceId} />
      <TopLeftControls spaceId={spaceId} />
      <Chat
        spaceId={spaceId}
        notifyInputTyping={notifyInputTyping}
        users={onlineUsers}
      />
    </main>
  );
}
