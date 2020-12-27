'use strict'

const express = require('express');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3002;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.listen(PORT, () => console.log(`server up on ${PORT}`));

let ciderInfo = require('./data/ciderinfo.json');
let allHouses = getAllHouses(ciderInfo);
let allStyles = getStyles(ciderInfo);
let allMoods = getAllMoods(ciderInfo);
// let allGrades = getAllGrades(allNames);
// let subStyles = getSubStyles(allNames);
//---------------- ROUTES-----------------------//
app.get('/', (req, res) => {
        res.render('index', { ciderHouses: allHouses, ciderStyles: allStyles});
})

app.get('/about', (req, res) => {
    res.render('pages/About');
})

app.get('/ciders', (req, res) => {

    return res.send(allarr);//all ciders
})


//-----------------HELPER FUNCTIONS-------------//

function getAllHouses(list){
    let houses = [];
    for (var cider in list){
        let h = list[cider].Cidery;
        if(!houses.includes(h)) houses.push(h);
    }
    return houses;
}

    function getStyles(list){
        let stylesObject = loadStyles(list);
        let styles = loadSubStyles(list, stylesObject);
    return styles;
}

function getAllMoods(list){
    let moods = [];
    for (var cider in list){
        let m = list[cider].Mood
        if(typeof m === 'object'){
            // console.log("m type", typeof m)
            for (var sub in m){
                // console.log("sub ", sub)
                if(!moods.includes(sub)){
                    moods.push(sub)
                }
            }
        }
        moods.push(m);
    }
    // console.log(moods);
}


function loadStyles(list){
    let styles = {};
    for(var cider in list){
        let s = list[cider].Style
        for(var x in s){
            if(!Object.keys(styles).includes(x.keys)) styles[x] = null;
        }
    }
    return styles;
}

function loadSubStyles(list, styleObject){
    let subStyles = {...styleObject};
    for(var cider in list){
        let s = list[cider].Style;
        for(var t in Object.keys(s)){
            let key = Object.keys(s)[t];
            if(s[key] != null){
                if(subStyles[key] == null){
                    if(typeof s[key] == 'object' ){
                        let temp = []
                        for (var x in s[key]) temp.push(x);
                        subStyles[key] = temp;
                    } else{
                        subStyles[key] = [s[key]];
                    }
                }
                else{
                    if(typeof s[key] == 'object' ){
                        for (var x in s[key]){
                            if(!subStyles[key].includes(s[key][x])) subStyles[key].push(s[key][x]);
                        }

                    }else{
                        if(!subStyles[key].includes(s[key])) subStyles[key].push(s[key]);
                    } 
                }
            }
        }

    }
    return subStyles;
}

function getAllGrades(list){
    let temp = [];
    list.forEach(cider => {
        let g = ciderInfo[cider].Grade;
        if(!temp.includes(g)) temp.push(g);
    })
    return temp.sort();
}

