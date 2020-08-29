// =========================
//      PUERTO
// =========================

process.env.PORT = process.env.PORT || 3000;

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
    urlDb = 'mongodb+srv://wookie:85bpArt0E8Sd3sZU@cluster0.tnpsx.mongodb.net/delivery-db';
}

process.env.URLDB = urlDb;