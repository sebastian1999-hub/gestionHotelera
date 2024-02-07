/* Librerías */
const express = require("express");

const Limpieza = require(__dirname + "/../models/limpieza.js");
const Habitacion = require(__dirname + "/../models/habitacion.js");

const router = express.Router();

/* Limpiezas de una habitación */
router.get("/:id", async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    const limpiezas = await Limpieza.find({ idHabitacion: req.params.id }).sort(
      { fechaHora: -1 }
    );
    if (limpiezas.length === 0) {
      res.render("error", { error: "No hay limpiezas registradas" });
    }
    res.render("listado_limpiezas", {
      limpiezas: resultado,
      habitacion: habitacion,
    });
  } catch (error) {
    res.render("error", { error: "No hay limpiezas registradas" });
  }
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
router.get("/nueva/:id", (req, res) => {
  const habitacionId = req.params.id;
  res.render("limpiezas_nueva", { id: habitacionId });
});

/* Actualizar limpieza */
router.post("/:id", async (req, res) => {
  try {
    let nuevaLimpieza = new Limpieza({
      idHabitacion: req.params.id,
      fechaHora: req.body.fecha,
      observaciones: req.body.observaciones? req.body.observaciones : null,
    });

    

    const resultado = await nuevaLimpieza.save();
    const habitacion = await Habitacion.findById(req.params.id);
    habitacion= await Habitacion.findandupdate({_id:req.params.id},{$set:{ultimaLimpieza: req.body.fecha}});
    const limpiezas = await Limpieza.find({ idHabitacion: req.params.id });
      
    
    res.render("listado_limpiezas", { habitacion: habitacion, limpiezas: limpiezas });
  } catch (error) {
    res.render("error", { error: "Error creando la limpieza" });
  }
});

module.exports = router;
