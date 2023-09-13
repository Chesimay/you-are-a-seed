/*
To Do: 
- test save and load resources exhaustively
- photosynthesis time baybee
*/
import {getNonNullElement, createDefinedSpan, newTextEvent, addButtonListener, createDefinedSpanColored, addResourcePopupListener,getNonNullSavedValue} from "./main";
import { setStarchToGlucose, getStarchToGlucose } from "./state";
import { awakening, sufficientWater, enoughGlucoseForRespiration, amylaseProductionConcludes, getPhase } from "./changePhase";

//all vars are stored in window.localStorage, all resources are in “arbitrary units”
let H2O = 0; //water - H2O
let CO2 = 0; //carbon dioxide - CO2
let O2 = 0; //Oxygen Gas - enters passively via diffusion in seed forme
let ATP = 34; //adenosine triphosphate - ATP
let ADP = 0; //adenosine diphosphate - ADP - C10H15N5O10P2 - made using 5 ammonia, 10 CO2, and phosphorous
let starch = 100; // starch - (C6H10O5)n
let glucose = 0; //glucose - C6H12O6
let NH3 = 0; //ammonia with nitrogen in it

let amylaseRate = 0;

let canRespire = false;

//used for saving, loading, and resetting
let liveButtons = [""]; //items in this array look like "id\/array,of,resources\/array,of,changes\/optionalIntForAddButtonListener"; edit it whenever a button becomes visible or invisible AND when a button's popup is changed
let textContent = [""]; //items in this array look like "id\/text<span>perhaps|with spans</span>\/optionalOpacity"; use **updateItemText** instead of .textContent = "..." to keep this storage in line with reality (no edits should be otherwise necessary)
let shownResources = [""]; //edit this whenever you add/remove an item from the table on the right
let shownDivs = [""]; //edit this whenever you edit the opacity of a div

const allDivs = ["resources_sector", "testa_tasks", "cotelydon_tasks", "radicle_root_tasks", "plumule_leaf_tasks", "vascular_tasks"];
const allButtons = ["H2O_testa", "glucose_production", "cotelydon_respiration"];

//basic setters
function changeO2(numToAdd : number){
    O2 += numToAdd;
    getNonNullElement("oxygen_counter").textContent = ""+O2;
}
function changeCO2(numToAdd : number){
    CO2 += numToAdd;
    getNonNullElement("carbon_dioxide_counter").textContent = ""+CO2;
}
function changeH2O(numToAdd : number){
    H2O += numToAdd;
    getNonNullElement("water_counter").textContent = ""+H2O;
}
function changeATP(numToAdd : number){
    ATP += numToAdd;
    getNonNullElement("energy_counter").textContent = ""+ATP;
}
function changeADP(numToAdd : number){
    ADP += numToAdd;
    getNonNullElement("spent_energy_counter").textContent = ""+ADP;
}
function changeStarch(numToAdd : number){
    starch += numToAdd;
    getNonNullElement("starch_counter").textContent = ""+starch;
}
function changeGlucose(numToAdd : number){
    glucose += numToAdd;
    getNonNullElement("glucose_counter").textContent = ""+glucose;
}

