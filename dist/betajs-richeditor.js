/*!
  betajs-codemirror - v0.0.1 - 2013-11-12
  Copyright (c) Victor Lingenthal
  MIT Software License.
*/
BetaJS.Templates.Cached = BetaJS.Templates.Cached || {};
BetaJS.Templates.Cached['rich-editor-view-template'] = '  <div class="rich-editor-view">    <div class="controlbox">       <div class="button" style="float: left"><div class="buttonicon icon ui-icon-power"></div></div>       <div class="button" style="float: left"><div class="buttonicon icon ui-icon-phone"></div></div>       <div class="button" style="float: left"><div class="buttonicon icon ui-icon-apple"></div></div>   </div>   <div class="editbox">   </div>  </div> ';

BetaJS.Templates.Cached['simple-rich-editor-content-view-template'] = '  <div class="simple-rich-editor-content-view" contenteditable="true" data-selector="inner" data-view-id="{%= supp.view_id %}">   {%= content %}  </div> ';

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

/*
 * - Caret Remove
 * - Selection Add
 * - Selection Remove
 * 
 */


BetaJS.Views.SimpleRichEditorContentView.extend("BetaJS.Views.RichEditorContentView", {
	
	constructor : function(options) {
		this._inherited(BetaJS.Views.RichEditorContentView, "constructor", options);
		this.__caretElementStack = {};
		this.on("select", function () {
			this.__caretClearElementStack();
		}, this);
		this.on("insert", function () {
			this.__caretCharacterAdded();
		}, this);
	},
	
	caretNodeOffset: function () {
		return BetaJS.Browser.Dom.selectionOffset();
	},

	hasParentElement : function(element) {
		return this.isSelected() ? this.selectionHasParentElement(element) : this.caretHasParentElement(element);
	},

	setParentElement : function(element, value) {
		if (this.isSelected())
			this.selectionSetParentElement(element, value);
		else
			this.caretSetParentElement(element, value);
	},

	isSelected : function() {
		return this.hasFocus() && BetaJS.Browser.Dom.selectedHtml() != "";
	},
		
	selectionAncestor: function () {
		return BetaJS.Browser.Dom.selectionAncestor();
	},
	
	selection: function () {
		return BetaJS.Browser.Dom.selectionNodes();
	},
		
	selectionLeaves: function () {
		return BetaJS.Browser.Dom.selectionLeaves();
	},

	selectionHasParentElement : function(element) {
		if (!this.hasFocus())
			return;
		if (this.selectionAncestor().parents(this._selector + " " + element).length > 0)
			return true;
		return BetaJS.Objs.all(this.selectionLeaves(), function (node) {
			return (node.parents(this._selector + " " + element).length > 0) ||
			       (BetaJS.Types.is_defined(node.get(0).tagName) && node.get(0).tagName.toLowerCase() == element.toLowerCase());
		}, this);
	},
	
	selectionSetParentElement: function (element, value) {
		if (!this.hasFocus())
			return;
		var has = this.selectionHasParentElement(element);
		if (BetaJS.Types.is_undefined(value))
			value = !has;
		if (value == has)
			return;
		if (value)
			this.selectionAddParentElement(element);
		else
			this.selectionRemoveParentElement(element);
	},

	selectionAddParentElement : function(element) {
		if (!this.hasFocus())
			return;
		// TODO
	},

	selectionRemoveParentElement : function(element) {
		if (!this.hasFocus())
			return;
		// TODO
	},

	caretNode : function() {
		return BetaJS.Browser.Dom.selectionStartNode();
	},

	caretHasParentElement : function(element) {
		if (BetaJS.Types.is_defined(this.__caretElementStack[element]))
			return this.__caretElementStack[element];
		return this.caretNode().parents(this._selector + " " + element).length > 0;
	},

	caretSetParentElement: function (element, value) {
		var has = this.caretHasParentElement(element);
		if (BetaJS.Types.is_undefined(value))
			value = !has;
		if (value == has)
			return;
		if (value)
			this.caretAddParentElement(element);
		else
			this.caretRemoveParentElement(element);
	},

	caretAddParentElement : function(element) {
		if (this.caretHasParentElement(element))
			return;
		this.__caretElementStack[element] = true;
		this.trigger("element");
	},
	
	__caretCharacterAdded: function () {
		var yesTags = [];
		var noTags = [];
		BetaJS.Objs.iter(this.__caretElementStack, function (value, tag) {
			if (value)
				yesTags.push(tag);
			else
				noTags.push(tag);
		});
		var offset = this.caretNodeOffset();
		var leftNode = this.caretNode();
		var parent = leftNode.parent().get(0); 
		var left = leftNode.get(0);
		var right = left.splitText(offset);
		var current = left.splitText(offset - 1);
		var inner = current;
		var content = current.data;
		for (var i = 0; i < yesTags.length; ++i) {
			var newElement = document.createElement(yesTags[i]);
			newElement.appendChild(current);
			current = newElement;
			parent.insertBefore(current, right);
		}
		BetaJS.Browser.Dom.selectNode(inner, 1);
		// TODO: noTags
	},
	
	__caretClearElementStack: function () {
		this.__caretElementStack = {};
	},

	caretRemoveParentElement : function(element) {
		if (!this.caretHasParentElement(element))
			return;
		this.__caretElementStack[element] = false;
		this.trigger("element");
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