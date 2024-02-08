/* Librerías */
const express = require("express");
const Habitacion = require(__dirname + "/../models/habitacion.js");
const Limpieza = require(__dirname + "/../models/limpieza.js");
const autentication = require(__dirname + "/../utils/auth.js");
const upload = require(__dirname + "/../utils/uploads.js");


let router = express.Router();

router.get("/nueva",autentication.autenticacion, (req, res) => {
  res.render("habitaciones_nueva");
});
/* Listado de todas las habitaciones */
router.get("/", async (req, res) => {
   Habitacion.find().then((resultado) => {
     res.render("listado_habitaciones", { habitaciones: resultado });

   }).catch((error) => {
     res.render("error", { error: "Error listando habitaciones" });
   })
});

/* Obtener detalles de una habitación concreta */
router.get("/:id",  (req, res) => {
  
    Habitacion.findById(req.params.id).then((resultado) => {
      if (!resultado) {
        res.render("error", { error: "Error buscando habitacion" });
      }
      res.render("ficha_habitacion", { habitacion: resultado });
    })
    .catch((error) => {
      res.render("error", { error: "Error buscando habitacion" });
    })
    
});



/* Insertar una habitación */
router.post("/", upload.uploadHabitacion.single("imagen"), (req, res) => {
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
  Habitacion.findByIdAndDelete(req.params.id).then((resultado) => {
    if (resultado) {
      Limpieza.deleteMany({ idHabitacion: req.params.id }).then(() => {
        res.redirect('/habitaciones');
      })
    }
    else{
      res.render("error", { error: "Error eliminando la habitación" });
    }

  }).catch((error) => {
    res.render("error", { error: "Error encontrando la habitación" });
  })
});

/* Añadir una incidencia a una habitación */
router.post("/:id/incidencias",upload.uploadHabitacion.single("imagen"), async (req, res) => {
  const nuevaIncidencia = new Incidencia({
    descripcion: req.body.descripcion,
    imagen: req.file.filename ? req.file.filename : null,
  })
  Habitacion.findById(req.params.id).then((habitacion) => {
    if (habitacion) {
      habitacion.incidencias.push(nuevaIncidencia);
      habitacion.save().then((resultado) => {
        res.render("ficha_habitacion", { habitacion: resultado, incidencias: resultado.incidencias });
      }).catch((error) => {
        res.render("error", { error: "Error añadiendo la incidencia" });
      })
    }
  }).catch((error) => {
    res.render("error", { error: "Error encontrando la hhabitacion" });
  })
});

/* Actualizar el estado de una incidencia de una habitación */
// router.put("/:idH/incidencias/:idI", autentication.autentication, (req, res) => {
//   Habitacion.findById(req.params.idH).then((habitacion) => {
//     if (habitacion) {
//       habitacion.incidencias.forEach((incidencia) => {
//         if (incidencia._id == req.params.idI) {
//           incidencia.fechaFin = new Date();
//           incidencia.save().then((resultado) => {
//             res.redirect(`/habitaciones/${req.params.idH}`);
//           }).catch((error) => {
//             res.render("error", { error: "Error actualizando la incidencia" });
//           })
          
//         }
//       })
//     }
//     else{
//       res.render("error", { error: "Error encontrando la incidencia" });
//     }
//   }).catch((error) => {
//     res.render("error", { error: "Error encontrando la habitación" });
//   })
// });

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
