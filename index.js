require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");

morgan.token("pb", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.static('build'))
app.use(cors())
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :pb")
);

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/info", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      const info = `Phonebook has info for ${persons.length} people`;
      res.send(`<div>${info}</div> <div>${new Date()}</div>`);
    })
    .catch((err) => next(err));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      next(err);
    });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove({ _id: req.params.id })
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;
  console.log("body");
  if (!body.name) {
    res.status(400).json({ error: "name must be unique" }).end();
  }

  if (!body.number) {
    res.status(400).json({ error: "number must be unique" }).end();
  }

  // Person.findOne({ name: body.name }).then((person) => {
  //   if (person) {
  //     res
  //       .status(400)
  //       .json({ error: `${body.name} has been created` })
  //       .end();
  //   }
  // });

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savePerson) => {
      res.json(savePerson);
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatePerson) => {
      res.json(updatePerson);
    })
    .catch((err) => next(err));
});

const unknowEndpoint = (req, res) => {
  res.status(404).send({ error: "unknow endpoint" });
};
app.use(unknowEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log("error", error.name);

  if (error.name === "CastError") {
    res.status(400).json({ error: "error id" });
  } else if (error.name === "ValidationError") {
    res.status(400).json({ error: error.message });
  } else if (error.name === "MongoError") {
    res.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
