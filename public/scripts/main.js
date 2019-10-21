/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author 
 */

/** namespace. */
var rh = rh || {};

/** globals */
rh.variableName = "";

/** function and class syntax examples */
rh.enableEmailPassword = function () {
	const username = new mdc.textField.MDCTextField(document.querySelector('.email'));
	const password = new mdc.textField.MDCTextField(document.querySelector('.password'));
	new mdc.ripple.MDCRipple(document.querySelector('#createAccount'));
	new mdc.ripple.MDCRipple(document.querySelector('#login'));
};

/* Main */
$(document).ready(() => {
	console.log("Ready");
	if ($("#index-page").length) {
		rh.enableEmailPassword();

		$("#login").click(function () {
			window.location.href = "/mainPage.html";
		});
	}else if($("#main-page").length){

	}
});