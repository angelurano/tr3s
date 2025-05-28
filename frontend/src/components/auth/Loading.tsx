import logo from '/logoipsum.svg';

export function Loading() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <img
        src={logo}
        alt='Logo'
        width={120}
        height={120}
        className='animate-pulse duration-700'
      />
    </div>
  );
}
