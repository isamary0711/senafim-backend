import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { loginLimiter } from '../middlewares/rateLimitMiddleware.js'; // Importamos el limitador

const router = Router();

// Aplicamos 'loginLimiter' únicamente al endpoint de login
router.post('/login', loginLimiter, login);

export default router;