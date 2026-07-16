import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const login = async (req, res) => {
    try {
        console.log("🕵️ INICIANDO INTENTO DE LOGIN");
        
        const correo = req.body.correo;
        const passwordFront = req.body.password || req.body.clave || req.body.contrasena; 

        if (!correo || !passwordFront) {
            return res.status(400).json({ error: 'Por favor ingrese correo y contraseña.' });
        }

        // Buscamos en tu tabla original: 'usuarios'
        const userResult = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = userResult.rows[0];

        if (usuario.activo === false) { 
            return res.status(403).json({ error: 'Usuario inhabilitado. Contacte al administrador.' });
        }

        const validPassword = await bcrypt.compare(passwordFront, usuario.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // IMPORTANTE: Aseguramos inyectar el ROL en el token
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('❌ Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};