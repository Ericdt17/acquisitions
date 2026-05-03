import { z } from 'zod';
import { ROLE_USER, ROLE_ADMIN, ROLE_SUPER_ADMIN } from '#constants/roles.js';

const roleEnum = z.enum([ROLE_USER, ROLE_ADMIN, ROLE_SUPER_ADMIN]);

export const createUserBodySchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(128),
  role: roleEnum.default(ROLE_USER),
});

export const updateUserBodySchema = z
  .object({
    name: z.string().min(1).max(255).trim().optional(),
    email: z.string().max(255).toLowerCase().trim().optional(),
    password: z.string().min(8).max(128).optional(),
    role: roleEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });
