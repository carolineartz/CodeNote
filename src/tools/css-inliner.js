YUI.add('cn-css-inliner', function (Y) {

	var _ideaCSS = [
		{
			key: '.hljs',
			value: 'display: block; padding: 0.5em;' +
  					'color: #000;' +
  					'background: #fff;'
		},
		{
			key: '.hljs-subst,' +
				'.hljs-title',
			value: 'font-weight: normal;' +
  					'color: #000;'
		},
		{
			key: '.hljs-comment,' +
					'.hljs-template_comment,' +
					'.hljs-javadoc,' +
					'.diff .hljs-header',
			value: 'color: #808080;' +
  					'font-style: italic;'
		},
		{
			key: '.hljs-annotation,' +
					'.hljs-decorator,' +
					'.hljs-preprocessor,' +
					'.hljs-pragma,' +
					'.hljs-doctype,' +
					'.hljs-pi,' +
					'.hljs-chunk,' +
					'.hljs-shebang,' +
					'.apache .hljs-cbracket,' +
					'.hljs-prompt,' +
					'.http .hljs-title',
			value: 'color: #808000;'
		},
		{
			key: '.hljs-tag,' +
					'.hljs-pi',
			value: 'background: #efefef;'
		},
		{
			key: '.hljs-tag .hljs-title,' +
					'.hljs-id,' +
					'.hljs-attr_selector,' +
					'.hljs-pseudo,' +
					'.hljs-literal,' +
					'.hljs-keyword,' +
					'.hljs-hexcolor,' +
					'.css .hljs-function,' +
					'.ini .hljs-title,' +
					'.css .hljs-class,' +
					'.hljs-list .hljs-title,' +
					'.clojure .hljs-title,' +
					'.nginx .hljs-title,' +
					'.tex .hljs-command,' +
					'.hljs-request,' +
					'.hljs-status',
			value: 'font-weight: bold;' +
  					'color: #000080;'
		},
		{
			key: '.hljs-attribute,' +
					'.hljs-rules .hljs-keyword,' +
					'.hljs-number,' +
					'.hljs-date,' +
					'.hljs-regexp,' +
					'.tex .hljs-special',
			value: 'font-weight: bold;' +
  					'color: #0000ff;'
		},
		{
			key: '.hljs-number,' +
					'.hljs-regexp',
			value: 'font-weight: normal;'
		},
		{
			key: '.hljs-string,' +
					'.hljs-value,' +
					'.hljs-filter .hljs-argument,' +
					'.css .hljs-function .hljs-params,' +
					'.apache .hljs-tag',
			value: 'color: #008000;' +
  					'font-weight: bold;'
		},
		{
			key: '.hljs-symbol,' +
					'.ruby .hljs-symbol .hljs-string,' +
					'.hljs-char,' +
					'.tex .hljs-formula',
			value: 'color: #000;' +
  					'background: #d0eded;' +
  					'font-style: italic;'
		},
		{
			key: '.hljs-phpdoc,' +
					'.hljs-yardoctag,' +
					'.hljs-javadoctag',
			value: 'text-decoration: underline;'
		},
		{
			key: '.hljs-variable,' +
					'.hljs-envvar,' +
					'.apache .hljs-sqbracket,' +
					'.nginx .hljs-built_in',
			value: 'color: #660e7a;'
		},
		{
			key: '.hljs-addition',
			value: 'background: #baeeba;'
		},
		{
			key: '.hljs-deletion',
			value: 'background: #ffc8bd;'
		},
		{
			key: '.diff .hljs-change',
			value: 'background: #bccff9;'
		}
	];

	
	Y.namespace('CN').CSSInliner = (function () {
		var _toInline = function (node) {
				var i, rule, style;
				
				for (i = 0; i < _ideaCSS.length; i++) {
					rule = _ideaCSS[i];
					node.all(rule.key).each(function (elem) {
						style = elem.getAttribute('cn-style_') + rule.value;
						elem.setAttribute('cn-style_', style);
						elem.removeAttribute('class');
					});
				}
			};

		return {
			toInline: _toInline
		};
	}) ();

}, '1.0', {
	requires: [
	]
});