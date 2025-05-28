import React from 'react';
import { TypeOutline, Gamepad, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import giphyLogoUrl from '@/assets/giphy-logo.svg';

interface ToolbarItemProps {
  icon: React.ReactNode;
  name: string;
  children: React.ReactNode;
}

function ToolbarItem({ icon, name, children }: ToolbarItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='neutral'
                size='icon'
                className='hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                {icon}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent
            side='right'
            align='start'
            className='w-80 p-4'
            sideOffset={8}
          >
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side='right' sideOffset={8}>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Toolbar({ spaceId: _spaceId }: { spaceId: string }) {
  return (
    <div className='absolute left-3 top-1/2 flex -translate-y-1/2 flex-col gap-2 z-10'>
      <div className='flex flex-col items-center gap-2 rounded-md bg-white p-2 shadow-md dark:bg-gray-800'>
        <ToolbarItem
          icon={<img src={giphyLogoUrl} alt='GIF' className='h-4 w-4' />}
          name='GIF'
        >
          <PopoverGif />
        </ToolbarItem>

        <ToolbarItem icon={<TypeOutline className='h-5 w-5' />} name='Texto'>
          <PopoverText />
        </ToolbarItem>

        <ToolbarItem icon={<Gamepad className='h-5 w-5' />} name='Juego'>
          <PopoverGame />
        </ToolbarItem>

        <ToolbarItem icon={<StickyNote className='h-5 w-5' />} name='Nota'>
          <PopoverNote />
        </ToolbarItem>
      </div>
    </div>
  );
}

function PopoverGif() {
  return <></>;
}

function PopoverNote() {
  return <></>;
}

function PopoverGame() {
  return <></>;
}

function PopoverText() {
  return <></>;
}
