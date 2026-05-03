import { z } from 'zod';
import { ROLE_USER, ROLE_ADMIN } from '#constants/roles.js';

export const signupSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(128),
  role: z.enum([ROLE_USER, ROLE_ADMIN]).default(ROLE_USER),
});

export const signinSchema = z.object({
  email: z.string().toLowerCase().trim(),
  password: z.string().min(1).max(255),
});

