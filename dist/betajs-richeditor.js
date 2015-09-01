/*!
betajs-richeditor - v1.0.0 - 2015-08-31
Copyright (c) Victor Lingenthal
MIT Software License.
*/
/*!
betajs-scoped - v0.0.1 - 2015-03-26
Copyright (c) Oliver Friedmann
MIT Software License.
*/
var Scoped = (function () {
var Globals = {

	get : function(key) {
		if (typeof window !== "undefined")
			return window[key];
		if (typeof global !== "undefined")
			return global[key];
		return null;
	},

	set : function(key, value) {
		if (typeof window !== "undefined")
			window[key] = value;
		if (typeof global !== "undefined")
			global[key] = value;
		return value;
	},
	
	setPath: function (path, value) {
		var args = path.split(".");
		if (args.length == 1)
			return this.set(path, value);		
		var current = this.get(args[0]) || this.set(args[0], {});
		for (var i = 1; i < args.length - 1; ++i) {
			if (!(args[i] in current))
				current[args[i]] = {};
			current = current[args[i]];
		}
		current[args[args.length - 1]] = value;
		return value;
	},
	
	getPath: function (path) {
		var args = path.split(".");
		if (args.length == 1)
			return this.get(path);		
		var current = this.get(args[0]);
		for (var i = 1; i < args.length; ++i) {
			if (!current)
				return current;
			current = current[args[i]];
		}
		return current;
	}

};
var Helper = {
		
	method: function (obj, func) {
		return function () {
			return func.apply(obj, arguments);
		};
	},
	
	extend: function (base, overwrite) {
		base = base || {};
		overwrite = overwrite || {};
		for (var key in overwrite)
			base[key] = overwrite[key];
		return base;
	},
	
	typeOf: function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]' ? "array" : typeof obj;
	},
	
	isEmpty: function (obj) {
		if (obj === null || typeof obj === "undefined")
			return true;
		if (this.typeOf(obj) == "array")
			return obj.length === 0;
		if (typeof obj !== "object")
			return false;
		for (var key in obj)
			return false;
		return true;
	},
	
	matchArgs: function (args, pattern) {
		var i = 0;
		var result = {};
		for (var key in pattern) {
			if (pattern[key] === true || this.typeOf(args[i]) == pattern[key]) {
				result[key] = args[i];
				i++;
			} else if (this.typeOf(args[i]) == "undefined")
				i++;
		}
		return result;
	},
	
	stringify: function (value) {
		if (this.typeOf(value) == "function")
			return "" + value;
		return JSON.stringify(value);
	}	

};
var Attach = {
		
	__namespace: "Scoped",
	
	upgrade: function (namespace) {
		var current = Globals.get(namespace || Attach.__namespace);
		if (current && Helper.typeOf(current) == "object" && current.guid == this.guid && Helper.typeOf(current.version) == "string") {
			var my_version = this.version.split(".");
			var current_version = current.version.split(".");
			var newer = false;
			for (var i = 0; i < Math.min(my_version.length, current_version.length); ++i) {
				newer = my_version[i] > current_version[i];
				if (my_version[i] != current_version[i]) 
					break;
			}
			return newer ? this.attach(namespace) : current;				
		} else
			return this.attach(namespace);		
	},

	attach : function(namespace) {
		if (namespace)
			Attach.__namespace = namespace;
		var current = Globals.get(Attach.__namespace);
		if (current == this)
			return this;
		Attach.__revert = current;
		Globals.set(Attach.__namespace, this);
		return this;
	},
	
	detach: function (forceDetach) {
		if (forceDetach)
			Globals.set(Attach.__namespace, null);
		if (typeof Attach.__revert != "undefined")
			Globals.set(Attach.__namespace, Attach.__revert);
		delete Attach.__revert;
		return this;
	},
	
	exports: function (mod, object, forceExport) {
		mod = mod || (typeof module != "undefined" ? module : null);
		if (typeof mod == "object" && mod && "exports" in mod && (forceExport || mod.exports == this || !mod.exports || Helper.isEmpty(mod.exports)))
			mod.exports = object || this;
		return this;
	}	

};

