/*!
betajs-richeditor - v1.0.10 - 2017-02-17
Copyright (c) Victor Lingenthal
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.Dynamics.RichEditor');
Scoped.binding('base', 'global:BetaJS');
Scoped.binding('browser', 'global:BetaJS.Browser');
Scoped.binding('dynamics', 'global:BetaJS.Dynamics');
Scoped.define("module:", function () {
	return {
    "guid": "15a5c98c-e44a-cb29-7593-2577c3ce3753",
    "version": "1.0.10"
};
});
Scoped.assumeVersion('base:version', '~1.0.96');
Scoped.assumeVersion('browser:version', '~1.0.61');
Scoped.assumeVersion('dynamics:version', '~0.0.83');
Scoped.define("module:Richeditor", [
    "dynamics:Dynamic",
    "base:Strings",
    "browser:Dom",
    "browser:Events",
    "browser:Selection",
    "base:Objs",
    "base:Types"
], function (Dynamic, Strings, Dom, DomEvents, Selection, Objs, Types, scoped) {
	
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

			selectionAncestor: function () {
				return Selection.selectionAncestor();
			},
			
			selectionLeaves: function () {
				return Selection.selectionLeaves();
			},

			selection: function () {
				return Selection.selectionNodes();
			},
				
			caretNode : function() {
				return Selection.selectionStartNode();
			},

			selectionRemoveParentElement : function(element) {
				if (!this.isSelected())
					return;
				Selection.selectionSplitOffsets();
				var nodes = Selection.selectionNodes();
				nodes.forEach(function (node) {
					this.remove_tag_from_parent_path(node, element, this.editor());
				}, this);
				Selection.selectRange(nodes[0], nodes[nodes.length - 1]);
			},

			hasFocus: function () {
				var current = document.activeElement;
				while (current) {
					if (current == this.editor())
						return true;
					current = current.parentElement;
				}
				return false;
			},
			
			__caretCharacterAdded: function () {
				var yesTags = [];
				var noTags = [];
				Objs.iter(this.__caretElementStack, function (value, tag) { (value ? yesTags : noTags).push(tag); });
				var node = Dom.splitNode(this.caretNode(), this.caretNodeOffset() - 1, this.caretNodeOffset());
				var i = null;
				for (i = 0; i < noTags.length; ++i)
					this.remove_tag_from_parent_path(node, noTags[i], this.editor());
				for (i = 0; i < yesTags.length; ++i) {
					var element = document.createElement(yesTags[i]);
					Dom.elementInsertBefore(element, node);
					element.appendChild(node);
					node = element;
				}							
				Selection.selectNode(node, 1);
			},
			
			selectionHasParentElement : function(element) {
				if (!this.isSelected())
					return false;
				element = Types.is_string(element) ? this.editor().querySelector(element) : element;
				var current = this.selectionAncestor();
				while (current) {
					if (current == element)
						return true;
					if (current == this.editor())
						break;
					current = current.parentElement;
				}
				return Objs.all(this.selectionLeaves(), function (node) {
					while (node) {
						if (node == element)
							return true;
						if (node == this.editor())
							return false;
						node = node.parentElement;
					}
					return false;
				}, this);
			},
			
			caretHasParentElement : function(element) {
				if (Types.is_defined(this.__caretElementStack[element]))
					return this.__caretElementStack[element];
				element = Types.is_string(element) ? this.editor().querySelector(element) : element;
				var current = this.caretNode();
				while (current) {
					if (current == element)
						return true;
					if (current == this.editor())
						break;
					current = current.parentElement;
				}
				return false;
			},

			selectionAddParentElement : function (element) {
				if (!this.isSelected())
					return;
				element = Types.is_string(element) ? this.editor().querySelector(element) : element;
				Selection.selectionSplitOffsets();
				var nodes = Selection.selectionNodes();
				for (var i = 0; i < nodes.length; ++i) {
					var current = nodes[i];
					while (current && current != element && current != this.editor())
						current = current.parentElement;
					if (current != element) {
						var e = document.createElement(element);
						Dom.elementInsertBefore(e, nodes[i]);
						e.appendChild(nodes[i]);
						nodes[i] = e;
					}
				}
				Selection.selectRange(nodes[0], nodes[nodes.length - 1]);
			},

			remove_tag_from_parent_path: function (node, tag, context) {	
				tag = tag.toLowerCase();
				var current = node.parentElement;
				while (current && current != this.editor() && current != context) {
					if (current.tagName.toLowerCase() === tag) {
						while (node != this.editor() && node && node != current) {
							this.contentSiblings(node).forEach(function (sibling) {
								var element = document.createElement(tag);
								Dom.elementInsertBefore(element, sibling);
								element.appendChild(sibling);
							}, this);
							node = node.parentElement;
						}
						var nodes = [];
						for (var i = 0; i < current.childNodes.length; ++i)
							nodes.push(current.childNodes[i]);
						nodes.forEach(function (unwrap) {
							while (unwrap.childNodes.length > 0)
								Dom.elementInsertBefore(unwrap.childNodes[0], unwrap);
							unwrap.parentElement.removeChild(unwrap);
						}, this);
					}
					current = current.parentElement;
				}
			}			
			
		};
	});
	
	Cls.register("ba-richeditor");
	
	return Cls;

});

}).call(Scoped);