//initialization stuff
function displayTestaWater(){
    addResourcePopupListener("H2O_testa", [" ", "Water"],["Per Click", "+1"]);
	getNonNullElement("testa_tasks").style.opacity = "1";
    getNonNullElement("H2O_testa").style.opacity = "1";
	addButtonListener("H2O_testa");
    shownDivs[shownDivs.length] = "testa_tasks";

    let index = liveButtons.length; //if we don't find an array item with the right id, add it at the end of the array
    for(let i = 1; i<liveButtons.length; i++){ //start at 1 because liveButtons[0] is ""
        if(liveButtons[i].split("\\/")[0] === "H2O_testa"){ //if we DO find an array item with this id, replace the content of that item with the new info
            index = i;
        }
    }
    liveButtons[index] = "H2O_testa\\/ ,Water\\/Per Click,+1";
}
function addH2OTesta(){
    //display the resources tab if it isn't shown already
    const rsc = document.getElementById("resources_sector");
    if(rsc === null){
        throw "resources sector is gone somehow?";
    }
    if(rsc.style.opacity != "1"){
        rsc.style.opacity = "1";
        shownDivs[shownDivs.length] = "resources_sector";
        if(shownResources)
        showResource("Water", "H<sub>2</sub>O", 1, "H2O");
    }
    
    //degrade the testa the more water you uptake with it
    if(getNonNullElement("dry_INTRO").textContent != ""){
        const introText = getNonNullElement("dry_INTRO");
    
        if(H2O == 19){
            introText.style.opacity = "0.85";
            updateItemText("dry_INTRO", "Your <span>testa|seed coating</span> is beginning to break down.", "0.85");
        }
        else if(H2O == 39){
            introText.style.opacity = "0.6";
            updateItemText("dry_INTRO", "Your <span>testa|seed coating</span> is even more degraded.", "0.6");

            newTextEvent("Deep in your cells, <span>RNA|‘r’ibo’n’ucleic ‘a’cid, a single-stranded molecule with many different forms that all help in protein synthesis,</span> conveys instructions from your <span>DNA|‘d’eoxyribo’n’ucleic ‘a’cid, a double-stranded molecule that stores information,</span> to produce <span>amylase|a protein that helps break down starches</span>. This uses energy.");
            showResource("Energy","ATP, C<sub>10</sub>H<sub>16</sub>N<sub>5</sub>O<sub>13</sub>P<sub>3</sub>", ATP, "ATP");
            showResource("Spent Energy","ADP, C<sub>10</sub>H<sub>15</sub>N<sub>5</sub>O<sub>10</sub>P<sub>2</sub>", ADP, "ADP");
            sufficientWater();
        }
        else if(H2O >= 99){
            //hide waterButton
            let waterButton = getNonNullElement("H2O_testa");
            waterButton.style.opacity = "0";
            let clone = waterButton.cloneNode(true); //such clones should have no event listeners, but the same everything else
            waterButton.parentElement?.insertBefore(clone, waterButton);
            waterButton.remove();
            liveButtons = liveButtons.slice(liveButtons.indexOf("H2O_testa\\/ ,Water\\/Per Click,+1"), 1); //remove H2O_testa from liveButtons

            //remove waterButton's popup
            getNonNullElement("H2O_testa_popup").remove();

            //hide introText
            updateItemText("dry_INTRO", "", "0");
            newTextEvent("Your <span>testa|seed coating</span> disintegrated.");
        }
        
    }
    //increment H2O
    changeH2O(1);
}

function initialAmylaseProduction(){
    //when energy at 10, say "Your energy reserves are growing low."
    if(ATP == 10){
        newTextEvent("Your energy reserves are growing low.");
    }
    //when all energy is converted to spent energy, prompt the visibility of the switch for
    //  glucose production and say
    //"Amylase production concludes. You now have enough amylase to convert starches to glucose."
    if(ATP == 0){
        newTextEvent("<span>Amylase|A protein that helps break down starches</span> production concludes. You now have enough <span>amylase|proteins that help break down starches</span> to convert starches to glucose.");
        amylaseProductionConcludes();
        changeAmylaseRate(1); //amylaseRate is now 1
        showResource("Starch","long chains of sugars", starch, "starch");
        getNonNullElement("cotelydon_tasks").style.opacity = ""+1; 
        getNonNullElement("glucose_production").style.opacity = "1"; //show the toggle button and text arround it
        addButtonListener("glucose_production");
        updateItemText("glucose_production", "Toggle Glucose Production ON");
        addResourcePopupListener("glucose_production", [" ","Starch", "Glucose"], ["Per Second","-1", "+10"]);
        shownDivs[shownDivs.length] = "cotelydon_tasks";
        liveButtons[liveButtons.length] = "glucose_production\\/ ,Starch,Glucose\\/Per Second,-1,+10";
    }
    else{
        //energy -> spent energy once per second
        changeATP(-1);
        changeADP(1);
    }

}

function changeAmylaseRate(newRate : number){
    amylaseRate = newRate;
    updateItemText("amylase_counter", "Amylase: "+amylaseRate);
    addResourcePopupListener("glucose_production", ["Starch", "Glucose"], ["-"+amylaseRate+" per second", "+"+(amylaseRate*10)+" per second"]);
    
    let index = -1; //if we don't find an array item with the right id, don't change the array at all
    for(let i = 1; i<liveButtons.length; i++){ //start at 1 because liveButtons[0] is ""
        if(liveButtons[i].split("\\/")[0] === "glucose_production"){ //if we DO find an array item with this id, replace the content of that item with the new info
            index = i;
        }
    }
    if(index>=0 && index<liveButtons.length){
        liveButtons[index] = "glucose_production\\/Starch,Glucose\\/-"+amylaseRate+" per second, +"+(amylaseRate*10)+" per second";
    }
    
}

