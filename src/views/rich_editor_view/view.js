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
					label: "B",
					children_classes: "bold"
				},
				events: {
					"click": function () {
						alert("Bold");
					}
				},
			},
			
			italic_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					label: "I",
					children_classes: "italic"
				},
				events: {
					"click": function () {
						alert("Italic");
					}
				},
			},
			
			underline_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					label: "U",
					children_classes: "underline"
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
					label: "L",
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
					label: "C",
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
					label: "R",
				},
				events: {
					"click": function () {
						alert("text-align: right");
					}
				},
			},
			
			Justify_align_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					label: "J",
				},
				events: {
					"click": function () {
						alert("text-align: justify");
					}
				},
			},
			
			editor_view: {
				type: "BetaJS.Views.SimpleRichEditorView",
				el: ".editbox",
				options:{
					children_classes: "textareadiv",
					content: this.binding("content")
				}
			}

		};
	}
	
});