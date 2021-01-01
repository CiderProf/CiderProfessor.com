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
let allGrades = getAllGrades(ciderInfo);
// let cider = new Cider({Name: 'Pear', Cidery: 'Stem Ciders'}, ciderInfo);

//---------------- ROUTES-----------------------//
app.get('/', (req, res) => {
        res.render('index', { ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods});
})

app.get('/about', (req, res) => {
    res.render('pages/About');
})

app.get('/ciders', (req, res) => {

    return res.send(allarr);//all ciders
})

app.get('/styles', (req, res) => {
    res.render('pages/Styles', {ciderStyles: allStyles});
})

app.get('/styles/:info', (req, res) => {
    let style = req.params.info;
    // console.log("this the style ", style);
    //if substyle is null, get all ciders by style and send to list
    //else get all substyles and send to list of substyles
    let x = getCidersByStyle(style, ciderInfo);
    console.log(x);
    res.render('pages/ListOfCider', {ciderList: x});
})

app.post('/list/:info', (req, res) => {
    console.log(req.body);
    // let name = req.params.Name;

    // handleInfoParse(name);
    res.render('pages/List');
})

app.get('/test', (req, res) => {
    // let body = req.body;
    let cider = new Cider({Name: 'Tangerine Tumeric', Cidery: 'Seattle Cider Company'}, ciderInfo);
    // console.log("test", cider.SubStyles)
    res.render('pages/CiderDetail', {cider: cider})
})


//-----------------HELPER FUNCTIONS-------------//

function Cider(data, list){
    let dName = data.Name;
    let dCiderH = data.Cidery
    let cider = {};
    for(var cid of list){
        if(cid.Name == dName && cid.Cidery == dCiderH){
            cider = cid;
        }
    }  
    return cider
}

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

function getAllMoods(list){
    let moods = [];
    for (var cider in list){
        let m = list[cider].Mood
        if(m != null){
            if(typeof m == 'object'){
                for (var sub in m){
                    // console.log("sub ", m[sub]);
                    if(!moods.includes(m[sub])) moods.push(m[sub])
                }
            } else{
            if(!moods.includes(m)) moods.push(m);
            }
        }
    }
    return moods;
}

function getAllGrades(list){
    let temp = [];
    for(var cider in list){
        let g = ciderInfo[cider].Grade;
        if(!temp.includes(g)) temp.push(g);        
    }
    return temp.sort();
}

function getCidersByStyle(style, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        if(Object.keys(ciderInfo[cider].Style).includes(style)){
            const c = ciderInfo[cider];
            tempObj.Name = c.Name;
            tempObj.Cidery = c.Cidery;
            tempObj.Grade = c.Grade;
            tempObj.Location = c.State_Country;
            tempObj.ABV = c.ABV;
            tempObj.LogoURL= c.LogoURL
            tempArr.push(tempObj);
        }
    }
    return tempArr;
}

