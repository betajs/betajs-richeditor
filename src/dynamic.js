Scoped.define("module:Richeditor", [
    "dynamics:Dynamic",
    "jquery:",
    "base:Strings",
    "browser:Dom",
    "browser:Events",
    "browser:Selection",
    "base:Objs",
    "base:Types"
], function (Dynamic, $, Strings, Dom, DomEvents, Selection, Objs, Types, scoped) {
	
	var Cls = Dynamic.extend({scoped: scoped}, function (inherited) {
		return {
			
			template : "<div></div>",
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this._domEvents = this.auto_destroy(new DomEvents());
				this.set("content", this.initialContent || "");
				this.__wasKeyInput = false;
				this.__enableContentChange = false;
				this.on("select", function () {
					this.trigger("element");
				});
				this.on("change:content", function (value) {
					if (this.editor() && this.__enableContentChange)
						this.editor().innerHTML = value;
				}, this);
				this.properties().computed("text", function () {
					return Strings.strip_html(this.get("content") || "");
				}, ["content"]);
				this._domEvents.on(window, "selectionchange", function () {
					if (this.hasFocus())
						this.trigger("select");
				}, this);
				this.__caretElementStack = {};
				this.on("select", function () {
					this.__caretClearElementStack();
				}, this);
				this.on("keyinput", function () {
					this.__caretCharacterAdded();
				}, this);
			},
			
			editor: function () {
				return Dom.unbox(this.activeElement());
			},
			
			_afterActivate: function () {
				var e = this.editor();
				e.contentEditable = true;
				e.innerHTML = this.get("content");
				this._domEvents.on(e, "blur", function () {
					this.trigger("leave");
				}, this);
				this._domEvents.on(e, "focus", function () {
					this.trigger("enter");
				}, this);
				this._domEvents.on(e, "keypress", function (e) {
					this.__wasKeyInput = false;
					if (e.which !== 0)
						this.__wasKeyInput = true;			
				}, this);
				this._domEvents.on(e, "input", function (e) {
					this.__enableContentChange = false;
					this.set("content", e.innerHTML);
					this.__enableContentChange = true;
					if (this.__wasKeyInput) {
						this.__wasKeyInput = false;
						this.trigger("keyinput");
					}
				}, this);
			},

			focus: function () {
				this.editor().focus();
			},
			
			caretNodeOffset: function () {
				return Selection.selectionEndOffset();
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
				return Selection.selectionContained(this.editor()) && Selection.selectionNonEmpty();
			},
			
			selectionSetParentElement: function (element, value) {
				if (!this.isSelected())
					return;
				var has = this.selectionHasParentElement(element);
				if (Types.is_undefined(value))
					value = !has;
				if (value == has)
					return;
				if (value)
					this.selectionAddParentElement(element);
				else
					this.selectionRemoveParentElement(element);
			},

			caretSetParentElement: function (element, value) {
				var has = this.caretHasParentElement(element);
				if (Types.is_undefined(value))
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
			
			__caretClearElementStack: function () {
				this.__caretElementStack = {};
			},

			caretRemoveParentElement : function(element) {
				if (!this.caretHasParentElement(element))
					return;
				this.__caretElementStack[element] = false;
				this.trigger("element");
			},
			
			contentSiblings: function (node) {
				var result = [];
				node.parentNode.childNodes.forEach(function (sibling) {
					if (sibling != node)
						result.push(sibling);
				});
				return result;
			},

			hasFocus: function () {
				return document.activeElement == this.editor() || $(document.activeElement).parents(this.editor()).length > 0;
			},
			
			selectionAncestor: function () {
				return $(Selection.selectionAncestor());
			},
			
			selection: function () {
				return $(Selection.selectionNodes());
			},
				
			selectionLeaves: function () {
				return $(Selection.selectionLeaves());
			},

			selectionHasParentElement : function(element) {
				if (!this.isSelected())
					return false;
				if (this.selectionAncestor().parents($(this.editor()).find(element)).length > 0)
					return true;
				return Objs.all(this.selectionLeaves(), function (node) {
					return node.closest($(this.editor()).find(element)).length > 0;
				}, this);
			},
			
			selectionAddParentElement : function (element) {
				if (!this.isSelected())
					return;
				Selection.selectionSplitOffsets();
				var nodes = $(Selection.selectionNodes());
				for (var i = 0; i < nodes.length; ++i) {
					if (nodes[i].closest($(this.editor()).find(element)).length === 0)
						nodes[i] = nodes[i].wrap("<" + element + "></" + element + ">");
				}
				Selection.selectRange(nodes[0], nodes[nodes.length - 1]);
			},

			selectionRemoveParentElement : function(element) {
				if (!this.isSelected())
					return;
				Selection.selectionSplitOffsets();
				var nodes = $(Selection.selectionNodes());
				for (var i = 0; i < nodes.length; ++i)
					this.remove_tag_from_parent_path(nodes[i], element, this.editor());
				Selection.selectRange(nodes[0], nodes[nodes.length - 1]);
			},

			caretNode : function() {
				return $(Selection.selectionStartNode());
			},

			caretHasParentElement : function(element) {
				if (Types.is_defined(this.__caretElementStack[element]))
					return this.__caretElementStack[element];
				return this.caretNode().parents($(this.editor()).find(element)).length > 0;
			},

			__caretCharacterAdded: function () {
				var yesTags = [];
				var noTags = [];
				Objs.iter(this.__caretElementStack, function (value, tag) { (value ? yesTags : noTags).push(tag); });
				var node = $(Dom.splitNode(this.caretNode().get(0), this.caretNodeOffset() - 1, this.caretNodeOffset()));
				var i = null;
				for (i = 0; i < noTags.length; ++i)
					this.remove_tag_from_parent_path(node, noTags[i], this.editor());
				for (i = 0; i < yesTags.length; ++i)
					node = node.wrap("<" + yesTags[i] + "></" + yesTags[i] + ">");			
				Selection.selectNode(node.get(0), 1);
			},
			
			remove_tag_from_parent_path: function (node, tag, context) {	
				tag = tag.toLowerCase();
				node = $(node);
				context = $(context);
				var parents = node.parents(context ? context + " " + tag : tag);
				for (var i = 0; i < parents.length; ++i) {
					var parent = parents.get(i);
					parent = $(parent);
					while (node.get(0) != parent.get(0)) {
						this.contentSiblings(node.get(0)).wrap("<" + tag + "></" + tag + ">");
						node = node.parent();
					}
					parent.contents().unwrap();
				}
			}			
			
		};
	});
	
	Cls.register("ba-richeditor");
	
	return Cls;

});
