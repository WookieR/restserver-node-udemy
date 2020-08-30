// =========================
//      PUERTO
// =========================

process.env.PORT = process.env.PORT || 3000;

// =========================
//      Vencimiento Token
// =========================

process.env.CADUCIDAD_TOKEN = 3600000;

// =========================
//      Seed Token
// =========================

process.env.SEED = process.env.SEED || 'clave-secreta';

// =========================
//      Entorno
// =========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =========================
//      Base de Datos
// =========================

let urlDb;

if (process.env.NODE_ENV === 'dev') {
    urlDb = 'mongodb://localhost:27017/delivery-db';
} else {
    urlDb = process.env.MONGO_URI;
}

process.env.URLDB = urlDb;

// =========================
//      Google Client
// =========================

process.env.CLIENT_ID = process.env.CLIENT_ID || '140092941922-ulo823eqc4ieggctf2pa50ptt8dkfvjf.apps.googleusercontent.com';