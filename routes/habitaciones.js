/* Librerías */
const express = require("express");
const Habitacion = require(__dirname + "/../models/habitacion.js");
const Limpieza = require(__dirname + "/../models/limpieza.js");
const multer = require('multer');

let router = express.Router();
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname)
  }
})
let upload = multer({storage: storage});

/* Listado de todas las habitaciones */
router.get("/", async (req, res) => {
  try {
    const resultado = await Habitacion.find();
    if (!resultado || resultado.length == 0)
      res.render("error", { error: "Error listando Habitaciones" });
    else res.render("listado_habitaciones", { habitaciones: resultado });
  } catch (err) {
    res
      .status(500)
      .send({ error: "No hay habitaciones registradas en la aplicación" });
  }
});

/* Obtener detalles de una habitación concreta */
router.get("/:id", async (req, res) => {
  try {
    const resultado = await Habitacion.findById(req.params.id);
    if (!resultado) {
      res.render("error", { error: "Error buscando habitacion" });
    }
    res.render("ficha_habitacion", { habitacion: resultado });
  } catch (error) {
    res.status(400).send({ error: "No existe el número de habitación" });
  }
});
router.get("/nueva", (req, res) => {
  res.render("habitacion_nueva");
});

/* Insertar una habitación */
router.post("/", upload.single("imagen"), (req, res) => {
  const nuevaHabitacion = new Habitacion({
    numero: req.body.numero,
    tipo: req.body.tipo,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    ultimaLimpieza: new Date(),
    imagen: req.file.filename ? req.file.filename : null,
  });

  nuevaHabitacion
    .save()
    .then((resultado) => {
      res.redirect(req.baseUrl);
    })
    .catch((error) => {
      res.render("habitacion_nueva", { errores: error.errors });
    });
});

/* Actualizar TODAS las últimas limpiezas */
router.put("/ultimaLimpieza", async (req, res) => {
  try {
    // Obtenemos todas las habitaciones
    const habitaciones = await Habitacion.find();

    // Iteramos sobre cada habitación y actualizamos la última limpieza
    habitaciones.forEach(async (habitacion) => {
      const ultimaLimpieza = await Limpieza.findOne({
        idHabitacion: habitacion._id,
      }).sort({ fechaHora: -1 });

      if (ultimaLimpieza) {
        habitacion.ultimaLimpieza = ultimaLimpieza.fechaHora;
        await habitacion.save();
      }
    });

    res
      .status(200)
      .send({
        resultado: "Se han actualizado las ultimas limpiezas realizadas",
      });
  } catch (error) {
    res.status(400).send({ error: "Error actualizando limpiezas" });
  }
});

/* Actualizar los datos de una habitación */
router.put("/:id", async (req, res) => {
  try {
    const resultado = await Habitacion.findByIdAndUpdate(
      req.params.id,
      {
        numero: req.body.numero,
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        ultimaLimpieza: req.body.ultimaLimpieza,
        precio: req.body.precio,
      },
      { new: true, runValidators: true }
    );

    if (!resultado) {
      return res
        .status(400)
        .send({ error: "Error actualizando los datos de la habitación" });
    }
    res.status(200).send({ resultado: resultado });
  } catch (error) {
    res
      .status(400)
      .send({ error: "Error actualizando los datos de la habitación" });
  }
});

/* Eliminar una habitación */
router.delete("/:id", async (req, res) => {
  try {
    const resultado = await Habitacion.findByIdAndDelete(req.params.id);
    if (!resultado) {
      return res.render('error',{ error: "Error eliminando la habitación" });
    }
    const habitaciones= await Habitacion.find();
    res.render('listado_habitaciones',{ habitaciones: habitaciones});
  } catch (error) {
    res.render('error',{ error: "Error eliminando la habitación: " });
  }
});

/* Añadir una incidencia a una habitación */
router.post("/:id/incidencias",upload.single("imagen"), async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    if (!habitacion) {
      return res.render('error',{ error: "Error añadiendo la incidencia" });
    }

    const incidencia = {
      descripcion: req.body.descripcion,
      fechaInicio: new Date(),
      imagen: req.file.filename ? req.file.filename : null
    };
    habitacion.incidencias.push(incidencia);

    const habitacionActualizada = await habitacion.save();
    res.render("ficha_habitacion", { habitacion: habitacionActualizada, incidencias: habitacionActualizada.incidencias });
  } catch (error) {
    res.render("error", { error: "Error anadiendo la incidencia" });
  }
});

/* Actualizar el estado de una incidencia de una habitación */
router.put("/:idH/incidencias/:idI", async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.idH);
    if (!habitacion) {
      return res.render('error',{ error: "Incidencia no encontrada" });
    }

    // Búsqueda de la incidencia dentro del array de incidencias de la habitación
    const incidencia = habitacion.incidencias.id(req.params.idI);

    if (!incidencia) {
      return res.render('error',{ error: "Incidencia no encontrada" });
    }

    incidencia.fechaFin = new Date();
    const habitacionActualizada = await habitacion.save();
    res.render("ficha_habitacion", { habitacion: habitacionActualizada, incidencias: habitacionActualizada.incidencias });
  } catch (error) {
    res.status(400).send({ error: "Error al actualizar la incidencia" });
  }
});

/* Actualizar última limpieza */
router.put("/:id/ultimalimpieza", async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    if (!habitacion) {
      return res.status(400).send({ error: "Error actualizando limpieza" });
    }

    const ultimaLimpieza = await Limpieza.findOne({
      idHabitacion: req.params.id,
    }).sort({ fechaHora: -1 });
    if (!ultimaLimpieza) {
      return res.status(400).send({ error: "Error actualizando limpieza" });
    }

    habitacion.ultimaLimpieza = ultimaLimpieza.fechaHora;
    const habitacionActualizada = await habitacion.save();
    res.status(200).send({ resultado: habitacionActualizada });
  } catch (error) {
    res.status(400).send({ error: "Error actualizando limpieza" });
  }
});

module.exports = router;
