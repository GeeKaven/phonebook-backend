const express = require("express");
const morgan = require("morgan");
const app = express();

morgan.token("pb", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :pb")
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/info", (req, res) => {
  const info = `Phonebook has info for ${persons.length} people`;
  res.send(`<div>${info}</div> <div>${new Date()}</div>`);
});

app.get("/api/person/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/person/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name) {
    res.status(400).json({ error: "name must be unique" });
  }

  if (!body.number) {
    res.status(400).json({ error: "number must be unique" });
  }

  if (persons.find((person) => person.name === body.name)) {
    res.status(400).json({ error: `${body.name} has been created` });
  }

  const person = {
    id: getRandomInt(10000000),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  res.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
