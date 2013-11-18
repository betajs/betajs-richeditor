BetaJS.Views.View.extend("BetaJS.Views.SimpleRichEditorContentView", {

	_templates : {
		"default" : BetaJS.Templates.Cached["simple-rich-editor-content-view-template"]
	},

	constructor : function(options) {
		this._inherited(BetaJS.Views.SimpleRichEditorContentView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		this._selector = "[data-view-id='" + this.cid() + "']";
		this.__wasKeyInput = false;
		this.__enableContentChange = false;
		this.on("select", function () { this.trigger("element"); }, this);
		this.on("change:content", function (value) {
			if (this._editor && this.__enableContentChange)
				this._editor.html(value);
		}, this);
		this.set("text", this.computed(function () {
			return BetaJS.Strings.strip_html(this.get("content") || "");
		}, ["content"]));
	},
	
	_global_events: [{
		"selectionchange": "__select",
	}],
			
	_events : [{
		"blur [data-selector='inner']" : "__leave",
		"focus [data-selector='inner']": "__enter",
		"input [data-selector='inner']": "__change",
		"keypress [data-selector='inner']": "__keypress",
	}],
	
	__select: function () {
		if (this.hasFocus())
			this.trigger("select");
	},
	
	__leave: function () {
		this.trigger("leave");
	},

	__enter: function () {
		this.trigger("enter");
	},
	
	__change: function () {
		this.__enableContentChange = false;
		this.set("content", this._editor.html());
		this.__enableContentChange = true;
		if (this.__wasKeyInput) {
			this.__wasKeyInput = false;
			this.trigger("keyinput");
		}
	},

	__keypress: function (e) {
		this.__wasKeyInput = false;
		if (e.which !== 0)
			this.__wasKeyInput = true;			
	},
	
	_render : function() {
		this._inherited(BetaJS.Views.SimpleRichEditorContentView, "_render");
		this._editor = this.$("[data-selector='inner']");
	},
	
	hasFocus: function () {
		return (document.activeElement == this._editor.get(0)) ||
		       (BetaJS.$(document.activeElement).parents(this._selector).length > 0);
	},
	
	focus: function () {
		this._editor.focus();
	}
	
});
