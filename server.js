'use strict'

const express = require('express');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;
//const url = process.env.MAPURL;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.listen(PORT, () => console.log(`server up on ${PORT}`));


const stateArray = require('./data/usStates.js');
const unitedstates = stateArray.unitedstates;
const ciderInfo = require('./data/ciderinfo.json');
const complits = require('./data/compLits.json');
const blurbs = require('./data/splashpageinfo.json');
const houseReviews = require('./data/ciderhouses.json');
const allHouses = getAllHouses(ciderInfo);
const allStyles = getStyles(ciderInfo);
const allMoods = getAllMoods(ciderInfo);
const allCountries = getAllCiderCountries(ciderInfo);
const allStates = getAllCiderStates(ciderInfo);
const allLitStyle = getLitStyles(complits);
const allthemes = getAllThemes(complits);
const allBlurbs = require('./data/splashpageinfo.json');
const headerInfo = {ciderHouses: allHouses, 
                  ciderStyles: allStyles,
                  ciderMoods: allMoods,
                  complitstyle: allLitStyle,
                  complittheme: allthemes,
                  ciderCountries: allCountries,
                  ciderStates: allStates};

//---------------- ROUTES-----------------------//
app.get('/', (req, res) => {
        res.render('pages/index', {headerInfo});
})

app.get('/about', (req, res) => {
    res.render('pages/About', {headerInfo});
})

app.get('/sortby/:info', (req, res) => {
    const info = req.params.info;
    let sorted;
    info == "Name" ? sorted = ciderInfo.sort((a, b) => (a[info] > b[info]) ? 1 : -1) 
                   : sorted = ciderInfo.sort((a, b) => (a[info] < b[info]) ? 1 : -1);
    res.render('pages/ListOfCider', {ciderList: sorted, blurb: null, headerInfo});
})

app.get('/ciderdetail/:info', (req, res) => {
    const id = parseInt(req.params.info);
    const cider = getCider(id, ciderInfo);
    const releventComplits = getLitsByCider(id, complits);
    res.render('pages/CiderDetail', {cider: cider, complits: releventComplits, headerInfo});
})

app.get('/styles', (req, res) => {
    res.render('pages/Styles', {ciderStyles: allStyles, headerInfo});
})

app.get('/styles/:info', (req, res) => {
    const style = Object.values(req.query);
    let info = req.params.info;
    let blurb = getSplashBlurb(style, blurbs);
    if(req.params.info.includes("&")) info = replaceChar(info)
    if(info == style[0]){
        let cs = getCidersByStyle(info, ciderInfo);
        let list = orderCidersByScore(cs)
        return res.render('pages/ListOfCider', {ciderList: cs, blurb: [blurb, style], headerInfo});
    } else {
        let css = getCidersBySubStyle(info, style[0], ciderInfo)
        let list = orderCidersByScore(css)
        return res.render('pages/ListOfCider', {ciderList: css, blurb: [null, info], headerInfo});
    }
})
app.get('/styles/:info1/:info2', (req, res) => {
    const style = Object.values(req.query);
    const info = req.params.info1 + "&" + req.params.info2;
    res.redirect(`/styles/${info}?style=${style}`);
})

app.get('/splash/:info', (req, res) => {
    let style = req.params.info;
    if(style.includes('&')) style = replaceChar(style);
    const blurb = getSplashBlurb(style, blurbs);
    const subStyles = getSubStylesByStyle( style, ciderInfo);
    const splash = [style, blurb, subStyles];
    res.render('pages/Splash', {splash: splash, headerInfo});
})

app.get('/moods', (req, res) => {
    const sortedMoods = allMoods.sort()
    res.render('pages/Moods', {ciderMoods: sortedMoods, headerInfo});
})

app.get('/moods/:info', (req, res) => {
    const mood = req.params.info;
    let cm = getCidersByMood(mood, ciderInfo);
    let list = orderCidersByScore(cm)
    res.render('pages/ListOfCider', {ciderList: list, blurb: null, headerInfo});
})
app.get('/moods/:info1/:info2', (req, res) => { //this handles an edge case where the info contains a '/'
    let s = req.params.info1;
    res.redirect(`/moods/${s}`);
})

