/* Librerías */
const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const methodOverride = require('method-override');
const nunjucks = require('nunjucks');
const session = require('express-session');

const habitaciones = require(__dirname + "/routes/habitaciones");
const limpiezas = require(__dirname + "/routes/limpiezas");
const auth = require(__dirname + "/routes/auth");


dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/hotel');

let app = express();
app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: false
}));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
nunjucks.configure('views', {
    autoescape: true,
    express: app
});


app.set('view engine', 'njk');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function(req, res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
       
        var method = req.body._method
        delete req.body._method
        return method
    }
}));
app.use('/public',express.static(__dirname + 'public'));
app.use("/habitaciones", habitaciones);
app.use("/limpiezas", limpiezas);
app.use("/auth", auth);
app.use('/node_modules', express.static('node_modules'));

app.get('/', (req, res) => {
    res.redirect('listado_habitaciones');
})



app.listen(8080);