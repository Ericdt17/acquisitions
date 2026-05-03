import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { signupSchema, signinSchema } from '#validations/auth.validation.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if(!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error) });
    }
    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set (res, 'token', token);

    logger.info(`User registered successfully:${email}`);
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    logger.error('Error signing up user', e);
    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const signin = async (req, res) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error),
      });
    }
    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);
    return res.status(200).json({
      message: 'Signed in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    logger.error('Error signing in user', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const signout = (req, res) => {
  cookies.clear(res, 'token');
  return res.status(200).json({ message: 'Signed out successfully' });
};

export const me = (req, res) => {
  return res.status(200).json({ user: req.user });
};
