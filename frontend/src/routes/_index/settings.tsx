import { createFileRoute } from '@tanstack/react-router';
import { useTheme } from '@/context/theme';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserButton, SignUpButton, SignInButton } from '@clerk/clerk-react';
import { Authenticated, Unauthenticated } from 'convex/react';

export const Route = createFileRoute('/_index/settings')({
  component: SettingsComponent
});

function SettingsComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='relative flex h-full w-full items-center justify-center'>
      <div className='flex flex-col gap-6 p-6'>
        <h1 className='text-2xl'>Configuración</h1>
        <p className='text-muted-foreground'>
          Cambia la configuración de la aplicación o de tu cuenta
        </p>

        <div className='flex flex-row gap-10'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Tema de la aplicación
              </label>
              <Select
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as 'light' | 'dark' | 'default')
                }
              >
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='Selecciona un tema' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='default'>Default</SelectItem>
                  <SelectItem value='light'>Claro</SelectItem>
                  <SelectItem value='dark'>Oscuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Configuración de Usuario
              </label>
              <div className='flex flex-row items-center'>
                <Authenticated>
                  <Button className='rounded-full p-1' variant='default'>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: 'size-8'
                        }
                      }}
                    />
                  </Button>
                  <span className='ml-4 text-xs'>Presiona el botón</span>
                </Authenticated>
                <Unauthenticated>
                  <SignUpButton mode='modal'>
                    <Button
                      className='bg-secondary-background text-secondary-foreground w-1/2 cursor-pointer rounded-r-none border-r-0'
                      variant='noShadow'
                    >
                      Registrarse
                    </Button>
                  </SignUpButton>
                  <SignInButton mode='modal'>
                    <Button
                      className='w-1/2 cursor-pointer rounded-l-none'
                      variant='noShadow'
                    >
                      Iniciar Sesión
                    </Button>
                  </SignInButton>
                </Unauthenticated>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
