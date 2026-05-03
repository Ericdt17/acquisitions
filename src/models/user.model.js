import { pgTable } from 'drizzle-orm/pg-core';
import { serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { ROLE_USER } from '#constants/roles.js';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default(ROLE_USER),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});