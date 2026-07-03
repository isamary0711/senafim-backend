import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log("=========================================");
console.log("🕵️ AUDITORÍA DE ENTORNO ACTIVA");
console.log("=========================================");

if (process.env.DATABASE_URL) {
    console.log("✅ La variable DATABASE_URL está cargada.");
} else {
    console.log("❌ ALERTA: No se encontró DATABASE_URL.");
}

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
});

pool.on('connect', (client) => {
    console.log('🔗 Conexión EN LA NUBE establecida con:', client.host);
});