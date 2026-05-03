import express from 'express';
import { requireAuth, requireAdmin } from '#middlewares/auth.middleware.js';
import * as userController from '#controllers/user.controller.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/', userController.index);
router.post('/', userController.store);
router.get('/:id', userController.show);
router.patch('/:id', userController.update);
router.delete('/:id', userController.destroy);

export default router;
