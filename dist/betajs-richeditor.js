/*!
  betajs-codemirror - v0.0.1 - 2013-11-02
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
	}	
	
});
BetaJS.Views.ListContainerView.extend("BetaJS.Pages.RichEditorView", {
	
	_templates : {
		"default" : BetaJS.Templates.Cached["rich-editor-view-template"]
	},
	
	constructor : function(options) {
		options = options || {};
		options.el = "body";
		options.alignment = "vertical";
		this._inherited(BetaJS.Views.RichEditorView, "constructor", options);
		this._setOptionProperty(options, "content", "");
		// this.editor_view = this.addChild(new BetaJS.Views.SimpleRichEditorView({
			// el: ".editbox",
			// children_classes: "textareadiv",
			// content: this.binding("content")
		// }));
	},
	
	_domain: function () {
		return {
			page_head_view: {
				type: "ListContainerView",
				options: {
					el_classes: "controlbox"
				}
			},
	
			logo_view: {
				type: "BetaJS.Views.ButtonView",
				parent: "page_head_view",
				options: {
					label: "Hello",
					children_classes: "text-container logo-container"
				},
				events: {
					"click": function () {
						//this.domain.ns.logo_dropdown_view.toggle();
					}
				},
			},

		};
	}
	
});