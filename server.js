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
let complits = require('./data/compLits.json');
let allHouses = getAllHouses(ciderInfo);
let allStyles = getStyles(ciderInfo);
let allMoods = getAllMoods(ciderInfo);
let allGrades = getAllGrades(ciderInfo);
let allLitStyle = getLitStyles(complits);
let allthemes = getAllThemes(complits);
let headerInfo = {ciderHouses: allHouses, 
                  ciderStyles: allStyles,
                  ciderMoods: allMoods};

//---------------- ROUTES-----------------------//
app.get('/', (req, res) => {
        res.render('pages/index', {ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/about', (req, res) => {
    res.render('pages/About', {ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/ciders', (req, res) => {
    return res.send(allarr);//all ciders
})

app.get('/sortby/:info', (req, res) => {
    const info = req.params.info;
    let sorted;
    info == "Name" ?
        sorted = ciderInfo.sort((a, b) => (a[info] > b[info]) ? 1 : -1) :
        sorted = ciderInfo.sort((a, b) => (a[info] < b[info]) ? 1 : -1);
    res.render('pages/ListOfCider', {ciderList: sorted, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/ciderdetail/:info', (req, res) => {
    const id = parseInt(req.params.info);
    const cider = getCider(id, ciderInfo);
    res.render('pages/CiderDetail', {cider: cider, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes})
})

app.get('/splash/:info', (req, res) => {
    const selection = req.params.info;

    res.render('pages/Splash', {ciderStyles: allStyles, ciderHouses: allHouses, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes})
})

app.get('/styles', (req, res) => {
    res.render('pages/Styles', {ciderStyles: allStyles, ciderHouses: allHouses, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/styles/:info', (req, res) => {
    const style = Object.values(req.query);
    const info = req.params.info;
    if(info == style[0]){
        let cs = getCidersByStyle(info, ciderInfo);
        return res.render('pages/ListOfCider', {ciderList: cs, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
    } else {
        let css = getCidersBySubStyle(info, style[0], ciderInfo)
        return res.render('pages/ListOfCider', {ciderList: css, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
    }
})

app.get('/grade', (req, res) => {
    res.render('pages/Grades', {ciderGrades: allGrades, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes})
})

app.get('/grade/:info', (req, res) => {
    const grade = req.params.info;
    let g = getCidersByGrade(grade, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: g, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/moods', (req, res) => {
    res.render('pages/Moods', {ciderMoods: allMoods, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/moods/:info', (req, res) => {
    const mood = req.params.info;
    let cm = getCidersByMood(mood, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: cm, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/philosophy', (req, res) => {
    res.render('pages/Philosophy', {ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})

app.get('/ciderhouses', (req, res) => {
    let sortedhouses = allHouses.sort();
    res.render('pages/AllHouses', {allHouses: sortedhouses, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes})
})

app.get('/ciderhouses/:info', (req, res) => {
    let house = req.params.info;
    let ch = getCidersByHouse(house, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: ch, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes})
})

app.get('/names', (req, res) => {
    let names = getAllNames(ciderInfo);
    let sortednames = names.sort();
    //TODO deal with >1 ciders with same name
    res.render('pages/AllNames', {allnames: sortednames})
})

// app.get('/dates', (req, res) => {
//     let dates = getAllDates(ciderInfo);
//     let alldates = handleDates(dates)
//     res.render('pages/AllDates', {allDates: alldates})
// })

// app.get('/dates/:info', (req, res) => {
//     const date = req.params.info;
//     let cd = getCidersByDate(date, ciderInfo);
//     res.render('pages/ListOfCider', {ciderList: cd});
// })

app.get('/complits', (req, res) => {
    res.render('pages/CompLits', {complits: complits, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes})
})

app.get('/complits/:info', (req, res) => {
    let cid = req.params.info;
    let cle = getEssay(cid, complits);
    res.render('pages/CompLitEssay', {complit: cle, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes})
})

app.get('/litsbydate', (req, res) => {
    let sorted = complits.sort((a, b) => (a.Date < b.Date) ? 1 : -1);
    res.render('pages/ListOfLits', {LitsList: sorted, ciderHouses: allHouses, ciderStyles: allStyles, ciderMoods: allMoods, complitstyle: allLitStyle, complittheme: allthemes});
})


//-----------------HELPER FUNCTIONS-------------//

function getCider(id, list){
    for(var cider in list){
        let i = ciderInfo[cider];
        if(i.ID == id){
            return i;
        }
    }  
}

function getEssay(id, list){
    for(var essay in list){
        let e = complits[essay];
        if(e.ID == id){
            let tempobj = {};
            tempobj = e;
            tempobj.CidObjs = [];
            tempobj.Ciders.forEach(id => {
                let tempcid = [];
                let cid = getCider(id, ciderInfo)
                tempcid.push(cid.Name);
                tempcid.push(cid.ID);
                tempobj.CidObjs.push(tempcid);
                tempobj.CidObjs.sort();
            });
            // tempobj.Date = handleDates([e.Date]);
            //TODO handle Style array?
            return tempobj;
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

function getCidersByHouse(house, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        if(ciderInfo[cider].Cidery == house){
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



function getAllNames(list){
    let names = [];
    for (var cider in list){
        let n = list[cider].Name
        if(!names.includes(n)) names.push(n);
    }
    return names;
}

function getAllDates(list){
    let dates = [];
    for (var cider in list){
        let d = list[cider].Date_Tried
        if(!dates.includes(d)) dates.push(d)
    }
    return dates;
}

function handleDates(dates){
    let alldates = [];
    let sorteddates = dates.reverse();
    for (var d in sorteddates){
        let n = sorteddates[d].toString();
        let yr = '';
        let mo = '';
        for(let i=0; i<n.length; i++){
            if (i < 4) yr = yr.concat(n[i]);
            if (i > 3) mo = mo.concat(n[i])
        }
        let x = new Date(yr, mo);
        let s = x.toDateString().split(' ');
        let t = s.splice(2,1);
        let w = s.splice(1).join(' ');
        let temp = [];
        temp.push(sorteddates[d]);
        temp.push(w);
        alldates.push(temp)
    }
    return alldates;
}

function getCidersByDate(date, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        if(ciderInfo[cider].Date_Tried == date){
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

function getAllThemes(list){
    let tempArr = [];
    for(var lit in list){
        let t = complits[lit].Theme;
        if(!tempArr.includes(t)) tempArr.push(t);
    }
    return tempArr;
}

function getLitStyles(list){
    let stylesArray = loadlitStyles(list);
    // let styles = loadLitSubstyles(list, stylesArray);
return stylesArray;
}

function loadlitStyles(list){
    let litstyles = [];
    for(var lit in list){
        let s = list[lit].Style;
        if(s !== null && typeof s !== 'object' && !litstyles.includes(s)) litstyles.push(s);
        if(s !== null && typeof s == 'object' && !litstyles.includes(Object.keys(s)[0])) litstyles.push(Object.keys(s)[0]);
    }
    return litstyles;
}

function loadLitSubstyles(list, stylesArray){
let allstyles = [];
for(var lit in list){
    let ls = list[lit].Style;
        if(ls !== null && typeof ls !== 'object' && !allstyles.includes(ls)){
            //push to allstyles
            allstyles.push(ls);
        }
        if(ls !== null && typeof ls == 'object'){
            let key = Object.keys(ls);
            let val = Object.values(ls);
            allstyles.some( objkey => {
                if(typeof objkey == 'object' && Object.keys(objkey) == key[0]){
                    objkey = [...val]
                }
            });
            // if allstyles has an object with key=ls key, 
            if(check){
                // add ls.value to ls.value array
                console.log('found it', obj);
            } else {
                // else push new object with value in array to allstyles
                let newobj = {[key]: val};
                allstyles.push(newobj);
            }
        }
    }
    console.log(allstyles);
}

function getLitsByDate(list){
    let dates = [];
    for (var lit in list){
        let d = list[lit].Date
        if(!dates.includes(d)) dates.push(d)
    }
    return dates;
}

