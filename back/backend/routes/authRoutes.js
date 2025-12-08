import express from 'express';
import { AuthController } from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/register',
  AuthController.validateRegister(),
  AuthController.register
);

router.post('/login', AuthController.validateLogin(), AuthController.login);

export default router;


