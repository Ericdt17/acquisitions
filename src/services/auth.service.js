import bcrypt from 'bcrypt';
import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';


export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error('Error hashing password', e);
    throw new Error('Failed to hash password');
  }
};

/** Returns safe user fields or null when credentials are invalid (same outcome for unknown email vs wrong password). */
export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (e) {
    logger.error('Error authenticating user', e);
    throw new Error('Failed to authenticate');
  }
};

export const createUser = async ({ name, email, password, role = 'user'}) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if(existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }
    const password_hash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      . returning({ id: users.id, name: users.name, email: users.email, role: users.role, created_at: users.created_at, updated_at: users.updated_at });
    
    logger.info(`User created successfully: ${newUser.email}`);
    return newUser;
  } catch (e) {
    if (e.message === 'User with this email already exists') {
      throw e;
    }
    logger.error('Error creating user', e);
    throw new Error('Failed to create user');
  }
};