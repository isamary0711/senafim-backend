import { Router } from 'express';
import { 
    obtenerVacantesActivas, 
    obtenerTodasLasVacantes, 
    crearVacante, 
    eliminarVacante, 
    postularseAVacante, 
    obtenerPostulacionesRecibidas 
} from '../controllers/vacantesController.js';
import { verificarToken } from '../middlewares/authMiddleware.js'; // <--- IMPORTAMOS TU MEDIADOR

const router = Router();

// ==========================================
// 🌐 RUTAS PÚBLICAS (Acceso libre en la Web)
// ==========================================
router.get('/activas', obtenerVacantesActivas);
router.post('/postular', postularseAVacante);

// ==========================================
// 🔐 RUTAS PROTEGIDAS (Solo Personal Autorizado)
// ==========================================
router.get('/todas', verificarToken, obtenerTodasLasVacantes);
router.get('/postulaciones', verificarToken, obtenerPostulacionesRecibidas);
router.post('/crear', verificarToken, crearVacante);
router.put('/eliminar/:id', verificarToken, eliminarVacante);

export default router;