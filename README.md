dijit-PolymerTemplateBinding
=========

Test integration of Dojo templated dijits with Polymer's TemplateBinding.

Dijit template's can now use common Polymer syntax
- Handlebar syntax (eg. `{{ title }}`) bi-directional binding to widget instance variables.
	- First time rendering of classic dijit variables (eg `${title}`) still works but is inferior and not recommended
- Children templates may also use the repeat or conditional constructs based off any instance variables
- `<template>`s may contain declarative Dijit sysntax


Example usage
-------------

In the `FormWidget` example, we have a simple Widget that extends a new custom base class called `PolymerTemplateWidget`.
It loads its associated template and NLS values and applies them to templateString and nls instance variables.

```JavaScript
//------------------------------------------------------------------------
// Module:   FormWidget.js
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
	});
});
```

Implementation
--------------

Note: Currently, Polymer's custom loader must be used to instantiate the templateBinding libraries. Just add the following prior to loading dojo.js

	<!-- Load Polymer-TemplateBinding and deps :: Not AMD compatible -->
	<script src="polymer/TemplateBinding/load.js"></script>

All the custom logic is contained with a new Dojo base class called `PolymerTemplateWidget` (PTW).
The PTW simply extends `dijit/_WidgetBase`, `dijit/_TemplatedMixin`, and `dijit/_WidgetsInTemplateMixin`.

It provides its own `buildRendering()` function that overrides the one provided in `dijit/_AttachMixin`.
The updated buildRendering function:

- Scans the dijit template for any `<template>` nodes
	- For each template found, it is bound to the dijit's instance scope.
	- This immediately processes all {{ xxx }} tokens
- Renders the dijit template
Care should be taken to ensure that any dijit instance variables are properly defined prior to rendring.
This would mean that these values must be set at:

- The class level
	- Primitives only or fixed class variables (such as NLS'd maps)
	- Not recommended for mutable arrays and objects
- Passed in a constructor arguments
- Set in `constructor()` (pre-mixin), or in `postMixInProperties()`




