BetaJS.Views.View.extend("BetaJS.Views.RichEditorView", {
	
	_templates : {
		"default" : BetaJS.Templates.Cached["rich-editor-view-template"]
	},
	
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.RichEditorView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		this.editor_view = this.addChild(new BetaJS.Views.SimpleRichEditorView({
			el: ".editbox",
			children_classes: "textareadiv",
			content: this.binding("content")
		}));
	}
	
});