BetaJS.Views.View.extend("BetaJS.Views.SimpleRichEditorContentView", {

	_templates : {
		"default" : BetaJS.Templates.Cached["simple-rich-editor-content-view-template"]
	},

	constructor : function(options) {
		this._inherited(BetaJS.Views.SimpleRichEditorContentView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		this._selector = "[data-view-id='" + this.cid() + "']";
		this.__wasKeyPress = false;
	},
	
	_events : [{
		"blur [data-selector='inner']" : "__change",
		"keyup [data-selector='inner']" : "__change",
		"paste [data-selector='inner']" : "__change",
		"keypress [data-selector='inner']" : "__key_press",
		"keyup [data-selector='inner']" : "__key_up",
		"click  [data-selector='inner']" : "__click",
	}],
	
	__key_press: function (e) {
		this.__wasKeyPress = true;
		if (e.which !== 0)
			this.trigger("insert");
		this.trigger("select");
		this.trigger("element");
	},
	
	__key_up: function () {
		if (!this.__wasKeyPress) {
			this.trigger("insert");
			this.trigger("select");
			this.trigger("element");			
		}
		this.__wasKeyPress = false;
	},
	
	__click: function () {
		this.trigger("select");
		this.trigger("element");
	},
	
	__change : function() {
		this.set("content", this._editor.html());
	},
	
	_render : function() {
		this._inherited(BetaJS.Views.SimpleRichEditorContentView, "_render");
		this._editor = this.$("[data-selector='inner']");
	},
	
	hasFocus: function () {
		return (document.activeElement == this._editor.get(0)) ||
		       (BetaJS.$(document.activeElement).parents(this._selector).length > 0);
	}
	
});
