import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en los headers (Bearer token)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ 
            error: "Token no proporcionado. Acceso denegado." 
        });
    }

    try {
        // 2. Verificamos el token con el secreto definido en tus variables de entorno
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. INYECCIÓN DE IDENTIDAD: 
        // Inyectamos el objeto completo decodificado. 
        // Asegúrate de que al crear el token (login), incluiste: { id: ..., rol: ... }
        req.usuario = decoded; 
        
        // 4. LOG DE SEGURIDAD (Opcional, ayuda a depurar accesos en consola)
        // console.log(`Usuario autenticado: ID ${req.usuario.id} con ROL: ${req.usuario.rol}`);
        
        next(); 
    } catch (error) {
        console.error("❌ Fallo en la verificación del token:", error.message);
        return res.status(401).json({ 
            error: "Token inválido o expirado. Por favor, inicia sesión nuevamente." 
        });
    }
};