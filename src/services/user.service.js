import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq, ne, and } from 'drizzle-orm';
import { hashPassword } from '#services/auth.service.js';

const publicFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

export const listUsers = async () => {
  return db.select(publicFields).from(users).orderBy(users.id);
};

export const getUserById = async (id) => {
  const [row] = await db.select(publicFields).from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
};

export const updateUser = async (id, { name, email, password, role }) => {
  if (email) {
    const [other] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1);
    if (other) {
      throw new Error('User with this email already exists');
    }
  }

  const patch = {};
  if (name !== undefined) patch.name = name;
  if (email !== undefined) patch.email = email;
  if (role !== undefined) patch.role = role;
  if (password !== undefined) patch.password = await hashPassword(password);
  patch.updated_at = new Date();

  const [updated] = await db
    .update(users)
    .set(patch)
    .where(eq(users.id, id))
    .returning(publicFields);

  if (!updated) return null;
  logger.info(`User updated: id=${id}`);
  return updated;
};

export const deleteUser = async (id) => {
  const [removed] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (removed) logger.info(`User deleted: id=${id}`);
  return Boolean(removed);
};
