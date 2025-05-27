import { LeaveSpace } from './LeaveSpace';

export function Toolbar() {
  return (
    <div className='absolute left-[50%] top-2 flex -translate-x-[50%] flex-col gap-y-4'>
      <div className='flex flex-row items-center gap-y-1 rounded-md bg-white p-1 shadow-md'>
        <div>Pencil</div>
        <div>Square</div>
        <div>Circle</div>
        <LeaveSpace />
      </div>
    </div>
  );
}
