const jwt = require('jsonwebtoken');

// ===================
// VERIFICAR TOKEN
// ===================

let verificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'El token es invalido',
                err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });

};

let verificaAdminRol = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.rol != 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            message: 'No esta autorizado para realizar la insercion'
        });

    }
    next();

};

module.exports = {
    verificaToken,
    verificaAdminRol
}