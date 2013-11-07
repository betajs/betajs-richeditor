BetaJS.Views.ListContainerView.extend("BetaJS.Views.RichEditorView", {

	constructor : function(options) {
		options = options || {};
		options.el = "body";
		options.el_classes = "rich-editor-view";
		options.alignment = "vertical";
		this._inherited(BetaJS.Views.RichEditorView, "constructor", options);
		this._setOptionProperty(options, "content", "");
	},
	
	_domain: function () {
		return {
			toolbar: {
				type: "ListContainerView",
				options: {
					el_classes: "toolbar"
				}
			},
			
			font_style_dropdown: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					label: "Font",
				},
				events: {
					"click": function () {
						alert("Dropdown change font-style");
					}
				},
			},
			
			font_size_dropdown: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					label: "16",
				},
				events: {
					"click": function () {
						alert("Dropdown change font-size");
					}
				},
			},
			
			seperator1: {
				type: "BetaJS.Views.View",
				parent: "toolbar",
				options: {
					el_classes: "seperator"
				}
			},

			
			bold_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-bold",
					hotkey: "ctrl+b",
				},
				events: {
					"click": function () {
						alert("Bold? " + this.domain.ns.editor_view.actions.isBold());
						this.domain.ns.editor_view.actions.isBold();
					}
				},
			},
			
			italic_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-italic",
					hotkey: "ctrl+i"
				},
				events: {
					"click": function () {
						alert("Italic? " + this.domain.ns.editor_view.actions.isItalic());
					}
				},
			},
			
			underline_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-underline",
				},
				events: {
					"click": function () {
						alert("Underline");
					}
				},
			},
			
			seperator2: {
				type: "BetaJS.Views.View",
				parent: "toolbar",
				options: {
					el_classes: "seperator"
				}
			},
				
			left_align_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-align-left",
				},
				events: {
					"click": function () {
						alert("text-align: left");
					}
				},
			},
			
			center_align_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-align-center",
				},
				events: {
					"click": function () {
						alert("text-align: center");
					}
				},
			},
			
			right_align_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-align-right",
				},
				events: {
					"click": function () {
						alert("text-align: right");
					}
				},
			},
			
			justify_align_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-align-justify",
				},
				events: {
					"click": function () {
						alert("text-align: justify");
					}
				},
			},
			
			editor_view: {
				type: "BetaJS.Views.SimpleRichEditorView",
				options: function (page) {
					return {
						children_classes: "textareadiv",
						content: page.binding("content")
					};
				}
			}

		};
	}
	
});