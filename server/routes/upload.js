const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    let tiposValidos = ['producto', 'usuario'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo invalido'
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado ningun archivo'
        });
    }

    let archivo = req.files.archivo;

    let nombreArchivo = archivo.name.split('.');

    let extension = nombreArchivo[nombreArchivo.length - 1];

    //EXTENSIONES PERMITIDAS
    let extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas
            }
        });
    }

    //CAMBIAR NOMBRE AL ARCHIVO
    let nuevoNombre = `${id}-${new Date().getMilliseconds() }.${extension}`;

    archivo.mv(`uploads/${tipo}/${nuevoNombre}`, (err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //IMAGEN CARGADA
        if (tipo === 'usuario') {
            imagenUsuario(id, res, nuevoNombre);
        } else {
            imagenProducto(id, res, nuevoNombre);
        }
    });
});

function imagenUsuario(id, res, nuevoNombre) {
    Usuario.findById(id, (err, usuarioDb) => {
        if (err) {
            borraArchivo(nuevoNombre, 'usuario')
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDb) {
            borraArchivo(usuarioDb.img, 'usuario')
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //BORRAR
        borraArchivo(usuarioDb.img, 'usuario')

        usuarioDb.img = nuevoNombre;
        usuarioDb.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuarioGuardado,
                img: nuevoNombre
            });
        });
    });
}

function imagenProducto(id, res, nuevoNombre) {
    Producto.findById(id, (err, productoDb) => {
        if (err) {
            borraArchivo(nuevoNombre, 'producto')
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDb) {
            borraArchivo(productoDb.img, 'producto')
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //BORRAR
        borraArchivo(productoDb.img, 'producto')

        productoDb.img = nuevoNombre;
        productoDb.save((err, productoGuardado) => {
            res.json({
                ok: true,
                productoGuardado,
                img: nuevoNombre
            });
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;