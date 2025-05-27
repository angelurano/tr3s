import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen.ts';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { esES } from '@clerk/localizations';
import { neobrutalism } from '@clerk/themes';
import { ThemeProvider } from './components/theme/ThemeProvider.tsx';

import './index.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      localization={esES}
      appearance={{
        baseTheme: neobrutalism,
        signIn: { baseTheme: neobrutalism },
        signUp: { baseTheme: neobrutalism },
        userProfile: { baseTheme: neobrutalism },
        userButton: { baseTheme: neobrutalism },
        organizationProfile: { baseTheme: neobrutalism },
        organizationSwitcher: { baseTheme: neobrutalism },
        createOrganization: { baseTheme: neobrutalism },
        organizationList: { baseTheme: neobrutalism }
      }}
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>
);