app.get('/geography', (req, res) => {
    res.render('pages/Geography', {states: allStates, headerInfo});
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
    let list = orderCidersByScore(ch)
    res.render('pages/ListOfCider', {ciderList: list, blurb: null, headerInfo});
})

app.get('/ciderhousereviews', (req, res) => {
    let houses = getCiderHouses(houseReviews).sort();
    res.render('pages/ListOfHouses', {houses: houses, blurb: null, headerInfo});
})

app.get('/ciderlocations/:info', (req, res) => {
    let country = req.params.info;
    let ciders = getCidersByCountry(country, ciderInfo);
    let list = orderCidersByScore(ciders)
    res.render('pages/ListOfCider', {ciderList: list, blurb: null, headerInfo});
})

app.get('/housereviewsbystate', (req, res) => {
    let sorted = sortHousesReviewedbyState(houseReviews);
    res.render('pages/HouseByState', {houses: sorted, headerInfo});
})

app.get('/ciderhousereviews/:info', (req, res) => {
    let house = req.params.info;
    let review = getHouseReviewByName(house, houseReviews);
    let ciderNames = getCiderHouseCiders(review.CidersID);
    let compReviews = getReviewslist(review.CompLitID);
    res.render('pages/HouseReview', {review: review, ciderNames: ciderNames, compReviews: compReviews, headerInfo});
})

app.get('/complits', (req, res) => {
    res.render('pages/CompLits', {headerInfo});
})

app.get('/listcomplits', (req, res) => {
    let ciderNames = getCiderNames();
    let allLits = processObjectDates(complits);
    let sorted = allLits.sort((a, b) => (a.Date[2] < b.Date[2]) ? 1 : -1);
    res.render('pages/ListOfCompLits', {complits: sorted, ciderNames: ciderNames, headerInfo});
})

app.get('/complits/:info', (req, res) => {
    let cid = req.params.info;
    let cle = getEssay(cid, complits);
    res.render('pages/CompLitEssay', {complit: cle, headerInfo});
})

app.get('/litsplash/:info', (req, res) => {
    let type = req.params.info;
    let splash;
    type == 'theme' ? splash = allthemes : splash = getQuickStyles();
    res.render('pages/LitSplash', {splash: splash, type: type, headerInfo})
})

app.get('/litredirect/:info', (req, res) => {
    let info = req.params.info;
    if(info.includes('~')) info = info.replace('~', '/');
    const type = req.query.type;
    if (type == 'theme') res.redirect(`/litsbytheme/${info}`)
    if (type == 'style') {
        if(allLitStyle[info] == null) res.redirect(`/litsbystyle/${info}`);
        else res.render('pages/LitSplash', {splash: allLitStyle[info], type: info, headerInfo});
    }
    if(type != 'theme' && type != 'style') res.redirect(`/litsbystyle/${type}&${info}`);
})

app.get('/litsbystyle/:info', (req, res) => {
    let style = req.params.info;
    let litsbystyle;
    if(style.includes('&')){
        let subStyle = style.slice(style.indexOf("&")+1, style.length);
        litsbystyle = getLitsBySubstyle(subStyle, complits);
        style = subStyle;
    }else{
        litsbystyle = getLitsByStyle(style, complits);
    };
    litsbystyle.sort((a, b) => (a.Title > b.Title) ? 1 : -1)
    let ciderNames = getCiderNames();
    res.render('pages/ListOfCompLits', {complits: litsbystyle, ciderNames: ciderNames, headerInfo});
})

app.get('/litsbystyle/:info1/:info2', (req, res) => { //this handles an edge case where the info contains a '/'
    //let s = req.params.info1;
    let ss = req.params.info2;
    res.redirect(`/litsbystyle/${ss}`);
})
app.get('/litredirect/:info1/:info2', (req, res) => { //this handles an edge case where the info contains a '/'
    const ss = req.params.info1.concat('~',req.params.info2);
    const type = req.query.type;
    res.redirect(`/litredirect/${ss}?type=${type}`);
})

