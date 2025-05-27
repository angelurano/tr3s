import { Link } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';

export function LeaveSpace() {
  const isInSpace = true;

  if (!isInSpace) return null;

  const handleLeaveSpace = () => {
    console.log('Abandonar espacio');
  };

  return (
    <Button variant='noShadow' className='flex size-7 cursor-pointer p-0'>
      <LogOut className='size-full' />
    </Button>
  );
}

export function SidebarLeaveSpace() {
  const isInSpace = false;

  if (!isInSpace) return null;

  const handleLeaveSpace = () => {
    console.log('Abandonar espacio');
  };

  return (
    <Link to='/'>
      <LogOut />
      <span>Abandonar Espacio</span>
    </Link>
  );
}
