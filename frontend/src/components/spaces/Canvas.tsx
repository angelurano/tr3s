import { SidebarTrigger } from '../ui/sidebar';
import { Chat } from './Chat';
import { PresenceIndicator } from './PresenceIndicator';
import { Toolbar } from './Toolbar';
import { UserSection } from './UserSection';

export function Canvas({ spaceId }: { spaceId: string }) {
  return (
    <main className='relative h-full w-full flex-1 touch-none bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:69px_69px] bg-center'>
      <SidebarTrigger className='relative left-3 top-3 flex-shrink-0 cursor-pointer' />
      <PresenceIndicator />
      <Toolbar />
      <UserSection />
      <Chat />
    </main>
  );
}
