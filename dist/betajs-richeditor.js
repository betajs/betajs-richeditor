/*!
  betajs-codemirror - v0.0.1 - 2013-11-15
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
		this.__wasKeyInput = false;
		this.on("select", function () { this.trigger("element"); }, this);
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
		this.set("content", this._editor.html());
		this.trigger("change");
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

BetaJS.Views.SimpleRichEditorContentView.extend("BetaJS.Views.RichEditorContentView", {
	
	constructor : function(options) {
		this._inherited(BetaJS.Views.RichEditorContentView, "constructor", options);
		this.__caretElementStack = {};
		this.on("select", function () {
			this.__caretClearElementStack();
		}, this);
		this.on("keyinput", function () {
			this.__caretCharacterAdded();
		}, this);
	},
	
	caretNodeOffset: function () {
		return BetaJS.Browser.Dom.selectionEndOffset();
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
		return BetaJS.Browser.Dom.selectionContained(this._editor) && BetaJS.Browser.Dom.selectionNonEmpty();
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
		if (!this.isSelected())
			return;
		if (this.selectionAncestor().parents(this._selector + " " + element).length > 0)
			return true;
		return BetaJS.Objs.all(this.selectionLeaves(), function (node) {
			return node.closest(this._selector + " " + element).length > 0;
		}, this);
	},
	
	selectionSetParentElement: function (element, value) {
		if (!this.isSelected())
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

	selectionAddParentElement : function (element) {
		if (!this.isSelected())
			return;
		BetaJS.Browser.Dom.selectionSplitOffsets();
		var nodes = BetaJS.Browser.Dom.selectionNodes();
		for (var i = 0; i < nodes.length; ++i)
			if (nodes[i].closest(this._selector + " " + element).length == 0)
				nodes[i] = nodes[i].wrap("<" + element + "></" + element + ">");
		BetaJS.Browser.Dom.selectRange(nodes[0], nodes[nodes.length - 1]);
	},

	selectionRemoveParentElement : function(element) {
		if (!this.isSelected())
			return;
		BetaJS.Browser.Dom.selectionSplitOffsets();
		var nodes = BetaJS.Browser.Dom.selectionNodes();
		for (var i = 0; i < nodes.length; ++i)
			BetaJS.Browser.Dom.remove_tag_from_parent_path(nodes[i], element, this._selector);
		BetaJS.Browser.Dom.selectRange(nodes[0], nodes[nodes.length - 1]);
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
		BetaJS.Objs.iter(this.__caretElementStack, function (value, tag) { (value ? yesTags : noTags).push(tag); });
		var node = BetaJS.Browser.Dom.splitNode(this.caretNode(), this.caretNodeOffset() - 1, this.caretNodeOffset());
		for (var i = 0; i < noTags.length; ++i)
			BetaJS.Browser.Dom.remove_tag_from_parent_path(node, noTags[i], this._selector);
		for (var i = 0; i < yesTags.length; ++i)
			node = node.wrap("<" + yesTags[i] + "></" + yesTags[i] + ">");			
		BetaJS.Browser.Dom.selectNode(node, 1);
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