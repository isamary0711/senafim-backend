import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. IMPORTAMOS TODAS TUS RUTAS
import vacantesRoutes from './routes/vacantesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pesajeRoutes from './routes/pesajeRoutes.js';

// Inicializamos las variables de entorno (para leer tu conexión a Neon y el JWT_SECRET)
dotenv.config();

const app = express();

// 2. CONFIGURAR MIDDLEWARES GLOBALES
// Permite que tu frontend se comunique con este backend sin bloqueos de seguridad CORS
app.use(cors()); 

// Permite que Express entienda los datos JSON que le envía tu frontend (el req.body)
app.use(express.json()); 

// 3. CONECTAR LOS ENRUTADORES
// Cada ruta maneja su propio módulo de forma limpia
app.use('/api/vacantes', vacantesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pesajes', pesajeRoutes);

// 4. RUTA BASE DE COMPROBACIÓN (Opcional pero muy útil)
app.get('/', (req, res) => {
    res.json({ mensaje: '🚀 API del sistema funcionando correctamente.' });
});

// 5. LEVANTAR EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});