app.get('/litsbytheme/:info', (req, res) => {
    let theme = req.params.info;
    let litsList = getLitsByTheme(theme, complits);
    litsList.sort((a, b) => (a.Title > b.Title) ? 1 : -1)
    let ciderNames = getCiderNames();
    res.render('pages/ListOfCompLits', {complits: litsList, ciderNames: ciderNames, headerInfo})
})

app.get('/map', (req, res) => {
    res.render('pages/Map', {headerInfo});
})



//ajax routes for app.js
app.get('/getCiderStates', (req, res) => {
    res.send(allStates);
})

app.get('/cidersbystate/:info', (req, res) => {
    let state = req.params.info;
    let ciders = getCidersByState(state, ciderInfo);
    console.log('api hit', state);
    // res.redirect(302, 'pages/ListOfCider', {ciderList: ciders, headerInfo});
    let list = orderCidersByScore(ciders);
    res.redirect(302, 'pages/ListOfCider');
})



//-----------------HELPER FUNCTIONS-------------//

function orderCidersByScore(list){
    return list.sort((a, b) => (a.Score < b.Score) ? 1 : -1);
}

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
            if(typeof e.Style == 'object' && e.Style !== null ){
                tempobj.Style = Object.keys(e.Style) + "-" + Object.values(e.Style);
            } else {
                tempobj.Style = e.Style;
            }
            return tempobj;
        }
    }
}

function getCiderNames(){
    let ciderNames = {};
    complits.forEach(complit => {
        complit.Ciders.forEach(id => {
            ciderNames[id] = (ciderInfo.filter(cider => cider.ID == id)[0].Name);
        })
    })
    return ciderNames;
}
//TODO refactor this to be more useful to that
function getCiderHouseCiders(list){
    let ciderNames = {};
    list.forEach(id => {
        ciderNames[id] = (ciderInfo.filter(cider => cider.ID == id)[0].Name);
    })
    return ciderNames;
}
function getReviewslist(list){
    if(!list) return null;
    let reviewNames = {};
    list.forEach(id => {
        //reviewNames[id] = (complits.filter(comp => comp.ID == id)[0].Title);
        let temp = complits.filter(comp => comp.ID == id);
        if(temp[0]) reviewNames[id] = temp[0].Title;
    })
    return reviewNames;
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
    return list.filter(cider => cider.Cidery == house)
}

function getCidersByState(state, list){
    return list.filter(cider => cider.State_Country == state);
}

function getStyles(list){
        let stylesObject = loadStyles(list);
        let styles = loadSubStyles(list, stylesObject);
    return styles;
}

function loadStyles(list){
    //can't be dynamic, needs to be in specific order
    const styles = {
        'Standard': null,
        'Single Varietal': null,
        'Fruit': null,
        'Botanical/Spiced': null,
        'Seasonal': null,
        'Farmhouse and Scrumpy': null,
        'Sidra': null,
        'Perry and Pear Cider': null,
        'Rosé': null,
        'Crabapple': null,
        'Imperial' : null,
        'Light Cider': null,
        'Beer-like': null,
        'Whisky-like': null,
        'Champagne-like': null,
        'Wine-like': null,
        'Dessert': null
    };
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
    //set order for Standard
    subStyles["Standard"] = ['Dry', 'Semi-Dry', 'Semi-Sweet', 'Sweet', 'Complex', 'Tart']
    //set order for Single Varietal
    subStyles["Single Varietal"].sort();
    return subStyles;
}

function replaceChar(style){
    return style.replace('&', '/');
}

function getSplashBlurb(style, list){
    let temp = [];
    temp.push(list[style]);
    return temp;
}

function getSubStylesByStyle(style, list){
    let temp = [];
    for(var cider in list){
        let styleType = Object.keys(list[cider].Style);
        if(styleType.includes(style)){
            const subStyle = list[cider].Style[style];
            //TODO: If substyle is an array, look for unique values
            !temp.includes(subStyle) && typeof(subStyle) === 'string' ? temp.push(subStyle) : [...temp];
        }
    }
    return temp;
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
    return moods.sort();
}

