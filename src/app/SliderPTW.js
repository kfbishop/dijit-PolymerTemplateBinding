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
			title       : "SliderPTW - Polymer Template Widget with Input Bindings",
			values      : "Data Values",
			autoUpdates : "Toggle auto-updates to slider1 values"
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
				slider1 : 50,
				slider2 : 5
			};
		},

		//-----------------------------------------------------------
		postCreate : function() {
			var F = MODULE+":postCreate";
			// console.debug(F,"starting");

			this.modelDijitBinding = {
				"data.slider1" : { dijit:"dapslider1", member:"value" },
				"data.slider2" : "dapslider2"
			};
		},

		//-----------------------------------------------------------
		startAutoUpdates : function() {
			var F = MODULE+":startAutoUpdates";
			console.debug(F,"starting");

			//-- Set it up so that we alternate updating the model and dijit
			//-- values every offset seconds
			var offset = 10 * 1000;

			//-- Update model value every offset seconds
			this.i1 = setInterval( lang.hitch(this, function() {
				var n = Math.round( Math.random()*100 );
				console.log("Setting MODEL value to: ", n);
				this.data.slider1 = n;
				Platform.performMicrotaskCheckpoint();
			}), offset);

			//-- Update dijit value every 20 seconds (offset by offset/2)
			setTimeout( lang.hitch(this, function() {
				this.i2 = setInterval( lang.hitch(this, function() {
					var n = Math.round( Math.random()*100 );
					console.log("Setting DIJIT value to: ", n);
					this.dapslider1.set("value", n);
					Platform.performMicrotaskCheckpoint();
				}), offset);
			}), offset/2);
		},

		//-----------------------------------------------------------
		stopAutoUpdates : function() {
			var F = MODULE+":stopAutoUpdates";
			console.debug(F,"starting");

			if (this.i1) { clearInterval(this.i1); }
			if (this.i2) { clearInterval(this.i2); }
			this.i1 = this.i2 = null;
		},

		//-----------------------------------------------------------
		daeToggleAutoUpdates : function() {
			var F = MODULE+":daeToggleAutoUpdates";
			console.debug(F,"starting");

			if (this.i1) {
				this.stopAutoUpdates();
			} else {
				this.startAutoUpdates();
			}
		},


		//-----------------------------------------------------------
		//-- Private methods
		//-----------------------------------------------------------

	});
});
