//------------------------------------------------------------------------
// Module:   ButtonsPTW.js
// Author:   Karl Bishop <kfbishop@us.ibm.com>
//------------------------------------------------------------------------
define([
	"dojo/text!./ButtonsPTW.html",
	"dojo/i18n!app/nls/ButtonsPTW.js",
	"app/PolymerTemplatedWidget",

	"dojo/_base/declare",
	"dojo/_base/lang",

	"dijit/form/Button"
], function( template, nls, PolymerTemplatedWidget, declare, lang ) {

	var MODULE = "app/ButtonsPTW";

	return declare([PolymerTemplatedWidget], {

		//-----------------------------------------------------------
		//-- Public variables
		//-----------------------------------------------------------
		templateString : template,
		nls            : nls,

		headerClass    : "blue",
		hideHeader     : true,

		buttons        : null,

		//-----------------------------------------------------------
		//-- Private variables
		//-----------------------------------------------------------
		newButtonCounter : 1,

		//-----------------------------------------------------------
		//-- Public methods
		//-----------------------------------------------------------
		constructor : function() {
			var F = MODULE+":constructor:";
			// console.debug(F,"starting");
		},

		postMixInProperties : function() {
			// Put all instance variable setup here (or constructor)
			//	prior to actual form instantiation to prevent any view updates
			var F = MODULE+":postMixInProperties";
			// console.debug(F,"starting");
			this.buttons = [
			    { label: 'Fee'          , action: "alertButton" },
			    { label: 'Fi'           , action: "alertButton" },
			    { label: 'Fo'           , action: "alertButton" },
			    { label: 'Fum'          , action: "alertButton" }
			];
		},

		daeChangeColor : function() {
			console.log("daeChangeColor: Starting");
			this.headerClass = (this.headerClass == "blue" ? "red" : "blue");
			Platform.performMicrotaskCheckpoint();
		},

		daeToggleH2 : function() {
			console.log("daeToggleH2: Starting");
			this.hideHeader = !this.hideHeader
			Platform.performMicrotaskCheckpoint();
		},

		daeAddButton : function(evt) {
			console.log("AddButton: ", this, evt);
			this.buttons.push( { label: 'New '+this.newButtonCounter++ , action: "alertButton" } );
			Platform.performMicrotaskCheckpoint();
		},

		alertButton : function(evt) {
			console.log("AlertButton: ", this.get('label'), evt);
			alert( "The '" + this.get('label') + "'' button was pressed");
		}

		//-----------------------------------------------------------
		//-- Private methods
		//-----------------------------------------------------------

	});
});
