import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { signupSchema } from '#validations/auth.validation.js';
import { createUser } from '#services/auth.service.js';
import jwt from 'jsonwebtoken';
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

    const token = jwt.sign({id: user.id, email: user.email, role: user.role});
    cookies.set (res, 'token', token);

    logger.info(`User registered successfully:${email}`);
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    logger.error('Error signing up user', e);
    if(e.message === 'User with this email already exists') {
      return res.status(409).json({error: 'User with this email already exists' });
    }

  //  next(e);
  }
};

