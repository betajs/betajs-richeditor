BetaJS.Browser.Dom = {
	
	traverseNext: function (node, skip_children) {
		if ("get" in node)
			node = node.get(0);
		if (node.firstChild && !skip_children)
			return BetaJS.$(node.firstChild);
		if (!node.parentNode)
			return null;
		if (node.nextSibling)
			return BetaJS.$(node.nextSibling);
		return this.traverseNext(node.parentNode, true);
	},
	
	selectionStartNode : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},
	
	selectedHtml : function() {
		if (window.getSelection)
			return window.getSelection().toString();
		else if (document.selection)
			return document.selection.createRange().htmlText;
	},
	
	selectionAncestor : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).commonAncestorContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().parentElement());
		return null;
	},
	
	selectionStart : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},

	selectionEnd : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).endContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().endContainer);
		return null;
	},

	selectionNodes: function () {
		var result = [];
		var start = this.selectionStart();
		var end = this.selectionEnd();
		result.push(start);
		var current = start;
		while (current.get(0) != end.get(0)) {
			current = this.traverseNext(current);
			result.push(current);
		}
		return result;
	}
	
};

BetaJS.Views.View.extend("BetaJS.Views.SimpleRichEditorView", {

	_templates : {
		"default" : BetaJS.Templates.Cached["simple-rich-editor-view-template"]
	},

	constructor : function(options) {
		this._inherited(BetaJS.Views.SimpleRichEditorView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		this._selector = "[data-view-id='" + this.cid() + "']";
		this.actions.__context = this;
		this.selection.__context = this;
		this.caret.__context = this;
	},

	_events : function() {
		return this._inherited(BetaJS.Views.SimpleRichEditorView, "_events").concat([{
			"blur [data-selector='inner']" : "__change",
			"keyup [data-selector='inner']" : "__change",
			"paste [data-selector='inner']" : "__change"
		}]);
	},

	__change : function() {
		this.set("content", this.$("[data-selector='inner']").html());
	},

	_render : function() {
		this._inherited(BetaJS.Views.SimpleRichEditorView, "_render");
		this._editor = this.$("[data-selector='inner']");
	},

	actions : {
		__context : null,

		hasParentElement : function(element) {
			var access = this.__context.selection.isSelected() ? this.__context.selection : this.__context.caret;
			return this.__context.selection.isSelected() ? access.hasParentElement(element) : access.hasParentElement(element);
		},

		setParentElement : function(element, value) {
			var has = this.hasParentElement(element);
			if (BetaJS.Types.is_undefined(value))
				value = !has;
			if (value == has)
				return;
			var access = this.__context.selection.isSelected() ? this.__context.selection : this.__context.caret;
			if (has)
				access.removeParentElement(element);
			else
				access.addParentElement(element);
		},

		isBold : function() {
			return this.hasParentElement("strong");
		},

		bold : function(value) {
			this.setParentElement("strong", value);
		},

		isItalic : function() {
			return this.hasParentElement("i");
		},

		italic : function(value) {
			this.setParentElement("i", value);
		}
	},

	selection : {
		__context : null,

		isSelected : function() {
			return BetaJS.Browser.Dom.selectedHtml() != "";
		},
		
		ancestor: function () {
			return BetaJS.Browser.Dom.selectionAncestor();
		},
		
		selection: function () {
			return BetaJS.Browser.Dom.selectionNodes();
		},
		
		selectionLeaves: function () {
			var sel = this.selection();
			return BetaJS.Objs.filter(this.selection(), function (node) {
				return node.children().length == 0;
			});
		},

		hasParentElement : function(element) {
			if (this.ancestor().parents(this.__context._selector + " " + element).length > 0)
				return true;
			return BetaJS.Objs.all(this.selectionLeaves(), function (node) {
				return (node.parents(this.__context._selector + " " + element).length > 0) ||
				       (BetaJS.Types.is_defined(node.get(0).tagName) && node.get(0).tagName.toLowerCase() == element.toLowerCase());
			}, this);
		},

		addParentElement : function(element) {
			// TODO
		},

		removeParentElement : function(element) {
			// TODO
		}
	},

	caret : {
		__context : null,

		node : function() {
			return BetaJS.Browser.Dom.selectionStartNode();
		},

		hasParentElement : function(element) {
			return this.node().parents(this.__context._selector + " " + element).length > 0;
		},

		addParentElement : function(element) {
			// TODO
		},

		removeParentElement : function(element) {
			// TODO
		}
	}

}); 