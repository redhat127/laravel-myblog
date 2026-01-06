import z from 'zod';

export const clientEnv = z
  .object({
    VITE_APP_NAME: z.string().min(1),
    VITE_CLOUDFLARE_TURNSTILE_SITE_KEY: z.string().min(1),
  })
  .parse(import.meta.env);
