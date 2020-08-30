const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');

const app = express();

app.post('/login', function(req, res) {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDb) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario o contraseña son incorrectos'
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario o contraseña son incorrectos'
            });
        }

        let token = jwt.sign({
            usuario: usuarioDb
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuarioDb,
            token
        });

    });
});

// CONFIGURACIONES DE GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch((err) => {
            res.status(403).json({
                ok: false,
                err
            });
        });

    // res.json({
    //     usuario: googleUser
    // });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDb) {
            if (usuarioDb.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su autenticacion normal'
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDb
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuarioDb,
                    token
                });
            }
        } else {
            let usuario = new Usuario();
            usuario.nombre = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'

            usuario.save((err, usuarioDb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDb
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    usuarioDb,
                    token
                });
            });
        }
    });

});

module.exports = app;