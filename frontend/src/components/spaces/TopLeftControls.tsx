import { useQuery } from 'convex/react';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { ThemeButton } from '../theme/ThemeButton';
import { Notifications } from '../Notifications';
import { LeaveSpace } from './LeaveSpace';
import EditSpace from '../index/EditSpace';
import { Button } from '../ui/button';
import { PencilLine, Maximize, Minimize } from 'lucide-react';
import { api } from '@server/_generated/api';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopLeftControlsProps {
  spaceId: string;
}

export function TopLeftControls({ spaceId }: TopLeftControlsProps) {
  const spaceAccess = useQuery(api.spaces.getSpaceAccess, { spaceId });
  const isMobile = useIsMobile();

  return (
    <div className='absolute left-3 top-3 flex items-center gap-2 rounded-md bg-white p-2 shadow-md dark:bg-gray-800'>
      <SidebarTrigger className='flex-shrink-0 cursor-pointer' />
      <ThemeButton variant='noShadow' className='cursor-pointer' />
      {!isMobile && <ToggleFullScreen />}
      {spaceAccess?.space && (
        <EditSpace space={spaceAccess.space}>
          <Button variant='noShadow' className='flex size-7 cursor-pointer p-0'>
            <PencilLine className='size-full' />
          </Button>
        </EditSpace>
      )}
      <Notifications />
      <LeaveSpace spaceId={spaceId} />
    </div>
  );
}

function ToggleFullScreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFullscreen = Boolean(
        document.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
      );
      setIsFullscreen(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange
      );
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <Button
      variant='noShadow'
      className='flex size-7 cursor-pointer p-0'
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
    >
      {isFullscreen ? (
        <Minimize className='size-full' />
      ) : (
        <Maximize className='size-full' />
      )}
    </Button>
  );
}
