'use strict';

const express = require('express');
const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT;

const app = express();
app.use(cors());

// routes

app.get('/ciders', (req, res) => {
    return //all ciders
})

app.get('/ciders/:id', (req, res) => {
    return // one cider by ID
})


app.listen(PORT, () => console.log(`App is up on ${PORT}`));


//rout definitions