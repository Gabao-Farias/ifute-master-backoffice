import { useEffect } from 'react';

import { useThemeStore } from '@/store/theme-store';

/**
 * Aplica a classe `.dark`/`.light` no <html> conforme a preferência salva,
 * reagindo em tempo real à mudança do tema do SO quando o modo é `system`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const isDark =
        mode === 'dark' ||
        (mode === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
    };

    apply();

    if (mode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
  }, [mode]);

  return <>{children}</>;
}
