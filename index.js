import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import pesajeRoutes from './src/routes/pesajeRoutes.js';
import vacantesRoutes from './src/routes/vacantesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- RUTAS PÚBLICAS Y MIXTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/vacantes', vacantesRoutes);

// --- RUTAS PROTEGIDAS ---
app.use('/api/pesajes', pesajeRoutes);

app.get('/', (req, res) => {
    res.send('🚀 Motor SENAFIM V2.0 Operativo en entorno limpio.');
});

app.listen(PORT, () => {
    console.log('=========================================');
    console.log('🚀 SENAFIM BACKEND V2.0 (NUEVO ENTORNO)');
    console.log('📡 Escuchando en el puerto: ' + PORT);
    console.log('=========================================');
});