function getCidersByStyle(style, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        if(Object.keys(ciderInfo[cider].Style).includes(style)){
            tempObj = ciderInfo[cider];
            tempObj.Date_Tried = dateConvert(tempObj.Date_Tried);
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
        if(Object.keys(cs).includes(style)){
            if(Object.values(cs).includes(subStyle)){
                tempObj = ciderInfo[cider];
                tempObj.Date_Tried = dateConvert(tempObj.Date_Tried);
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
                let checkMood = cm[i];
                cm[i] !== null && cm[i].includes("/") ? checkMood = cm[i].split("/")[0] : cm[i]
                if(checkMood == mood){
                    tempObj = ciderInfo[cider];
                    tempObj.Date_Tried = dateConvert(tempObj.Date_Tried);
                    tempArr.push(tempObj);
                }
            }
        } else{
            if(cm == mood){
                tempObj = ciderInfo[cider];
                tempObj.Date_Tried = dateConvert(tempObj.Date_Tried);
                tempArr.push(tempObj);
            }
        }
    }
    return tempArr;
}

function dateConvert(date){
    //201805 => ['Jun', '2018', 201805]
    const d = (date - 1).toString();
    if(typeof date == 'object') return date;
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

function getCidersByCountry(country, list){
    return list.filter(cider => cider.State_Country == country);
}

function getAllCiderCountries(list){
    let countries = []
    for(var cider in list){
        let cs = list[cider].State_Country;
        if(!unitedstates.includes(cs) && !countries.includes(cs)) countries.push(cs);
    }
    return countries.sort();
}

function getAllCiderStates(list){
    let states = []
    for(var cider in list){
        let cs = list[cider].State_Country;
        if(unitedstates.includes(cs) && !states.includes(cs)) states.push(cs);
    }
    return states.sort();
}

function getAllThemes(list){
    let themes = list.map(lit => lit.Theme);
    return [...new Set(themes)];
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

function getQuickStyles(){
    return Object.keys(allLitStyle);
}

function getLitsByStyle(style, list) {
    let lits = [];
    for(var lit in list){
        const ls = list[lit].Style;
        if(ls == style){
            let tempObj = {};
            tempObj = complits[lit];
            tempObj.Date = dateConvert(tempObj.Date);
            lits.push(tempObj);
        }
    }
    return lits;
}

function getLitsBySubstyle(subStyle, list){
    let lits =[];
    for(var lit in list){
        const ls = list[lit].Style;
        if(typeof ls == 'object' && ls !== null && Object.values(ls) == subStyle){
            let tempObj = {};
            tempObj = complits[lit];
            tempObj.Date = dateConvert(tempObj.Date);
            lits.push(tempObj);
        }
    }
    return lits;
}

function getLitsByTheme(theme, list){
    return list.filter( lit => lit.Theme == theme);
}

function getLitsByCider(id, list){
    return list.filter( lit => lit.Ciders.includes(id));
}

function getCiderHouses(list){
    return list.map(h => h.Name);
}

function sortHousesReviewedbyState(list){
    let temp = {};
    let states = [];
    for( var house in list){
        let arr = processCityToArray(list[house].City);
        let state = arr[1];
        if(!states.includes(state)) states.push(state);
    }
    states.sort();
    //set the sorted states as keys in order in temp with null values to be set later
    states.forEach(state => {
        temp[state] = null;
    });
    //set the ciderhouses by state in sorted order
    for( var house in list){
        let arr = processCityToArray(list[house].City);
        const state = arr[1];
        const name = list[house].Name;
        if(temp[state] === null){
            temp[state] = [name];
        }
        !temp[state].includes(name) ? temp[state].push(name) : [...temp[state]];
        temp[state].sort();
    }
    return temp;
}
function processCityToArray(input){
    if(input != null && typeof(input) == 'object') return input;
    if(input != null && typeof(input) == 'string'){
        return input.split(", ");
    }
}

function getHouseReviewByName(house, list){
    let temp = list.filter( h => h.Name == house);
    let rev = temp[0];
    rev.Date = dateConvert(rev.Date);
    return rev;
}

function processObjectDates(list){
    let temp = list;
    for (var item in list){
        temp[item].Date = dateConvert(list[item].Date);
    }
    return temp;
}