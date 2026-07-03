import { Router } from 'express';
import { registrarPesaje, obtenerHistorialPesajes } from '../controllers/pesajeController.js';
// Asegúrate de que la ruta y el nombre de tu middleware de autenticación coincidan:
import { verificarToken } from '../middlewares/authMiddleware.js'; 

const router = Router();

// Rutas protegidas (Requieren que el operador haya iniciado sesión y envíe su token)
router.post('/', verificarToken, registrarPesaje);
router.get('/', verificarToken, obtenerHistorialPesajes);

export default router;