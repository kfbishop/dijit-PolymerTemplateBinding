//------------------------------------------------------------------------
// Module:   SliderPTW.js
// Author:   Karl Bishop <kfbishop@us.ibm.com>
//------------------------------------------------------------------------
define([
	"dojo/text!./SliderPTW.html",
	"app/PolymerTemplatedWidget",

	"dojo/_base/declare",
	"dojo/_base/lang",

	"dijit/form/Button",
	"dijit/form/HorizontalSlider",
	"dijit/form/HorizontalRule",
	"dijit/form/HorizontalRuleLabels",
], function( template, PolymerTemplatedWidget, declare, lang ) {

	var MODULE = "app/SliderPTW";

	return declare([PolymerTemplatedWidget], {

		//-----------------------------------------------------------
		//-- Public variables
		//-----------------------------------------------------------
		templateString : template,

		nls            : {
			title    : "SliderPTW - Polymer Template Widget with Input Bindings",
			values   : "Data Values"
		},

		data           : null,

		//-----------------------------------------------------------
		//-- Public methods
		//-----------------------------------------------------------
		postMixInProperties : function() {
			// Put all instance variable setup here (or constructor)
			//	prior to actual form instantiation to prevent any view updates
			var F = MODULE+":postMixInProperties";
			console.debug(F,"starting");

			this.data = {
				horizontal1 : 10
			};
		},

		//-----------------------------------------------------------
		postCreate : function() {
			var F = MODULE+":postCreate";
			// console.debug(F,"starting");

			this.modelDijitBinding = {
				"data.horizontal1" : {
					dijit       : "dapHorizontal1",
					member      : "value"
				}
			};
		},


		//-----------------------------------------------------------
		//-- Private methods
		//-----------------------------------------------------------

	});
});
