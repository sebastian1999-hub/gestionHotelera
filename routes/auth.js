const express = require("express");
const Usuario=require(__dirname + "/../models/usuario");

let router = express.Router();


router.get('/login', (req, res) => {
    res.render('login');
})
router.post('/login', (req, res) => {
    Usuario.findOne({ login: req.body.login, password: req.body.password }).then((usuario) => {
        if (!usuario) {
            res.render('login', { error: 'Usuario o contraseña incorrectos' });
        }
        else {
            req.session.usuario = usuario.login;
            res.redirect('/habitaciones');
        }
    })
});
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/habitaciones');
});




module.exports = router;