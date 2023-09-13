import {getNonNullElement, createDefinedSpan, addButtonListener, addResourcePopupListener, getNonNullSavedValue} from "./main";
import {updateItemText, displayTestaWater} from "./resources";
import { setUsingATPForAmylaseProduction } from "./state";

let phase = "dormancy"; 
/*
Current phases:
 - dormancy
 - need water
 - producing amylase
 - glucose production
 - cellular respiration in cotelydon

Future phases?
 - growing radicle
*/

let timeOfDay = -1;
type Color = { r: number, g: number, b: number }

function awakening() {
	//only run this function once
	if (phase === "dormancy") {
		phase = "need water";

		//in 2 seconds, make the first button visible and clickable
		setTimeout(() => {
			displayTestaWater();
		}, 2000);

		//swap the text in the initial header
		updateItemText("dry_INTRO", "Water contacted your <span>testa|seed coating</span>!");

		//change the document's title
		document.title = "The Seed Awakens";

		//fade to the new background color and text color
		fadeColor({ r: 0, g: 0, b: 0 }, { r: 250, g: 235, b: 215 }, '--background', 2000);
		fadeColor({ r: 250, g: 235, b: 215 }, { r: 0, g: 0, b: 0 }, '--text-color', 2000);
	}
}
function sufficientWater(){
	if(phase === "need water"){
		phase = "producing amylase";
		setUsingATPForAmylaseProduction(true);
	}
}
function amylaseProductionConcludes(){
	if(phase === "producing amylase"){
		phase = "glucose production";
		setUsingATPForAmylaseProduction(false);
	}
}
function enoughGlucoseForRespiration(){
	if(phase === "glucose production"){
		phase = "cellular respiration in cotelydon";
	}
}

function breachSoil(){} //called upon growing the cotelydon above the soil

function sunrise(){}
function sunset(){}

//changing colors
function fadeColor(startColor: Color, endColor: Color, colorVar: string, duration: number) { //duration in milliseconds
	const interval = 10; // 10 milliseconds
	const steps = duration / interval;
	const stepSize = 1 / steps;
	let progress = 0;

	//every 10 millisecond, blend the colors a bit more toward the end color
	const timer = setInterval(() => {
		progress += stepSize;
		//exit the loop when the blending is complete
		if (progress >= 1) {
			clearInterval(timer);
		}
		//update the current color
		const currentColor = blendColors(startColor, endColor, progress);
		//actually change the variable based on the name of the CSS var passed in
		document.documentElement.style.setProperty(colorVar, currentColor);
	}, interval);
}
function blendColors(startColor: Color, endColor: Color, progress: number): string {
	const r = Math.round(startColor.r + (endColor.r - startColor.r) * progress);
	const g = Math.round(startColor.g + (endColor.g - startColor.g) * progress);
	const b = Math.round(startColor.b + (endColor.b - startColor.b) * progress);
	return `rgb(${r}, ${g}, ${b})`;
}

//SAVING AND LOADING
function getPhase(){
	return phase;
}
function savePhase(){
	window.localStorage.setItem("phase", phase);
	window.localStorage.setItem("timeOfDay", ""+timeOfDay);
}
function loadPhase(){ 
	timeOfDay = parseInt(getNonNullSavedValue("timeOfDay"));
	phase = getNonNullSavedValue("phase"); 
	switch(phase){
		case "dormancy":
			resetPhase();
			break;
		//all of these phases are in the "Seed Awakens" group, with the same background color and title
		case "need water": 
		case "producing amylase":
		case "glucose production":
		case "cellular respiration in cotelydon":
			//snap to the new background color and text color
			fadeColor({ r: 250, g: 235, b: 215 }, { r: 250, g: 235, b: 215 }, '--background', 1);
			fadeColor({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }, '--text-color', 1);

			//make the first button visible and clickable
			displayTestaWater();

			//swap the text in the header
			document.title = "The Seed Awakens";
			break;
	}
}
function resetPhase(){
	//reset all values stored by changePhase
	timeOfDay = -1;

	//reset the phase itself
	phase = "dormancy";

	//SET THE SCREEN TO THE BEGINNING STATE
	//change the document's title
	document.title = "The Dry Dark Of Dormancy";

	//snap to the original background color and text color
	fadeColor({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }, '--background', 1);
	fadeColor({ r: 250, g: 235, b: 215 }, { r: 250, g: 235, b: 215 }, '--text-color', 1);
}

export { awakening, sufficientWater, amylaseProductionConcludes, enoughGlucoseForRespiration, savePhase, loadPhase, resetPhase, getPhase }