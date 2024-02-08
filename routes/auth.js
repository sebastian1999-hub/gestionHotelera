const express = require("express");
const Usuario=require(__dirname + "/../models/usuario");

let router = express.Router();



router.post('/login', (req, res) => {
    let login = req.body.login;
    let password = req.body.password;

    let existeUsuario = Usuario.filter(usuario => 
        usuario.usuario == login && usuario.password == password);

    if (existeUsuario.length > 0)
    {
        req.session.usuario = existeUsuario[0].usuario;
        res.render('index');
    } else {
        res.render('login', 
                   {error: "Usuario o contraseña incorrectos"});
    }
});
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

let autenticacion = (req, res, next) => {
    if (req.session && req.session.usuario)
        return next();
    else
        res.render('login');
};



module.exports = router;