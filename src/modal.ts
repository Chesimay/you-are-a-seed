import {getNonNullElement, newTextEvent, addButtonListener} from "./main";

function openModal() {
	// Get the modal dialog box element
	var modal = getNonNullElement("modal");

	// Show the modal dialog box
	modal.style.display = "block";
}

function closeModal() {
	// Get the modal dialog box element
	var modal = getNonNullElement("modal");

	// Hide the modal dialog box
	modal.style.display = "none";
}

function confirmDecision() {
	// Code to execute when user confirms decision
	alert("Decision confirmed");
    

	// Hide the modal dialog box
	closeModal();
}

function cancelDecision() {
	// Code to execute when user cancels decision
	alert("Decision canceled");

	// Hide the modal dialog box
	closeModal();
}