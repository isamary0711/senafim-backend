import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const login = async (req, res) => {
    try {
        console.log("=========================================");
        console.log("🕵️ INICIANDO INTENTO DE LOGIN");
        
        const correo = req.body.correo;
        const passwordFront = req.body.password || req.body.clave || req.body.contrasena; 

        if (!correo || !passwordFront) {
            return res.status(400).json({ error: 'Por favor ingrese correo y contraseña.' });
        }

        // 2. Buscamos al usuario en la tabla maestra estandarizada "TM_USUARI"
        // NOTA: Usamos comillas dobles en PostgreSQL para los identificadores en mayúsculas
        console.log(`🔍 Buscando usuario en TM_USUARI: ${correo}`);
        const userResult = await pool.query('SELECT * FROM "TM_USUARI" WHERE "USUARI_EM" = $1', [correo]);
        
        if (userResult.rows.length === 0) {
            console.log("❌ Error: Usuario no encontrado.");
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = userResult.rows[0];

        // 3. Verificación de estado (Suponiendo que tu columna es USUARI_AC)
        if (usuario.USUARI_AC === false) { 
            return res.status(403).json({ error: 'Usuario inhabilitado. Contacte al administrador.' });
        }

        // 4. Verificación de contraseña (Mapeo a PWD)
        const validPassword = await bcrypt.compare(passwordFront, usuario.USUARI_PW);
        
        if (!validPassword) {
            console.log("❌ Error: Contraseña incorrecta.");
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 5. Fabricamos el Token (Payload: id y rol)
        // IMPORTANTE: Asegúrate de que el nombre de la columna del rol sea USUARI_RL
        const token = jwt.sign(
            { 
                id: usuario.USUARI_ID, 
                rol: usuario.USUARI_RL 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log("🚀 Login exitoso. Rol detectado:", usuario.USUARI_RL);
        console.log("=========================================");

        res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id: usuario.USUARI_ID,
                nombre: usuario.USUARI_NO,
                correo: usuario.USUARI_EM,
                rol: usuario.USUARI_RL
            }
        });

    } catch (error) {
        console.error('❌ Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};