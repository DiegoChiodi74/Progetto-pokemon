const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());


// Percorsi file
const POKEMON_FILE = path.join(__dirname, 'data', 'final_pokemon.json');
const COMBATS_FILE = path.join(__dirname, 'data', 'final_combats.json');
//per i 3 file
app.use(express.static(path.join(__dirname, 'public')));


// routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.get('/pokedex', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Pokedex.html'));
});

app.get('/arena', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Arena.html'));
});

// Variabili in memoria
let pokemons = [];
let combats = [];

// Caricamento iniziale
fs.readFile(POKEMON_FILE, 'utf8', (err, data) => {
  if (!err) pokemons = JSON.parse(data);
});

fs.readFile(COMBATS_FILE, 'utf8', (err, data) => {
  if (!err) combats = JSON.parse(data);
});

// Funzioni di salvataggio
function savePokemons() {
  fs.writeFileSync(POKEMON_FILE, JSON.stringify(pokemons, null, 2));
}

function saveCombats() {
  fs.writeFileSync(COMBATS_FILE, JSON.stringify(combats, null, 2));
}

// Tutti i Pokémon
app.get('/api/pokemon', (req, res) => {
  res.json(pokemons);
});

//singolo pokemon con name
app.get('/api/pokemon/nome/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const found = pokemons.find(p => p.Name.toLowerCase() === name);
  if (found) res.json(found);
  else res.status(404).json({ message: 'Pokémon non trovato per nome' });
});

// Singolo Pokémon con id
app.get('/api/pokemon/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const found = pokemons.find(p => p["#"] === id);
  if (found) res.json(found);
  else res.status(404).json({ message: 'Pokémon non trovato' });
});

// Aggiungi Pokémon
app.post('/api/pokemon', (req, res) => {
  const nuovoPokemon = req.body;
  // Controlla se esiste già un Pokémon con lo stesso ID
  const esiste = pokemons.some(p => p["#"].toString() === nuovoPokemon["#"].toString());
  if (esiste) {
    return res.status(400).json({ message: `Esiste già un Pokémon con ID ${nuovoPokemon["#"]}` });
  }
  // Se non esiste, aggiungiamo
  pokemons.push(req.body);
  savePokemons();
  res.status(201).json({ message: 'Pokémon aggiunto', data: req.body });
});

// Modifica Pokémon
app.put('/api/pokemon/:id', (req, res) => {
  const id = req.params.id;
  const index = pokemons.findIndex(p => p["#"].toString() === id.toString());
  if (index !== -1) {
    pokemons[index] = req.body;
    savePokemons();
    res.json({ message: 'Pokémon aggiornato', data: req.body });
  } else {
    res.status(404).json({ message: 'Pokémon non trovato' });
  }
});

// Elimina Pokémon
app.delete('/api/pokemon/:id', (req, res) => {
  const id = req.params.id;
  const index = pokemons.findIndex(p => p["#"].toString() === id.toString());
  if (index !== -1) {
    const deleted = pokemons.splice(index, 1);
    savePokemons();
    res.json({ message: 'Pokémon eliminato', data: deleted[0] });
  } else {
    res.status(404).json({ message: 'Pokémon non trovato' });
  }
});

// Elenco scontri
app.get('/api/combats', (req, res) => {
  res.json(combats);
});

// Avvia server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
