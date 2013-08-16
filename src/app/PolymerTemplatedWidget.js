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
	'dojo/query!css3',		//KB: MDV enhancement
	"dojo/parser",				//KB: MDV enhancement
	"dijit/registry",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_AttachMixin"

], function( array, declare, lang, aspect, domAttr, $, parser, registry, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _AttachMixin ) {

	var MODULE = "app/PolymerTemplatedWidget";

	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		//-----------------------------------------------------------
		//-- Public variables
		//-----------------------------------------------------------

		//-----------------------------------------------------------
		//-- Private variables
		//-----------------------------------------------------------
		_reparserAspectApplied : false,

		//-----------------------------------------------------------
		//-- Public methods
		//-----------------------------------------------------------
		buildRendering: function(){
			this.inherited(arguments);
			this._mdvSetTemplateModels();
			this._attachTemplateNodes(this.domNode);
			this._beforeFillContent();		// hook for _WidgetsInTemplateMixin
			this._mdvReparseHandler();
		},

		//-----------------------------------------------------------
		//-- Private methods
		//-----------------------------------------------------------

		_mdvSetTemplateModels: function(){
			//KB: Stub function for Polymer MDV template support
			// summary:
			//      Set any polymer MDV template models
			if ( Platform && Platform.performMicrotaskCheckpoint ) {
				$("template", this.domNode).forEach( lang.hitch(this, function(t) {
				    console.log("MDV setting model for: ", t);
				    if ( this.modelBinding ) {
				    	t.bindingDelegate = {
				    		getBinding : lang.hitch(this, this.modelBinding)
				    	};
				    }
				    t.model = this;
				}) );
				Platform.performMicrotaskCheckpoint();
			}
		},

		_mdvReparseHandler : function() {
			//KB: MDV enhancement
			if ( Platform && Platform.performMicrotaskCheckpoint && !this._reparserAspectApplied ) {
				this._reparserAspectApplied = true;
				// reparse for any new dijit types
				var checkForUnparsedDijits = function(node) {
				  console.log("MDV REPARSE: checking node: ", node);
				  $("> *[data-dojo-type]", node).forEach(function(n) {
				  	if ( !domAttr.has(n, "widgetid") ) {
				    	console.log("MDV REPARSE: dijit node has NOT been parsed: ", n);
					    parser.instantiate([n]);
				    } else {
					    console.log("REPARSE: dijit node has been parsed: ", n);
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
				    	console.log("MDV REPARSE: dijit nodes to be parsed: ", toBeInstatiated);
					    parser._instantiate(toBeInstatiated, {}, options, false);
					});
				}));
			}
		}

	});
});
