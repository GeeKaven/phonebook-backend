require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const Person = require("./models/person");

morgan.token("pb", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :pb")
);

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/info", (req, res) => {
  Person.find({}).then((res) => {
    const info = `Phonebook has info for ${res.length} people`;
    res.send(`<div>${info}</div> <div>${new Date()}</div>`);
  });
});

app.get("/api/person/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      res.status(500).end();
    });
});

app.delete("/api/person/:id", (req, res) => {
  Person.deleteOne({ _id: req.params.id }).then(() => {
    res.status(204).end();
  });
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  console.log("body");
  if (!body.name) {
    res.status(400).json({ error: "name must be unique" }).end();
  }

  if (!body.number) {
    res.status(400).json({ error: "number must be unique" }).end();
  }

  Person.findOne({ name: body.name }).then((person) => {
    if (person) {
      res
        .status(400)
        .json({ error: `${body.name} has been created` })
        .end();
    }
  });

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then((savePerson) => {
    res.json(savePerson);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
