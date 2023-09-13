import './style.css'
import {resetResources, addH2OTesta, changeH2O, glucoseProduction, toggleGlucoseProduction, respire, saveResources, loadResources} from "./resources"
import { awakening, loadPhase, resetPhase, savePhase } from './changePhase'
import {setStarchToGlucose, recurse, saveState, loadState, resetState} from "./state";

let textEvents = ["","","","",""];
type Color = { r: number, g: number, b: number }

//do at the beginning
recurse();
addDefListener("testa_INTRO", "seed coating", false);
addDefListener("testa_INTRO", "testa", true);
getNonNullElement("testa_INTRO").addEventListener("mouseleave", (_ev)=>{
  awakening();
})

getNonNullElement("save").addEventListener("mouseenter", (_ev)=>{
  getNonNullElement("save").style.textDecoration = "underline";
})
getNonNullElement("save").addEventListener("mouseleave", (_ev)=>{
  getNonNullElement("save").style.textDecoration = "";
})
getNonNullElement("save").addEventListener("mousedown", (_ev)=>{
  trueSave();
})

getNonNullElement("reset").addEventListener("mouseenter", (_ev)=>{
  getNonNullElement("reset").style.textDecoration = "underline";
})
getNonNullElement("reset").addEventListener("mouseleave", (_ev)=>{
  getNonNullElement("reset").style.textDecoration = "";
})
getNonNullElement("reset").addEventListener("mousedown", (_ev)=>{
  trueReset();
})

getNonNullElement("load").addEventListener("mouseenter", (_ev)=>{
  getNonNullElement("load").style.textDecoration = "underline";
})
getNonNullElement("load").addEventListener("mouseleave", (_ev)=>{
  getNonNullElement("load").style.textDecoration = "";
})
getNonNullElement("load").addEventListener("mousedown", (_ev)=>{
  trueLoad();
})

function addDefListener(tag : string, newText : string, leave : boolean) {
  const element = getNonNullElement(tag);

  if (leave) {
      element.addEventListener("mouseleave", (_ev) => {
          element.innerHTML = newText;
      })
  }
  else {
      element.addEventListener("mouseenter", (_ev) => {
          element.innerHTML = newText;
      })
  }
}
function addDefListenerToElm(element : Element, newText : string, leave : boolean) {
  if (leave) {
      element.addEventListener("mouseleave", (_ev) => {
          element.innerHTML = newText;
      })
  }
  else {
      element.addEventListener("mouseenter", (_ev) => {
          element.innerHTML = newText;
      })
  }
}
function addButtonListener(tag : string, incrementBy ?: number) {
  getNonNullElement(tag).addEventListener("mouseup", (_ev) => {
      switch (tag){
          case "H2O_testa":
              addH2OTesta();
              break;
          case "H2O":
              if(incrementBy){
                changeH2O(incrementBy);
              }
              else{
                console.log("tried to increment a resource, but did not give incrementBy");
              }
              break;
          case "glucose_production":
              toggleGlucoseProduction();
              break;
          case "cotelydon_respiration":
              respire();
              break;
      }
  })
}
function addResourcePopupListener(tag : string, resources : string[], changes : string[]){
  let element = getNonNullElement(tag);

  console.log("in popup adder");
  //if this element already has a popup
  if(document.getElementById(tag+"_popup") != null){
    getNonNullElement(tag+"_popup").remove(); //remove the popup element
  }

  //set up a popup with a left-justified list of resources and a right-justified list of changes to those resources
  let popup = document.createElement("div");
  popup.className = "popup";
  popup.id = tag+"_popup";

  for(let i = 0; i<resources.length && changes.length; i++){
    //create a each row as its own div
    let popupRow = document.createElement("div");
    popupRow.className = "popup-row";
    
    //add the left-justified element
    let resource = document.createElement("p");
    resource.textContent = resources[i];
    resource.className = "left-text popup-text";
    popupRow.appendChild(resource);

    //add the right-justified element
    let change = document.createElement("p");
    change.textContent = changes[i];
    change.className = "right-text popup-text";
    popupRow.appendChild(change);

    //add the grid item to the grid container
    popup.appendChild(popupRow);
  } //any mismatched elements will not be added
  

  let clearfix = document.createElement("div");
  clearfix.className = "clearfix";
  popup.appendChild(clearfix);
  
  if(element.parentElement != null){
    element.parentElement.insertBefore(popup, element);
  }
  
  function showPopup(event : MouseEvent){
    //SHOW THE POPUP
    console.log("showing popup when mouse enters button");
    //get the position of the element (probably a button based on my use cases)
    let buttonRect = element.getBoundingClientRect();

    // calculate the adjusted position with scroll position
    let adjustedLeft = buttonRect.left + window.scrollX;
    let adjustedTop = buttonRect.top + window.scrollY;
        
    // set the position of the popup to be just below the button
    popup.style.left = adjustedLeft + "px";
    popup.style.top = (adjustedTop + buttonRect.height) + "px";
    
    //display the popup
    popup.style.display = "block";
  }
  function hidePopup(event : MouseEvent){
    //HIDE THE POPUP
    popup.style.display = "none";
  }

  element.addEventListener("mouseenter", showPopup);
  element.addEventListener("mouseleave", hidePopup);

}
try{getNonNullSavedValue("validSaveData")}
catch(Error){
  trueSave();
}

