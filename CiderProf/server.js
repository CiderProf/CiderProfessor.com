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

app.get('/ciderdetail/:info', (req, res) => {
    const id = parseInt(req.params.info);
    const cider = getCider(id, ciderInfo);
    res.render('pages/CiderDetail', {cider: cider})
})

app.get('/styles', (req, res) => {
    res.render('pages/Styles', {ciderStyles: allStyles});
})

app.get('/styles/:info', (req, res) => {
    const style = Object.values(req.query);
    const info = req.params.info;
    if(info == style[0]){
        let cs = getCidersByStyle(info, ciderInfo);
        return res.render('pages/ListOfCider', {ciderList: cs});
    } else {
        let css = getCidersBySubStyle(info, style[0], ciderInfo)
        return res.render('pages/ListOfCider', {ciderList: css});
    }
})

app.get('/grade', (req, res) => {
    res.render('pages/Grades', {ciderGrades: allGrades})
})

app.get('/grade/:info', (req, res) => {
    const grade = req.params.info;
    let g = getCidersByGrade(grade, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: g});
})

app.get('/moods', (req, res) => {
    res.render('pages/Moods', {ciderMoods: allMoods});
})

app.get('/moods/:info', (req, res) => {
    const mood = req.params.info;
    let cm = getCidersByMood(mood, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: cm});
})

app.get('/philosophy', (req, res) => {
    res.render('pages/Philosophy');
})



// app.post('/list/:info', (req, res) => {
//     console.log(req.body);
//     // let name = req.params.Name;

//     // handleInfoParse(name);
//     res.render('pages/List');
// })

app.get('/test', (req, res) => {
    let cider = new Cider({Name: 'Tangerine Tumeric', Cidery: 'Seattle Cider Company'}, ciderInfo);
    res.render('pages/CiderDetail', {cider: cider})
})


//-----------------HELPER FUNCTIONS-------------//

function getCider(id, list){
    for(var cider in list){
        let i = ciderInfo[cider].ID;
        if(i == id){
            return ciderInfo[cider]
        }
    }  
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
            tempObj.ID = c.ID
            tempArr.push(tempObj);
        }
    }
    return tempArr;
}

function getCidersBySubStyle(subStyle, style, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        let cs = ciderInfo[cider].Style;
        //if ciderInfo[cider].Style is object
        if(Object.keys(cs).includes(style)){
            if(Object.values(cs).includes(subStyle)){
                const c = ciderInfo[cider];
                tempObj.Name = c.Name;
                tempObj.Cidery = c.Cidery;
                tempObj.Grade = c.Grade;
                tempObj.Location = c.State_Country;
                tempObj.ABV = c.ABV;
                tempObj.LogoURL= c.LogoURL
                tempObj.ID = c.ID
                tempArr.push(tempObj);
            }
        }
    }
    return tempArr;
}

function getCidersByMood(mood, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        let cm = ciderInfo[cider].Mood;
        if(typeof(cm) == 'object' && cm != null){
            for(let i = 0; i < cm.length; i ++){
                if(cm[i] == mood){
                    const c = ciderInfo[cider];
                    tempObj.Name = c.Name;
                    tempObj.Cidery = c.Cidery;
                    tempObj.Grade = c.Grade;
                    tempObj.Location = c.State_Country;
                    tempObj.ABV = c.ABV;
                    tempObj.LogoURL= c.LogoURL
                    tempObj.ID = c.ID
                    tempArr.push(tempObj);
                    tempObj = {};
                    }
            }
        } else{
            if(cm == mood){
                const c = ciderInfo[cider];
                tempObj.Name = c.Name;
                tempObj.Cidery = c.Cidery;
                tempObj.Grade = c.Grade;
                tempObj.Location = c.State_Country;
                tempObj.ABV = c.ABV;
                tempObj.LogoURL= c.LogoURL
                tempObj.ID = c.ID
                tempArr.push(tempObj);
                tempObj = {};
            }
        }
    }
    return tempArr;
}

function getCidersByGrade(grade, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        if(ciderInfo[cider].Grade == grade){
            const c = ciderInfo[cider];
            tempObj.Name = c.Name;
            tempObj.Cidery = c.Cidery;
            tempObj.Grade = c.Grade;
            tempObj.Location = c.State_Country;
            tempObj.ABV = c.ABV;
            tempObj.LogoURL= c.LogoURL
            tempObj.ID = c.ID
            tempArr.push(tempObj);
        }
    }
    return tempArr;
}