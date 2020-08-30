const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

const _ = require('underscore');

const app = express();

let Producto = require('../models/producto');
const { findByIdAndUpdate } = require('../models/producto');

app.get('/producto', verificaToken, (req, res) => {
    // usuario y categoria, paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true }, 'nombre descripcion precioUni')
        .limit(limite).skip(desde)
        .populate('usuario')
        .populate('categoria')
        .exec((err, productosDb) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Ocurrio un error',
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productosDb,
                    cuantos: conteo
                });
            });

        });

});

app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id, (err, productoDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productoDb
        });
    });

});

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productosDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productosDb
            });
        });
});

app.post('/producto', verificaToken, (req, res) => {
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoriaId']);

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoriaId,
        usuario: req.usuario._id,
    });

    producto.save((err, productoDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productoDb
        })
    });
});

app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoriaId']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productoDb
        });
    });

});

app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let cambiaDisponible = { disponible: false };

    Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true }, (err, productoDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDb) {
            return res.status(400).json({
                ok: false,
                message: 'No existe el id'
            });
        }

        res.json({
            ok: true,
            productoDb
        });
    });
});


module.exports = app;