import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_index')({
  component: IndexLayout
});

function IndexLayout() {
  return (
    <SidebarProvider>
      <div className='min-h-vh flex w-full'>
        <AppSidebar />
        <main className='flex h-full w-full flex-col overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:69px_69px] bg-center'>
          <Header />
          <div className='h-full w-full overflow-y-auto'>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
