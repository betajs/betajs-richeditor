/*
 * - Caret Remove
 * - Selection Add
 * - Selection Remove
 * 
 */


BetaJS.Views.SimpleRichEditorContentView.extend("BetaJS.Views.RichEditorContentView", {
	
	constructor : function(options) {
		this._inherited(BetaJS.Views.RichEditorContentView, "constructor", options);
		this.__caretElementStack = {};
		this.on("select", function () {
			this.__caretClearElementStack();
		}, this);
		this.on("insert", function () {
			this.__caretCharacterAdded();
		}, this);
	},
	
	caretNodeOffset: function () {
		return BetaJS.Browser.Dom.selectionOffset();
	},

	hasParentElement : function(element) {
		return this.isSelected() ? this.selectionHasParentElement(element) : this.caretHasParentElement(element);
	},

	setParentElement : function(element, value) {
		if (this.isSelected())
			this.selectionSetParentElement(element, value);
		else
			this.caretSetParentElement(element, value);
	},

	isSelected : function() {
		return this.hasFocus() && BetaJS.Browser.Dom.selectedHtml() != "";
	},
		
	selectionAncestor: function () {
		return BetaJS.Browser.Dom.selectionAncestor();
	},
	
	selection: function () {
		return BetaJS.Browser.Dom.selectionNodes();
	},
		
	selectionLeaves: function () {
		return BetaJS.Browser.Dom.selectionLeaves();
	},

	selectionHasParentElement : function(element) {
		if (!this.hasFocus())
			return;
		if (this.selectionAncestor().parents(this._selector + " " + element).length > 0)
			return true;
		return BetaJS.Objs.all(this.selectionLeaves(), function (node) {
			return (node.parents(this._selector + " " + element).length > 0) ||
			       (BetaJS.Types.is_defined(node.get(0).tagName) && node.get(0).tagName.toLowerCase() == element.toLowerCase());
		}, this);
	},
	
	selectionSetParentElement: function (element, value) {
		if (!this.hasFocus())
			return;
		var has = this.selectionHasParentElement(element);
		if (BetaJS.Types.is_undefined(value))
			value = !has;
		if (value == has)
			return;
		if (value)
			this.selectionAddParentElement(element);
		else
			this.selectionRemoveParentElement(element);
	},

	selectionAddParentElement : function(element) {
		if (!this.hasFocus())
			return;
		// TODO
	},

	selectionRemoveParentElement : function(element) {
		if (!this.hasFocus())
			return;
		// TODO
	},

	caretNode : function() {
		return BetaJS.Browser.Dom.selectionStartNode();
	},

	caretHasParentElement : function(element) {
		if (BetaJS.Types.is_defined(this.__caretElementStack[element]))
			return this.__caretElementStack[element];
		return this.caretNode().parents(this._selector + " " + element).length > 0;
	},

	caretSetParentElement: function (element, value) {
		var has = this.caretHasParentElement(element);
		if (BetaJS.Types.is_undefined(value))
			value = !has;
		if (value == has)
			return;
		if (value)
			this.caretAddParentElement(element);
		else
			this.caretRemoveParentElement(element);
	},

	caretAddParentElement : function(element) {
		if (this.caretHasParentElement(element))
			return;
		this.__caretElementStack[element] = true;
		this.trigger("element");
	},
	
	__caretCharacterAdded: function () {
		var yesTags = [];
		var noTags = [];
		BetaJS.Objs.iter(this.__caretElementStack, function (value, tag) {
			if (value)
				yesTags.push(tag);
			else
				noTags.push(tag);
		});
		var offset = this.caretNodeOffset();
		var leftNode = this.caretNode();
		var parent = leftNode.parent().get(0); 
		var left = leftNode.get(0);
		var right = left.splitText(offset);
		var current = left.splitText(offset - 1);
		var inner = current;
		var content = current.data;
		for (var i = 0; i < yesTags.length; ++i) {
			var newElement = document.createElement(yesTags[i]);
			newElement.appendChild(current);
			current = newElement;
			parent.insertBefore(current, right);
		}
		BetaJS.Browser.Dom.selectNode(inner, 1);
		// TODO: noTags
	},
	
	__caretClearElementStack: function () {
		this.__caretElementStack = {};
	},

	caretRemoveParentElement : function(element) {
		if (!this.caretHasParentElement(element))
			return;
		this.__caretElementStack[element] = false;
		this.trigger("element");
	}

}); 