const express = require('express');
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const _ = require('underscore');

const app = express();

let Categoria = require('../models/categoria');

app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriasDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categoriasDb
            });
        });
});

app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDb) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontro la categoria'
            });
        }

        res.json({
            ok: true,
            categoriaDb
        });
    });

});

app.post('/categoria/', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Ocurrio un error',
                err
            });
        }

        if (!categoriaDb) {
            return res.status(400).json({
                ok: false,
                message: 'Ocurrio un error',
                err
            });
        }

        res.json({
            ok: true,
            categoriaDb
        })
    });


});

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = _.pick(req.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, categoriaDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaDb
        });

    });

});

app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'Categoria eliminada satisfactoriamente',
            categoriaDb
        })

    });

});

module.exports = app;