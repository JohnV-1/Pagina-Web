const express = require('express');
const router = require('./routes/api.js');
const app = express();
const port = 3000;

app.use(express.json());
app.use(router);

app.listen(port, () => {
    console.log('Practica 3 corriendo en el puerto '+port);
});
