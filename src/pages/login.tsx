import { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';

import { Logo } from '@/components/brand/logo';
import { GoogleIcon } from '@/components/brand/google-icon';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { googleLogin, autoLogin } = useAuth();
  const [pending, setPending] = useState(false);

  const ranAutoLogin = useRef(false);
  useEffect(() => {
    if (ranAutoLogin.current) return;
    ranAutoLogin.current = true;

    autoLogin().then((result) => {
      if (result === 'logged') {
        navigate(ROUTES.dashboard, { replace: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: 'email profile',
    onSuccess: async (tokenResponse) => {
      setPending(true);
      try {
        await googleLogin(tokenResponse.access_token);
        navigate(ROUTES.dashboard, { replace: true });
      } catch {
        toast.error('Não foi possível entrar. Tente novamente.');
        setPending(false);
      }
    },
    onError: () => {
      toast.error('Falha na autenticação com o Google.');
      setPending(false);
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center rounded-2xl border bg-card/70 p-8 shadow-xl backdrop-blur-xl">
          <Logo size={56} />

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Backoffice Mestre
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-center text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Acesso exclusivo da diretoria iFute
          </p>

          <Button
            variant="outline"
            size="lg"
            className="mt-8 w-full"
            disabled={pending}
            onClick={() => login()}
          >
            <GoogleIcon />
            {pending ? 'Entrando…' : 'Entrar com o Google'}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} iFute · Painel da diretoria
        </p>
      </div>
    </div>
  );
}
