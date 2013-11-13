BetaJS.Views.SimpleRichEditorContentView.extend("BetaJS.Views.RichEditorContentView", {
	
	constructor : function(options) {
		this._inherited(BetaJS.Views.RichEditorContentView, "constructor", options);
		this.__caretElementStack = {};
		this.on("select", function () {
			this.__caretClearElementStack();
		}, this);
		this.on("keyinput", function () {
			this.__caretCharacterAdded();
		}, this);
	},
	
	caretNodeOffset: function () {
		return BetaJS.Browser.Dom.selectionEndOffset();
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
		return BetaJS.Browser.Dom.selectionContained(this._editor) && BetaJS.Browser.Dom.selectionNonEmpty();
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
		if (!this.isSelected())
			return;
		if (this.selectionAncestor().parents(this._selector + " " + element).length > 0)
			return true;
		return BetaJS.Objs.all(this.selectionLeaves(), function (node) {
			return BetaJS.Browser.Dom.elementHasAncestorTag(node, element, this._selector);
		}, this);
	},
	
	selectionSetParentElement: function (element, value) {
		if (!this.isSelected())
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

	selectionAddParentElement : function (element) {
		if (!this.isSelected())
			return;
		BetaJS.Browser.Dom.selectionSplitOffsets();
		var nodes = BetaJS.Browser.Dom.selectionNodes();
		for (var i = 0; i < nodes.length; ++i)
			if (!BetaJS.Browser.Dom.elementHasAncestorTag(nodes[i], element, this._selector))
				nodes[i] = nodes[i].wrap("<" + element + "></" + element + ">");
		BetaJS.Browser.Dom.selectRange(nodes[0], nodes[nodes.length - 1]);
	},

	selectionRemoveParentElement : function(element) {
		if (!this.isSelected())
			return;
		BetaJS.Browser.Dom.selectionSplitOffsets();
		var nodes = BetaJS.Browser.Dom.selectionNodes();
		for (var i = 0; i < nodes.length; ++i)
			BetaJS.Browser.Dom.remove_tag_from_parent_path(nodes[i], element, this._selector);
		BetaJS.Browser.Dom.selectRange(nodes[0], nodes[nodes.length - 1]);
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
		BetaJS.Objs.iter(this.__caretElementStack, function (value, tag) { (value ? yesTags : noTags).push(tag); });
		var node = BetaJS.Browser.Dom.splitNode(this.caretNode(), this.caretNodeOffset() - 1, this.caretNodeOffset());
		for (var i = 0; i < noTags.length; ++i)
			BetaJS.Browser.Dom.remove_tag_from_parent_path(node, noTags[i], this._selector);
		for (var i = 0; i < yesTags.length; ++i)
			node = node.wrap("<" + yesTags[i] + "></" + yesTags[i] + ">");			
		BetaJS.Browser.Dom.selectNode(node, 1);
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