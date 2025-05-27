export function Toolbar({ spaceId }: { spaceId: string }) {
  return (
    <div className='absolute left-3 top-1/2 flex -translate-y-1/2 flex-col gap-2'>
      <div className='flex flex-col items-center gap-2 rounded-md bg-white p-2 shadow-md dark:bg-gray-800'>
        <div>Pencil</div>
        <div>Square</div>
        <div>Circle</div>
      </div>
    </div>
  );
}
