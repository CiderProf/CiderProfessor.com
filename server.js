'use strict'

const express = require('express');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3002;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.listen(PORT, () => console.log(`server up on ${PORT}`));

const ciderInfo = require('./data/ciderinfo.json');
const complits = require('./data/compLits.json');
const allHouses = getAllHouses(ciderInfo);
const allStyles = getStyles(ciderInfo);
const allMoods = getAllMoods(ciderInfo);
const allGrades = getAllGrades(ciderInfo);
const allLitStyle = getLitStyles(complits);
const allthemes = getAllThemes(complits);
const headerInfo = {ciderHouses: allHouses, 
                  ciderStyles: allStyles,
                  ciderMoods: allMoods,
                  complitstyle: allLitStyle,
                  complittheme: allthemes};

//---------------- ROUTES-----------------------//
app.get('/', (req, res) => {
        res.render('pages/index', {headerInfo});
})

app.get('/about', (req, res) => {
    res.render('pages/About', {headerInfo});
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
    res.render('pages/ListOfCider', {ciderList: sorted, headerInfo});
})

app.get('/ciderdetail/:info', (req, res) => {
    const id = parseInt(req.params.info);
    const cider = getCider(id, ciderInfo);
    res.render('pages/CiderDetail', {cider: cider, headerInfo});
})

app.get('/splash/:info', (req, res) => {
    const selection = req.params.info;
    const blurb = getPageBlurb(selection);
    const list = getSubstyles(selection, ciderInfo);
    res.render('pages/Splash', {blurb: blurb, list: list, style: selection, headerInfo});
})
app.get('/splash/:info1/:info2', (req, res) => { //this handles an edge case where the info contains a '/'
    let s = req.params.info1;
    res.redirect(`/splash/${s}`);
})

app.get('/styles', (req, res) => {
    res.render('pages/Styles', {ciderStyles: allStyles, headerInfo});
})

app.get('/styles/:info', (req, res) => {
    const style = Object.values(req.query);
    const info = req.params.info;
    if(info == style[0]){
        let cs = getCidersByStyle(info, ciderInfo);
        return res.render('pages/ListOfCider', {ciderList: cs, headerInfo});
    } else {
        let css = getCidersBySubStyle(info, style[0], ciderInfo)
        return res.render('pages/ListOfCider', {ciderList: css, headerInfo});
    }
})


app.get('/grade', (req, res) => {
    res.render('pages/Grades', {ciderGrades: allGrades, headerInfo})
})

app.get('/grade/:info', (req, res) => {
    const grade = req.params.info;
    let g = getCidersByGrade(grade, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: g, headerInfo});
})

app.get('/moods', (req, res) => {
    res.render('pages/Moods', {ciderMoods: allMoods, headerInfo});
})

app.get('/moods/:info', (req, res) => {
    const mood = req.params.info;
    let cm = getCidersByMood(mood, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: cm, headerInfo});
})

app.get('/philosophy', (req, res) => {
    res.render('pages/Philosophy', {headerInfo});
})

app.get('/ciderhouses', (req, res) => {
    let sortedhouses = allHouses.sort();
    res.render('pages/AllHouses', {allHouses: sortedhouses, headerInfo});
})

app.get('/ciderhouses/:info', (req, res) => {
    let house = req.params.info;
    let ch = getCidersByHouse(house, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: ch, headerInfo});
})

app.get('/names', (req, res) => {
    let names = getAllNames(ciderInfo);
    let sortednames = names.sort();
    //TODO deal with >1 ciders with same name
    res.render('pages/AllNames', {allnames: sortednames, headerInfo});
})

app.get('/dates', (req, res) => {
    let dates = getAllDates(ciderInfo);
    let alldates = handleDates(dates)
    res.render('pages/AllDates', {allDates: alldates, headerInfo});
})

app.get('/dates/:info', (req, res) => {
    const date = req.params.info;
    let cd = getCidersByDate(date, ciderInfo);
    res.render('pages/ListOfCider', {ciderList: cd, headerInfo});
})

app.get('/complits', (req, res) => {
    res.render('pages/CompLits', {complits: complits, headerInfo});
})

app.get('/complits/:info', (req, res) => {
    let cid = req.params.info;
    let cle = getEssay(cid, complits);
    res.render('pages/CompLitEssay', {complit: cle, headerInfo});
})

app.get('/litsbydate', (req, res) => {
    let sorted = complits.sort((a, b) => (a.Date < b.Date) ? 1 : -1);
    res.render('pages/Complits', {complits: sorted, headerInfo});
})

app.get('/litsbystyle/:info', (req, res) => {
    let style = req.params.info;
    getLitsByStyle(style, complits);
    // res.render('pages/LitsByStyle', {litstyles: allLitStyle, headerInfo});
})

app.get('/litsbytheme/:info', (req, res) => {
    let theme = req.params.info;
    let litsList = getLitsByTheme(theme, complits);
    res.render('pages/Complits', {complits: litsList, headerInfo})
})


//-----------------HELPER FUNCTIONS-------------//

