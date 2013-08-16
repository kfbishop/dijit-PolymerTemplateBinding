//------------------------------------------------------------------------
// Module:   FormWidget.js
// Author:   Karl Bishop <kfbishop@us.ibm.com>
//------------------------------------------------------------------------
define([
	"dojo/text!./FormWidget.html",
	"dojo/i18n!app/nls/FormWidget.js",
	"app/PolymerTemplatedWidget",

	"dojo/_base/declare",
	"dojo/_base/lang",

	"dijit/form/Button",
	"dijit/form/HorizontalSlider",
	"dijit/form/HorizontalRule",
	"dijit/form/HorizontalRuleLabels",
], function( template, nls, PolymerTemplatedWidget, declare, lang ) {

	var MODULE = "app/FormWidget";

	return declare([PolymerTemplatedWidget], {

		//-----------------------------------------------------------
		//-- Public variables
		//-----------------------------------------------------------
		templateString : template,
		nls            : nls,

		headerColor    : "blue",

		data           : null,
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
			this.data = {
				horizontal1 : 10
			};
			this.buttons = [
			    { label: 'Fee'          , action: "alertButton" },
			    { label: 'Fi'           , action: "alertButton" },
			    { label: 'Fo'           , action: "alertButton" },
			    { label: 'Fum'          , action: "alertButton" }
			];
		},

		postCreate : function() {
			var F = MODULE+":postCreate";
			// console.debug(F,"starting");

			//KB: We really need to abstract this logic to have bi-directional binding of a
			//	dijit's value and a bound instance variable.
			this.dapHorizontal1.onChange = lang.hitch(this, function(val) {
				this.data.horizontal1 = Math.round(val);  // Force int in this case.
				Platform.performMicrotaskCheckpoint();
			});
		},

		// modelDijitBinding : {
		// 	"data.horizontal1" : this.dapHorizontal1
		// },

		// modelBinding : function(model, path, name, node) {
		// 	//-- Fires pre-parsing!
		// 	if ( path && path in this.modelDijitBinding ) {
		// 		console.log("CUSTOM BINDING:  ", arguments);
		// 		var d = this.modelDijitBinding[ path ];
		// 		var binding = new CompoundBinding(function(values) {
		// 			console.log("CUSTOM BINDING 2: ", values);
  // 	      return d.get("value");
	 //      });
	 //      binding.bind(path, model, path);
		// 		return binding;
		// 	}

		// 	// if ( node.nodeType && node.nodeType !== 3 ) {
		// 	// 	var dijit = registry.byNode(node);
		// 	// 	if (dijit) {
		// 	// 		var p = path.match(/value/i);
		// 	// 		var binding = new CompoundBinding(function(values) {
		// 	// 			console.log("CUSTOM BINDING 2: ", values);
		//  //        return this.dapHorizontal1.get("value");
		//  //      });
		//  //      binding.bind('data.horizontal1', model, path);
		// 	//     return binding;
		// 	//   }
		// 	// }
		// 	return;
		// }

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
