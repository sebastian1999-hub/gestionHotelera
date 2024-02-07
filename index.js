/* Librerías */
const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const nunjucks = require('nunjucks');
const session = require('express-session');

const habitaciones = require(__dirname + "/routes/habitaciones");
const limpiezas = require(__dirname + "/routes/limpiezas");
const auth = require(__dirname + "/routes/auth");


dotenv.config();

/* Conexión a la BD */
mongoose.connect('mongodb://localhost:27017/hotel');

let app = express();
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Asignación del motor de plantillas
app.set('view engine', 'njk');
app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/habitaciones", habitaciones);
app.use("/limpiezas", limpiezas);
app.use("/login", auth);
app.use('/node_modules', express.static('node_modules'));



app.listen(8080);