function updateItemText(id : string, newText : string, opacity?:string, dontSave? : boolean){
    let element = getNonNullElement(id);

    //update the opacity of the element
    if(opacity !== undefined){
        element.style.opacity = opacity;
    }

    //save the newText variable as it was passed in before it potentially is mutated
    let nonmutatedNewText = newText;

    //UPDATE THE TEXT OF ELEMENT APPROPRIATELY
    if(!newText.includes("<span>")){
        element.textContent = newText;
    }
    else{
        element.textContent = ""; //clear the element to start
        //an integer representing the starting index of the first <span> token
        let posOfSubscript = newText.indexOf("<span>");
        while(posOfSubscript>=0){ //while there's another span token
            //make the element have some plain text
            element.appendChild(document.createTextNode(newText.substring(0,posOfSubscript)));
    
            //make the element have some text in a span
            let posOfEndSubscript = newText.indexOf("</span>");
            if(posOfEndSubscript<0){
                console.log(nonmutatedNewText);
                throw new Error('newText contained a starting "<span>" token, but no ending "</span>" token');
            }
            //grab the text until the | and use it as the word, then the rest of the text is the definition
            const word = newText.substring(posOfSubscript+6,newText.indexOf("|"));
            const def = newText.substring(newText.indexOf("|")+1,posOfEndSubscript);
            element.appendChild(createDefinedSpan(word, def));
    
            //update newText and posOfSubscript
            newText = newText.substring(posOfEndSubscript+7);
            posOfSubscript = newText.indexOf("<span>");
        }
        //put whatever remains of the text into the element 
        element.appendChild(document.createTextNode(newText));
    } 

    //UPDATE TEXTCONTENT APPROPRIATELY
    let index = textContent.length; //if we don't find an array item with this id, the info will be put in a new spot at the very end of the array
    for(let i = 1; i<textContent.length; i++){ //start at 1 because textContent[0] is ""
        if(textContent[i].split("\\/")[0] === id){ //if we DO find an array item with this id, replace the content of that item with the new info
            index = i;
        }
    }
    //actually update the array
    if(dontSave === undefined || dontSave == false){
        if(opacity !== undefined){
            textContent[index] = id+"\\/"+nonmutatedNewText+"\\/"+opacity; 
        }
        else{
            textContent[index] = id+"\\/"+nonmutatedNewText; 
        }
    }
}

//button functions
function toggleGlucoseProduction(){
    if(getStarchToGlucose()){
        setStarchToGlucose(false);
        updateItemText("glucose_production", "Toggle Glucose Production ON");
    }
    else{
        setStarchToGlucose(true);
        if(document.getElementById("glucose_counter") == null){
            showResource("Glucose","a simple sugar, C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>", glucose, "glucose");
        }
        updateItemText("glucose_production", "Toggle Glucose Production OFF");
    }
}

function glucoseProduction(){
    changeStarch(-1*amylaseRate); changeGlucose(10*amylaseRate); //turn x starch into 10x glucose
    if(getPhase()==="glucose production" && glucose >= 100) { //the first time glucose goes above 100...
        enoughGlucoseForRespiration();
           
        updateItemText("respire_header", "Cellular Respiration");
        updateItemText("respire_text", "Oxygen gas and carbon dioxide are currently able to diffuse respectively into/out of your cells from the soil");

        let toggleRespiration = getNonNullElement("cotelydon_respiration");
        toggleRespiration.style.opacity = "1";
        addButtonListener("cotelydon_respiration");
        addResourcePopupListener("cotelydon_respiration", [" ", "Glucose", "Oxygen Gas", "ADP", "Carbon Dioxide", "Water", "ATP"], ["Per Click", "-1", "-0 (-6+6)", "-34", "+0 (+6-6)", "+6", "+34"]);
        liveButtons[liveButtons.length] = "cotelydon_respiration\\/ ,Glucose,Oxygen Gas,ADP,Carbon Dioxide,Water,ATP\\/Per Click,-1,-0 (-6+6),-34,+0 (+6-6),+6,+34";
    }
}

function respire(){
    let includeOxygen = shownResources.toString().includes("O2");
    let includeCO2 = shownResources.toString().includes("CO2");
    if(canRespire){
        //remove costs
        changeGlucose(-1); changeADP(-34);
        if(includeOxygen){    //maybe do things with oxygen and CO2 based on the visible resources
          changeO2(-6);
        }

        //add benefits
        changeATP(34); changeH2O(6);
        if(includeCO2){
            changeCO2(6);
        }
    }
}

