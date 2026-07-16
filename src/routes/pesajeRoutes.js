import { Router } from 'express';
import { registrarPesaje, obtenerHistorialPesajes } from '../controllers/pesajeController.js';
import { verificarToken } from '../middlewares/authMiddleware.js'; 

// Importamos el guardián de roles
import { permitirRoles } from '../middlewares/roleMiddleware.js'; 

const router = Router();

// ================================================================
// RUTAS TRANSACCIONALES DE PESAJE (LA ROMANA)
// ================================================================

// GET: Ver historial de pesajes 
// -> Acceso: Operador (para ver su día) y Supervisor (para auditar)
router.get('/', 
    verificarToken, 
    permitirRoles(['Operador', 'Supervisor']), 
    obtenerHistorialPesajes
);

// POST: Registrar un nuevo ticket de pesaje
// -> Acceso: EXCLUSIVO del Operador de Romana
router.post('/', 
    verificarToken, 
    permitirRoles(['Operador']), 
    registrarPesaje
);

export default router;