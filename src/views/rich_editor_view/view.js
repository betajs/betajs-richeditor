BetaJS.Views.ListContainerView.extend("BetaJS.Pages.RichEditorView", {
	
	_templates : {
		"default" : BetaJS.Templates.Cached["rich-editor-view-template"]
	},
	
	constructor : function(options) {
		options = options || {};
		options.el = "body";
		options.alignment = "vertical";
		this._inherited(BetaJS.Views.RichEditorView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		// this.editor_view = this.addChild(new BetaJS.Views.SimpleRichEditorView({
			// el: ".editbox",
			// children_classes: "textareadiv",
			// content: this.binding("content")
		// }));
	},
	
	_domain: function () {
		return {
			page_head_view: {
				type: "ListContainerView",
				options: {
					el_classes: "controlbox"
				}
			},
	
			logo_view: {
				type: "BetaJS.Views.ButtonView",
				parent: "page_head_view",
				options: {
					label: "Hello",
					children_classes: "text-container logo-container"
				},
				events: {
					"click": function () {
						//this.domain.ns.logo_dropdown_view.toggle();
					}
				},
			},

		};
	}
	
});