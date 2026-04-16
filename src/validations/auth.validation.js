import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(128),
  role: z.enum(['admin', 'user']).default('user'),
});

export const signinSchema = z.object({
  email: z.string().toLowerCase().trim(),
  password: z.string().min(1).max(255),
});

