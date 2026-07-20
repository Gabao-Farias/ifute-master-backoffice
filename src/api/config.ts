import { api } from './client';

const CONFIG_URL = '/private/config';

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export type PlatformPixKey = {
  platform_pix_key: string | null;
  platform_pix_key_type: PixKeyType | null;
};

export const configApi = {
  /** Chave PIX da plataforma (destino do saque). */
  async platformPixKey(): Promise<PlatformPixKey> {
    const { data } = await api.get<PlatformPixKey>(
      `${CONFIG_URL}/platform-pix-key`,
    );
    return data;
  },

  /** Cadastra/atualiza a chave PIX da plataforma. */
  async setPlatformPixKey(input: {
    platform_pix_key: string;
    platform_pix_key_type: PixKeyType;
  }): Promise<PlatformPixKey> {
    const { data } = await api.patch<PlatformPixKey>(
      `${CONFIG_URL}/platform-pix-key`,
      input,
    );
    return data;
  },
};

export const configKeys = {
  all: ['config'] as const,
  platformPixKey: () => ['config', 'platform-pix-key'] as const,
};

export const PIX_KEY_TYPE_OPTIONS: { value: PixKeyType; label: string }[] = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'EVP', label: 'Chave aleatória (EVP)' },
];
