import rateLimit from 'express-rate-limit';

// Configuración del limitador para el inicio de sesión
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
    max: 5, // Bloquea la IP tras 5 intentos fallidos dentro de los 15 minutos
    message: {
        error: "Demasiados intentos de inicio de sesión. Por seguridad, tu IP ha sido bloqueada temporalmente. Inténtalo de nuevo en 15 minutos."
    },
    standardHeaders: true, // Retorna la información de límite en los headers 'RateLimit-*'
    legacyHeaders: false, // Deshabilita los headers antiguos 'X-RateLimit-*'
    handler: (req, res, next, options) => {
        console.warn(`⚠️ Intento de fuerza bruta detectado desde la IP: ${req.ip}`);
        res.status(429).json(options.message);
    }
});