function getCider(id, list){
    for(var cider in list){
        let i = ciderInfo[cider];
        if(i.ID == id){
            i.Date_Tried = dateConvert(i.Date_Tried);
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
                tempcid.push(cid.Cidery)
                tempobj.CidObjs.push(tempcid);
                tempobj.CidObjs.sort();
            });
            tempobj.Date = dateConvert(e.Date);
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
            tempObj.Score = c.Score;
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

function getSubstyles(selection, list){
    let subStyles = [];
    for (var cider in list){
        const style = list[cider].Style;
        const key = Object.keys(style)
        if(style && key == selection){
            const subStyle = style[key];
            // check if aray
            if(subStyle && typeof subStyle == 'object'){
                subStyle.forEach(subValue => {
                    // add to list
                    if(!subStyles.includes(subValue)) subStyles.push(subValue);
                });
                // add to list
            } else if(subStyle && !subStyles.includes(subStyle)) subStyles.push(subStyle);
        }
    }
    // console.log(subStyles)
    return subStyles.length > 0 ? subStyles : null;
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
            tempObj.Score = c.Score;
            tempObj.Location = c.State_Country;
            tempObj.ABV = c.ABV;
            tempObj.LogoURL= c.LogoURL
            tempObj.ID = c.ID
            tempObj.Date_Tried = dateConvert(c.Date_Tried);
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
                tempObj.Score = c.Score;
                tempObj.Location = c.State_Country;
                tempObj.ABV = c.ABV;
                tempObj.LogoURL= c.LogoURL
                tempObj.ID = c.ID
                tempObj.Date_Tried = dateConvert(c.Date_Tried);
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
                    tempObj.Score = c.Score;
                    tempObj.Location = c.State_Country;
                    tempObj.ABV = c.ABV;
                    tempObj.LogoURL= c.LogoURL
                    tempObj.ID = c.ID
                    tempObj.Date_Tried = dateConvert(c.Date_Tried);
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
                tempObj.Score = c.Score;
                tempObj.Location = c.State_Country;
                tempObj.ABV = c.ABV;
                tempObj.LogoURL= c.LogoURL
                tempObj.ID = c.ID
                tempObj.Date_Tried = dateConvert(c.Date_Tried);
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
            tempObj.Score = c.Score;
            tempObj.Location = c.State_Country;
            tempObj.ABV = c.ABV;
            tempObj.LogoURL= c.LogoURL
            tempObj.ID = c.ID
            tempObj.Date_Tried = dateConvert(c.Date_Tried);
            tempArr.push(tempObj);
        }
    }
    //sort by score then name
    tempArr.sort((a,b) => (a.Score < b.Score) ? 1 : (a.Score === b.Score) ? ((a.Name > b.Name) ? 1 : -1) : -1 );
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
    console.log(dates)
    let alldates = [];
    const sorteddates = dates.sort((a,b) => (a < b) ? 1 : -1 );
    for (var d in sorteddates){
        alldates.push(dateConvert(sorteddates[d]))
    }
    // console.log(alldates)
    return alldates;
}

function dateConvert(date){
    //201805 => ['Jun', '2018', 201805]
    let tempArr = [];
    const d = date.toString();
    if(d.length < 6) return null;
    let yr = '';
    let mo = '';
    for(let i=0; i<d.length; i++){
        if (i < 4) yr = yr.concat(d[i]);
        if (i > 3) mo = mo.concat(d[i]);
    }
    const oDate = new Date(yr, mo);
    const sDate = oDate.toDateString().split(' ');
    sDate.splice(2,1);
    sDate.splice(0,1);
    sDate.push(date);
    return sDate;
}

function getCidersByDate(date, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        const iDate = parseInt(ciderInfo[cider].Date_Tried);
        if(iDate == date){
            const c = ciderInfo[cider];
            tempObj.Name = c.Name;
            tempObj.Cidery = c.Cidery;
            tempObj.Grade = c.Grade;
            tempObj.Score = c.Score;
            tempObj.Location = c.State_Country;
            tempObj.ABV = c.ABV;
            tempObj.LogoURL= c.LogoURL
            tempObj.ID = c.ID
            tempObj.Date_Tried = dateConvert(c.Date_Tried);
            tempArr.push(tempObj);
        }
    }
    return tempArr;
}

function getPageBlurb(subStyle){
    const pageinfo = require('./data/splashpageinfo.json');
    return pageinfo[subStyle];
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
    let litstyles = {};
    for(var lit in list){
        let s = list[lit].Style;
        if(s !== null && typeof s !== 'object' && !Object.keys(litstyles).includes(s)) litstyles[s] = null;
        if(s !== null && typeof s == 'object'){
            const sty = Object.keys(s)[0];
            const sub = Object.values(s)[0];
            const litstyleSet = Object.keys(litstyles);
            const litstyleSubSet = litstyles[sty];
            if(!litstyleSet.includes(sty)) litstyles[sty] = [sub];
            if(litstyleSet.includes(sty)) litstyles[sty] = !litstyleSubSet.includes(sub) ? [...litstyleSubSet, sub] : litstyles[sty]
        } 
    }
    return litstyles;
}

//might not need this
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

function getLitsByStyle(style, list) {
    let lits = [];
    console.log('style', style)
    for(var lit in list){
        const ls = list[lit].Style;
        console.log('ls', ls)
        if(ls == style){
            console.log('hit')
            let tempObj = list[lit];
        }
    }
}

function getLitsByTheme(theme, list){
    let lits = [];
    for(var lit in list){
        const lt = list[lit].Theme;
        if(lt == theme){
            let tempObj = list[lit];
            lits.push(tempObj);
        }
    }
    return lits;
}
