BetaJS.Views.View.extend("BetaJS.Views.SimpleRichEditorView", {
	
	_templates : {
		"default" : BetaJS.Templates.Cached["simple-rich-editor-view-template"]
	},
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.SimpleRichEditorView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		this.actions.__context = this;
		this.selection.__context = this;
		this.caret.__context = this;
	},
	
	_events: function () {
		return this._inherited(BetaJS.Views.SimpleRichEditorView, "_events").concat([{
			"blur [data-selector='inner']": "__change",
			"keyup [data-selector='inner']": "__change",
			"paste [data-selector='inner']": "__change"
		}]);
	},
	
	__change: function () {
		this.set("content", this.$("[data-selector='inner']").html());
	},
	
	_render: function () {
		this._inherited(BetaJS.Views.SimpleRichEditorView, "_render");
		this._editor = this.$("[data-selector='inner']");
	},
	
	actions: {
		__context: null,
		
		hasParentElement: function (element) {
			var selection = this.__context.selection;
			var caret = this.__context.caret;
			return selection.isSelected() ? selection.hasParentElement(element) : caret.hasParentElement(element);
		},
		
		setParentElement: function (element, value) {
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
		
		isBold: function () {
			return this.hasParentElement("strong");
		},
		
		bold: function (value) {
			this.setParentElement("strong", value);
		},

		isItalic: function () {
			return this.hasParentElement("i");
		},
		
		italic: function (value) {
			this.setParentElement("i", value);
		}
	},
	
	selection: {
		__context: null,
		
		isSelected: function () {
			// TODO
			return true;
		},
		
		hasParentElement: function (element) {
			return BetaJS.Browser.Dom.hasParentElementsTag(element, BetaJS.Browser.Dom.parentElementBySelection(), this.__context._editor.get(0));
		},
		
		addParentElement: function (element) {
			// TODO			
		},
		
		removeParentElement: function (element) {
			// TODO			
		}
	},
	
	caret: {
		__context: null,
		
		hasParentElement: function (element) {
			return BetaJS.Browser.Dom.hasParentElementsTag(element, BetaJS.Browser.Dom.parentElementBySelection(), this.__context._editor);
		},
		
		addParentElement: function (element) {
			// TODO			
		},
		
		removeParentElement: function (element) {
			// TODO			
		}
	}
	
});