/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'fontawesome\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-align-left' : '&#xf036;',
			'icon-align-center' : '&#xf037;',
			'icon-align-right' : '&#xf038;',
			'icon-align-justify' : '&#xf039;',
			'icon-font' : '&#xf031;',
			'icon-bold' : '&#xf032;',
			'icon-italic' : '&#xf033;',
			'icon-list-ul' : '&#xf0ca;',
			'icon-list-ol' : '&#xf0cb;',
			'icon-strikethrough' : '&#xf0cc;',
			'icon-underline' : '&#xf0cd;',
			'icon-caret-down' : '&#xf0d7;',
			'icon-sort-down' : '&#xf0dd;',
			'icon-picture' : '&#xf03e;',
			'icon-tint' : '&#xf043;',
			'icon-map-marker' : '&#xf041;',
			'icon-pencil' : '&#xf040;',
			'icon-adjust' : '&#xf042;',
			'icon-calendar' : '&#xf073;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};