function greyOutButtons(){
    if(document.getElementById("cotelydon_respiration") !== null){ //IF cotelydon respiration button exists, grey it out or don't as needed
        let includeOxygen = false;
        for(let i = 0; i<shownResources.length; i++){
            if(shownResources[i].includes("Oxygen Gas")){
                includeOxygen = true;
            }
        }
        if((!includeOxygen || (includeOxygen && O2 >= 6)) && (glucose >= 1) && (ADP >= 34)){
            canRespire = true;
            getNonNullElement("cotelydon_respiration").className = getNonNullElement("cotelydon_respiration").className.replace(" unclickable-button", "");
        }
        else{
            if(canRespire){
                canRespire = false;
                getNonNullElement("cotelydon_respiration").className+= " unclickable-button";
            }
        }
    }
}

//SHOW AND REMOVE RESOURCES FROM TABLE
function showResource(resource : string, chemTitle : string, startingNum : number, saveTag?: string){
    const tableSection = getNonNullElement("resources_list");
    tableSection.style.opacity = "1";
    const newRow = document.createElement("tr");
    newRow.id = resource.replaceAll(" ", "_")+"_tr";

    let originalChemTitle = chemTitle;

    //give the resource cell the appropriate label
    const label = document.createElement("td");
    label.textContent = resource;

    //give the chemTitle cell the appropriate text, including subscripts
    const chemLabel = document.createElement("td");
    if(!chemTitle.includes("<sub>")){
        chemLabel.textContent = chemTitle;
    }
    else{
        //an integer representing the starting index of the first <sub> token
        let posOfSubscript = chemTitle.indexOf("<sub>");
        while(posOfSubscript>=0){ //while there's another subscript token
            //make the label have some plain text
            chemLabel.appendChild(document.createTextNode(chemTitle.substring(0,posOfSubscript)));

            //make the label have some subscript text
            let posOfEndSubscript = chemTitle.indexOf("</sub>");
            if(posOfEndSubscript<0){
                throw new Error('chemTitle contained a starting "<sub>" token, but no ending "</sub>" token');
            }
            const subText = document.createElement("sub");
            subText.textContent = chemTitle.substring(posOfSubscript+5,posOfEndSubscript);
            chemLabel.appendChild(subText);

            //update chemTitle and posOfSubscript
            chemTitle = chemTitle.substring(posOfEndSubscript+6);
            posOfSubscript = chemTitle.indexOf("<sub>");
        }
        //put whatever remains of chemTitle into chemLabel 
        chemLabel.appendChild(document.createTextNode(chemTitle));
    }

    //give the number cell the appropriate starting value and label
    const num = document.createElement("td");
    num.textContent = ""+startingNum;
    num.id = ""+resource.normalize().toLowerCase().replaceAll(" ", "_")+"_counter";
    
    newRow.appendChild(label);
    newRow.appendChild(chemLabel);
    newRow.appendChild(num);
    tableSection.appendChild(newRow);

    //KEEP TRACK OF SHOWN RESOURCES
    if(saveTag !== undefined){
        shownResources.push(resource+"\\/"+originalChemTitle+"\\/"+saveTag);
    }
}
function deleteResource(resource :string){
    let deleteMe = getNonNullElement(resource.replaceAll(" ", "_")+"_tr");
    deleteMe.remove();
}

