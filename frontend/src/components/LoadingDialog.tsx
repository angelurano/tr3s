import { DialogDescription, DialogTitle } from './ui/dialog';
import logo from '../../../../../../../../../../logoipsum.svg';

export function LoadingDialog() {
  return (
    <>
      <DialogTitle className='flex flex-col items-center justify-center pt-8'>
        <img
          src={logo}
          alt='Logo'
          width={100}
          height={100}
          className='animate-pulse duration-700'
        />
      </DialogTitle>
      <DialogDescription className='pb-8 text-center text-gray-500'>
        Cargando información...
      </DialogDescription>
    </>
  );
}
