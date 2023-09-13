/*
Every second, handle the recurring changes in resources.
*/
import { getNonNullSavedValue } from "./main";
import {amylaseRate, starch, glucoseProduction, initialAmylaseProduction, greyOutButtons} from "./resources";

let starchToGlucose = false;
let usingATPForAmylaseProduction = false;

//BASIC SETTERS AND GETTERS
function setStarchToGlucose(newSTG : boolean){
    starchToGlucose = newSTG;
}
function getStarchToGlucose() : boolean {
    return starchToGlucose;
}
function setUsingATPForAmylaseProduction(newbool : boolean){
    usingATPForAmylaseProduction = newbool;
}

//EVERY SECOND, THIS IS CALLED
function recurse(){
    greyOutButtons();
    
    if(starchToGlucose && starch >= amylaseRate){
        glucoseProduction();
    }
    if(usingATPForAmylaseProduction){
        initialAmylaseProduction();
    }

    setTimeout(() => {
            //console.log("recursing...");
            recurse();  
    }, 1000);
}

//SAVING AND LOADING
function saveState(){
    window.localStorage.setItem("starchToGlucose", ""+starchToGlucose);
    window.localStorage.setItem("usingATPForAmylaseProduction", ""+usingATPForAmylaseProduction);
}
function loadState(){
    starchToGlucose = (getNonNullSavedValue("starchToGlucose") === "true"); //"parseBool"
    usingATPForAmylaseProduction = (getNonNullSavedValue("usingATPForAmylaseProduction") === "true"); //"parseBool"
}
function resetState(){
    starchToGlucose = false;
    usingATPForAmylaseProduction = false;
}

export{setStarchToGlucose, setUsingATPForAmylaseProduction, getStarchToGlucose, recurse, saveState, loadState, resetState};