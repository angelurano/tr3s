import { useCallback, useEffect } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Chat } from './Chat';
import { PresenceIndicator } from './PresenceIndicator';
import { Toolbar } from './Toolbar';
import { UserSection } from './UserSection';
import { CursorOverlay } from './CursorOverlay';
import { useSpacePresence } from '@/hooks/useSpacePresence';

export function Canvas({ spaceId }: { spaceId: string }) {
  const { onlineUsers, updateCursorPosition, setMouseInCanvas } =
    useSpacePresence(spaceId);

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
    setMouseInCanvas(true);
  }, [setMouseInCanvas]);

  const handleMouseLeave = useCallback(() => {
    setMouseInCanvas(false);
  }, [setMouseInCanvas]);

  useEffect(() => {
    const handleWindowMouseLeave = (event: MouseEvent) => {
      if (
        event.clientX <= 0 ||
        event.clientY <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      ) {
        setMouseInCanvas(false);
      }
    };

    const handleWindowFocus = () => {
      setMouseInCanvas(false);
    };

    const handleWindowBlur = () => {
      setMouseInCanvas(false);
    };

    window.addEventListener('mouseleave', handleWindowMouseLeave);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('mouseleave', handleWindowMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [setMouseInCanvas]);

  return (
    <main
      className='relative h-full w-full flex-1 touch-none overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:69px_69px] bg-center'
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CursorOverlay users={onlineUsers} />
      <SidebarTrigger className='relative left-3 top-3 flex-shrink-0 cursor-pointer' />
      <PresenceIndicator users={onlineUsers} />
      <Toolbar spaceId={spaceId} />
      <UserSection spaceId={spaceId} />
      <Chat />
    </main>
  );
}
