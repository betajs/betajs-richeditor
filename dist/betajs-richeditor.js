/*!
  betajs-codemirror - v0.0.1 - 2013-11-04
  Copyright (c) Victor Lingenthal
  MIT Software License.
*/
BetaJS.Templates.Cached = BetaJS.Templates.Cached || {};
BetaJS.Templates.Cached['rich-editor-view-template'] = '  <div class="rich-editor-view">    <div class="controlbox">       <div class="button" style="float: left"><div class="buttonicon icon ui-icon-power"></div></div>       <div class="button" style="float: left"><div class="buttonicon icon ui-icon-phone"></div></div>       <div class="button" style="float: left"><div class="buttonicon icon ui-icon-apple"></div></div>   </div>   <div class="editbox">   </div>  </div> ';

BetaJS.Templates.Cached['simple-rich-editor-view-template'] = '  <div class="simple-rich-editor-view" contenteditable="true" data-selector="inner">   {%= content %}  </div> ';

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
					children_classes: "bold",
					hotkey: "ctrl+b",
				},
				events: {
					"click": function () {
						alert("Bold? " + this.domain.ns.editor_view.actions.isBold());
					}
				},
			},
			
			italic_button: {
				type: "ButtonView",
				parent: "toolbar",
				options: {
					label: "I",
					children_classes: "italic",
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