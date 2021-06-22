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
    //check for complit
    //send complit [title and id]
    res.render('pages/CiderDetail', {cider: cider, headerInfo});
})

app.get('/styles', (req, res) => {
    let blurbs = allBlurbs;
    res.render('pages/Styles', {ciderStyles: allStyles, styleBlurbs: blurbs, headerInfo});
})

app.get('/styles/:info', (req, res) => {
    const style = Object.values(req.query);
    const info = req.params.info;
    if(info == style[0]){
        let cs = getCidersByStyle(info, ciderInfo);
        let list = orderCidersByScore(cs)
        return res.render('pages/ListOfCider', {ciderList: cs, headerInfo});
    } else {
        let css = getCidersBySubStyle(info, style[0], ciderInfo)
        let list = orderCidersByScore(css)
        return res.render('pages/ListOfCider', {ciderList: css, headerInfo});
    }
})

app.get('/splash/:info', (req, res) => {
    //TODO: handle Botanical/Spiced style 
    const style = req.params.info;
    const blurb = getSplashBlurb(style, blurbs)
    const subStyles = getSubStylesByStyle( style, ciderInfo)
    let splash = [style, blurb, subStyles];
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
    res.render('pages/ListOfCider', {ciderList: list, headerInfo});
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
    res.render('pages/ListOfCider', {ciderList: list, headerInfo});
})

app.get('/ciderhousereviews', (req, res) => {
    let houses = getCiderHouses(houseReviews).sort();
    res.render('pages/ListOfHouses', {houses: houses, headerInfo});
})

app.get('/ciderlocations/:info', (req, res) => {
    let country = req.params.info;
    let ciders = getCidersByCountry(country, ciderInfo);
    let list = orderCidersByScore(ciders)
    res.render('pages/ListOfCider', {ciderList: list, headerInfo});
})

app.get('/housereviewsbystate', (req, res) => {
    let sorted = sortHousesReviewedbyState(houseReviews);
    res.render('pages/HouseByState', {houses: sorted, headerInfo});
})

app.get('/ciderhousereviews/:info', (req, res) => {
    let house = req.params.info;
    let review = getHouseReviewByName(house, houseReviews);
    res.render('pages/HouseReview', {review: review, headerInfo});
})

app.get('/complits', (req, res) => {
    let list = complits;
    let sorted = list.sort((a, b) => (a.Date < b.Date) ? 1 : -1);
    res.render('pages/CompLits', {complits: sorted, headerInfo});
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
    let litsbystyle;
    if(style.includes('&')){
        let subStyle = style.slice(style.indexOf("&")+1, style.length);
        litsbystyle = getLitsBySubstyle(subStyle, complits);
    }else{
        litsbystyle = getLitsByStyle(style, complits);
    };
    res.render('pages/LitsByStyle', {litstyles: litsbystyle, headerInfo});
})

app.get('/litsbystyle/:info1/:info2', (req, res) => { //this handles an edge case where the info contains a '/'
    //let s = req.params.info1;
    let ss = req.params.info2;
    res.redirect(`/litsbystyle/${ss}`);
})

app.get('/litsbytheme/:info', (req, res) => {
    let theme = req.params.info;
    let litsList = getLitsByTheme(theme, complits);
    res.render('pages/Complits', {complits: litsList, headerInfo})
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
            tempObj = ciderInfo[cider];
            tempObj.Date_Tried = dateConvert(tempObj.Date_Tried);
            tempArr.push(tempObj);
        }
    }
    return tempArr;
}

function getCidersByState(state, list){
    let temp = [];
    for(var cider in list){
        let s = list[cider].State_Country;
        if(s == state) temp.push(list[cider]);
    }
    return temp;
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
            if(!Object.keys(styles).includes(x)) styles[x] = null;
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

function getSplashBlurb(style, list){
    let temp = [style];
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
    return moods;
}

function getCidersByStyle(style, list){
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        if(Object.keys(ciderInfo[cider].Style).includes(style)){
            tempObj = ciderInfo[cider];
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
                if(cm[i] == mood){
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
    const d = date.toString();
    if(d.length < 6) return null;
    if(typeof date == 'object') return date;
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
    let tempArr = [];
    for(var cider in list){
        let tempObj = {};
        const place = list[cider].State_Country;
        if(place == country){
            tempObj = ciderInfo[cider];
            tempObj.Date_Tried = dateConvert(tempObj.Date_Tried);
            tempArr.push(tempObj)
        }
    }
    return tempArr;
}

function getAllCiderCountries(list){
    let countries = ["United States"]
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

function getLitsByStyle(style, list) {
    let lits = [];
    for(var lit in list){
        const ls = list[lit].Style;
        if(ls == style){
            let tempObj = {};
            tempObj.Title = list[lit].Title;
            tempObj.Date = dateConvert(list[lit].Date);
            tempObj.ID = list[lit].ID;
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
            tempObj.Title = list[lit].Title;
            tempObj.Date = dateConvert(list[lit].Date);
            tempObj.ID = list[lit].ID;
            lits.push(tempObj);
        }
    }
    return lits;
}

function getLitsByTheme(theme, list){
    return list.filter( lit => lit.Theme == theme);
}

function getCiderHouses(list){
    return list.map(h => h.Name);
}

function sortHousesReviewedbyState(list){
    let temp = {};
    let states = [];
    for( var house in list){
        let state = list[house].City[1];
        if(!states.includes(state)) states.push(state);
    }
    states.sort();
    //set the sorted states as keys in order in temp with null values to be set later
    states.forEach(state => {
        temp[state] = null;
    });
    //set the ciderhouses by state in sorted order
    for( var house in list){
        const state = list[house].City[1];
        const name = list[house].Name;
        if(temp[state] === null){
            temp[state] = [name];
        }
        !temp[state].includes(name) ? temp[state].push(name) : [...temp[state]];
        temp[state].sort();
    }
    return temp;
}

function getHouseReviewByName(house, list){
    let temp = list.filter( h => h.Name == house);
    let rev = temp[0];
    rev.Date = dateConvert(rev.Date);
    //rev.CidersID get names and IDs for links
    //rev.CompLitID get names and IDs for links
    return rev;
}

