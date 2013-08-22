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

			this.own(
				aspect.after(this, "postCreate", lang.hitch(this, this._ptwWidgetBinding) )
			);
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
			// summary:
			//		Maps dijit to binding (d2b) and binding to dijit (b2d)
			// description:
			//		In situations where you have decalrative dijits within a
			//		<template>, you can seed values using {{ binding }}, but
			//		the binding is lost once the dijit is created. Use a
			//		custom Model to Dijit Binding map (this.modelDijitBinding)
			//		to define the model key and its desired bound dijit member.
			//		The modelDijitBinding expects a local reference (attachpoint)
			//		for the dijit target, so the mapping should be defined in the
			//		postCreate() function.
			// example:
			//	|	this.modelDijitBinding = {
			//	|		"data.slider1" : { dijit:"dapslider1", member:"value" },
			//	|		"data.slider2" : "dapslider2"
			//	|	};
			//		In the above example, the dijit can be either a string naming
			//		the attachpoint, or a map of dijit:'attacpoint', member:'name'.
			//		Member defaults to 'value' if not defined.
			var F = MODULE + ":_ptwWidgetBinding:";
			var mdb, key, dijit, d2b, b2d;
			console.log(F,"Binding Widgets");

			for( key in this.modelDijitBinding ) {
				console.log(F,"Key:", key);
				mdb = this.modelDijitBinding[key];
				if ( typeof mdb === "string" ) {
					mdb = { dijit:mdb, member:"value" };
				}
				dijit = this[ mdb.dijit ];
				member = mdb.member || "value";

				var d2bHandler = (function(key) {
			        return function(newValue, oldValue) {
						if ( newValue !== oldValue ) {
							console.log(F,"d2b: ", key, newValue, oldValue);
							lang.setObject(key, newValue, this);
							Platform.performMicrotaskCheckpoint();
						}
					}
			    })(key);

		    	var b2dHandler = (function(key, dijit, member) {
		            return function(newValue, oldValue) {
						if ( newValue !== oldValue ) {
							console.log(F,"b2d: ", key, newValue, oldValue);
							dijit.set(member, newValue);
							Platform.performMicrotaskCheckpoint();
						}
					}
		        })(key, dijit, member);

				d2b = new PathObserver(dijit, member, lang.hitch(this, d2bHandler) );
				b2d = new PathObserver(this , key   , lang.hitch(this, b2dHandler) );

				this.own(
					aspect.after( dijit, "onChange", Platform.performMicrotaskCheckpoint)
				);
			}
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
				this.own(
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
					}))
				);
			}
		}

	});
});
