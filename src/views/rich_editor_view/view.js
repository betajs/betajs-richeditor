BetaJS.Views.ListContainerView.extend("BetaJS.Views.RichEditorView", {

	constructor : function(options) {
		options = options || {};
		options.el = "body";
		options.el_classes = "rich-editor-view";
		options.alignment = "vertical";
		this._inherited(BetaJS.Views.RichEditorView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		this.ns.editor_view.on("element", function () {			
			this.trigger("element-slow");
		}, this, { min_delay: 50, max_delay: 200 });
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
					children_classes: "bold",
					hotkey: "ctrl+b"
				},
				events: {
					"click": function () {
						this.domain.ns.editor_view.focus();
						this.domain.ns.editor_view.setParentElement("strong");
					}
				},
				listeners: {
					"element-slow": function () {
						this.set("selected", this.domain.ns.editor_view.hasParentElement("strong"));
					}
				}
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
						this.domain.ns.editor_view.focus();
						this.domain.ns.editor_view.setParentElement("i");
					}
				},
				listeners: {
					"element-slow": function () {
						this.set("selected", this.domain.ns.editor_view.hasParentElement("i"));
					}
				}
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
							
			bulletpoint_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-list-ul",
				},
				events: {
					"click": function () {
						alert("Bulletpoint");
					}
				},
			},
						
			numberedlist_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					children_classes: "icon-list-ol",
				},
				events: {
					"click": function () {
						alert("Numberedlist");
					}
				},
			},
						
			seperator3: {
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
				type: "BetaJS.Views.RichEditorContentView",
				el: ".editbox",
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