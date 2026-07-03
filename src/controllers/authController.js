import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const login = async (req, res) => {
    try {
        console.log("=========================================");
        console.log("🕵️ INICIANDO INTENTO DE LOGIN");
        
        // 1. Recibimos los datos que envía el frontend
        // Usamos un fallback por si tu React lo envía como 'clave' o 'contrasena'
        const correo = req.body.correo;
        const passwordFront = req.body.password || req.body.clave || req.body.contrasena; 

        console.log(`Datos recibidos -> Correo: ${correo}, Clave recibida: ${passwordFront ? 'SÍ' : 'NO'}`);

        if (!correo || !passwordFront) {
            console.log("❌ Error: Faltan datos en la petición del frontend.");
            return res.status(400).json({ error: 'Por favor ingrese correo y contraseña.' });
        }

        // 2. Buscamos al usuario en la base de datos de PostgreSQL
        console.log(`🔍 Buscando usuario en Neon: ${correo}`);
        const userResult = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        
        if (userResult.rows.length === 0) {
            console.log("❌ Error: Usuario no encontrado en la base de datos.");
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = userResult.rows[0];
        console.log("✅ Usuario encontrado en BD. ¿Tiene hash de password?:", !!usuario.password);

        // 3. Verificamos si el usuario no ha sido despedido/suspendido
        // CORRECCIÓN: Como la columna 'activo' aún no existe en Neon, verificamos explícitamente 
        // que sea 'false' para bloquear, en lugar de bloquear si es 'undefined'.
        if (usuario.activo === false) { 
            console.log("❌ Error: El usuario está inhabilitado.");
            return res.status(403).json({ error: 'Usuario inhabilitado. Contacte al administrador.' });
        }

        // 4. Comparamos la contraseña enviada con la encriptada en la base de datos
        if (!usuario.password) {
            console.log("❌ Error Crítico: La columna 'password' del usuario está vacía en Neon.");
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const validPassword = await bcrypt.compare(passwordFront, usuario.password);
        
        if (!validPassword) {
            console.log("❌ Error: La contraseña ingresada no coincide con el hash.");
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        console.log("🔓 ¡Contraseña validada matemáticamente con éxito!");

        // 5. Fabricamos el "Carnet Digital" (Token) válido por 8 horas
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log("🚀 Login exitoso. Enviando token al frontend.");
        console.log("=========================================");

        // 6. Damos la bienvenida al usuario (sin devolver la contraseña por seguridad)
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