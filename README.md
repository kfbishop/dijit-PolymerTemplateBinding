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

### ButtonsPTW.js

In the `ButtonsPTW` example, we have a simple Widget that extends a new custom base class called `PolymerTemplateWidget` (PTW). A trimmed down version of the main module file is shown below:

```JavaScript
//------------------------------------------------------------------------
// Module:   ButtonsPTW.js
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
		templateString   : template,
		nls              : nls,
		headerClass      : "blue",
		hideHeader       : true,
		buttons          : null,
		newButtonCounter : 1,

		postMixInProperties : function() {
			// Put all instance variable setup here (or constructor)
			//	prior to actual form instantiation to prevent any view updates
			this.buttons = [
			    { label: 'Fee'          , action: "alertButton" },
			    { label: 'Fi'           , action: "alertButton" },
			    { label: 'Fo'           , action: "alertButton" },
			    { label: 'Fum'          , action: "alertButton" }
			];
		},

		daeAddButton : function(evt) {
			this.buttons.push( { label: 'New '+this.newButtonCounter++ , action: "alertButton" } );
			Platform.performMicrotaskCheckpoint();
		},

		//-- ...Other action functions follow similr pattern and are not shown...

	});
});
```
This module loads its associated template and NLS values and applies them to templateString and nls instance variables.
Notice how we set our `this.buttons` instance variable in `postMixInProperties`. This is proper place to define complex values prior to rendering.

In the `daeAddButton` function, we simply push a new member to the buttons list.  The `Platform.performMicrotaskCheckpoint()` function must be run to pick up binding updates to the tempalte.  We might be able to put our own observer on local variables and automatically run this in the future.

### ButtonsPTW.html

In the dijit template file shown below, notice how we have a custom `<template bind>` tag immediately under the root node tag. This is the main tempalte used to bind to our dijit class instance.

	<div>
	<template bind>
		<style>
		h1, h2  { margin-bottom: 8px;  }
		.blue   { color: blue;         }
		.red    { color: red;          }
		</style>

		<h1 class="{{ headerClass }}">{{ nls.title }}</h1>

		<button data-dojo-type="dijit/form/Button" type="button"
			data-dojo-attach-event="onClick:daeAddButton">
			{{ nls.addButton }}
		</button>
		&nbsp;	&nbsp;	&nbsp;
		<button data-dojo-type="dijit/form/Button" type="button"
			data-dojo-attach-event="onClick:daeChangeColor">
			{{ nls.changeColor }}
		</button>
		<br/><br/>

		<template repeat="{{ buttons }}">
		    <button data-dojo-type="dijit/form/Button" type="button"
			    data-dojo-props="onClick:this.{{action}}">
			    {{ label }}
			</button>
		</template>

		<br/><br/>
		<button data-dojo-type="dijit/form/Button" type="button"
			data-dojo-attach-event="onClick:daeToggleH2">
			{{ nls.toggleH2 }}
		</button>
		hideHeader = {{ hideHeader }}
		<h2 hidden?="{{ hideHeader }}">Can you see me?</h2>

	</template>
	</div>

Since we are within a template, it is legal to have a local `<style>` tag directly in the tempalte. This does not remove the value of having a master theme based CSS, but can come in handy for local only styling.

We have many `{{ variable }}` text tags throughout the template. These behave as you would expect with live two-way binding between the tempalte and instance variables. There are also several NLS specific values brought in using standard Dojo I18N handling.

- Note: Currently, if you pass in a `value:{{value}}` to a declarative widget, the binding is broken during widget instantiation. I'm working on this and will hopefully have some remedy soon.

In the middle of the dijit template, you'll notice a second `<template repeat={{ buttons }}">` block, that contains a declarative button dijit. Since we created a list of button objects, this template iterates over the list creating several buttons tags, which are later parsed into real dijit buttons.


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
- Sets up an after aspect on `Platform.performMicrotaskCheckpoint();`, that forces a _reparse_ of the dijit template after each bind update. This looks for any potentially new declarative widgets that need instantiation.

Care should be taken to ensure that any dijit instance variables are properly defined prior to rendring.
This would mean that these values must be set at:

- The class level
	- Primitives only or fixed class variables (such as NLS'd maps)
	- Not recommended for mutable arrays and objects
- Passed in a constructor arguments
- Set in `constructor()` (pre-mixin), or in `postMixInProperties()`


Outstanding Issues
------------------

There are quite a few issues that still need to be resoved.

## Binding Dijit values

The top-most issue deals with binding specific values within declarative dijits inside of <tempaltes>.  We can _seed_ values and other variables when instantiating these dijits, but then the binding is lost.  I'm working on a way to define a map of bind keys with dijits. This can be explored in the SliderPTW dijit. In the controller we define a map like shown below:

	this.modelDijitBinding = {
		"data.horizontal1" : {
			dijit       : "dapHorizontal1",
			member      : "value"
		}
	};

In theory we want the "data.horizontal1" bind key to directly map the resulting dapHorizontal1 dijit attach point's value attribute.   In the PolymerTemplateWidget base class, we attmept to use observe-js :: PathObserver objects to watch for changes and react.  At this point, its not working.  I may try to use a templatebinding delegate to achieve similar solution.



