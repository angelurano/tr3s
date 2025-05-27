import { useTheme } from '@/context/theme';
import { Button } from '../ui/button';
import { MoonStar, Sun } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export function ThemeButton({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Button>) {
  const { isDarkMode, setTheme } = useTheme();

  return (
    <Button
      variant='default'
      className={cn('flex size-7 cursor-pointer p-0', className)}
      {...props}
      onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
    >
      {isDarkMode ? (
        <Sun className='size-full' />
      ) : (
        <MoonStar className='size-full' />
      )}
    </Button>
  );
}
