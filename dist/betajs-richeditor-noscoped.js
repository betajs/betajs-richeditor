/*!
betajs-richeditor - v1.0.3 - 2016-02-26
Copyright (c) Victor Lingenthal
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.Dynamics.RichEditor');
Scoped.binding('base', 'global:BetaJS');
Scoped.binding('browser', 'global:BetaJS.Browser');
Scoped.binding('dynamics', 'global:BetaJS.Dynamics');
Scoped.binding('jquery', 'global:jQuery');
Scoped.define("module:", function () {
	return {
    "guid": "15a5c98c-e44a-cb29-7593-2577c3ce3753",
    "version": "31.1456497896136"
};
});
Scoped.define("module:Richeditor", [
    "dynamics:Dynamic",
    "jquery:",
    "base:Strings",
    "browser:Dom",
    "base:Objs",
    "base:Types"
], function (Dynamic, $, Strings, Dom, Objs, Types, scoped) {
	
	var Cls = Dynamic.extend({scoped: scoped}, function (inherited) {
		return {
			
			template : "<div></div>",
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this.set("content", this.initialContent || "");
				this.__wasKeyInput = false;
				this.__enableContentChange = false;
				this.on("select", function () {
					this.trigger("element");
				});
				this.on("change:content", function (value) {
					if (this.editor() && this.__enableContentChange)
						this.$editor().html(value);
				}, this);
				this.properties().computed("text", function () {
					return Strings.strip_html(this.get("content") || "");
				}, ["content"]);
				var self = this;
				$(window).on("selectionchange." + this.cid(), function () {
					if (self.hasFocus())
						self.trigger("select");
				});
				this.__caretElementStack = {};
				this.on("select", function () {
					this.__caretClearElementStack();
				}, this);
				this.on("keyinput", function () {
					this.__caretCharacterAdded();
				}, this);
			},
			
			destroy: function () {
				$(window).off("selectionchange." + this.cid());
				inherited.destroy.call(this);
			},
			
			editor: function () {
				return this.element().get(0);
			},
			
			$editor: function () {
				return $(this.editor());
			},
			
			_afterActivate: function ($element) {
				$e = this.$editor();
				$e.attr("contenteditable", true);
				$e.html(this.get("content"));
				var self = this;
				$e.on("blur", function () {
					self.trigger("leave");
				});
				$e.on("focus", function () {
					self.trigger("enter");
				});
				$e.on("keypress", function (e) {
					self.__wasKeyInput = false;
					if (e.which !== 0)
						self.__wasKeyInput = true;			
				});
				$e.on("input", function (e) {
					self.__enableContentChange = false;
					self.set("content", $e.html());
					self.__enableContentChange = true;
					if (self.__wasKeyInput) {
						self.__wasKeyInput = false;
						self.trigger("keyinput");
					}
				});
			},

			hasFocus: function () {
				return (document.activeElement == this.editor()) ||
				       ($(document.activeElement).parents(this.editor()).length > 0);
			},
			
			focus: function () {
				this.$editor().focus();
			},
			
			caretNodeOffset: function () {
				return Dom.selectionEndOffset();
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
				return Dom.selectionContained(this.$editor()) && Dom.selectionNonEmpty();
			},
			
			selectionAncestor: function () {
				return Dom.selectionAncestor();
			},
			
			selection: function () {
				return Dom.selectionNodes();
			},
				
			selectionLeaves: function () {
				return Dom.selectionLeaves();
			},

			selectionHasParentElement : function(element) {
				if (!this.isSelected())
					return false;
				if (this.selectionAncestor().parents(this.$editor().find(element)).length > 0)
					return true;
				return Objs.all(this.selectionLeaves(), function (node) {
					return node.closest(this.$editor().find(element)).length > 0;
				}, this);
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

			selectionAddParentElement : function (element) {
				if (!this.isSelected())
					return;
				Dom.selectionSplitOffsets();
				var nodes = Dom.selectionNodes();
				for (var i = 0; i < nodes.length; ++i) {
					if (nodes[i].closest(this.$editor().find(element)).length === 0)
						nodes[i] = nodes[i].wrap("<" + element + "></" + element + ">");
				}
				Dom.selectRange(nodes[0], nodes[nodes.length - 1]);
			},

			selectionRemoveParentElement : function(element) {
				if (!this.isSelected())
					return;
				Dom.selectionSplitOffsets();
				var nodes = Dom.selectionNodes();
				for (var i = 0; i < nodes.length; ++i)
					Dom.remove_tag_from_parent_path(nodes[i], element, this.$editor());
				Dom.selectRange(nodes[0], nodes[nodes.length - 1]);
			},

			caretNode : function() {
				return Dom.selectionStartNode();
			},

			caretHasParentElement : function(element) {
				if (Types.is_defined(this.__caretElementStack[element]))
					return this.__caretElementStack[element];
				return this.caretNode().parents(this.$editor().find(element)).length > 0;
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
			
			__caretCharacterAdded: function () {
				var yesTags = [];
				var noTags = [];
				Objs.iter(this.__caretElementStack, function (value, tag) { (value ? yesTags : noTags).push(tag); });
				var node = Dom.splitNode(this.caretNode(), this.caretNodeOffset() - 1, this.caretNodeOffset());
				var i = null;
				for (i = 0; i < noTags.length; ++i)
					Dom.remove_tag_from_parent_path(node, noTags[i], this.$editor());
				for (i = 0; i < yesTags.length; ++i)
					node = node.wrap("<" + yesTags[i] + "></" + yesTags[i] + ">");			
				Dom.selectNode(node, 1);
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
			
		};
	});
	
	Cls.register("ba-richeditor");
	
	return Cls;

});

}).call(Scoped);