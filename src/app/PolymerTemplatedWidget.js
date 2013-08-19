//------------------------------------------------------------------------
//------------------------------------------------------------------------
// Module:   PolymerTemplatedWidget.js
// Author:   Karl Bishop <kfbishop@us.ibm.com>
//------------------------------------------------------------------------
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom-attr",
	'dojo/query!css3',
	"dojo/parser",
	"dijit/registry",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin"

], function( array, declare, lang, aspect, domAttr, $, parser, registry, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ) {

	var MODULE = "app/PolymerTemplatedWidget";

	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		//-----------------------------------------------------------
		//-- Public variables
		//-----------------------------------------------------------
		modelDijitBinding : null,

		//-----------------------------------------------------------
		//-- Private variables
		//-----------------------------------------------------------
		_reparserAspectApplied : false,

		//-----------------------------------------------------------
		//-- Public methods
		//-----------------------------------------------------------

		//-----------------------------------------------------------
		constructor: function() {
			this.modelDijitBinding = {};

			aspect.before(this, "postCreate", lang.hitch(this, this._ptwWidgetBinding) );
		},

		//-----------------------------------------------------------
		buildRendering: function(){
			this.inherited(arguments);
			this._ptwSetTemplateModels();
			this._attachTemplateNodes(this.domNode);
			this._beforeFillContent();		// hook for _WidgetsInTemplateMixin
			this._ptwReparseHandler();
		},

		//-----------------------------------------------------------
		//-- Private methods
		//-----------------------------------------------------------

		//-----------------------------------------------------------
		_ptwSetTemplateModels: function() {
			//KB: Stub function for Polymer PTW template support
			// summary:
			//      Set any polymer PTW template models
			if ( Platform && Platform.performMicrotaskCheckpoint ) {
				$("template", this.domNode).forEach( lang.hitch(this, function(t) {
				    console.log("PTW setting model for: ", t);
			    	// t.bindingDelegate = {
			    	// 	getBinding : lang.hitch(this, this.ptwModelBinding)
			    	// };
				    t.model = this;
				}) );
				Platform.performMicrotaskCheckpoint();
			}
		},

		//-----------------------------------------------------------
		_ptwWidgetBinding : function() {
			//-- Fires pre-parsing!
			var F = MODULE + ":_ptwWidgetBinding:";
			console.log(F,"Binding Widgets");
			for( var key in this.modelDijitBinding ) {
				console.log(F,"Key:", key);
				var mdb = this.modelDijitBinding[key];
				var dijit = this[ mdb.dijit ];
				//-- Setup dijit to model binding
				var d2b = new PathObserver(dijit, mdb.member, function(newValue, oldValue) {
					console.log(F,"d2b: fired", newValue, oldValue);
					if ( newValue !== oldValue ) {
						console.log(F,"d2b: ", dijit, mdb.member, newValue, oldValue);
						key = newValue;
						Platform.performMicrotaskCheckpoint();
					}
				});
				var b2d = new PathObserver(this, key, function(newValue, oldValue) {
					console.log(F,"b2d: fired", oldValue, newValue);
					if ( newValue !== oldValue ) {
						console.log(F,"b2d: ", this, key, newValue, oldValue);
						dijit.set(mdb.member, newValue);
						Platform.performMicrotaskCheckpoint();
					}
				});
			}
		},

		//-----------------------------------------------------------
		_ptwModelBinding : function(model, path, name, node) {
			//-- Fires pre-parsing!
			var F = MODULE + ":_ptwModelBinding:";
			console.log(F,"Starting", arguments);
			if ( path && path in this.modelDijitBinding ) {
				console.log(F,"CUSTOM BINDING:  ", arguments);
				var d = this.modelDijitBinding[ path ];
				var binding = new CompoundBinding(function(values) {
					console.log(F,"CUSTOM BINDING 2: ", values);
		  	      return d.get("value");
			      });
			      binding.bind(path, model, path);
						return binding;
					}

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
			return;
		},

		//-----------------------------------------------------------
		_ptwReparseHandler : function() {
			//KB: PTW enhancement
			var F = MODULE + ":_ptwReparseHandler:";
			if ( Platform && Platform.performMicrotaskCheckpoint && !this._reparserAspectApplied ) {
				this._reparserAspectApplied = true;
				// reparse for any new dijit types
				var checkForUnparsedDijits = function(node) {
				  console.log(F,"REPARSE: checking node: ", node);
				  $("> *[data-dojo-type]", node).forEach(function(n) {
				  	if ( !domAttr.has(n, "widgetid") ) {
				    	console.log(F,"REPARSE: dijit node has NOT been parsed: ", n);
					    parser.instantiate([n]);
				    } else {
					    console.log(F,"REPARSE: dijit node has been parsed: ", n);
					    if (n.childNodes.length) {
						    checkForUnparsedDijits(n);
						}
				    }
				  });
				};
				aspect.after( Platform, "performMicrotaskCheckpoint", lang.hitch(this, function() {
					//checkForUnparsedDijits(this.domNode);
					var options = {propsThis:this};
					parser.scan(this.domNode, options).then(function(nodes) {
						var toBeInstatiated = array.filter(nodes, function(n) {
							return !domAttr.has(n, "widgetid");
						});
						if (toBeInstatiated.length) {
					    	console.log(F, "REPARSE: dijit nodes to be parsed: ", toBeInstatiated);
						    parser._instantiate(toBeInstatiated, {}, options, false);
						}
					});
				}));
			}
		}

	});
});
