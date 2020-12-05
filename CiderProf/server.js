'use strict'

const express = require('express');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3002;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.listen(PORT, () => console.log(`server up on ${PORT}`));

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/about', (req, res) => {
    res.render('pages/About');
})