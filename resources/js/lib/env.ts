import z from 'zod';

export const clientEnv = z
  .object({
    VITE_APP_NAME: z.string().min(1),
  })
  .parse(import.meta.env);
