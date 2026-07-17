import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ENV } from '@/lib/env';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { router } from '@/routes';
import { useThemeStore } from '@/store/theme-store';

export default function App() {
  const mode = useThemeStore((s) => s.mode);

  return (
    <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}>
      <QueryProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            richColors
            theme={mode === 'system' ? 'system' : mode}
          />
        </ThemeProvider>
      </QueryProvider>
    </GoogleOAuthProvider>
  );
}