//SAVING AND LOADING
function saveResources(){ //**should be** called by main every few seconds to save the game
    window.localStorage.setItem("H2O", ""+H2O);
    window.localStorage.setItem("O2", ""+O2);
    window.localStorage.setItem("CO2", ""+CO2);
    window.localStorage.setItem("ATP", ""+ATP);
    window.localStorage.setItem("ADP", ""+ADP);
    window.localStorage.setItem("starch", ""+starch);
    window.localStorage.setItem("glucose", ""+glucose);

    window.localStorage.setItem("amylaseRate", ""+amylaseRate);

    //KEEP TRACK OF SHOWN RESOURCES
    window.localStorage.setItem("shownResources", shownResources.join("<>"));

    window.localStorage.setItem("liveButtons", liveButtons.join("<>"));	
    window.localStorage.setItem("textContent", textContent.join("<>"));

    window.localStorage.setItem("shownDivs", shownDivs.join("<>"));	
}
function loadResources(){
    H2O = parseInt(getNonNullSavedValue("H2O"));
    O2 = parseInt(getNonNullSavedValue("O2"));
    CO2 = parseInt(getNonNullSavedValue("CO2"));
    ATP = parseInt(getNonNullSavedValue("ATP"));
    ADP = parseInt(getNonNullSavedValue("ADP"));
    starch = parseInt(getNonNullSavedValue("starch"));
    glucose = parseInt(getNonNullSavedValue("glucose"));

    amylaseRate = parseInt(getNonNullSavedValue("amylaseRate"));
    
    //RE-SHOW RESOURCES
    for(let i = 1; i<shownResources.length; i++){ //delete all resources currently shown
        let resTitle = shownResources[i].split("\\/");
        deleteResource(resTitle[0]);
    }
    
    shownResources = getNonNullSavedValue("shownResources").split("<>"); //load in the saved resources
    for(let i = 1; i<shownResources.length; i++){ //first item will always be "", so start on 1 (if it exists)
        let resTitle = shownResources[i].split("\\/");
        showResource(resTitle[0], resTitle[1], parseInt(getNonNullSavedValue(resTitle[2]))); //DOESN'T make showResources save the newly-loaded resource a second time
    }

    //RE-SHOW DIVS
    //Make every div invisible
    for(let i = 0; i < allDivs.length; i++){
        getNonNullElement(allDivs[i]).style.opacity = "0";
    }
    //Make the correct divs visible again
    shownDivs = getNonNullSavedValue("shownDivs").split("<>");	
    for(let i = 1; i<shownDivs.length; i++){
        getNonNullElement(shownDivs[i]).style.opacity = "1";
    }

    //RE-AWAKEN BUTTONS
    //First make every button INvisible and UNclickable
    for(let i = 0; i<allButtons.length; i ++){
		let currentButton = getNonNullElement(allButtons[i]);
        currentButton.style.opacity = "0";
		let clone = currentButton.cloneNode(true); //such clones should have no event listeners, but the same everything else
		currentButton.parentElement?.insertBefore(clone, currentButton);
		currentButton.remove();
	}
    //Then re-awaken every "live" button
    liveButtons = getNonNullSavedValue("liveButtons").split("<>");
    for(let i = 1; i<liveButtons.length; i++){ //starts at 1 because of the "" at position 0 to define liveButton's type
        //liveButtons[i] may be a string representation of an array with three or four elements
        let buttonArr = liveButtons[i].split("\\/");
        //give it the correct popup
        addResourcePopupListener(buttonArr[0], (buttonArr[1].split(",")), (buttonArr[2].split(",")));
        //give it the correct action
        if(buttonArr[3]){ //if it has an integer specifying how much to increase/decrease something by, buttonArr[3] will exist...
            addButtonListener(buttonArr[0], parseInt(buttonArr[3])); // ...and addButtonListener will process it 
        }
        else{
            addButtonListener(buttonArr[0]); //otherwise, addButtonListener will process it soley based on the id
        }
        //set the visibility
        getNonNullElement(buttonArr[0]).style.opacity = "1";
    }

    //RE-DISPLAY TEXT
    //Remove all the text from the things with text content currently
    for(let i = 1; i<textContent.length; i++){
        let id = textContent[i].split("\\/")[0];
        getNonNullElement(id).textContent = "";
    }
    textContent = getNonNullSavedValue("textContent").split("<>"); //load in the saved text content
    for(let i = 1; i<textContent.length; i++){ //for every item past the first one, which is ""
        let arrIdTextOpacity = textContent[i].split("\\/"); //get the id and text (and perhaps the opacity) out of it
        if(arrIdTextOpacity.length == 3){
            updateItemText(arrIdTextOpacity[0], arrIdTextOpacity[1], arrIdTextOpacity[2], true);
        }
        else{
            updateItemText(arrIdTextOpacity[0], arrIdTextOpacity[1], "1", true); //use them to change the textContent of the appropriate element, putting in the right spans and everything, but not saving it to the array again
        }
    }

    //HELP WITH MAKING SURE THIS PART IS COVERED BY EVERYTHING ELSE
    //fix the text and appearance of "dry_INTRO" based on the state of H2O and the visibility of water button
    // if(getNonNullElement("H2O_testa").style.opacity === "1"){
    //     const introText = getNonNullElement("dry_INTRO");
    
    //     if(H2O >= 100){
    //         //hide waterButton
    //         let waterButton = getNonNullElement("H2O_testa");
    //         waterButton.style.opacity = "0";
    //         let clone = waterButton.cloneNode(true); //such clones should have no event listeners, but the same everything else
    //         waterButton.parentElement?.insertBefore(clone, waterButton);
    //         liveButtons.slice(liveButtons.indexOf("H2O_testa"), 1); //remove H2O_testa from liveButtons

    //         //remove waterButton's popup
    //         getNonNullElement("H2O_testa_popup").remove();

    //         //hide introText
    //         introText.style.opacity = "0";
    //         newTextEvent("Your <span>testa|seed coating</span> disintegrated.");
    //     }
    //     else if(H2O >= 40){
    //         introText.style.opacity = "0.6";
    //         introText.textContent = "Your ";
    //         introText.appendChild(createDefinedSpan("testa", "seed coating"));
    //         introText.appendChild(document.createTextNode(" is even more degraded."));

    //         newTextEvent("Deep in your cells, <span>RNA|‘r’ibo’n’ucleic ‘a’cid, a single-stranded molecule with many different forms that all help in protein synthesis,</span> conveys instructions from your <span>DNA|‘d’eoxyribo’n’ucleic ‘a’cid, a double-stranded molecule that stores information,</span> to produce <span>amylase|a protein that helps break down starches</span>. This uses energy.");
    //         showResource("Energy","ATP, C<sub>10</sub>H<sub>16</sub>N<sub>5</sub>O<sub>13</sub>P<sub>3</sub>", ATP, "ATP");
    //         showResource("Spent Energy","ADP, C<sub>10</sub>H<sub>15</sub>N<sub>5</sub>O<sub>10</sub>P<sub>2</sub>", ADP, "ADP");
    //         initialAmylaseProduction();
    //     }
    //     else if(H2O >= 20){
    //         introText.style.opacity = "0.85";
    //         introText.textContent = "Your ";
    //         introText.appendChild(createDefinedSpan("testa", "seed coating"));
    //         introText.appendChild(document.createTextNode(" is beginning to break down."));
    //     }
    // }
    // else{
    //     getNonNullElement("dry_INTRO").style.opacity = "0";
    // }
}
function resetResources(){
    H2O = 0;
    O2 = 0;
    CO2 = 0;
    ATP = 34;
    ADP = 0;
    starch = 100;
    glucose = 0;

    amylaseRate = 0;

    //RESET BUTTONS
	for(let i = 0; i<allButtons.length; i ++){
		let currentButton = getNonNullElement(allButtons[i]);
        currentButton.style.opacity = "0";
		let clone = currentButton.cloneNode(true); //such clones should have no event listeners, but the same everything else
		currentButton.parentElement?.insertBefore(clone, currentButton);
		currentButton.remove();
	}
	//reset the "liveButtons" var
	liveButtons = [""];

    //...and the "shownDivs" var
	shownDivs = [""];
    //Make the divs that hold the buttons and the table of resources invisible
    for(let i = 0; i < allDivs.length; i++){
        getNonNullElement(allDivs[i]).style.opacity = "0";
    }

    //...and the "textContent" var
    //Remove all the text from the things with text content
    for(let i = 1; i<textContent.length; i++){
        let id = textContent[i].split("\\/")[0];
        getNonNullElement(id).textContent = "";
    }
    //and reset textContent itself
    textContent = [""];

    //reset the span with the ability to change the phase in the initial text if it was deleted
	let testaIntro = null;
	try{ 
		testaIntro = getNonNullElement("testa_INTRO");
	}catch{
		testaIntro = createDefinedSpan("testa", "seed coating");
		testaIntro.id = "testa_INTRO";
	}

	let dry = getNonNullElement("dry_INTRO");
	dry.style.opacity = "1";
	dry.textContent = "Your ";
	dry.appendChild(testaIntro);
	dry.appendChild(document.createTextNode(" detects no water."));

	getNonNullElement("testa_INTRO").addEventListener("mouseleave", (_ev)=>{
		awakening();
	})


    //Delete all resources from the table
    for(let i = 1; i<shownResources.length; i++){ //delete all resources currently shown
        let resTitle = shownResources[i].split("\\/");
        deleteResource(resTitle[0]);
    }
    shownResources = [""];

}

export{greyOutButtons,    updateItemText, initialAmylaseProduction, addH2OTesta, changeH2O, starch, amylaseRate, toggleGlucoseProduction, glucoseProduction, saveResources, respire, resetResources, loadResources, displayTestaWater}