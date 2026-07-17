import { authApi } from '@/api/auth';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth-store';

/**
 * Fluxo de autenticação: login via Google, auto-login (valida token salvo) e
 * logout. Idêntico ao backoffice, sem a parte de local ativo.
 */
export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clear = useAuthStore((s) => s.clear);

  const googleLogin = async (googleAccessToken: string) => {
    const { accessToken } = await authApi.loginGoogle({
      access_token: googleAccessToken,
    });
    setToken(accessToken);
  };

  const autoLogin = async (): Promise<'logged' | 'not-logged'> => {
    try {
      await authApi.checkAuth();
      return 'logged';
    } catch {
      clear();
      return 'not-logged';
    }
  };

  const signOut = () => {
    clear();
    queryClient.clear();
  };

  return {
    token,
    isAuthenticated: !!token,
    googleLogin,
    autoLogin,
    signOut,
  };
}
