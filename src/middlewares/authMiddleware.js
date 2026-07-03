import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en los headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // El formato es "Bearer <token>"

    if (!token) {
        return res.status(403).json({ error: "Token no proporcionado. Acceso denegado." });
    }

    try {
        // 2. Verificamos el token con tu secreto
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. AQUÍ ESTÁ LA CLAVE: Inyectamos el usuario en el objeto 'req'
        req.usuario = decoded; 
        
        next(); // Continuamos al controlador
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};