function createDefinedSpan(text : string, definition : string) : HTMLSpanElement{
  const span = document.createElement("span");
  span.textContent = text;
  span.id = text;
  addDefListenerToElm(span, definition, false);
  addDefListenerToElm(span, text, true);
  return span;
}
function createDefinedSpanColored(text : string, definition : string, color : Color) : HTMLSpanElement{
  const span = document.createElement("span");
  span.textContent = text;
  span.id = text;
  span.style.color = `rgb(${color.r}, ${color.g}, ${color.b})`;
  addDefListenerToElm(span, definition, false);
  addDefListenerToElm(span, text, true);
  return span;
}

function getNonNullElement(tag : string): HTMLElement{
  let element = document.getElementById(tag);

  if(element == null){
    throw "there's no element called "+tag;
  }
  return element;
}

function newTextEvent(event : string){
  let narrativeText = getNonNullElement("narrative");

  //clear the last <p> in the list
  let lastItem = textEvents[textEvents.length-1];
  if(!(lastItem === "")){//don't try to query the document for blank ids
    let currentChild = document.querySelector("#narrative #"+lastItem);
    currentChild?.remove();
    for(let i =0; i<2; i++){
      if(narrativeText.lastChild != null){
        narrativeText.removeChild(narrativeText.lastChild);} //remove the <br>s
    }
  } 
    
  //add new event with a unique string as the first child and shift everything else over 1
  for(let i = textEvents.length-1; i > 0; i--){
    textEvents[i] = textEvents[i-1];
  }
  textEvents[0] = event;
  if(event.indexOf(" ")>=0){
    textEvents[0] = event.replaceAll("<","").replaceAll(">","").replaceAll("|","");
    textEvents[0] = textEvents[0].substring(0, textEvents[0].indexOf(" "));
  }
  //add a chain of '2's until it doesn't match any entry
  let unique = false;
  while(!unique){
    unique = true;
    for(let i = 1; i<textEvents.length; i++){
      if(textEvents[0] === textEvents[i]){
        unique = false;
      }
    }
    if(!unique){
      textEvents[0]+=""+2; 
    }
  }

  //Add the new text to the top of the narrative text section
  let newP = document.createElement("paragraph");
  //id the event 
  newP.id = textEvents[0];

  if(!event.includes("<span>")){
    newP.textContent = event;
  }
  else{
    //an integer representing the starting index of the first <span> token
    let posOfSubscript = event.indexOf("<span>");
    while(posOfSubscript>=0){ //while there's another span token
        //make the label have some plain text
        newP.appendChild(document.createTextNode(event.substring(0,posOfSubscript)));

        //make the label have some text in a span
        let posOfEndSubscript = event.indexOf("</span>");
        if(posOfEndSubscript<0){
            throw new Error('event contained a starting "<span>" token, but no ending "</span>" token');
        }
        //grab the text until the | and use it as the word, then the rest of the text is the definition
        const word = event.substring(posOfSubscript+6,event.indexOf("|"));
        const def = event.substring(event.indexOf("|")+1,posOfEndSubscript);
        newP.appendChild(createDefinedSpan(word, def));

        //update chemTitle and posOfSubscript
        event = event.substring(posOfEndSubscript+7);
        posOfSubscript = event.indexOf("<span>");
    }
    //put whatever remains of chemTitle into chemLabel 
    newP.appendChild(document.createTextNode(event));
  } 
  narrativeText.insertBefore(document.createElement("br"), narrativeText.firstChild);
  narrativeText.insertBefore(document.createElement("br"), narrativeText.firstChild);
  narrativeText.insertBefore(newP, narrativeText.firstChild);

  //adjust all the <p>s' transparency appropriately
  let i = 0
  for(i = 0; i < textEvents.length; i++){
    let id = textEvents[i];
    if(id === ""){continue;} //don't try to query the document for blank ids

    let currentChild = document.querySelector("#narrative #"+id);
    if(currentChild == null){
      throw ("newTextEvent improperly added "+id+" to the document");
    }

    (currentChild as HTMLElement).style.opacity = ""+((textEvents.length - i)/textEvents.length);
  }
}

//SAVING AND LOADING
function getNonNullSavedValue(key : string){
  let toReturn = window.localStorage.getItem(key);
  if(toReturn == null){
    throw key+" has not been saved to";
  }
  return toReturn;
}
function trueSave(){
  window.localStorage.setItem("validSaveData", "true");
  window.localStorage.setItem("textEvents", textEvents.join("<this_is_a_very_long_phrase_that_hopefully_is_not_in_any_textEvent>"));

  savePhase();
  saveResources();
  saveState();
}
function trueLoad(){
  let gutMyChildren = getNonNullElement("narrative");
  while (gutMyChildren.lastChild != null) {
    console.log(gutMyChildren.lastChild.nodeName+" was removed");
    gutMyChildren.removeChild(gutMyChildren.lastChild);
  }
  textEvents = ["","","","",""];

  loadPhase();
  loadResources();
  loadState();
}
function trueReset(){
  let gutMyChildren = getNonNullElement("narrative");
  while (gutMyChildren.lastChild != null) {
    console.log(gutMyChildren.lastChild.nodeName+" was removed");
    gutMyChildren.removeChild(gutMyChildren.lastChild);
  }
  textEvents = ["","","","",""];
  
  resetPhase();
  resetResources();
  resetState();
}

export{getNonNullSavedValue, addDefListener,addDefListenerToElm, addButtonListener, createDefinedSpan, createDefinedSpanColored, getNonNullElement, newTextEvent, addResourcePopupListener}