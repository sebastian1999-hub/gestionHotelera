/* Librerías */
const express = require("express");

const Limpieza = require(__dirname + "/../models/limpieza.js");
const Habitacion = require(__dirname + "/../models/habitacion.js");
const autentication = require(__dirname + "/../utils/auth.js");

const router = express.Router();




/* Limpiezas de una habitación */
router.get("/:id", async (req, res) => {
  Habitacion.findById(req.params.id).then((habitacion) => {
    if (habitacion) {
      let numeroHabitacion = habitacion.numero;
      Limpieza.find({ idHabitacion: req.params.id }).sort({fechaHora: -1}).then((limpiezas) => {
        res.render('listado_limpiezas', { limpiezas: limpiezas, habitacion: habitacion})
      })
    }
    else{
      res.render("error", { error: "Error buscando habitacion" });
    }
  }).catch((error) => {
    res.render("error", { error: "Error encontrando habitacion" });
  })
});
router.get("/nueva/:id",autentication.autenticacion, (req, res) => {
  const habitacionId = req.params.id;
  console.log(habitacionId);
  res.render("limpiezas_nueva", { id: habitacionId });
});

/* Estado de limpieza actual de una habitación */
router.get("/:id/estadolimpieza", async (req, res) => {
  try {
    const resultado = await Limpieza.find({ idHabitacion: req.params.id }).sort(
      "-fechaHora"
    );
    let estado = "limpia";

    if (resultado.length === 0) {
      estado = "pendiente de limpieza";
    } else {
      let fecha = resultado[0].fechaHora;
      let hoy = new Date();
      if (
        fecha.getFullYear() !== hoy.getFullYear() ||
        fecha.getMonth() !== hoy.getMonth() ||
        fecha.getDate() !== hoy.getDate()
      ) {
        estado = "pendiente de limpieza";
      }
    }
    res.status(200).send({ resultado: estado });
  } catch (err) {
    res.status(400).send({ error: "Error obteniendo estado de limpieza" });
  }
});

/* Actualizar limpieza */
router.post("/:id",  (req, res) => {
  
    let nuevaLimpieza = new Limpieza({
      idHabitacion: req.params.id,
      fechaHora: req.body.fecha,
      observaciones: req.body.observaciones? req.body.observaciones : null,});

    nuevaLimpieza.save().then(() => {
      Limpieza.find({ idHabitacion: req.params.id }).sort({fechaHora: -1}).then((limpiezas) => {
        Habitacion.findByIdAndUpdate(req.params.id, {
          $set: {
            ultimaLimpieza: limpiezas[0].fechaHora
          }
          
        },{new: true}).then(() => {
          res.redirect('/limpiezas/' + req.params.id);
        }).catch((error) => {
          res.render("error", { error: "Error actualizando la habitación" });
        })
      }).catch((error) => {
        res.render("error", { error: "Error actualizando la habitación" });
      })
    })
  
});

module.exports = router;
