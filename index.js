const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { MongoClient } = require('mongodb'); // Use object destructuring
const app = express();
const port = 30009;
const jsonParser = bodyParser.json();
const fileName = 'students.json';

app.use(bodyParser.json());
app.use(express.static('public'));

const mongoURL = 'mongodb://localhost:27017';
const dbName = 'database_hello_world';
const collectionName = 'collection_hello_world';

app.set('views', 'views');
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Load data from file
let rawData = fs.readFileSync(fileName);
let data = JSON.parse(rawData);

app.get('/', (request, response) => {
    response.render('home');
});

app.get('/students', (request, response) => {
    data.sort((a, b) => (a.name > b.name) ? 1 : -1);
    response.send(data);
});

app.post('/students', jsonParser, async (request, response) => {
    const newStudent = request.body;
    data.push(newStudent);
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));

    try {
      const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      await collection.insertOne(newStudent);
      client.close();
  
      response.end();
  } catch (error) {
      console.error('Error inserting data into MongoDB:', error);
      response.status(500).json({ error: 'Error inserting data into MongoDB' }); // Respond with an error message
  }
  
});

app.delete('/students/:id', (request, response) => {
    const id = parseInt(request.params.id);
    data = data.filter((student) => student.id !== id);
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    response.end();
});

app.patch('/students/:id', jsonParser, (request, response) => {
    const id = parseInt(request.params.id);
    const { name } = request.body;
    const index = data.findIndex((student) => student.id === id);
    if (index !== -1) {
        data[index].name = name;
        fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
        response.end();
    } else {
        response.status(404).end();
    }
});

// Wrap server setup and listener in an async function
async function startServer() {
    try {
        await app.listen(port);
        console.log(`Server listening on port ${port}`);
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

// Call the async function to start the server
startServer();

