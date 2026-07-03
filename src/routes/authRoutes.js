import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Definimos que al recibir un POST en esta ruta, se ejecute nuestro controlador
router.post('/login', login);

export default router;