function newNamespace (options) {
	
	options = Helper.extend({
		tree: false,
		global: false,
		root: {}
	}, options);
	
	function initNode(options) {
		return Helper.extend({
			route: null,
			parent: null,
			children: {},
			watchers: [],
			data: {},
			ready: false,
			lazy: []
		}, options);
	}
	
	var nsRoot = initNode({ready: true});
	
	var treeRoot = null;
	
	if (options.tree) {
		if (options.global) {
			try {
				if (window)
					treeRoot = window;
			} catch (e) { }
			try {
				if (global)
					treeRoot = global;
			} catch (e) { }
		} else
			treeRoot = options.root;
		nsRoot.data = treeRoot;
	}
	
	function nodeDigest(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready) {
			nodeDigest(node.parent);
			return;
		}
		if (node.route in node.parent.data) {
			node.data = node.parent.data[node.route];
			node.ready = true;
			for (var i = 0; i < node.watchers.length; ++i)
				node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
			node.watchers = [];
			for (var key in node.children)
				nodeDigest(node.children[key]);
		}
	}
	
	function nodeEnforce(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready)
			nodeEnforce(node.parent);
		node.ready = true;
		if (options.tree && typeof node.parent.data == "object")
			node.parent.data[node.route] = node.data;
		for (var i = 0; i < node.watchers.length; ++i)
			node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
		node.watchers = [];
	}
	
	function nodeSetData(node, value) {
		if (typeof value == "object") {
			for (var key in value) {
				node.data[key] = value[key];
				if (node.children[key])
					node.children[key].data = value[key];
			}
		} else
			node.data = value;
		nodeEnforce(node);
		for (var k in node.children)
			nodeDigest(node.children[k]);
	}
	
	function nodeClearData(node) {
		if (node.ready && node.data) {
			for (var key in node.data)
				delete node.data[key];
		}
	}
	
	function nodeNavigate(path) {
		if (!path)
			return nsRoot;
		var routes = path.split(".");
		var current = nsRoot;
		for (var i = 0; i < routes.length; ++i) {
			if (routes[i] in current.children)
				current = current.children[routes[i]];
			else {
				current.children[routes[i]] = initNode({
					parent: current,
					route: routes[i]
				});
				current = current.children[routes[i]];
				nodeDigest(current);
			}
		}
		return current;
	}
	
	function nodeAddWatcher(node, callback, context) {
		if (node.ready)
			callback.call(context || this, node.data);
		else {
			node.watchers.push({
				callback: callback,
				context: context
			});
			if (node.lazy.length > 0) {
				var f = function (node) {
					if (node.lazy.length > 0) {
						var lazy = node.lazy.shift();
						lazy.callback.call(lazy.context || this, node.data);
						f(node);
					}
				};
				f(node);
			}
		}
	}

	return {
		
		extend: function (path, value) {
			nodeSetData(nodeNavigate(path), value);
		},
		
		set: function (path, value) {
			var node = nodeNavigate(path);
			if (node.data)
				nodeClearData(node);
			nodeSetData(node, value);
		},
		
		lazy: function (path, callback, context) {
			var node = nodeNavigate(path);
			if (node.ready)
				callback(context || this, node.data);
			else {
				node.lazy.push({
					callback: callback,
					context: context
				});
			}
		},
		
		digest: function (path) {
			nodeDigest(nodeNavigate(path));
		},
		
		obtain: function (path, callback, context) {
			nodeAddWatcher(nodeNavigate(path), callback, context);
		}
		
	};
	
}
function newScope (parent, parentNamespace, rootNamespace, globalNamespace) {
	
	var self = this;
	var nextScope = null;
	var childScopes = [];
	var localNamespace = newNamespace({tree: true});
	var privateNamespace = newNamespace({tree: false});
	
	var bindings = {
		"global": {
			namespace: globalNamespace
		}, "root": {
			namespace: rootNamespace
		}, "local": {
			namespace: localNamespace
		}, "default": {
			namespace: privateNamespace
		}, "parent": {
			namespace: parentNamespace
		}, "scope": {
			namespace: localNamespace,
			readonly: false
		}
	};
	
	var custom = function (argmts, name, callback) {
		var args = Helper.matchArgs(argmts, {
			options: "object",
			namespaceLocator: true,
			dependencies: "array",
			hiddenDependencies: "array",
			callback: true,
			context: "object"
		});
		
		var options = Helper.extend({
			lazy: this.options.lazy
		}, args.options || {});
		
		var ns = this.resolve(args.namespaceLocator);
		
		var execute = function () {
			this.require(args.dependencies, args.hiddenDependencies, function () {
				arguments[arguments.length - 1].ns = ns;
				if (this.options.compile) {
					var params = [];
					for (var i = 0; i < argmts.length; ++i)
						params.push(Helper.stringify(argmts[i]));
					this.compiled += this.options.ident + "." + name + "(" + params.join(", ") + ");\n\n";
				}
				var result = args.callback.apply(args.context || this, arguments);
				callback.call(this, ns, result);
			}, this);
		};
		
		if (options.lazy)
			ns.namespace.lazy(ns.path, execute, this);
		else
			execute.apply(this);

		return this;
	};
	
	return {
		
		getGlobal: Helper.method(Globals, Globals.getPath),
		setGlobal: Helper.method(Globals, Globals.setPath),
		
		options: {
			lazy: false,
			ident: "Scoped",
			compile: false			
		},
		
		compiled: "",
		
		nextScope: function () {
			if (!nextScope)
				nextScope = newScope(this, localNamespace, rootNamespace, globalNamespace);
			return nextScope;
		},
		
		subScope: function () {
			var sub = this.nextScope();
			childScopes.push(sub);
			nextScope = null;
			return sub;
		},
		
		binding: function (alias, namespaceLocator, options) {
			if (!bindings[alias] || !bindings[alias].readonly) {
				var ns;
				if (Helper.typeOf(namespaceLocator) != "string") {
					ns = {
						namespace: newNamespace({
							tree: true,
							root: namespaceLocator
						}),
						path: null	
					};
				} else
					ns = this.resolve(namespaceLocator);
				bindings[alias] = Helper.extend(options, ns);
			}
			return this;
		},
		
		resolve: function (namespaceLocator) {
			var parts = namespaceLocator.split(":");
			if (parts.length == 1) {
				return {
					namespace: privateNamespace,
					path: parts[0]
				};
			} else {
				var binding = bindings[parts[0]];
				if (!binding)
					throw ("The namespace '" + parts[0] + "' has not been defined (yet).");
				return {
					namespace: binding.namespace,
					path : binding.path && parts[1] ? binding.path + "." + parts[1] : (binding.path || parts[1])
				};
			}
		},
		
		define: function () {
			return custom.call(this, arguments, "define", function (ns, result) {
				ns.namespace.set(ns.path, result);
			});
		},
		
		extend: function () {
			return custom.call(this, arguments, "extend", function (ns, result) {
				ns.namespace.extend(ns.path, result);
			});
		},
		
		condition: function () {
			return custom.call(this, arguments, "condition", function (ns, result) {
				if (result)
					ns.namespace.set(ns.path, result);
			});
		},
		
		require: function () {
			var args = Helper.matchArgs(arguments, {
				dependencies: "array",
				hiddenDependencies: "array",
				callback: "function",
				context: "object"
			});
			args.callback = args.callback || function () {};
			var dependencies = args.dependencies || [];
			var allDependencies = dependencies.concat(args.hiddenDependencies || []);
			var count = allDependencies.length;
			var deps = [];
			var environment = {};
			if (count) {
				var f = function (value) {
					if (this.i < deps.length)
						deps[this.i] = value;
					count--;
					if (count === 0) {
						deps.push(environment);
						args.callback.apply(args.context || this.ctx, deps);
					}
				};
				for (var i = 0; i < allDependencies.length; ++i) {
					var ns = this.resolve(allDependencies[i]);
					if (i < dependencies.length)
						deps.push(null);
					ns.namespace.obtain(ns.path, f, {
						ctx: this,
						i: i
					});
				}
			} else {
				deps.push(environment);
				args.callback.apply(args.context || this, deps);
			}
			return this;
		},
		
		digest: function (namespaceLocator) {
			var ns = this.resolve(namespaceLocator);
			ns.namespace.digest(ns.path);
			return this;
		}		
		
	};
	
}
var globalNamespace = newNamespace({tree: true, global: true});
var rootNamespace = newNamespace({tree: true});
var rootScope = newScope(null, rootNamespace, rootNamespace, globalNamespace);

var Public = Helper.extend(rootScope, {
		
	guid: "4b6878ee-cb6a-46b3-94ac-27d91f58d666",
	version: '9.1427403679672',
		
	upgrade: Attach.upgrade,
	attach: Attach.attach,
	detach: Attach.detach,
	exports: Attach.exports
	
});

Public = Public.upgrade();
Public.exports();
	return Public;
}).call(this);
/*!
betajs-richeditor - v1.0.0 - 2015-08-31
Copyright (c) Victor Lingenthal
MIT Software License.
*/
(function () {

var Scoped = this.subScope();

Scoped.binding("module", "global:BetaJS.Dynamics.RichEditor");
Scoped.binding("base", "global:BetaJS");
Scoped.binding("dynamics", "global:BetaJS.Dynamics");
Scoped.binding("browser", "global:BetaJS.Browser");

Scoped.binding("jquery", "global:jQuery");

Scoped.define("module:", function () {
	return {
		guid: "15a5c98c-e44a-cb29-7593-2577c3ce3753",		       
		version: '27.1441069313511'
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