'use strict';

var polka = require('polka');
var send = require('@polka/send');
var sirv = require('sirv');
var fs = require('fs');
var path = require('path');
var marked = require('marked');
var PrismJS = require('prismjs');
require('prism-svelte');
var pg = require('pg');
var devalue$1 = require('devalue');
var cookie = require('cookie');
var httpie = require('httpie');
var querystring = require('querystring');
var flru = require('flru');
var yootils = require('yootils');
require('do-not-zip');
var Stream = require('stream');
var http = require('http');
var Url = require('url');
var https = require('https');
var zlib = require('zlib');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var polka__default = /*#__PURE__*/_interopDefaultLegacy(polka);
var send__default = /*#__PURE__*/_interopDefaultLegacy(send);
var sirv__default = /*#__PURE__*/_interopDefaultLegacy(sirv);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var marked__default = /*#__PURE__*/_interopDefaultLegacy(marked);
var PrismJS__default = /*#__PURE__*/_interopDefaultLegacy(PrismJS);
var devalue__default = /*#__PURE__*/_interopDefaultLegacy(devalue$1);
var flru__default = /*#__PURE__*/_interopDefaultLegacy(flru);
var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var Url__default = /*#__PURE__*/_interopDefaultLegacy(Url);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);

let lookup;
const titles = new Map();

function get_examples() {
	lookup = new Map();

	return fs__default['default'].readdirSync(`content/examples`).map(group_dir => {
		const metadata = JSON.parse(fs__default['default'].readFileSync(`content/examples/${group_dir}/meta.json`, 'utf-8'));

		return {
			title: metadata.title,
			examples: fs__default['default'].readdirSync(`content/examples/${group_dir}`).filter(file => file !== 'meta.json').map(example_dir => {
				const slug = example_dir.replace(/^\d+-/, '');

				if (lookup.has(slug)) throw new Error(`Duplicate example slug "${slug}"`);
				lookup.set(slug, `${group_dir}/${example_dir}`);

				const metadata = JSON.parse(fs__default['default'].readFileSync(`content/examples/${group_dir}/${example_dir}/meta.json`, 'utf-8'));
				titles.set(slug, metadata.title);

				return {
					slug,
					title: metadata.title
				};
			})
		};
	});
}

function get_example(slug) {
	if (!lookup || !lookup.has(slug)) get_examples();

	const dir = lookup.get(slug);
	const title = titles.get(slug);

	if (!dir || !title) return null;

	const files = fs__default['default'].readdirSync(`content/examples/${dir}`)
		.filter(name => name[0] !== '.' && name !== 'meta.json')
		.map(name => {
			return {
				name,
				source: fs__default['default'].readFileSync(`content/examples/${dir}/${name}`, 'utf-8')
			};
		});

	return { title, files };
}

let cached;

function get(req, res) {
	try {
		if (!cached || "development" !== 'production') {
			cached = get_examples().filter(section => section.title);
		}

		send__default['default'](res, 200, cached);
	} catch (e) {
		send__default['default'](res, e.status || 500, {
			message: e.message
		});
	}
}

var route_0 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get
});

const cache = new Map();

function get$1(req, res) {
	const { slug } = req.params;

	let example = cache.get(slug);

	if (!example || "development" !== 'production') {
		example = get_example(slug);
		if (example) cache.set(slug, example);
	}

	if (example) {
		send__default['default'](res, 200, example);
	} else {
		send__default['default'](res, 404, {
			error: 'not found'
		});
	}
}

var route_1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$1
});

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var whitespace = /\s/;
var validIdentifierCharacters = /[a-zA-Z_$][a-zA-Z0-9_$]*/;
var number = /^NaN|(?:[-+]?(?:(?:Infinity)|(?:0[xX][a-fA-F0-9]+)|(?:0[bB][01]+)|(?:0[oO][0-7]+)|(?:(?:(?:[1-9]\d*|0)?\.\d+|(?:[1-9]\d*|0)\.\d*|(?:[1-9]\d*|0))(?:[E|e][+|-]?\d+)?)))/;
var SINGLE_QUOTE = "'";
var DOUBLE_QUOTE = '"';

function getLocator(source, options) {
    if (options === void 0) { options = {}; }
    var offsetLine = options.offsetLine || 0;
    var offsetColumn = options.offsetColumn || 0;
    var originalLines = source.split('\n');
    var start = 0;
    var lineRanges = originalLines.map(function (line, i) {
        var end = start + line.length + 1;
        var range = { start: start, end: end, line: i };
        start = end;
        return range;
    });
    var i = 0;
    function rangeContains(range, index) {
        return range.start <= index && index < range.end;
    }
    function getLocation(range, index) {
        return { line: offsetLine + range.line, column: offsetColumn + index - range.start, character: index };
    }
    function locate(search, startIndex) {
        if (typeof search === 'string') {
            search = source.indexOf(search, startIndex || 0);
        }
        var range = lineRanges[i];
        var d = search >= range.end ? 1 : -1;
        while (range) {
            if (rangeContains(range, search))
                return getLocation(range, search);
            i += d;
            range = lineRanges[i];
        }
    }
    
    return locate;
}
function locate(source, search, options) {
    if (typeof options === 'number') {
        throw new Error('locate takes a { startIndex, offsetLine, offsetColumn } object as the third argument');
    }
    return getLocator(source, options)(search, options && options.startIndex);
}

function parse(str, opts) {
    var parser = new Parser(str, opts);
    return parser.value;
}
function noop() { }
var ParseError = /** @class */ (function (_super) {
    __extends(ParseError, _super);
    function ParseError(message, pos, loc) {
        var _this = _super.call(this, message) || this;
        _this.pos = pos;
        _this.loc = loc;
        return _this;
    }
    return ParseError;
}(Error));
// https://mathiasbynens.be/notes/javascript-escapes
var escapeable = {
    b: '\b',
    n: '\n',
    f: '\f',
    r: '\r',
    t: '\t',
    v: '\v',
    0: '\0'
};
var hex = /^[a-fA-F0-9]+$/;
var Parser = /** @class */ (function () {
    function Parser(str, opts) {
        this.str = str;
        this.index = 0;
        this.onComment = (opts && opts.onComment) || noop;
        this.onValue = (opts && opts.onValue) || noop;
        this.value = this.readValue();
        this.allowWhitespaceOrComment();
        if (this.index < this.str.length) {
            throw new Error("Unexpected character '" + this.peek() + "'");
        }
    }
    Parser.prototype.allowWhitespaceOrComment = function () {
        while (this.index < this.str.length &&
            whitespace.test(this.str[this.index])) {
            this.index++;
        }
        var start = this.index;
        if (this.eat('/')) {
            if (this.eat('/')) {
                // line comment
                var text = this.readUntil(/(?:\r\n|\n|\r)/);
                this.onComment({
                    start: start,
                    end: this.index,
                    type: 'Comment',
                    text: text,
                    block: false
                });
                this.eat('\n');
            }
            else if (this.eat('*')) {
                // block comment
                var text = this.readUntil(/\*\//);
                this.onComment({
                    start: start,
                    end: this.index,
                    type: 'Comment',
                    text: text,
                    block: true
                });
                this.eat('*/', true);
            }
        }
        else {
            return;
        }
        this.allowWhitespaceOrComment();
    };
    Parser.prototype.error = function (message, index) {
        if (index === void 0) { index = this.index; }
        var loc = locate(this.str, index, { offsetLine: 1 });
        throw new ParseError(message, index, loc);
    };
    Parser.prototype.eat = function (str, required) {
        if (this.str.slice(this.index, this.index + str.length) === str) {
            this.index += str.length;
            return str;
        }
        if (required) {
            this.error("Expected '" + str + "' instead of '" + this.str[this.index] + "'");
        }
        return null;
    };
    Parser.prototype.peek = function () {
        return this.str[this.index];
    };
    Parser.prototype.read = function (pattern) {
        var match = pattern.exec(this.str.slice(this.index));
        if (!match || match.index !== 0)
            return null;
        this.index += match[0].length;
        return match[0];
    };
    Parser.prototype.readUntil = function (pattern) {
        if (this.index >= this.str.length)
            this.error('Unexpected end of input');
        var start = this.index;
        var match = pattern.exec(this.str.slice(start));
        if (match) {
            var start_1 = this.index;
            this.index = start_1 + match.index;
            return this.str.slice(start_1, this.index);
        }
        this.index = this.str.length;
        return this.str.slice(start);
    };
    Parser.prototype.readArray = function () {
        var start = this.index;
        if (!this.eat('['))
            return null;
        var array = {
            start: start,
            end: null,
            type: 'ArrayExpression',
            elements: []
        };
        this.allowWhitespaceOrComment();
        while (this.peek() !== ']') {
            array.elements.push(this.readValue());
            this.allowWhitespaceOrComment();
            if (!this.eat(','))
                break;
            this.allowWhitespaceOrComment();
        }
        if (!this.eat(']')) {
            this.error("Expected ']' instead of '" + this.str[this.index] + "'");
        }
        array.end = this.index;
        return array;
    };
    Parser.prototype.readBoolean = function () {
        var start = this.index;
        var raw = this.read(/^(true|false)/);
        if (raw) {
            return {
                start: start,
                end: this.index,
                type: 'Literal',
                raw: raw,
                value: raw === 'true'
            };
        }
    };
    Parser.prototype.readNull = function () {
        var start = this.index;
        if (this.eat('null')) {
            return {
                start: start,
                end: this.index,
                type: 'Literal',
                raw: 'null',
                value: null
            };
        }
    };
    Parser.prototype.readLiteral = function () {
        return (this.readBoolean() ||
            this.readNumber() ||
            this.readString() ||
            this.readNull());
    };
    Parser.prototype.readNumber = function () {
        var start = this.index;
        var raw = this.read(number);
        if (raw) {
            var sign = raw[0];
            var value = +(sign === '-' || sign === '+' ? raw.slice(1) : raw);
            if (sign === '-')
                value = -value;
            return {
                start: start,
                end: this.index,
                type: 'Literal',
                raw: raw,
                value: value
            };
        }
    };
    Parser.prototype.readObject = function () {
        var start = this.index;
        if (!this.eat('{'))
            return;
        var object = {
            start: start,
            end: null,
            type: 'ObjectExpression',
            properties: []
        };
        this.allowWhitespaceOrComment();
        while (this.peek() !== '}') {
            object.properties.push(this.readProperty());
            this.allowWhitespaceOrComment();
            if (!this.eat(','))
                break;
            this.allowWhitespaceOrComment();
        }
        this.eat('}', true);
        object.end = this.index;
        return object;
    };
    Parser.prototype.readProperty = function () {
        this.allowWhitespaceOrComment();
        var property = {
            start: this.index,
            end: null,
            type: 'Property',
            key: this.readPropertyKey(),
            value: this.readValue()
        };
        property.end = this.index;
        return property;
    };
    Parser.prototype.readIdentifier = function () {
        var start = this.index;
        var name = this.read(validIdentifierCharacters);
        if (name) {
            return {
                start: start,
                end: this.index,
                type: 'Identifier',
                name: name
            };
        }
    };
    Parser.prototype.readPropertyKey = function () {
        var key = this.readString() || this.readIdentifier();
        if (!key)
            this.error("Bad identifier as unquoted key");
        if (key.type === 'Literal') {
            key.name = String(key.value);
        }
        this.allowWhitespaceOrComment();
        this.eat(':', true);
        return key;
    };
    Parser.prototype.readString = function () {
        var start = this.index;
        // const quote = this.read(/^['"]/);
        var quote = this.eat(SINGLE_QUOTE) || this.eat(DOUBLE_QUOTE);
        if (!quote)
            return;
        var escaped = false;
        var value = '';
        while (this.index < this.str.length) {
            var char_1 = this.str[this.index++];
            if (escaped) {
                escaped = false;
                // line continuations
                if (char_1 === '\n')
                    continue;
                if (char_1 === '\r') {
                    if (this.str[this.index] === '\n')
                        this.index += 1;
                    continue;
                }
                if (char_1 === 'x' || char_1 === 'u') {
                    var start_2 = this.index;
                    var end = this.index += (char_1 === 'x' ? 2 : 4);
                    var code = this.str.slice(start_2, end);
                    if (!hex.test(code))
                        this.error("Invalid " + (char_1 === 'x' ? 'hexadecimal' : 'Unicode') + " escape sequence", start_2);
                    value += String.fromCharCode(parseInt(code, 16));
                }
                else {
                    value += escapeable[char_1] || char_1;
                }
            }
            else if (char_1 === '\\') {
                escaped = true;
            }
            else if (char_1 === quote) {
                var end = this.index;
                return {
                    start: start,
                    end: end,
                    type: 'Literal',
                    raw: this.str.slice(start, end),
                    value: value
                };
            }
            else {
                if (char_1 === '\n')
                    this.error("Bad string", this.index - 1);
                value += char_1;
            }
        }
        this.error("Unexpected end of input");
    };
    Parser.prototype.readValue = function () {
        this.allowWhitespaceOrComment();
        var value = (this.readArray() ||
            this.readObject() ||
            this.readLiteral());
        if (value) {
            this.onValue(value);
            return value;
        }
        this.error("Unexpected EOF");
    };
    return Parser;
}());

function evaluate(str) {
    var ast = parse(str);
    return getValue(ast);
}
function getValue(node) {
    if (node.type === 'Literal') {
        return node.value;
    }
    if (node.type === 'ArrayExpression') {
        return node.elements.map(getValue);
    }
    if (node.type === 'ObjectExpression') {
        var obj_1 = {};
        node.properties.forEach(function (prop) {
            obj_1[prop.key.name] = getValue(prop.value);
        });
        return obj_1;
    }
}

function extract_frontmatter(markdown) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	const frontMatter = match[1];
	const content = markdown.slice(match[0].length);

	const metadata = {};
	frontMatter.split('\n').forEach(pair => {
		const colonIndex = pair.indexOf(':');
		metadata[pair.slice(0, colonIndex).trim()] = pair
			.slice(colonIndex + 1)
			.trim();
	});

	return { metadata, content };
}

function extract_metadata(line, lang) {
	try {
		if (lang === 'html' && line.startsWith('<!--') && line.endsWith('-->')) {
			return evaluate(line.slice(4, -3).trim());
		}

		if (
			lang === 'js' ||
			(lang === 'json' && line.startsWith('/*') && line.endsWith('*/'))
		) {
			return evaluate(line.slice(2, -2).trim());
		}
	} catch (err) {
		// TODO report these errors, don't just squelch them
		return null;
	}
}

// map lang to prism-language-attr
const langs = {
	bash: 'bash',
	html: 'markup',
	sv: 'svelte',
	js: 'javascript',
	css: 'css',
	diff: 'diff'
};


// links renderer
function link_renderer (href, title, text) {
	let target_attr = '';
	let title_attr = '';

	if (href.startsWith("http")) {
		target_attr = ' target="_blank"';
	}

	if (title !== null) {
		title_attr = ` title="${title}"`;
	}

	return `<a href="${href}"${target_attr}${title_attr} rel="noopener noreferrer">${text}</a>`;
}

let json;

function get_sections() {
	const slugs = new Set();

	const sections = fs.readdirSync(`content/tutorial`)
		.filter(dir => /^\d+/.test(dir))
		.map(dir => {
			let meta;

			try {
				meta = JSON.parse(fs.readFileSync(`content/tutorial/${dir}/meta.json`, 'utf-8'));
			} catch (err) {
				throw new Error(`Error reading metadata for ${dir}`);
			}

			return {
				title: meta.title,
				chapters: fs.readdirSync(`content/tutorial/${dir}`)
					.filter(dir => /^\d+/.test(dir))
					.map(tutorial => {
						try {
							const md = fs.readFileSync(`content/tutorial/${dir}/${tutorial}/text.md`, 'utf-8');
							const { metadata } = extract_frontmatter(md);

							const slug = tutorial.replace(/^\d+-/, '');

							if (slugs.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
							slugs.add(slug);

							return {
								slug,
								title: metadata.title,
								section_dir: dir,
								chapter_dir: tutorial,
							};
						} catch (err) {
							throw new Error(`Error building tutorial ${dir}/${tutorial}: ${err.message}`);
						}
					})
			};
		});

	return sections;
}

function get$2(req, res) {
	try {
		if (!json || "development" !== 'production') {
			json = get_sections();
		}

		send__default['default'](res, 200, json);
	} catch (err) {
		send__default['default'](res, 500, {
			message: err.message
		});
	}
}

var route_2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$2
});

function get$3(req, res) {
	let { min = '0', max = '100' } = req.query;
	min = +min;
	max = +max;

	res.setHeader('Access-Control-Allow-Origin', '*');

	// simulate a long delay
	setTimeout(() => {
		// fail sometimes
		if (Math.random() < 0.333) {
			res.statusCode = 400;
			res.end(`Failed to generate random number. Please try again`);
			return;
		}

		const num = min + Math.round(Math.random() * (max - min));
		res.end(String(num));
	}, 1000);
}

var route_3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$3
});

(function(Prism) {
	// $ set | grep '^[A-Z][^[:space:]]*=' | cut -d= -f1 | tr '\n' '|'
	// + LC_ALL, RANDOM, REPLY, SECONDS.
	// + make sure PS1..4 are here as they are not always set,
	// - some useless things.
	var envVars = '\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b';

	var commandAfterHeredoc = {
		pattern: /(^(["']?)\w+\2)[ \t]+\S.*/,
		lookbehind: true,
		alias: 'punctuation', // this looks reasonably well in all themes
		inside: null // see below
	};

	var insideString = {
		'bash': commandAfterHeredoc,
		'environment': {
			pattern: RegExp("\\$" + envVars),
			alias: 'constant'
		},
		'variable': [
			// [0]: Arithmetic Environment
			{
				pattern: /\$?\(\([\s\S]+?\)\)/,
				greedy: true,
				inside: {
					// If there is a $ sign at the beginning highlight $(( and )) as variable
					'variable': [
						{
							pattern: /(^\$\(\([\s\S]+)\)\)/,
							lookbehind: true
						},
						/^\$\(\(/
					],
					'number': /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,
					// Operators according to https://www.gnu.org/software/bash/manual/bashref.html#Shell-Arithmetic
					'operator': /--?|-=|\+\+?|\+=|!=?|~|\*\*?|\*=|\/=?|%=?|<<=?|>>=?|<=?|>=?|==?|&&?|&=|\^=?|\|\|?|\|=|\?|:/,
					// If there is no $ sign at the beginning highlight (( and )) as punctuation
					'punctuation': /\(\(?|\)\)?|,|;/
				}
			},
			// [1]: Command Substitution
			{
				pattern: /\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,
				greedy: true,
				inside: {
					'variable': /^\$\(|^`|\)$|`$/
				}
			},
			// [2]: Brace expansion
			{
				pattern: /\$\{[^}]+\}/,
				greedy: true,
				inside: {
					'operator': /:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,
					'punctuation': /[\[\]]/,
					'environment': {
						pattern: RegExp("(\\{)" + envVars),
						lookbehind: true,
						alias: 'constant'
					}
				}
			},
			/\$(?:\w+|[#?*!@$])/
		],
		// Escape sequences from echo and printf's manuals, and escaped quotes.
		'entity': /\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|x[0-9a-fA-F]{1,2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})/
	};

	Prism.languages.bash = {
		'shebang': {
			pattern: /^#!\s*\/.*/,
			alias: 'important'
		},
		'comment': {
			pattern: /(^|[^"{\\$])#.*/,
			lookbehind: true
		},
		'function-name': [
			// a) function foo {
			// b) foo() {
			// c) function foo() {
			// but not “foo {”
			{
				// a) and c)
				pattern: /(\bfunction\s+)\w+(?=(?:\s*\(?:\s*\))?\s*\{)/,
				lookbehind: true,
				alias: 'function'
			},
			{
				// b)
				pattern: /\b\w+(?=\s*\(\s*\)\s*\{)/,
				alias: 'function'
			}
		],
		// Highlight variable names as variables in for and select beginnings.
		'for-or-select': {
			pattern: /(\b(?:for|select)\s+)\w+(?=\s+in\s)/,
			alias: 'variable',
			lookbehind: true
		},
		// Highlight variable names as variables in the left-hand part
		// of assignments (“=” and “+=”).
		'assign-left': {
			pattern: /(^|[\s;|&]|[<>]\()\w+(?=\+?=)/,
			inside: {
				'environment': {
					pattern: RegExp("(^|[\\s;|&]|[<>]\\()" + envVars),
					lookbehind: true,
					alias: 'constant'
				}
			},
			alias: 'variable',
			lookbehind: true
		},
		'string': [
			// Support for Here-documents https://en.wikipedia.org/wiki/Here_document
			{
				pattern: /((?:^|[^<])<<-?\s*)(\w+?)\s[\s\S]*?(?:\r?\n|\r)\2/,
				lookbehind: true,
				greedy: true,
				inside: insideString
			},
			// Here-document with quotes around the tag
			// → No expansion (so no “inside”).
			{
				pattern: /((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,
				lookbehind: true,
				greedy: true,
				inside: {
					'bash': commandAfterHeredoc
				}
			},
			// “Normal” string
			{
				pattern: /(^|[^\\](?:\\\\)*)(["'])(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|(?!\2)[^\\`$])*\2/,
				lookbehind: true,
				greedy: true,
				inside: insideString
			}
		],
		'environment': {
			pattern: RegExp("\\$?" + envVars),
			alias: 'constant'
		},
		'variable': insideString.variable,
		'function': {
			pattern: /(^|[\s;|&]|[<>]\()(?:add|apropos|apt|aptitude|apt-cache|apt-get|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,
			lookbehind: true
		},
		'keyword': {
			pattern: /(^|[\s;|&]|[<>]\()(?:if|then|else|elif|fi|for|while|in|case|esac|function|select|do|done|until)(?=$|[)\s;|&])/,
			lookbehind: true
		},
		// https://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
		'builtin': {
			pattern: /(^|[\s;|&]|[<>]\()(?:\.|:|break|cd|continue|eval|exec|exit|export|getopts|hash|pwd|readonly|return|shift|test|times|trap|umask|unset|alias|bind|builtin|caller|command|declare|echo|enable|help|let|local|logout|mapfile|printf|read|readarray|source|type|typeset|ulimit|unalias|set|shopt)(?=$|[)\s;|&])/,
			lookbehind: true,
			// Alias added to make those easier to distinguish from strings.
			alias: 'class-name'
		},
		'boolean': {
			pattern: /(^|[\s;|&]|[<>]\()(?:true|false)(?=$|[)\s;|&])/,
			lookbehind: true
		},
		'file-descriptor': {
			pattern: /\B&\d\b/,
			alias: 'important'
		},
		'operator': {
			// Lots of redirections here, but not just that.
			pattern: /\d?<>|>\||\+=|==?|!=?|=~|<<[<-]?|[&\d]?>>|\d?[<>]&?|&[>&]?|\|[&|]?|<=?|>=?/,
			inside: {
				'file-descriptor': {
					pattern: /^\d/,
					alias: 'important'
				}
			}
		},
		'punctuation': /\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,
		'number': {
			pattern: /(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,
			lookbehind: true
		}
	};

	commandAfterHeredoc.inside = Prism.languages.bash;

	/* Patterns in command substitution. */
	var toBeCopied = [
		'comment',
		'function-name',
		'for-or-select',
		'assign-left',
		'string',
		'environment',
		'function',
		'keyword',
		'builtin',
		'boolean',
		'file-descriptor',
		'operator',
		'punctuation',
		'number'
	];
	var inside = insideString.variable[1].inside;
	for(var i = 0; i < toBeCopied.length; i++) {
		inside[toBeCopied[i]] = Prism.languages.bash[toBeCopied[i]];
	}

	Prism.languages.shell = Prism.languages.bash;
})(Prism);

(function (Prism) {

	Prism.languages.diff = {
		'coord': [
			// Match all kinds of coord lines (prefixed by "+++", "---" or "***").
			/^(?:\*{3}|-{3}|\+{3}).*$/m,
			// Match "@@ ... @@" coord lines in unified diff.
			/^@@.*@@$/m,
			// Match coord lines in normal diff (starts with a number).
			/^\d.*$/m
		]

		// deleted, inserted, unchanged, diff
	};

	/**
	 * A map from the name of a block to its line prefix.
	 *
	 * @type {Object<string, string>}
	 */
	var PREFIXES = {
		'deleted-sign': '-',
		'deleted-arrow': '<',
		'inserted-sign': '+',
		'inserted-arrow': '>',
		'unchanged': ' ',
		'diff': '!',
	};

	// add a token for each prefix
	Object.keys(PREFIXES).forEach(function (name) {
		var prefix = PREFIXES[name];

		var alias = [];
		if (!/^\w+$/.test(name)) { // "deleted-sign" -> "deleted"
			alias.push(/\w+/.exec(name)[0]);
		}
		if (name === "diff") {
			alias.push("bold");
		}

		Prism.languages.diff[name] = {
			pattern: RegExp('^(?:[' + prefix + '].*(?:\r\n?|\n|(?![\\s\\S])))+', 'm'),
			alias: alias,
			inside: {
				'line': {
					pattern: /(.)(?=[\s\S]).*(?:\r\n?|\n)?/,
					lookbehind: true
				},
				'prefix': {
					pattern: /[\s\S]/,
					alias: /\w+/.exec(name)[0]
				}
			}
		};

	});

	// make prefixes available to Diff plugin
	Object.defineProperty(Prism.languages.diff, 'PREFIXES', {
		value: PREFIXES
	});

}(Prism));

function highlight(source, lang) {
	const plang = langs[lang] || '';
	const highlighted = plang ? PrismJS__default['default'].highlight(
		source,
		PrismJS__default['default'].languages[plang],
		lang,
	) : source.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

	return `<pre class='language-${plang}'><code>${highlighted}</code></pre>`;
}

const cache$1 = new Map();

function find_tutorial(slug) {
	const sections = fs.readdirSync(`content/tutorial`);

	for (const section of sections) {
		const chapters = fs.readdirSync(`content/tutorial/${section}`).filter(dir => /^\d+/.test(dir));
		for (const chapter of chapters) {
			if (slug === chapter.replace(/^\d+-/, '')) {
				return { section, chapter };
			}
		}
	}
}

function get_tutorial(slug) {
	const found = find_tutorial(slug);
	if (!found) return found;

	const dir = `content/tutorial/${found.section}/${found.chapter}`;

	const markdown = fs.readFileSync(`${dir}/text.md`, 'utf-8');
	const app_a = fs.readdirSync(`${dir}/app-a`);
	const app_b = fs.existsSync(`${dir}/app-b`) && fs.readdirSync(`${dir}/app-b`);

	const { content } = extract_frontmatter(markdown);

	const renderer = new marked__default['default'].Renderer();

	renderer.link = link_renderer;

	renderer.code = (source, lang) => {
		source = source.replace(/^ +/gm, match =>
			match.split('    ').join('\t')
		);

		const lines = source.split('\n');

		const meta = extract_metadata(lines[0], lang);

		let prefix = '';
		let className = 'code-block';

		if (meta) {
			source = lines.slice(1).join('\n');
			const filename = meta.filename || (lang === 'html' && 'App.svelte');
			if (filename) {
				prefix = `<span class='filename'>${prefix} ${filename}</span>`;
				className += ' named';
			}
		}

		return `<div class='${className}'>${prefix}${highlight(source, lang)}</div>`;
	};

	let html = marked__default['default'](content, { renderer });
	if (found.chapter.startsWith('01')) {
		const meta = JSON.parse(fs.readFileSync(`content/tutorial/${found.section}/meta.json`));
		html = `<h2>${meta.title}</h2>\n${html}`;
	}

	function get_file(stage, file) {
		const ext = path.extname(file);
		const name = file.slice(0, -ext.length);
		const type = ext.slice(1);

		return {
			name,
			type,
			source: fs.readFileSync(`${dir}/${stage}/${file}`, 'utf-8')
		};
	}

	return {
		html,
		app_a: app_a.map(file => get_file('app-a', file)),
		app_b: app_b && app_b.map(file => get_file('app-b', file))
	};
}

function get$4(req, res) {
	const { slug } = req.params;

	let tut = cache$1.get(slug);
	if (!tut || "development" !== 'production') {
		tut = get_tutorial(slug);
		cache$1.set(slug, tut);
	}

	if (tut) {
		send__default['default'](res, 200, tut);
	} else {
		send__default['default'](res, 404, { message: 'not found' });
	}
}

var route_4 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$4
});

// Uses `PG*` ENV vars
const DB = process.env.PGHOST ? new pg.Pool() : null;

function query(text, values=[]) {
	return DB.query(text, values).then(r => r.rows);
}

function find(text, values=[]) {
	return query(text, values).then(arr => arr[0]);
}

async function get$5(req, res) {
	if (req.user) {
		const page_size = 100;
		const offset = req.query.offset ? parseInt(req.query.offset) : 0;
		const rows = await query(`
			select g.uid, g.name, coalesce(g.updated_at, g.created_at) as updated_at
			from gists g
			where g.user_id = $1
			order by id desc
			limit ${page_size + 1}
			offset $2
		`, [req.user.id, offset]);

		rows.forEach(row => {
			row.uid = row.uid.replace(/-/g, '');
		});

		const more = rows.length > page_size;
		send__default['default'](res, 200, { apps: rows.slice(0, page_size), offset: more ? offset + page_size : null });
	} else {
		send__default['default'](res, 401);
	}
}

var route_5 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$5
});

const sanitize_user = obj => obj && ({
	uid: obj.uid,
	username: obj.username,
	name: obj.name,
	avatar: obj.avatar
});

const session_cache = flru__default['default'](1000);

const create_user = async (gh_user, access_token) => {
	return await find(`
		insert into users(uid, name, username, avatar, github_token)
		values ($1, $2, $3, $4, $5) on conflict (uid) do update
		set (name, username, avatar, github_token, updated_at) = ($2, $3, $4, $5, now())
		returning id, uid, username, name, avatar
	`, [gh_user.id, gh_user.name, gh_user.login, gh_user.avatar_url, access_token]);
};

const create_session = async user => {
	const session = await find(`
		insert into sessions(user_id)
		values ($1)
		returning uid
	`, [user.id]);

	session_cache.set(session.uid, user);

	return session;
};

const delete_session = async sid => {
	await query(`delete from sessions where uid = $1`, [sid]);
	session_cache.set(sid, null);
};

const get_user = async sid => {
	if (!sid) return null;

	if (!session_cache.has(sid)) {
		session_cache.set(sid, await find(`
			select users.id, users.uid, users.username, users.name, users.avatar
			from sessions
			left join users on sessions.user_id = users.id
			where sessions.uid = $1 and expiry > now()
		`, [sid]));
	}

	return session_cache.get(sid);
};

const authenticate = () => {
	// this is a convenient time to clear out expired sessions
	query(`delete from sessions where expiry < now()`);

	return async (req, res, next) => {
		req.cookies = cookie.parse(req.headers.cookie || '');
		req.user = await get_user(req.cookies.sid);

		next();
	};
};

const oauth = 'https://github.com/login/oauth';
const baseurl = process.env.BASEURL;
const secure = baseurl && baseurl.startsWith('https:');

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

async function get$6(req, res) {
	try {
		// Trade "code" for "access_token"
		const r1 = await httpie.post(`${oauth}/access_token?` + querystring.stringify({
			code: req.query.code,
			client_id,
			client_secret,
		}));

		// Now fetch User details
		const { access_token } = querystring.parse(r1.data);
		const r2 = await httpie.get('https://api.github.com/user', {
			headers: {
				'User-Agent': 'svelte.dev',
				Authorization: `token ${access_token}`
			}
		});

		const user = await create_user(r2.data, access_token);
		const session = await create_session(user);

		res.writeHead(200, {
			'Set-Cookie': cookie.serialize('sid', session.uid, {
				maxAge: 31536000,
				path: '/',
				httpOnly: true,
				secure
			}),
			'Content-Type': 'text/html; charset=utf-8'
		});

		res.end(`
			<script>
				window.opener.postMessage({
					user: ${devalue__default['default'](sanitize_user(user))}
				}, window.location.origin);
			</script>
		`);
	} catch (err) {
		console.error('GET /auth/callback', err);
		send__default['default'](res, 500, err.data, {
			'Content-Type': err.headers['content-type'],
			'Content-Length': err.headers['content-length']
		});
	}
}

var route_6 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$6
});

async function get$7(req, res) {
	await delete_session(req.cookies.sid);

	send__default['default'](res, 200, '', {
		'Set-Cookie': cookie.serialize('sid', '', {
			maxAge: -1,
			path: '/',
			httpOnly: true,
			secure
		})
	});
}

var route_7 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$7
});

const get$8 = client_id
	? (req, res) => {
		const Location = `${oauth}/authorize?` + querystring.stringify({
			scope: 'read:user',
			client_id,
			redirect_uri: `${baseurl}/auth/callback`,
		});

		send__default['default'](res, 302, Location, { Location });
	}
	: (req, res) => {
		send__default['default'](res, 500, `
			<body style="font-family: sans-serif; background: rgb(255,215,215); border: 2px solid red; margin: 0; padding: 1em;">
				<h1>Missing .env file</h1>
				<p>In order to use GitHub authentication, you will need to <a target="_blank" href="https://github.com/settings/developers">register an OAuth application</a> and create a local .env file:</p>
				<pre>GITHUB_CLIENT_ID=[YOUR_APP_ID]\nGITHUB_CLIENT_SECRET=[YOUR_APP_SECRET]\nBASEURL=http://localhost:3000</pre>
				<p>The <code>BASEURL</code> variable should match the callback URL specified for your app.</p>
				<p>See also <a target="_blank" href="https://github.com/sveltejs/svelte/tree/master/site#repl-github-integration">here</a></p>
			</body>
		`, {
			'Content-Type': 'text/html; charset=utf-8'
		});
	};

var route_8 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$8
});

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match Latin Unicode letters (excluding mathematical operators). */
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

/** Used to compose unicode character classes. */
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0';

/** Used to compose unicode capture groups. */
var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';

/**
 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
 */
var reComboMark = RegExp(rsCombo, 'g');

/** Used to map Latin Unicode letters to basic Latin letters. */
var deburredLetters = {
  // Latin-1 Supplement block.
  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
  '\xc7': 'C',  '\xe7': 'c',
  '\xd0': 'D',  '\xf0': 'd',
  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
  '\xd1': 'N',  '\xf1': 'n',
  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
  '\xc6': 'Ae', '\xe6': 'ae',
  '\xde': 'Th', '\xfe': 'th',
  '\xdf': 'ss',
  // Latin Extended-A block.
  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
  '\u0134': 'J',  '\u0135': 'j',
  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
  '\u0174': 'W',  '\u0175': 'w',
  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
  '\u0132': 'IJ', '\u0133': 'ij',
  '\u0152': 'Oe', '\u0153': 'oe',
  '\u0149': "'n", '\u017f': 'ss'
};

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyOf(object) {
  return function(key) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
 * letters to basic Latin letters.
 *
 * @private
 * @param {string} letter The matched letter to deburr.
 * @returns {string} Returns the deburred letter.
 */
var deburrLetter = basePropertyOf(deburredLetters);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * _.deburr('déjà vu');
 * // => 'deja vu'
 */
function deburr(string) {
  string = toString(string);
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
}

var lodash_deburr = deburr;

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var escapeStringRegexp = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

var replacements = [
	// German umlauts
	['ß', 'ss'],
	['ä', 'ae'],
	['Ä', 'Ae'],
	['ö', 'oe'],
	['Ö', 'Oe'],
	['ü', 'ue'],
	['Ü', 'Ue'],

	// Vietnamese
	['à', 'a'],
	['À', 'A'],
	['á', 'a'],
	['Á', 'A'],
	['â', 'a'],
	['Â', 'A'],
	['ã', 'a'],
	['Ã', 'A'],
	['è', 'e'],
	['È', 'E'],
	['é', 'e'],
	['É', 'E'],
	['ê', 'e'],
	['Ê', 'E'],
	['ì', 'i'],
	['Ì', 'I'],
	['í', 'i'],
	['Í', 'I'],
	['ò', 'o'],
	['Ò', 'O'],
	['ó', 'o'],
	['Ó', 'O'],
	['ô', 'o'],
	['Ô', 'O'],
	['õ', 'o'],
	['Õ', 'O'],
	['ù', 'u'],
	['Ù', 'U'],
	['ú', 'u'],
	['Ú', 'U'],
	['ý', 'y'],
	['Ý', 'Y'],
	['ă', 'a'],
	['Ă', 'A'],
	['Đ', 'D'],
	['đ', 'd'],
	['ĩ', 'i'],
	['Ĩ', 'I'],
	['ũ', 'u'],
	['Ũ', 'U'],
	['ơ', 'o'],
	['Ơ', 'O'],
	['ư', 'u'],
	['Ư', 'U'],
	['ạ', 'a'],
	['Ạ', 'A'],
	['ả', 'a'],
	['Ả', 'A'],
	['ấ', 'a'],
	['Ấ', 'A'],
	['ầ', 'a'],
	['Ầ', 'A'],
	['ẩ', 'a'],
	['Ẩ', 'A'],
	['ẫ', 'a'],
	['Ẫ', 'A'],
	['ậ', 'a'],
	['Ậ', 'A'],
	['ắ', 'a'],
	['Ắ', 'A'],
	['ằ', 'a'],
	['Ằ', 'A'],
	['ẳ', 'a'],
	['Ẳ', 'A'],
	['ẵ', 'a'],
	['Ẵ', 'A'],
	['ặ', 'a'],
	['Ặ', 'A'],
	['ẹ', 'e'],
	['Ẹ', 'E'],
	['ẻ', 'e'],
	['Ẻ', 'E'],
	['ẽ', 'e'],
	['Ẽ', 'E'],
	['ế', 'e'],
	['Ế', 'E'],
	['ề', 'e'],
	['Ề', 'E'],
	['ể', 'e'],
	['Ể', 'E'],
	['ễ', 'e'],
	['Ễ', 'E'],
	['ệ', 'e'],
	['Ệ', 'E'],
	['ỉ', 'i'],
	['Ỉ', 'I'],
	['ị', 'i'],
	['Ị', 'I'],
	['ọ', 'o'],
	['Ọ', 'O'],
	['ỏ', 'o'],
	['Ỏ', 'O'],
	['ố', 'o'],
	['Ố', 'O'],
	['ồ', 'o'],
	['Ồ', 'O'],
	['ổ', 'o'],
	['Ổ', 'O'],
	['ỗ', 'o'],
	['Ỗ', 'O'],
	['ộ', 'o'],
	['Ộ', 'O'],
	['ớ', 'o'],
	['Ớ', 'O'],
	['ờ', 'o'],
	['Ờ', 'O'],
	['ở', 'o'],
	['Ở', 'O'],
	['ỡ', 'o'],
	['Ỡ', 'O'],
	['ợ', 'o'],
	['Ợ', 'O'],
	['ụ', 'u'],
	['Ụ', 'U'],
	['ủ', 'u'],
	['Ủ', 'U'],
	['ứ', 'u'],
	['Ứ', 'U'],
	['ừ', 'u'],
	['Ừ', 'U'],
	['ử', 'u'],
	['Ử', 'U'],
	['ữ', 'u'],
	['Ữ', 'U'],
	['ự', 'u'],
	['Ự', 'U'],
	['ỳ', 'y'],
	['Ỳ', 'Y'],
	['ỵ', 'y'],
	['Ỵ', 'Y'],
	['ỷ', 'y'],
	['Ỷ', 'Y'],
	['ỹ', 'y'],
	['Ỹ', 'Y'],

	// Arabic
	['ء', 'e'],
	['آ', 'a'],
	['أ', 'a'],
	['ؤ', 'w'],
	['إ', 'i'],
	['ئ', 'y'],
	['ا', 'a'],
	['ب', 'b'],
	['ة', 't'],
	['ت', 't'],
	['ث', 'th'],
	['ج', 'j'],
	['ح', 'h'],
	['خ', 'kh'],
	['د', 'd'],
	['ذ', 'dh'],
	['ر', 'r'],
	['ز', 'z'],
	['س', 's'],
	['ش', 'sh'],
	['ص', 's'],
	['ض', 'd'],
	['ط', 't'],
	['ظ', 'z'],
	['ع', 'e'],
	['غ', 'gh'],
	['ـ', '_'],
	['ف', 'f'],
	['ق', 'q'],
	['ك', 'k'],
	['ل', 'l'],
	['م', 'm'],
	['ن', 'n'],
	['ه', 'h'],
	['و', 'w'],
	['ى', 'a'],
	['ي', 'y'],
	['َ‎', 'a'],
	['ُ', 'u'],
	['ِ‎', 'i'],
	['٠', '0'],
	['١', '1'],
	['٢', '2'],
	['٣', '3'],
	['٤', '4'],
	['٥', '5'],
	['٦', '6'],
	['٧', '7'],
	['٨', '8'],
	['٩', '9'],

	// Persian / Farsi
	['چ', 'ch'],
	['ک', 'k'],
	['گ', 'g'],
	['پ', 'p'],
	['ژ', 'zh'],
	['ی', 'y'],
	['۰', '0'],
	['۱', '1'],
	['۲', '2'],
	['۳', '3'],
	['۴', '4'],
	['۵', '5'],
	['۶', '6'],
	['۷', '7'],
	['۸', '8'],
	['۹', '9'],

	// Pashto
	['ټ', 'p'],
	['ځ', 'z'],
	['څ', 'c'],
	['ډ', 'd'],
	['ﺫ', 'd'],
	['ﺭ', 'r'],
	['ړ', 'r'],
	['ﺯ', 'z'],
	['ږ', 'g'],
	['ښ', 'x'],
	['ګ', 'g'],
	['ڼ', 'n'],
	['ۀ', 'e'],
	['ې', 'e'],
	['ۍ', 'ai'],

	// Urdu
	['ٹ', 't'],
	['ڈ', 'd'],
	['ڑ', 'r'],
	['ں', 'n'],
	['ہ', 'h'],
	['ھ', 'h'],
	['ے', 'e'],

	// Russian
	['А', 'A'],
	['а', 'a'],
	['Б', 'B'],
	['б', 'b'],
	['В', 'V'],
	['в', 'v'],
	['Г', 'G'],
	['г', 'g'],
	['Д', 'D'],
	['д', 'd'],
	['Е', 'E'],
	['е', 'e'],
	['Ж', 'Zh'],
	['ж', 'zh'],
	['З', 'Z'],
	['з', 'z'],
	['И', 'I'],
	['и', 'i'],
	['Й', 'J'],
	['й', 'j'],
	['К', 'K'],
	['к', 'k'],
	['Л', 'L'],
	['л', 'l'],
	['М', 'M'],
	['м', 'm'],
	['Н', 'N'],
	['н', 'n'],
	['О', 'O'],
	['о', 'o'],
	['П', 'P'],
	['п', 'p'],
	['Р', 'R'],
	['р', 'r'],
	['С', 'S'],
	['с', 's'],
	['Т', 'T'],
	['т', 't'],
	['У', 'U'],
	['у', 'u'],
	['Ф', 'F'],
	['ф', 'f'],
	['Х', 'H'],
	['х', 'h'],
	['Ц', 'Cz'],
	['ц', 'cz'],
	['Ч', 'Ch'],
	['ч', 'ch'],
	['Ш', 'Sh'],
	['ш', 'sh'],
	['Щ', 'Shh'],
	['щ', 'shh'],
	['Ъ', ''],
	['ъ', ''],
	['Ы', 'Y'],
	['ы', 'y'],
	['Ь', ''],
	['ь', ''],
	['Э', 'E'],
	['э', 'e'],
	['Ю', 'Yu'],
	['ю', 'yu'],
	['Я', 'Ya'],
	['я', 'ya'],
	['Ё', 'Yo'],
	['ё', 'yo'],

	// Romanian
	['ș', 's'],
	['Ș', 's'],
	['ț', 't'],
	['Ț', 't'],

	// Turkish
	['ş', 's'],
	['Ş', 's'],
	['ç', 'c'],
	['Ç', 'c'],
	['ğ', 'g'],
	['Ğ', 'g'],
	['ı', 'i'],
	['İ', 'i']
];

var overridableReplacements = [
	['&', ' and '],
	['🦄', ' unicorn '],
	['♥', ' love ']
];

const decamelize = string => {
	return string
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
};

const doCustomReplacements = (string, replacements) => {
	for (const [key, value] of replacements) {
		string = string.replace(new RegExp(escapeStringRegexp(key), 'g'), value);
	}

	return string;
};

const removeMootSeparators = (string, separator) => {
	return string
		.replace(new RegExp(`${separator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
};

const slugify = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		separator: '-',
		lowercase: true,
		decamelize: true,
		customReplacements: [],
		...options
	};

	const separator = escapeStringRegexp(options.separator);
	const customReplacements = new Map([
		...overridableReplacements,
		...options.customReplacements,
		...replacements
	]);

	string = doCustomReplacements(string, customReplacements);
	string = lodash_deburr(string);
	string = string.normalize('NFKD');

	if (options.decamelize) {
		string = decamelize(string);
	}

	let patternSlug = /[^a-zA-Z\d]+/g;

	if (options.lowercase) {
		string = string.toLowerCase();
		patternSlug = /[^a-z\d]+/g;
	}

	string = string.replace(patternSlug, separator);
	string = string.replace(/\\/g, '');
	string = removeMootSeparators(string, separator);

	return string;
};

var slugify_1 = slugify;
// TODO: Remove this for the next major release
var _default = slugify;
slugify_1.default = _default;

const SLUG_PRESERVE_UNICODE = false;
const SLUG_SEPARATOR = '_';

/* url-safe processor */

const urlsafeSlugProcessor = string =>
	slugify_1(string, {
		customReplacements: [	// runs before any other transformations
			['$', 'DOLLAR'], // `$destroy` & co
			['-', 'DASH'], // conflicts with `separator`
		],
		separator: SLUG_SEPARATOR,
		decamelize: false,
		lowercase: false
	})
		.replace(/DOLLAR/g, '$')
		.replace(/DASH/g, '-');

/* unicode-preserver processor */

const alphaNumRegex = /[a-zA-Z0-9]/;
const unicodeRegex = /\p{Letter}/u;
const isNonAlphaNumUnicode =
	string => !alphaNumRegex.test(string) && unicodeRegex.test(string);

const unicodeSafeProcessor = string =>
	string.split('')
		.reduce((accum, char, index, array) => {
			const type = isNonAlphaNumUnicode(char) ? 'pass' : 'process';

			if (index === 0) {
				accum.current = {type, string: char};
			} else if (type === accum.current.type) {
				accum.current.string += char;
			} else {
				accum.chunks.push(accum.current);
				accum.current = {type, string: char};
			}

			if (index === array.length - 1) {
				accum.chunks.push(accum.current);
			}

			return accum;
		}, {chunks: [], current: {type: '', string: ''}})
		.chunks
		.reduce((accum, chunk) => {
			const processed = chunk.type === 'process'
				? urlsafeSlugProcessor(chunk.string)
				: chunk.string;

			processed.length > 0 && accum.push(processed);

			return accum;
		}, [])
		.join(SLUG_SEPARATOR);

/* processor */

const makeSlugProcessor = (preserveUnicode = false) => preserveUnicode
	? unicodeSafeProcessor
	: urlsafeSlugProcessor;

const makeSlug = makeSlugProcessor(SLUG_PRESERVE_UNICODE);

function get_posts() {
	return fs__default['default']
		.readdirSync('content/blog')
		.map(file => {
			if (path__default['default'].extname(file) !== '.md') return;

			const match = /^(\d+-\d+-\d+)-(.+)\.md$/.exec(file);
			if (!match) throw new Error(`Invalid filename '${file}'`);

			const [, pubdate, slug] = match;

			const markdown = fs__default['default'].readFileSync(`content/blog/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const date = new Date(`${pubdate} EDT`); // cheeky hack
			metadata.pubdate = pubdate;
			metadata.dateString = date.toDateString();

			const renderer = new marked__default['default'].Renderer();

			renderer.link = link_renderer;

			renderer.code = highlight;

			renderer.heading = (text, level, rawtext) => {
				const fragment = makeSlug(rawtext);

				return `
					<h${level}>
						<span id="${fragment}" class="offset-anchor"></span>
						<a href="blog/${slug}#${fragment}" class="anchor" aria-hidden="true"></a>
						${text}
					</h${level}>`;
			};

			const html = marked__default['default'](
				content.replace(/^\t+/gm, match => match.split('\t').join('  ')),
				{ renderer }
			);

			return {
				html,
				metadata,
				slug
			};
		})
		.sort((a, b) => a.metadata.pubdate < b.metadata.pubdate ? 1 : -1);
}

let json$1;

function get$9(req, res) {
	if (!json$1 || "development" !== 'production') {
		const posts = get_posts()
			.filter(post => !post.metadata.draft)
			.map(post => {
				return {
					slug: post.slug,
					metadata: post.metadata
				};
			});

		json$1 = JSON.stringify(posts);
	}

	send__default['default'](res, 200, json$1, {
		'Content-Type': 'application/json',
		'Cache-Control': `max-age=${5 * 60 * 1e3}` // 5 minutes
	});
}

var route_9 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$9
});

const months = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');

function formatPubdate(str) {
	const [y, m, d] = str.split('-');
	return `${d} ${months[+m]} ${y} 12:00 +0000`;
}

function escapeHTML(html) {
	const chars = {
		'"' : 'quot',
		"'": '#39',
		'&': 'amp',
		'<' : 'lt',
		'>' : 'gt'
	};

	return html.replace(/["'&<>]/g, c => `&${chars[c]};`);
}

const rss = `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
	<title>Svelte blog</title>
	<link>https://svelte.dev/blog</link>
	<description>News and information about the magical disappearing UI framework</description>
	<image>
		<url>https://svelte.dev/favicon.png</url>
		<title>Svelte</title>
		<link>https://svelte.dev/blog</link>
	</image>
	${get_posts().filter(post => !post.metadata.draft).map(post => `
		<item>
			<title>${escapeHTML(post.metadata.title)}</title>
			<link>https://svelte.dev/blog/${post.slug}</link>
			<description>${escapeHTML(post.metadata.description)}</description>
			<pubDate>${formatPubdate(post.metadata.pubdate)}</pubDate>
		</item>
	`).join('')}
</channel>

</rss>
`.replace(/>[^\S]+/gm, '>').replace(/[^\S]+</gm, '<').trim();

function get$a(req, res) {
	send__default['default'](res, 200, rss, {
		'Cache-Control': `max-age=${30 * 60 * 1e3}`,
		'Content-Type': 'application/rss+xml'
	});
}

var route_10 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$a
});

let lookup$1;

function get$b(req, res) {
	if (!lookup$1 || "development" !== 'production') {
		lookup$1 = new Map();
		get_posts().forEach(post => {
			lookup$1.set(post.slug, post);
		});
	}

	const post = lookup$1.get(req.params.slug);

	if (post) {
		res.setHeader('Cache-Control', `max-age=${5 * 60 * 1e3}`); // 5 minutes
		send__default['default'](res, 200, post);
	} else {
		send__default['default'](res, 404, { message: 'not found' });
	}
}

var route_11 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$b
});

function get$c(req, res) {
	res.writeHead(302, { Location: 'https://discord.gg/yy75DKs' });
	res.end();
}

var route_12 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$c
});

const SLUG_PRESERVE_UNICODE$1 = false;
const SLUG_SEPARATOR$1 = '_';

/* url-safe processor */

const urlsafeSlugProcessor$1 = (string, opts) => {
	const { separator = SLUG_SEPARATOR$1 } = opts || {};

	return slugify_1(string, {
		customReplacements: [	// runs before any other transformations
			['$', 'DOLLAR'], // `$destroy` & co
			['-', 'DASH'], // conflicts with `separator`
		],
		separator,
		decamelize: false,
		lowercase: false
	})
	.replace(/DOLLAR/g, '$')
	.replace(/DASH/g, '-');
};

/* unicode-preserver processor */

const alphaNumRegex$1 = /[a-zA-Z0-9]/;
const unicodeRegex$1 = /\p{Letter}/u;
const isNonAlphaNumUnicode$1 =
	string => !alphaNumRegex$1.test(string) && unicodeRegex$1.test(string);

const unicodeSafeProcessor$1 = (string, opts) => {
	const { separator = SLUG_SEPARATOR$1 } = opts || {};

	return string.split('')
	.reduce((accum, char, index, array) => {
		const type = isNonAlphaNumUnicode$1(char) ? 'pass' : 'process';

		if (index === 0) {
			accum.current = {type, string: char};
		} else if (type === accum.current.type) {
			accum.current.string += char;
		} else {
			accum.chunks.push(accum.current);
			accum.current = {type, string: char};
		}

		if (index === array.length - 1) {
			accum.chunks.push(accum.current);
		}

		return accum;
	}, {chunks: [], current: {type: '', string: ''}})
	.chunks
	.reduce((accum, chunk) => {
		const processed = chunk.type === 'process'
			? urlsafeSlugProcessor$1(chunk.string)
			: chunk.string;

		processed.length > 0 && accum.push(processed);

		return accum;
	}, [])
	.join(separator);
};

/* session processor */

const make_session_slug_processor = ({
	preserve_unicode = SLUG_PRESERVE_UNICODE$1,
	separator = SLUG_SEPARATOR$1
}) => {
	const processor = preserve_unicode ? unicodeSafeProcessor$1 : urlsafeSlugProcessor$1;
	const seen = new Set();

	return string => {
		const slug = processor(string, { separator });

		if (seen.has(slug)) throw new Error(`Duplicate slug ${slug}`);
		seen.add(slug);

		return slug;
	}
};

const blockTypes = [
	'blockquote',
	'html',
	'heading',
	'hr',
	'list',
	'listitem',
	'paragraph',
	'table',
	'tablerow',
	'tablecell'
];

function get_sections$1() {
	const make_slug = make_session_slug_processor({
		preserve_unicode: SLUG_PRESERVE_UNICODE,
		separator: SLUG_SEPARATOR
	});

	return fs__default['default']
		.readdirSync(`content/docs`)
		.filter(file => file[0] !== '.' && path__default['default'].extname(file) === '.md')
		.map(file => {
			const markdown = fs__default['default'].readFileSync(`content/docs/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const section_slug = make_slug(metadata.title);

			const subsections = [];

			const renderer = new marked__default['default'].Renderer();

			let block_open = false;

			renderer.link = link_renderer;

			renderer.hr = () => {
				block_open = true;

				return '<div class="side-by-side"><div class="copy">';
			};

			renderer.code = (source, lang) => {
				source = source.replace(/^ +/gm, match =>
					match.split('    ').join('\t')
				);

				const lines = source.split('\n');

				const meta = extract_metadata(lines[0], lang);

				let prefix = '';
				let className = 'code-block';

				if (meta) {
					source = lines.slice(1).join('\n');
					const filename = meta.filename || (lang === 'html' && 'App.svelte');
					if (filename) {
						prefix = `<span class='filename'>${prefix} ${filename}</span>`;
						className += ' named';
					}
				}

				if (meta && meta.hidden) return '';

				const html = `<div class='${className}'>${prefix}${highlight(source, lang)}</div>`;

				if (block_open) {
					block_open = false;
					return `</div><div class="code">${html}</div></div>`;
				}

				return html;
			};

			renderer.heading = (text, level, rawtext) => {
				let slug;

				const match = /<a href="([^"]+)"[^>]*>(.+)<\/a>/.exec(text);
				if (match) {
					slug = match[1];
					text = match[2];
				} else {
					slug = make_slug(rawtext);
				}

				if (level === 3 || level === 4) {
					const title = text
						.replace(/<\/?code>/g, '')
						.replace(/\.(\w+)(\((.+)?\))?/, (m, $1, $2, $3) => {
							if ($3) return `.${$1}(...)`;
							if ($2) return `.${$1}()`;
							return `.${$1}`;
						});

					subsections.push({ slug, title, level });
				}

				return `
					<h${level}>
						<span id="${slug}" class="offset-anchor" ${level > 4 ? 'data-scrollignore' : ''}></span>
						<a href="docs#${slug}" class="anchor" aria-hidden="true"></a>
						${text}
					</h${level}>`;
			};

			blockTypes.forEach(type => {
				const fn = renderer[type];
				renderer[type] = function() {
					return fn.apply(this, arguments);
				};
			});

			const html = marked__default['default'](content, { renderer });

			const hashes = {};

			return {
				html: html.replace(/@@(\d+)/g, (m, id) => hashes[id] || m),
				metadata,
				subsections,
				slug: section_slug,
				file,
			};
		});
}

let json$2;

function get$d(req, res) {
	if (!json$2 || "development" !== 'production') {
		json$2 = get_sections$1();
	}

	send__default['default'](res, 200, json$2);
}

var route_13 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$d
});

function body(req) {
	return new Promise((fulfil, reject) => {
		let str = '';

		req.on('error', reject);

		req.on('data', chunk => {
			str += chunk;
		});

		req.on('end', () => {
			try {
				fulfil(JSON.parse(str));
			} catch (err) {
				reject(err);
			}
		});
	});
}

async function post(req, res) {
	const { user } = req;
	if (!user) return; // response already sent

	try {
		const { name, files } = await body(req);

		const [row] = await query(`
			insert into gists(user_id, name, files)
			values ($1, $2, $3) returning *`, [user.id, name, JSON.stringify(files)]);

		send__default['default'](res, 201, {
			uid: row.uid.replace(/-/g, ''),
			name: row.name,
			files: row.files,
			owner: user.uid,
		});
	} catch (err) {
		send__default['default'](res, 500, {
			error: err.message
		});
	}
}

var route_14 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	post: post
});

function get$e(req, res) {
	const path = req.params.file.join('/');
	if ( ('/' + path).includes('/.')) {
		res.writeHead(403);
		res.end();
		return;
	}
	fs.createReadStream('../' + path)
		.on('error', () => {
			res.writeHead(403);
			res.end();
		})
		.pipe(res);
	res.writeHead(200, { 'Content-Type': 'text/javascript' });
}

var route_15 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$e
});

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

async function get$f(req, res) {
	// is this an example?
	const example = get_example(req.params.id);

	if (example) {
		return send__default['default'](res, 200, {
			relaxed: true,
			uid: req.params.id,
			name: example.title,
			files: example.files,
			owner: null
		});
	}

	{
		// In dev, proxy requests to load particular REPLs to the real server.
		// This avoids needing to connect to the real database server.
		req.pipe(
			require('https').request({ host: 'svelte.dev', path: req.url })
		).once('response', res_proxy => {
			res_proxy.pipe(res);
			res.writeHead(res_proxy.statusCode, res_proxy.headers);
		}).once('error', () => res.end());
		return;
	}
}

async function patch(req, res) {
	const { user } = req;
	if (!user) return;

	let id;
	const uid = req.params.id;

	try {
		const [row] = await query(`select * from gists where uid = $1 limit 1`, [uid]);
		if (!row) return send__default['default'](res, 404, { error: 'Gist not found' });
		if (row.user_id !== user.id) return send__default['default'](res, 403, { error: 'Item does not belong to you' });
		id = row.id;
	} catch (err) {
		console.error('PATCH /gists @ select', err);
		return send__default['default'](res, 500);
	}

	try {
		const obj = await body(req);
		obj.updated_at = 'now()';
		let k;
		const cols = [];
		const vals = [];
		for (k in obj) {
			cols.push(k);
			vals.push(k === 'files' ? JSON.stringify(obj[k]) : obj[k]);
		}

		const tmp = vals.map((x, i) => `$${i + 1}`).join(',');
		const set = `set (${cols.join(',')}) = (${tmp})`;

		const [row] = await query(`update gists ${set} where id = ${id} returning *`, vals);

		send__default['default'](res, 200, {
			uid: row.uid.replace(/-/g, ''),
			name: row.name,
			files: row.files,
			owner: user.uid,
		});
	} catch (err) {
		console.error('PATCH /gists @ update', err);
		send__default['default'](res, 500, { error: err.message });
	}
}

var route_16 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$f,
	patch: patch
});

const makeSlug$1 = makeSlugProcessor(SLUG_PRESERVE_UNICODE);

function get_faqs() {
	return fs__default['default']
		.readdirSync('content/faq')
		.map(file => {
			if (path__default['default'].extname(file) !== '.md') return;

			const match = /^([0-9]+)-(.+)\.md$/.exec(file);
			if (!match) throw new Error(`Invalid filename '${file}'`);

			const [, order, slug] = match;

			const markdown = fs__default['default'].readFileSync(`content/faq/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const renderer = new marked__default['default'].Renderer();

			renderer.link = link_renderer;

			renderer.code = highlight;

			renderer.heading = (text, level, rawtext) => {
				const fragment = makeSlug$1(rawtext);

				return `
					<h${level}>
						<span id="${fragment}" class="offset-anchor"></span>
						<a href="faq#${fragment}" class="anchor" aria-hidden="true"></a>
						${text}
					</h${level}>`;
			};

			const answer = marked__default['default'](
				content.replace(/^\t+/gm, match => match.split('\t').join('  ')),
				{ renderer }
			);

			const fragment = makeSlug$1(slug);

			return {
				fragment,
				order,
				answer,
				metadata
			};
		})
		.sort((a, b) => a.order - b.order);
}

let json$3;

function get$g(req, res) {
	if (!json$3 || "development" !== 'production') {
		const faqs = get_faqs()
			.map(faq => {
				return {
					fragment: faq.fragment,
					answer: faq.answer,
					metadata: faq.metadata
				};
			});

		json$3 = JSON.stringify(faqs);
	}

	send__default['default'](res, 200, json$3, {
		'Content-Type': 'application/json',
		'Cache-Control': `max-age=${5 * 60 * 1e3}` // 5 minutes
	});
}

var route_17 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get: get$g
});

function noop$1() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop$1;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function null_to_empty(value) {
    return value == null ? '' : value;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop$1;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function add_classes(classes) {
    return classes ? ` class="${classes}"` : '';
}

/* node_modules/@sveltejs/site-kit/components/Section.svelte generated by Svelte v3.31.0 */

const css = {
	code: "section.svelte-1ojx4sy{position:relative;margin:10rem auto;padding:0 var(--side-nav);max-width:120rem}section.svelte-1ojx4sy h3{color:var(--text)}",
	map: "{\"version\":3,\"file\":\"Section.svelte\",\"sources\":[\"Section.svelte\"],\"sourcesContent\":[\"<style>\\n\\tsection {\\n\\t\\tposition: relative;\\n\\t\\tmargin: 10rem auto;\\n\\t\\tpadding: 0 var(--side-nav);\\n\\t\\tmax-width: 120rem;\\n\\t}\\n\\n\\tsection :global(h3) {\\n\\t\\tcolor: var(--text);\\n\\t}\\n</style>\\n\\n<section>\\n\\t<slot></slot>\\n</section>\"],\"names\":[],\"mappings\":\"AACC,OAAO,eAAC,CAAC,AACR,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,KAAK,CAAC,IAAI,CAClB,OAAO,CAAE,CAAC,CAAC,IAAI,UAAU,CAAC,CAC1B,SAAS,CAAE,MAAM,AAClB,CAAC,AAED,sBAAO,CAAC,AAAQ,EAAE,AAAE,CAAC,AACpB,KAAK,CAAE,IAAI,MAAM,CAAC,AACnB,CAAC\"}"
};

const Section = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css);
	return `<section class="${"svelte-1ojx4sy"}">${slots.default ? slots.default({}) : ``}</section>`;
});

/* node_modules/@sveltejs/site-kit/components/Blurb.svelte generated by Svelte v3.31.0 */

const css$1 = {
	code: ".blurb.svelte-1377vhn{display:grid;grid-row-gap:1em;grid-template-areas:\"one\"\n\t\t\t\"two\"\n\t\t\t\"three\"\n\t\t\t\"what\"\n\t\t\t\"how\"}.box.svelte-1377vhn{padding:1em;display:flex;flex-direction:column;border-bottom:none}.box.svelte-1377vhn a{color:white;padding:0;border:none}.box.svelte-1377vhn h2{padding:0;margin:0 0 0.5em 0;font-size:var(--h2);color:white;text-align:left}.blurb.svelte-1377vhn p{font-size:var(--h5)}.box.svelte-1377vhn .learn-more{display:block;position:relative;text-align:right;margin-top:auto;padding:0 1.2em 0 0}.box.svelte-1377vhn:hover .learn-more{color:white;text-decoration:underline}.box.svelte-1377vhn .learn-more::after,.box.svelte-1377vhn .cta a::after{content:'';position:absolute;display:block;right:0;top:0.3em;width:1em;height:1em;background:url(/icons/arrow-right.svg);background-size:100% 100%}.how.svelte-1377vhn{min-width:0}.how.svelte-1377vhn .cta a{display:inline-block;text-align:right;background-color:var(--prime);padding:0.5em 1.8em 0.5em 1em;border-radius:var(--border-r);border:none;color:white;position:relative}.how.svelte-1377vhn .cta a::after{right:0.5em;top:0.75em}.what.svelte-1377vhn{margin:2em 0 0 0}.how.svelte-1377vhn .cta{margin:0}@media(min-width: 900px){.blurb.svelte-1377vhn{grid-column-gap:1em;grid-row-gap:1em;grid-template-columns:repeat(2, 1fr);grid-template-areas:\"one two\"\n\t\t\t\t\"three how\"\n\t\t\t\t\"what what\"}.box.svelte-1377vhn{padding:2em}.box.svelte-1377vhn .cta{text-align:right}}@media(min-width: 1200px){.blurb.svelte-1377vhn{grid-column-gap:1em;grid-row-gap:5em;grid-template-columns:repeat(6, 1fr);grid-template-areas:\"one one two two three three\"\n\t\t\t\t\"what what what how how how\"}.what.svelte-1377vhn{margin:0}.box.svelte-1377vhn .cta{text-align:left}}",
	map: "{\"version\":3,\"file\":\"Blurb.svelte\",\"sources\":[\"Blurb.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport Section from './Section.svelte';\\n</script>\\n\\n<style>\\n\\t.blurb {\\n\\t\\tdisplay: grid;\\n\\t\\tgrid-row-gap: 1em;\\n\\t\\tgrid-template-areas:\\n\\t\\t\\t\\\"one\\\"\\n\\t\\t\\t\\\"two\\\"\\n\\t\\t\\t\\\"three\\\"\\n\\t\\t\\t\\\"what\\\"\\n\\t\\t\\t\\\"how\\\";\\n\\t}\\n\\n\\t.box {\\n\\t\\tpadding: 1em;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tborder-bottom: none;\\n\\t}\\n\\n\\t.box :global(a) {\\n\\t\\tcolor: white;\\n\\t\\tpadding: 0;\\n\\t\\tborder: none;\\n\\t}\\n\\n\\t.box :global(h2) {\\n\\t\\tpadding: 0;\\n\\t\\tmargin: 0 0 0.5em 0;\\n\\t\\tfont-size: var(--h2);\\n\\t\\tcolor: white;\\n\\t\\ttext-align: left;\\n\\t}\\n\\n\\t.blurb :global(p) {\\n\\t\\tfont-size: var(--h5);\\n\\t}\\n\\n\\t.box :global(.learn-more) {\\n\\t\\tdisplay: block;\\n\\t\\tposition: relative;\\n\\t\\ttext-align: right;\\n\\t\\tmargin-top: auto;\\n\\t\\tpadding: 0 1.2em 0 0;\\n\\t}\\n\\n\\t.box:hover :global(.learn-more) {\\n\\t\\tcolor: white;\\n\\t\\ttext-decoration: underline;\\n\\t}\\n\\n\\t.box :global(.learn-more)::after, .box :global(.cta) :global(a)::after {\\n\\t\\tcontent: '';\\n\\t\\tposition: absolute;\\n\\t\\tdisplay: block;\\n\\t\\tright: 0;\\n\\t\\ttop: 0.3em;\\n\\t\\twidth: 1em;\\n\\t\\theight: 1em;\\n\\t\\tbackground: url(/icons/arrow-right.svg);\\n\\t\\tbackground-size: 100% 100%;\\n\\t}\\n\\n\\t.how {\\n\\t\\t/* needed to prevent the <pre> from\\n\\t\\t   breaking the grid layout */\\n\\t\\tmin-width: 0;\\n\\t}\\n\\n\\t.how :global(.cta) :global(a) {\\n\\t\\tdisplay: inline-block;\\n\\t\\ttext-align: right;\\n\\t\\tbackground-color: var(--prime);\\n\\t\\tpadding: 0.5em 1.8em 0.5em 1em;\\n\\t\\tborder-radius: var(--border-r);\\n\\t\\tborder: none;\\n\\t\\tcolor: white;\\n\\t\\tposition: relative;\\n\\t}\\n\\n\\t.how :global(.cta) :global(a)::after {\\n\\t\\tright: 0.5em;\\n\\t\\ttop: 0.75em;\\n\\t}\\n\\n\\t.what {\\n\\t\\tmargin: 2em 0 0 0;\\n\\t}\\n\\n\\t.how :global(.cta) {\\n\\t\\tmargin: 0;\\n\\t}\\n\\n\\t@media (min-width: 900px) {\\n\\t\\t.blurb {\\n\\t\\t\\tgrid-column-gap: 1em;\\n\\t\\t\\tgrid-row-gap: 1em;\\n\\t\\t\\tgrid-template-columns: repeat(2, 1fr);\\n\\t\\t\\tgrid-template-areas:\\n\\t\\t\\t\\t\\\"one two\\\"\\n\\t\\t\\t\\t\\\"three how\\\"\\n\\t\\t\\t\\t\\\"what what\\\";\\n\\t\\t}\\n\\n\\t\\t.box {\\n\\t\\t\\tpadding: 2em;\\n\\t\\t}\\n\\n\\t\\t.box :global(.cta) {\\n\\t\\t\\ttext-align: right;\\n\\t\\t}\\n\\t}\\n\\n\\t@media (min-width: 1200px) {\\n\\t\\t.blurb {\\n\\t\\t\\tgrid-column-gap: 1em;\\n\\t\\t\\tgrid-row-gap: 5em;\\n\\t\\t\\tgrid-template-columns: repeat(6, 1fr);\\n\\t\\t\\tgrid-template-areas:\\n\\t\\t\\t\\t\\\"one one two two three three\\\"\\n\\t\\t\\t\\t\\\"what what what how how how\\\";\\n\\t\\t}\\n\\n\\t\\t.what {\\n\\t\\t\\tmargin: 0;\\n\\t\\t}\\n\\n\\t\\t.box :global(.cta) {\\n\\t\\t\\ttext-align: left;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<Section>\\n\\t<div class=\\\"blurb\\\">\\n\\t\\t<div class=\\\"box\\\" style=\\\"background: var(--prime); grid-area: one;\\\">\\n\\t\\t\\t<slot name=\\\"one\\\"></slot>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\\"box\\\" style=\\\"background: var(--flash); grid-area: two;\\\">\\n\\t\\t\\t<slot name=\\\"two\\\"></slot>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\\"box\\\" style=\\\"background: var(--second); grid-area: three;\\\">\\n\\t\\t\\t<slot name=\\\"three\\\"></slot>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\\"what\\\" style=\\\"grid-area: what;\\\">\\n\\t\\t\\t<slot name=\\\"what\\\"></slot>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\\"how\\\" style=\\\"grid-area: how;\\\">\\n\\t\\t\\t<slot name=\\\"how\\\"></slot>\\n\\t\\t</div>\\n\\t</div>\\n</Section>\\n\"],\"names\":[],\"mappings\":\"AAKC,MAAM,eAAC,CAAC,AACP,OAAO,CAAE,IAAI,CACb,YAAY,CAAE,GAAG,CACjB,mBAAmB,CAClB,KAAK;GACL,KAAK;GACL,OAAO;GACP,MAAM;GACN,KAAK,AACP,CAAC,AAED,IAAI,eAAC,CAAC,AACL,OAAO,CAAE,GAAG,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,aAAa,CAAE,IAAI,AACpB,CAAC,AAED,mBAAI,CAAC,AAAQ,CAAC,AAAE,CAAC,AAChB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,IAAI,AACb,CAAC,AAED,mBAAI,CAAC,AAAQ,EAAE,AAAE,CAAC,AACjB,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CACnB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,KAAK,CAAE,KAAK,CACZ,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,qBAAM,CAAC,AAAQ,CAAC,AAAE,CAAC,AAClB,SAAS,CAAE,IAAI,IAAI,CAAC,AACrB,CAAC,AAED,mBAAI,CAAC,AAAQ,WAAW,AAAE,CAAC,AAC1B,OAAO,CAAE,KAAK,CACd,QAAQ,CAAE,QAAQ,CAClB,UAAU,CAAE,KAAK,CACjB,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,AACrB,CAAC,AAED,mBAAI,MAAM,CAAC,AAAQ,WAAW,AAAE,CAAC,AAChC,KAAK,CAAE,KAAK,CACZ,eAAe,CAAE,SAAS,AAC3B,CAAC,AAED,mBAAI,CAAC,AAAQ,WAAW,AAAC,OAAO,CAAE,mBAAI,CAAC,AAAQ,IAAI,AAAC,CAAC,AAAQ,CAAC,AAAC,OAAO,AAAC,CAAC,AACvE,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,CAAC,CACR,GAAG,CAAE,KAAK,CACV,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,UAAU,CAAE,IAAI,sBAAsB,CAAC,CACvC,eAAe,CAAE,IAAI,CAAC,IAAI,AAC3B,CAAC,AAED,IAAI,eAAC,CAAC,AAGL,SAAS,CAAE,CAAC,AACb,CAAC,AAED,mBAAI,CAAC,AAAQ,IAAI,AAAC,CAAC,AAAQ,CAAC,AAAE,CAAC,AAC9B,OAAO,CAAE,YAAY,CACrB,UAAU,CAAE,KAAK,CACjB,gBAAgB,CAAE,IAAI,OAAO,CAAC,CAC9B,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,GAAG,CAC9B,aAAa,CAAE,IAAI,UAAU,CAAC,CAC9B,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,KAAK,CACZ,QAAQ,CAAE,QAAQ,AACnB,CAAC,AAED,mBAAI,CAAC,AAAQ,IAAI,AAAC,CAAC,AAAQ,CAAC,AAAC,OAAO,AAAC,CAAC,AACrC,KAAK,CAAE,KAAK,CACZ,GAAG,CAAE,MAAM,AACZ,CAAC,AAED,KAAK,eAAC,CAAC,AACN,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AAClB,CAAC,AAED,mBAAI,CAAC,AAAQ,IAAI,AAAE,CAAC,AACnB,MAAM,CAAE,CAAC,AACV,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,MAAM,eAAC,CAAC,AACP,eAAe,CAAE,GAAG,CACpB,YAAY,CAAE,GAAG,CACjB,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,CACrC,mBAAmB,CAClB,SAAS;IACT,WAAW;IACX,WAAW,AACb,CAAC,AAED,IAAI,eAAC,CAAC,AACL,OAAO,CAAE,GAAG,AACb,CAAC,AAED,mBAAI,CAAC,AAAQ,IAAI,AAAE,CAAC,AACnB,UAAU,CAAE,KAAK,AAClB,CAAC,AACF,CAAC,AAED,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3B,MAAM,eAAC,CAAC,AACP,eAAe,CAAE,GAAG,CACpB,YAAY,CAAE,GAAG,CACjB,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,CACrC,mBAAmB,CAClB,6BAA6B;IAC7B,4BAA4B,AAC9B,CAAC,AAED,KAAK,eAAC,CAAC,AACN,MAAM,CAAE,CAAC,AACV,CAAC,AAED,mBAAI,CAAC,AAAQ,IAAI,AAAE,CAAC,AACnB,UAAU,CAAE,IAAI,AACjB,CAAC,AACF,CAAC\"}"
};

const Blurb = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css$1);

	return `${validate_component(Section, "Section").$$render($$result, {}, {}, {
		default: () => `<div class="${"blurb svelte-1377vhn"}"><div class="${"box svelte-1377vhn"}" style="${"background: var(--prime); grid-area: one;"}">${slots.one ? slots.one({}) : ``}</div>

		<div class="${"box svelte-1377vhn"}" style="${"background: var(--flash); grid-area: two;"}">${slots.two ? slots.two({}) : ``}</div>

		<div class="${"box svelte-1377vhn"}" style="${"background: var(--second); grid-area: three;"}">${slots.three ? slots.three({}) : ``}</div>

		<div class="${"what svelte-1377vhn"}" style="${"grid-area: what;"}">${slots.what ? slots.what({}) : ``}</div>

		<div class="${"how svelte-1377vhn"}" style="${"grid-area: how;"}">${slots.how ? slots.how({}) : ``}</div></div>`
	})}`;
});

/* node_modules/@sveltejs/site-kit/components/Icon.svelte generated by Svelte v3.31.0 */

const css$2 = {
	code: ".icon.svelte-5yec89{position:relative;overflow:hidden;vertical-align:middle;-o-object-fit:contain;object-fit:contain;-webkit-transform-origin:center center;transform-origin:center center;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}",
	map: "{\"version\":3,\"file\":\"Icon.svelte\",\"sources\":[\"Icon.svelte\"],\"sourcesContent\":[\"<!--\\n-----------------------------------------------\\n\\tsvg icon\\n\\t- https://github.com/jacobmischka/svelte-feather-icon\\n\\t- https://feathericons.com/\\n-----------------------------------------------\\n-->\\n\\n<script>\\n\\texport let name;\\n\\texport let size = 20;\\n</script>\\n\\n<svg class=\\\"icon\\\" width={size} height={size}>\\n\\t<use xlink:href='#{name}' />\\n</svg>\\n\\n<style>\\n\\t.icon {\\n\\t\\tposition: relative;\\n\\t\\toverflow: hidden;\\n\\t\\tvertical-align: middle;\\n\\t\\t-o-object-fit: contain;\\n\\t\\tobject-fit: contain;\\n\\t\\t-webkit-transform-origin: center center;\\n\\t\\ttransform-origin: center center;\\n\\t\\tstroke: currentColor;\\n\\t\\tstroke-width: 2;\\n\\t\\tstroke-linecap: round;\\n\\t\\tstroke-linejoin: round;\\n\\t\\tfill: none;\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAkBC,KAAK,cAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,QAAQ,CAAE,MAAM,CAChB,cAAc,CAAE,MAAM,CACtB,aAAa,CAAE,OAAO,CACtB,UAAU,CAAE,OAAO,CACnB,wBAAwB,CAAE,MAAM,CAAC,MAAM,CACvC,gBAAgB,CAAE,MAAM,CAAC,MAAM,CAC/B,MAAM,CAAE,YAAY,CACpB,YAAY,CAAE,CAAC,CACf,cAAc,CAAE,KAAK,CACrB,eAAe,CAAE,KAAK,CACtB,IAAI,CAAE,IAAI,AACX,CAAC\"}"
};

const Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { name } = $$props;
	let { size = 20 } = $$props;
	if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
	if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
	$$result.css.add(css$2);

	return `



<svg class="${"icon svelte-5yec89"}"${add_attribute("width", size, 0)}${add_attribute("height", size, 0)}><use xlink:href="${"#" + escape(name)}"></use></svg>`;
});

/* node_modules/@sveltejs/site-kit/components/GuideContents.svelte generated by Svelte v3.31.0 */

const css$3 = {
	code: ".reference-toc.svelte-mm3tjv li.svelte-mm3tjv{display:block;line-height:1.2;margin:0 0 4rem 0}a.svelte-mm3tjv.svelte-mm3tjv{position:relative;transition:color 0.2s;border-bottom:none;padding:0;color:var(--second)}.section.svelte-mm3tjv.svelte-mm3tjv{display:block;padding:0 0 .8rem 0;font-size:var(--h6);text-transform:uppercase;letter-spacing:0.1em;font-weight:600}.subsection.svelte-mm3tjv.svelte-mm3tjv{display:block;font-size:1.6rem;font-family:var(--font);padding:0 0 0.6em 0}.section.svelte-mm3tjv.svelte-mm3tjv:hover,.subsection.svelte-mm3tjv.svelte-mm3tjv:hover,.active.svelte-mm3tjv.svelte-mm3tjv{color:var(--flash)}.subsection[data-level=\"4\"].svelte-mm3tjv.svelte-mm3tjv{padding-left:1.2rem}.icon-container.svelte-mm3tjv.svelte-mm3tjv{position:absolute;top:-.2rem;right:2.4rem}@media(min-width: 832px){a.svelte-mm3tjv.svelte-mm3tjv{color:var(--sidebar-text)}a.svelte-mm3tjv.svelte-mm3tjv:hover,.section.svelte-mm3tjv.svelte-mm3tjv:hover,.subsection.svelte-mm3tjv.svelte-mm3tjv:hover,.active.svelte-mm3tjv.svelte-mm3tjv{color:white\n\t\t}}",
	map: "{\"version\":3,\"file\":\"GuideContents.svelte\",\"sources\":[\"GuideContents.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { afterUpdate } from 'svelte';\\n\\timport Icon from './Icon.svelte';\\n\\n\\texport let sections = [];\\n\\texport let active_section = null;\\n\\texport let show_contents;\\n\\texport let prevent_sidebar_scroll = false;\\n\\texport let dir;\\n\\n\\tlet ul;\\n\\n\\tafterUpdate(() => {\\n\\t\\t// bit of a hack — prevent sidebar scrolling if\\n\\t\\t// TOC is open on mobile, or scroll came from within sidebar\\n\\t\\tif (prevent_sidebar_scroll || show_contents && window.innerWidth < 832) return;\\n\\n\\t\\tconst active = ul.querySelector('.active');\\n\\n\\t\\tif (active) {\\n\\t\\t\\tconst { top, bottom } = active.getBoundingClientRect();\\n\\n\\t\\t\\tconst min = 200;\\n\\t\\t\\tconst max = window.innerHeight - 200;\\n\\n\\t\\t\\tif (top > max) {\\n\\t\\t\\t\\tul.parentNode.scrollBy({\\n\\t\\t\\t\\t\\ttop: top - max,\\n\\t\\t\\t\\t\\tleft: 0,\\n\\t\\t\\t\\t\\tbehavior: 'smooth'\\n\\t\\t\\t\\t});\\n\\t\\t\\t} else if (bottom < min) {\\n\\t\\t\\t\\tul.parentNode.scrollBy({\\n\\t\\t\\t\\t\\ttop: bottom - min,\\n\\t\\t\\t\\t\\tleft: 0,\\n\\t\\t\\t\\t\\tbehavior: 'smooth'\\n\\t\\t\\t\\t});\\n\\t\\t\\t}\\n\\t\\t}\\n\\t});\\n</script>\\n\\n<style>\\n\\t.reference-toc li {\\n\\t\\tdisplay: block;\\n\\t\\tline-height: 1.2;\\n\\t\\tmargin: 0 0 4rem 0;\\n\\t}\\n\\n\\ta {\\n\\t\\tposition: relative;\\n\\t\\ttransition: color 0.2s;\\n\\t\\tborder-bottom: none;\\n\\t\\tpadding: 0;\\n\\t\\tcolor: var(--second);\\n\\t}\\n\\n\\t.section {\\n\\t\\tdisplay: block;\\n\\t\\tpadding: 0 0 .8rem 0;\\n\\t\\tfont-size: var(--h6);\\n\\t\\ttext-transform: uppercase;\\n\\t\\tletter-spacing: 0.1em;\\n\\t\\tfont-weight: 600;\\n\\t}\\n\\n\\t.subsection {\\n\\t\\tdisplay: block;\\n\\t\\tfont-size: 1.6rem;\\n\\t\\tfont-family: var(--font);\\n\\t\\tpadding: 0 0 0.6em 0;\\n\\t}\\n\\n\\t.section:hover,\\n\\t.subsection:hover,\\n\\t.active {\\n\\t\\tcolor: var(--flash);\\n\\t}\\n\\n\\t.subsection[data-level=\\\"4\\\"] {\\n\\t\\tpadding-left: 1.2rem;\\n\\t}\\n\\n\\t.icon-container {\\n\\t\\tposition: absolute;\\n\\t\\ttop: -.2rem;\\n\\t\\tright: 2.4rem;\\n\\t}\\n\\n\\t@media (min-width: 832px) {\\n\\t\\ta {\\n\\t\\t\\tcolor: var(--sidebar-text);\\n\\t\\t}\\n\\n\\t\\ta:hover,\\n\\t\\t.section:hover,\\n\\t\\t.subsection:hover,\\n\\t\\t.active {\\n\\t\\t\\tcolor: white\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<ul\\n\\tbind:this={ul}\\n\\tclass=\\\"reference-toc\\\"\\n\\ton:mouseenter=\\\"{() => prevent_sidebar_scroll = true}\\\"\\n\\ton:mouseleave=\\\"{() => prevent_sidebar_scroll = false}\\\"\\n>\\n\\t{#each sections as section}\\n\\t\\t<li>\\n\\t\\t\\t<a class=\\\"section\\\" class:active=\\\"{section.slug === active_section}\\\" href=\\\"{dir}#{section.slug}\\\">\\n\\t\\t\\t\\t{@html section.metadata.title}\\n\\n\\t\\t\\t\\t{#if section.slug === active_section}\\n\\t\\t\\t\\t\\t<div class=\\\"icon-container\\\">\\n\\t\\t\\t\\t\\t\\t<Icon name=\\\"arrow-right\\\" />\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t{/if}\\n\\t\\t\\t</a>\\n\\n\\t\\t\\t{#each section.subsections as subsection}\\n\\t\\t\\t\\t<!-- see <script> below: on:click='scrollTo(event, subsection.slug)' -->\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\\"subsection\\\"\\n\\t\\t\\t\\t\\tclass:active=\\\"{subsection.slug === active_section}\\\"\\n\\t\\t\\t\\t\\thref=\\\"{dir}#{subsection.slug}\\\"\\n\\t\\t\\t\\t\\tdata-level=\\\"{subsection.level}\\\"\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t{@html subsection.title}\\n\\n\\t\\t\\t\\t\\t{#if subsection.slug === active_section}\\n\\t\\t\\t\\t\\t\\t<div class=\\\"icon-container\\\">\\n\\t\\t\\t\\t\\t\\t\\t<Icon name=\\\"arrow-right\\\" />\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</a>\\n\\t\\t\\t{/each}\\n\\t\\t</li>\\n\\t{/each}\\n</ul>\\n\"],\"names\":[],\"mappings\":\"AA2CC,4BAAc,CAAC,EAAE,cAAC,CAAC,AAClB,OAAO,CAAE,KAAK,CACd,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,AACnB,CAAC,AAED,CAAC,4BAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,UAAU,CAAE,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,CAAC,CACV,KAAK,CAAE,IAAI,QAAQ,CAAC,AACrB,CAAC,AAED,QAAQ,4BAAC,CAAC,AACT,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CACpB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,KAAK,CACrB,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,WAAW,4BAAC,CAAC,AACZ,OAAO,CAAE,KAAK,CACd,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACrB,CAAC,AAED,oCAAQ,MAAM,CACd,uCAAW,MAAM,CACjB,OAAO,4BAAC,CAAC,AACR,KAAK,CAAE,IAAI,OAAO,CAAC,AACpB,CAAC,AAED,WAAW,CAAC,UAAU,CAAC,GAAG,CAAC,4BAAC,CAAC,AAC5B,YAAY,CAAE,MAAM,AACrB,CAAC,AAED,eAAe,4BAAC,CAAC,AAChB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,MAAM,CACX,KAAK,CAAE,MAAM,AACd,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,CAAC,4BAAC,CAAC,AACF,KAAK,CAAE,IAAI,cAAc,CAAC,AAC3B,CAAC,AAED,6BAAC,MAAM,CACP,oCAAQ,MAAM,CACd,uCAAW,MAAM,CACjB,OAAO,4BAAC,CAAC,AACR,KAAK,CAAE,KAAK;EACb,CAAC,AACF,CAAC\"}"
};

const GuideContents = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { sections = [] } = $$props;
	let { active_section = null } = $$props;
	let { show_contents } = $$props;
	let { prevent_sidebar_scroll = false } = $$props;
	let { dir } = $$props;
	let ul;

	afterUpdate(() => {
		// bit of a hack — prevent sidebar scrolling if
		// TOC is open on mobile, or scroll came from within sidebar
		if (prevent_sidebar_scroll || show_contents && window.innerWidth < 832) return;

		const active = ul.querySelector(".active");

		if (active) {
			const { top, bottom } = active.getBoundingClientRect();
			const min = 200;
			const max = window.innerHeight - 200;

			if (top > max) {
				ul.parentNode.scrollBy({
					top: top - max,
					left: 0,
					behavior: "smooth"
				});
			} else if (bottom < min) {
				ul.parentNode.scrollBy({
					top: bottom - min,
					left: 0,
					behavior: "smooth"
				});
			}
		}
	});

	if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0) $$bindings.sections(sections);
	if ($$props.active_section === void 0 && $$bindings.active_section && active_section !== void 0) $$bindings.active_section(active_section);
	if ($$props.show_contents === void 0 && $$bindings.show_contents && show_contents !== void 0) $$bindings.show_contents(show_contents);
	if ($$props.prevent_sidebar_scroll === void 0 && $$bindings.prevent_sidebar_scroll && prevent_sidebar_scroll !== void 0) $$bindings.prevent_sidebar_scroll(prevent_sidebar_scroll);
	if ($$props.dir === void 0 && $$bindings.dir && dir !== void 0) $$bindings.dir(dir);
	$$result.css.add(css$3);

	return `<ul class="${"reference-toc svelte-mm3tjv"}"${add_attribute("this", ul, 1)}>${each(sections, section => `<li class="${"svelte-mm3tjv"}"><a class="${["section svelte-mm3tjv", section.slug === active_section ? "active" : ""].join(" ").trim()}" href="${escape(dir) + "#" + escape(section.slug)}">${section.metadata.title}

				${section.slug === active_section
	? `<div class="${"icon-container svelte-mm3tjv"}">${validate_component(Icon, "Icon").$$render($$result, { name: "arrow-right" }, {}, {})}
					</div>`
	: ``}</a>

			${each(section.subsections, subsection => `
				<a class="${["subsection svelte-mm3tjv", subsection.slug === active_section ? "active" : ""].join(" ").trim()}" href="${escape(dir) + "#" + escape(subsection.slug)}"${add_attribute("data-level", subsection.level, 0)}>${subsection.title}

					${subsection.slug === active_section
	? `<div class="${"icon-container svelte-mm3tjv"}">${validate_component(Icon, "Icon").$$render($$result, { name: "arrow-right" }, {}, {})}
						</div>`
	: ``}
				</a>`)}
		</li>`)}</ul>`;
});

const getFragment = () => window.location.hash.slice(1);

/* node_modules/@sveltejs/site-kit/components/Docs.svelte generated by Svelte v3.31.0 */

const css$4 = {
	code: "aside.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{position:fixed;background-color:white;left:0.8rem;bottom:0.8rem;width:2em;height:2em;overflow:hidden;border:1px solid #eee;box-shadow:1px 1px 6px rgba(0,0,0,0.1);transition:width 0.2s, height 0.2s}aside.svelte-1itkhys button.svelte-1itkhys.svelte-1itkhys{position:absolute;bottom:0;left:0;width:3.4rem;height:3.4rem}aside.open.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{width:calc(100vw - 3rem);height:calc(100vh - var(--nav-h))}aside.open.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys::before{content:'';position:absolute;top:0;left:0;width:calc(100% - 2rem);height:2em;background:linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%);pointer-events:none;z-index:2}aside.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys::after{content:'';position:absolute;left:0;bottom:1.9em;width:calc(100% - 2rem);height:2em;background:linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%);pointer-events:none}.sidebar.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{position:absolute;font-family:var(--font);overflow-y:auto;width:100%;height:100%;padding:4em 1.6rem 2em 3.2rem;bottom:2em}.content.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{width:100%;margin:0;padding:var(--top-offset) var(--side-nav);tab-size:2;-moz-tab-size:2}@media(min-width: 832px){aside.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{display:block;width:var(--sidebar-w);height:100vh;top:0;left:0;overflow:hidden;box-shadow:none;border:none;overflow:hidden;background-color:var(--second);color:white}aside.open.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys::before{display:none}aside.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys::after{content:'';bottom:0;height:var(--top-offset);background:linear-gradient(to bottom, rgba(103,103,120,0) 0%, rgba(103,103,120,0.7) 50%, rgba(103,103,120,1) 100%)}aside.svelte-1itkhys button.svelte-1itkhys.svelte-1itkhys{display:none}.sidebar.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{padding:var(--top-offset) 0 6.4rem 3.2rem;font-family:var(--font);overflow-y:auto;height:100%;bottom:auto;width:100%}.content.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{padding-left:calc(var(--sidebar-w) + var(--side-nav))}.content.svelte-1itkhys .side-by-side{display:grid;grid-template-columns:calc(50% - 0.5em) calc(50% - 0.5em);grid-gap:1em}.content.svelte-1itkhys .side-by-side .code{padding:1em 0}}.content.svelte-1itkhys h2.svelte-1itkhys.svelte-1itkhys{margin-top:8rem;padding:2rem 1.6rem 4rem 0.2rem;border-top:var(--border-w) solid #6767785b;color:var(--text);line-height:1;font-size:var(--h3);letter-spacing:.05em;text-transform:uppercase}.content.svelte-1itkhys section.svelte-1itkhys:first-of-type>h2.svelte-1itkhys{margin-top:0}.content.svelte-1itkhys h4{margin:2em 0 1em 0}.content.svelte-1itkhys .offset-anchor{position:relative;display:block;top:calc(-1 * (var(--nav-h) + var(--top-offset) - 1rem));width:0;height:0}.content.svelte-1itkhys .anchor{position:absolute;display:block;background:url(/icons/link.svg) 0 50% no-repeat;background-size:1em 1em;width:1.4em;height:1em;left:-1.3em;opacity:0;transition:opacity 0.2s;border:none !important}.content.svelte-1itkhys h2 > .anchor,.content.svelte-1itkhys h3 > .anchor{top:0.75em}@media(min-width: 768px){.content.svelte-1itkhys h2:hover .anchor,.content.svelte-1itkhys h3:hover .anchor,.content.svelte-1itkhys h4:hover .anchor,.content.svelte-1itkhys h5:hover .anchor,.content.svelte-1itkhys h6:hover .anchor{opacity:1}.content.svelte-1itkhys h5 .anchor,.content.svelte-1itkhys h6 .anchor{top:0.25em}}.content.svelte-1itkhys h3,.content.svelte-1itkhys h3 > code{margin:6.4rem 0 0 0;padding:2rem 1.6rem 5.6rem .2rem;color:var(--text);border-top:var(--border-w) solid #6767781f;background:transparent;line-height:1}.content.svelte-1itkhys h3:first-of-type{border:none;margin:0}.content.svelte-1itkhys h3 > code{border-radius:0 0 0 0;border:none;font-size:inherit}.content.svelte-1itkhys h4,.content.svelte-1itkhys h4 > code{font-family:inherit;font-weight:600;font-size:2.4rem;color:var(--second);margin:6.4rem 0 1.6rem 0;padding-left:0;background:transparent;line-height:1;padding:0;top:0}.content.svelte-1itkhys h4 > em{opacity:0.7}.content.svelte-1itkhys h4 > .anchor{top:0.05em}.content.svelte-1itkhys h5{font-size:2.4rem;margin:2em 0 0.5em 0}.content.svelte-1itkhys code{padding:.3rem .8rem .3rem;margin:0 0.2rem;top:-.1rem;background:var(--back-api)}.content.svelte-1itkhys pre code{padding:0;margin:0;top:0;background:transparent}.content.svelte-1itkhys pre{margin:0 0 2em 0;width:100%;max-width:100%}.content.svelte-1itkhys .icon{width:2rem;height:2rem;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}.content.svelte-1itkhys table{margin:0 0 2em 0}section.svelte-1itkhys>.code-block>pre{display:inline-block;color:white;padding:.3rem .8rem;margin:0;max-width:100%}section.svelte-1itkhys>.code-block>pre.language-markup{padding:.3rem .8rem .2rem;background:var(--back-api)}section.svelte-1itkhys>p{max-width:var(--linemax)\n\t}section.svelte-1itkhys p{margin:1em 0}small.svelte-1itkhys.svelte-1itkhys.svelte-1itkhys{font-size:var(--h5);float:right;pointer-events:all;color:var(--prime);cursor:pointer}small.svelte-1itkhys a.svelte-1itkhys.svelte-1itkhys{all:unset }small.svelte-1itkhys a.svelte-1itkhys.svelte-1itkhys:before{all:unset }section.svelte-1itkhys blockquote{color:hsl(204, 100%, 50%);border:2px solid var(--flash)}section.svelte-1itkhys blockquote code{background:hsl(204, 100%, 95%) !important;color:hsl(204, 100%, 50%)}",
	map: "{\"version\":3,\"file\":\"Docs.svelte\",\"sources\":[\"Docs.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { onMount } from 'svelte';\\n\\timport GuideContents from './GuideContents.svelte'; // TODO rename\\n\\timport Icon from './Icon.svelte';\\n\\timport { getFragment } from '../utils/navigation';\\n\\n\\texport let owner = 'sveltejs';\\n\\texport let project = 'svelte';\\n\\texport let path = '/site/content';\\n\\texport let dir = 'docs';\\n\\texport let edit_title = 'edit this section';\\n\\texport let sections;\\n\\tlet active_section;\\n\\n\\tlet container;\\n\\tlet aside;\\n\\tlet show_contents = false;\\n\\n\\tonMount(() => {\\n\\t\\t// don't update `active_section` for headings above level 4, see _sections.js\\n\\t\\tconst anchors = container.querySelectorAll('[id]:not([data-scrollignore])');\\n\\n\\t\\tlet positions;\\n\\n\\t\\tconst onresize = () => {\\n\\t\\t\\tconst { top } = container.getBoundingClientRect();\\n\\t\\t\\tpositions = [].map.call(anchors, anchor => {\\n\\t\\t\\t\\treturn anchor.getBoundingClientRect().top - top;\\n\\t\\t\\t});\\n\\t\\t}\\n\\n\\t\\tlet last_id = getFragment();\\n\\n\\t\\tconst onscroll = () => {\\n\\t\\t\\tconst { top } = container.getBoundingClientRect();\\n\\n\\t\\t\\tlet i = anchors.length;\\n\\t\\t\\twhile (i--) {\\n\\t\\t\\t\\tif (positions[i] + top < 40) {\\n\\t\\t\\t\\t\\tconst anchor = anchors[i];\\n\\t\\t\\t\\t\\tconst { id } = anchor;\\n\\n\\t\\t\\t\\t\\tif (id !== last_id) {\\n\\t\\t\\t\\t\\t\\tactive_section = id;\\n\\t\\t\\t\\t\\t\\tlast_id = id;\\n\\t\\t\\t\\t\\t}\\n\\n\\t\\t\\t\\t\\treturn;\\n\\t\\t\\t\\t}\\n\\t\\t\\t}\\n\\t\\t};\\n\\n\\t\\twindow.addEventListener('scroll', onscroll, true);\\n\\t\\twindow.addEventListener('resize', onresize, true);\\n\\n\\t\\t// wait for fonts to load...\\n\\t\\tconst timeouts = [\\n\\t\\t\\tsetTimeout(onresize, 1000),\\n\\t\\t\\tsetTimeout(onscroll, 5000)\\n\\t\\t];\\n\\n\\t\\tonresize();\\n\\t\\tonscroll();\\n\\n\\t\\treturn () => {\\n\\t\\t\\twindow.removeEventListener('scroll', onscroll, true);\\n\\t\\t\\twindow.removeEventListener('resize', onresize, true);\\n\\n\\t\\t\\ttimeouts.forEach(timeout => clearTimeout(timeout));\\n\\t\\t};\\n\\t});\\n</script>\\n\\n<style>\\n\\taside {\\n\\t\\tposition: fixed;\\n\\t\\tbackground-color: white;\\n\\t\\tleft: 0.8rem;\\n\\t\\tbottom: 0.8rem;\\n\\t\\twidth: 2em;\\n\\t\\theight: 2em;\\n\\t\\toverflow: hidden;\\n\\t\\tborder: 1px solid #eee;\\n\\t\\tbox-shadow: 1px 1px 6px rgba(0,0,0,0.1);\\n\\t\\ttransition: width 0.2s, height 0.2s;\\n\\t}\\n\\n\\taside button {\\n\\t\\tposition: absolute;\\n\\t\\tbottom: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 3.4rem;\\n\\t\\theight: 3.4rem;\\n\\t}\\n\\n\\taside.open {\\n\\t\\twidth: calc(100vw - 3rem);\\n\\t\\theight: calc(100vh - var(--nav-h));\\n\\t}\\n\\n\\taside.open::before {\\n\\t\\tcontent: '';\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: calc(100% - 2rem);\\n\\t\\theight: 2em;\\n\\t\\tbackground: linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%);\\n\\t\\tpointer-events: none;\\n\\t\\tz-index: 2;\\n\\t}\\n\\n\\taside::after {\\n\\t\\tcontent: '';\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\tbottom: 1.9em;\\n\\t\\twidth: calc(100% - 2rem);\\n\\t\\theight: 2em;\\n\\t\\tbackground: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%);\\n\\t\\tpointer-events: none;\\n\\t}\\n\\n\\t.sidebar {\\n\\t\\tposition: absolute;\\n\\t\\tfont-family: var(--font);\\n\\t\\toverflow-y: auto;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tpadding: 4em 1.6rem 2em 3.2rem;\\n\\t\\tbottom: 2em;\\n\\t}\\n\\n\\t.content {\\n\\t\\twidth: 100%;\\n\\t\\tmargin: 0;\\n\\t\\tpadding: var(--top-offset) var(--side-nav);\\n\\t\\ttab-size: 2;\\n\\t\\t-moz-tab-size: 2;\\n\\t}\\n\\n\\t@media (min-width: 832px) { /* can't use vars in @media :( */\\n\\t\\taside {\\n\\t\\t\\tdisplay: block;\\n\\t\\t\\twidth: var(--sidebar-w);\\n\\t\\t\\theight: 100vh;\\n\\t\\t\\ttop: 0;\\n\\t\\t\\tleft: 0;\\n\\t\\t\\toverflow: hidden;\\n\\t\\t\\tbox-shadow: none;\\n\\t\\t\\tborder: none;\\n\\t\\t\\toverflow: hidden;\\n\\t\\t\\tbackground-color: var(--second);\\n\\t\\t\\tcolor: white;\\n\\t\\t}\\n\\n\\t\\taside.open::before {\\n\\t\\t\\tdisplay: none;\\n\\t\\t}\\n\\n\\t\\taside::after {\\n\\t\\t\\tcontent: '';\\n\\t\\t\\tbottom: 0;\\n\\t\\t\\theight: var(--top-offset);\\n\\t\\t\\tbackground: linear-gradient(to bottom, rgba(103,103,120,0) 0%, rgba(103,103,120,0.7) 50%, rgba(103,103,120,1) 100%);\\n\\t\\t}\\n\\n\\t\\taside button {\\n\\t\\t\\tdisplay: none;\\n\\t\\t}\\n\\n\\t\\t.sidebar {\\n\\t\\t\\tpadding: var(--top-offset) 0 6.4rem 3.2rem;\\n\\t\\t\\tfont-family: var(--font);\\n\\t\\t\\toverflow-y: auto;\\n\\t\\t\\theight: 100%;\\n\\t\\t\\tbottom: auto;\\n\\t\\t\\twidth: 100%;\\n\\t\\t}\\n\\n\\t\\t.content {\\n\\t\\t\\tpadding-left: calc(var(--sidebar-w) + var(--side-nav));\\n\\t\\t}\\n\\n\\t\\t.content :global(.side-by-side) {\\n\\t\\t\\tdisplay: grid;\\n\\t\\t\\tgrid-template-columns: calc(50% - 0.5em) calc(50% - 0.5em);\\n\\t\\t\\tgrid-gap: 1em;\\n\\t\\t}\\n\\n\\t\\t.content :global(.side-by-side) :global(.code) {\\n\\t\\t\\tpadding: 1em 0;\\n\\t\\t}\\n\\t}\\n\\n\\t.content h2 {\\n\\t\\tmargin-top: 8rem;\\n\\t\\tpadding: 2rem 1.6rem 4rem 0.2rem;\\n\\t\\tborder-top: var(--border-w) solid #6767785b; /* based on --second */\\n\\t\\tcolor: var(--text);\\n\\t\\tline-height: 1;\\n\\t\\tfont-size: var(--h3);\\n\\t\\tletter-spacing: .05em;\\n\\t\\ttext-transform: uppercase;\\n\\t}\\n\\n\\t.content section:first-of-type > h2 {\\n\\t\\tmargin-top: 0;\\n\\t}\\n\\n\\t.content :global(h4) {\\n\\t\\tmargin: 2em 0 1em 0;\\n\\t}\\n\\n\\t.content :global(.offset-anchor) {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: block;\\n\\t\\ttop: calc(-1 * (var(--nav-h) + var(--top-offset) - 1rem));\\n\\t\\twidth: 0;\\n\\t\\theight: 0;\\n\\t}\\n\\n\\t.content :global(.anchor) {\\n\\t\\tposition: absolute;\\n\\t\\tdisplay: block;\\n\\t\\tbackground: url(/icons/link.svg) 0 50% no-repeat;\\n\\t\\tbackground-size: 1em 1em;\\n\\t\\twidth: 1.4em;\\n\\t\\theight: 1em;\\n\\t\\tleft: -1.3em;\\n\\t\\topacity: 0;\\n\\t\\ttransition: opacity 0.2s;\\n\\t\\tborder: none !important; /* TODO get rid of linkify */\\n\\t}\\n\\n\\t.content :global(h2 > .anchor),\\n\\t.content :global(h3 > .anchor) {\\n\\t\\ttop: 0.75em;\\n\\t}\\n\\n\\t@media (min-width: 768px) {\\n\\t\\t.content :global(h2):hover :global(.anchor),\\n\\t\\t.content :global(h3):hover :global(.anchor),\\n\\t\\t.content :global(h4):hover :global(.anchor),\\n\\t\\t.content :global(h5):hover :global(.anchor),\\n\\t\\t.content :global(h6):hover :global(.anchor) {\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\n\\t\\t.content :global(h5) :global(.anchor),\\n\\t\\t.content :global(h6) :global(.anchor) {\\n\\t\\t\\ttop: 0.25em;\\n\\t\\t}\\n\\t}\\n\\n\\t.content :global(h3),\\n\\t.content :global(h3 > code) {\\n\\t\\tmargin: 6.4rem 0 0 0;\\n\\t\\tpadding: 2rem 1.6rem 5.6rem .2rem;\\n\\t\\tcolor: var(--text);\\n\\t\\tborder-top: var(--border-w) solid #6767781f; /* based on --second */\\n\\t\\tbackground: transparent;\\n\\t\\tline-height: 1;\\n\\t}\\n\\n\\t.content :global(h3):first-of-type {\\n\\t\\tborder: none;\\n\\t\\tmargin: 0;\\n\\t}\\n\\n\\t/* avoid doubled border-top */\\n\\t.content :global(h3 > code) {\\n\\t\\tborder-radius: 0 0 0 0;\\n\\t\\tborder: none;\\n\\t\\tfont-size: inherit;\\n\\t}\\n\\n\\n\\t.content :global(h4),\\n\\t.content :global(h4 > code) {\\n\\t\\tfont-family: inherit;\\n\\t\\tfont-weight: 600;\\n\\t\\tfont-size: 2.4rem;\\n\\t\\tcolor: var(--second);\\n\\t\\tmargin: 6.4rem 0 1.6rem 0;\\n\\t\\tpadding-left: 0;\\n\\t\\tbackground: transparent;\\n\\t\\tline-height: 1;\\n\\t\\tpadding: 0;\\n\\t\\ttop: 0;\\n\\t}\\n\\n\\t.content :global(h4 > em) {\\n\\t\\topacity: 0.7;\\n\\t}\\n\\n\\t.content :global(h4 > .anchor) {\\n\\t\\ttop: 0.05em;\\n\\t}\\n\\n\\t.content :global(h5) {\\n\\t\\tfont-size: 2.4rem;\\n\\t\\tmargin: 2em 0 0.5em 0;\\n\\t}\\n\\n\\t.content :global(code) {\\n\\t\\tpadding: .3rem .8rem .3rem;\\n\\t\\tmargin: 0 0.2rem;\\n\\t\\ttop: -.1rem;\\n\\t\\tbackground: var(--back-api);\\n\\t}\\n\\n\\t.content :global(pre) :global(code) {\\n\\t\\tpadding: 0;\\n\\t\\tmargin: 0;\\n\\t\\ttop: 0;\\n\\t\\tbackground: transparent;\\n\\t}\\n\\n\\t.content :global(pre) {\\n\\t\\tmargin: 0 0 2em 0;\\n\\t\\twidth: 100%;\\n\\t\\tmax-width: 100%;\\n\\t}\\n\\n\\t.content :global(.icon) {\\n\\t\\twidth: 2rem;\\n\\t\\theight: 2rem;\\n\\t\\tstroke: currentColor;\\n\\t\\tstroke-width: 2;\\n\\t\\tstroke-linecap: round;\\n\\t\\tstroke-linejoin: round;\\n\\t\\tfill: none;\\n\\t}\\n\\n\\t.content :global(table) {\\n\\t\\tmargin: 0 0 2em 0;\\n\\t}\\n\\n\\tsection > :global(.code-block) > :global(pre) {\\n\\t\\tdisplay: inline-block;\\n\\t\\t/* background: var(--back-api); */\\n\\t\\tcolor: white;\\n\\t\\tpadding: .3rem .8rem;\\n\\t\\tmargin: 0;\\n\\t\\tmax-width: 100%;\\n\\t}\\n\\n\\tsection > :global(.code-block)> :global(pre.language-markup) {\\n\\t\\tpadding: .3rem .8rem .2rem;\\n\\t\\tbackground: var(--back-api);\\n\\t}\\n\\n\\tsection > :global(p) {\\n\\t\\tmax-width: var(--linemax)\\n\\t}\\n\\n\\tsection :global(p) {\\n\\t\\tmargin: 1em 0;\\n\\t}\\n\\n\\tsmall {\\n\\t\\tfont-size: var(--h5);\\n\\t\\tfloat: right;\\n\\t\\tpointer-events: all;\\n\\t\\tcolor: var(--prime);\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\t/* no linkify on these */\\n\\tsmall a        { all: unset }\\n\\tsmall a:before { all: unset }\\n\\n\\tsection :global(blockquote) {\\n\\t\\tcolor: hsl(204, 100%, 50%);\\n\\t\\tborder: 2px solid var(--flash);\\n\\t}\\n\\n\\tsection :global(blockquote) :global(code) {\\n\\t\\tbackground: hsl(204, 100%, 95%) !important;\\n\\t\\tcolor: hsl(204, 100%, 50%);\\n\\t}\\n</style>\\n\\n<div bind:this={container} class=\\\"content listify\\\">\\n\\t{#each sections as section}\\n\\t\\t<section data-id={section.slug}>\\n\\t\\t\\t<h2>\\n\\t\\t\\t\\t<span class=\\\"offset-anchor\\\" id={section.slug}></span>\\n\\n\\t\\t\\t\\t<!-- svelte-ignore a11y-missing-content -->\\n\\t\\t\\t\\t<a href=\\\"{dir}#{section.slug}\\\" class=\\\"anchor\\\" aria-hidden></a>\\n\\n\\t\\t\\t\\t{@html section.metadata.title}\\n\\t\\t\\t\\t<small>\\n\\t\\t\\t\\t\\t<a href=\\\"https://github.com/{owner}/{project}/edit/master{path}/{dir}/{section.file}\\\" title=\\\"{edit_title}\\\">\\n\\t\\t\\t\\t\\t\\t<Icon name='edit' />\\n\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t</small>\\n\\t\\t\\t</h2>\\n\\n\\t\\t\\t{@html section.html}\\n\\t\\t</section>\\n\\t{/each}\\n</div>\\n\\n<aside bind:this={aside} class=\\\"sidebar-container\\\" class:open={show_contents}>\\n\\t<div class=\\\"sidebar\\\" on:click=\\\"{() => show_contents = false}\\\"> <!-- scroll container -->\\n\\t\\t<GuideContents {sections} {active_section} {show_contents} {dir} />\\n\\t</div>\\n\\n\\t<button on:click=\\\"{() => show_contents = !show_contents}\\\">\\n\\t\\t<Icon name=\\\"{show_contents? 'close' : 'menu'}\\\"/>\\n\\t</button>\\n</aside>\\n\"],\"names\":[],\"mappings\":\"AA0EC,KAAK,6CAAC,CAAC,AACN,QAAQ,CAAE,KAAK,CACf,gBAAgB,CAAE,KAAK,CACvB,IAAI,CAAE,MAAM,CACZ,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,QAAQ,CAAE,MAAM,CAChB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACvC,UAAU,CAAE,KAAK,CAAC,IAAI,CAAC,CAAC,MAAM,CAAC,IAAI,AACpC,CAAC,AAED,oBAAK,CAAC,MAAM,8BAAC,CAAC,AACb,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,MAAM,AACf,CAAC,AAED,KAAK,KAAK,6CAAC,CAAC,AACX,KAAK,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,CAAC,CACzB,MAAM,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,OAAO,CAAC,CAAC,AACnC,CAAC,AAED,KAAK,kDAAK,QAAQ,AAAC,CAAC,AACnB,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CACxB,MAAM,CAAE,GAAG,CACX,UAAU,CAAE,gBAAgB,EAAE,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAChH,cAAc,CAAE,IAAI,CACpB,OAAO,CAAE,CAAC,AACX,CAAC,AAED,kDAAK,OAAO,AAAC,CAAC,AACb,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,KAAK,CACb,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CACxB,MAAM,CAAE,GAAG,CACX,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CACnH,cAAc,CAAE,IAAI,AACrB,CAAC,AAED,QAAQ,6CAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,GAAG,CAAC,MAAM,CAAC,GAAG,CAAC,MAAM,CAC9B,MAAM,CAAE,GAAG,AACZ,CAAC,AAED,QAAQ,6CAAC,CAAC,AACT,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,IAAI,UAAU,CAAC,CAC1C,QAAQ,CAAE,CAAC,CACX,aAAa,CAAE,CAAC,AACjB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,KAAK,6CAAC,CAAC,AACN,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,WAAW,CAAC,CACvB,MAAM,CAAE,KAAK,CACb,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,QAAQ,CAAE,MAAM,CAChB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,CAChB,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,KAAK,CAAE,KAAK,AACb,CAAC,AAED,KAAK,kDAAK,QAAQ,AAAC,CAAC,AACnB,OAAO,CAAE,IAAI,AACd,CAAC,AAED,kDAAK,OAAO,AAAC,CAAC,AACb,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,IAAI,YAAY,CAAC,CACzB,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,AACpH,CAAC,AAED,oBAAK,CAAC,MAAM,8BAAC,CAAC,AACb,OAAO,CAAE,IAAI,AACd,CAAC,AAED,QAAQ,6CAAC,CAAC,AACT,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,MAAM,CAC1C,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,QAAQ,6CAAC,CAAC,AACT,YAAY,CAAE,KAAK,IAAI,WAAW,CAAC,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,AACvD,CAAC,AAED,uBAAQ,CAAC,AAAQ,aAAa,AAAE,CAAC,AAChC,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAC1D,QAAQ,CAAE,GAAG,AACd,CAAC,AAED,uBAAQ,CAAC,AAAQ,aAAa,AAAC,CAAC,AAAQ,KAAK,AAAE,CAAC,AAC/C,OAAO,CAAE,GAAG,CAAC,CAAC,AACf,CAAC,AACF,CAAC,AAED,uBAAQ,CAAC,EAAE,8BAAC,CAAC,AACZ,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CAAC,MAAM,CAAC,IAAI,CAAC,MAAM,CAChC,UAAU,CAAE,IAAI,UAAU,CAAC,CAAC,KAAK,CAAC,SAAS,CAC3C,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,WAAW,CAAE,CAAC,CACd,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,cAAc,CAAE,KAAK,CACrB,cAAc,CAAE,SAAS,AAC1B,CAAC,AAED,uBAAQ,CAAC,sBAAO,cAAc,CAAG,EAAE,eAAC,CAAC,AACpC,UAAU,CAAE,CAAC,AACd,CAAC,AAED,uBAAQ,CAAC,AAAQ,EAAE,AAAE,CAAC,AACrB,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,AACpB,CAAC,AAED,uBAAQ,CAAC,AAAQ,cAAc,AAAE,CAAC,AACjC,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,GAAG,CAAE,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,IAAI,OAAO,CAAC,CAAC,CAAC,CAAC,IAAI,YAAY,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACzD,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,AACV,CAAC,AAED,uBAAQ,CAAC,AAAQ,OAAO,AAAE,CAAC,AAC1B,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,eAAe,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,SAAS,CAChD,eAAe,CAAE,GAAG,CAAC,GAAG,CACxB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,GAAG,CACX,IAAI,CAAE,MAAM,CACZ,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,OAAO,CAAC,IAAI,CACxB,MAAM,CAAE,IAAI,CAAC,UAAU,AACxB,CAAC,AAED,uBAAQ,CAAC,AAAQ,YAAY,AAAC,CAC9B,uBAAQ,CAAC,AAAQ,YAAY,AAAE,CAAC,AAC/B,GAAG,CAAE,MAAM,AACZ,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,uBAAQ,CAAC,AAAQ,EAAE,AAAC,MAAM,CAAC,AAAQ,OAAO,AAAC,CAC3C,uBAAQ,CAAC,AAAQ,EAAE,AAAC,MAAM,CAAC,AAAQ,OAAO,AAAC,CAC3C,uBAAQ,CAAC,AAAQ,EAAE,AAAC,MAAM,CAAC,AAAQ,OAAO,AAAC,CAC3C,uBAAQ,CAAC,AAAQ,EAAE,AAAC,MAAM,CAAC,AAAQ,OAAO,AAAC,CAC3C,uBAAQ,CAAC,AAAQ,EAAE,AAAC,MAAM,CAAC,AAAQ,OAAO,AAAE,CAAC,AAC5C,OAAO,CAAE,CAAC,AACX,CAAC,AAED,uBAAQ,CAAC,AAAQ,EAAE,AAAC,CAAC,AAAQ,OAAO,AAAC,CACrC,uBAAQ,CAAC,AAAQ,EAAE,AAAC,CAAC,AAAQ,OAAO,AAAE,CAAC,AACtC,GAAG,CAAE,MAAM,AACZ,CAAC,AACF,CAAC,AAED,uBAAQ,CAAC,AAAQ,EAAE,AAAC,CACpB,uBAAQ,CAAC,AAAQ,SAAS,AAAE,CAAC,AAC5B,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACpB,OAAO,CAAE,IAAI,CAAC,MAAM,CAAC,MAAM,CAAC,KAAK,CACjC,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,UAAU,CAAE,IAAI,UAAU,CAAC,CAAC,KAAK,CAAC,SAAS,CAC3C,UAAU,CAAE,WAAW,CACvB,WAAW,CAAE,CAAC,AACf,CAAC,AAED,uBAAQ,CAAC,AAAQ,EAAE,AAAC,cAAc,AAAC,CAAC,AACnC,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,CAAC,AACV,CAAC,AAGD,uBAAQ,CAAC,AAAQ,SAAS,AAAE,CAAC,AAC5B,aAAa,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACtB,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,OAAO,AACnB,CAAC,AAGD,uBAAQ,CAAC,AAAQ,EAAE,AAAC,CACpB,uBAAQ,CAAC,AAAQ,SAAS,AAAE,CAAC,AAC5B,WAAW,CAAE,OAAO,CACpB,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,IAAI,QAAQ,CAAC,CACpB,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACzB,YAAY,CAAE,CAAC,CACf,UAAU,CAAE,WAAW,CACvB,WAAW,CAAE,CAAC,CACd,OAAO,CAAE,CAAC,CACV,GAAG,CAAE,CAAC,AACP,CAAC,AAED,uBAAQ,CAAC,AAAQ,OAAO,AAAE,CAAC,AAC1B,OAAO,CAAE,GAAG,AACb,CAAC,AAED,uBAAQ,CAAC,AAAQ,YAAY,AAAE,CAAC,AAC/B,GAAG,CAAE,MAAM,AACZ,CAAC,AAED,uBAAQ,CAAC,AAAQ,EAAE,AAAE,CAAC,AACrB,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACtB,CAAC,AAED,uBAAQ,CAAC,AAAQ,IAAI,AAAE,CAAC,AACvB,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAC1B,MAAM,CAAE,CAAC,CAAC,MAAM,CAChB,GAAG,CAAE,MAAM,CACX,UAAU,CAAE,IAAI,UAAU,CAAC,AAC5B,CAAC,AAED,uBAAQ,CAAC,AAAQ,GAAG,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AACpC,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,CAAC,CACN,UAAU,CAAE,WAAW,AACxB,CAAC,AAED,uBAAQ,CAAC,AAAQ,GAAG,AAAE,CAAC,AACtB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CACjB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,uBAAQ,CAAC,AAAQ,KAAK,AAAE,CAAC,AACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,YAAY,CACpB,YAAY,CAAE,CAAC,CACf,cAAc,CAAE,KAAK,CACrB,eAAe,CAAE,KAAK,CACtB,IAAI,CAAE,IAAI,AACX,CAAC,AAED,uBAAQ,CAAC,AAAQ,KAAK,AAAE,CAAC,AACxB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,AAClB,CAAC,AAED,sBAAO,CAAW,WAAW,AAAC,CAAW,GAAG,AAAE,CAAC,AAC9C,OAAO,CAAE,YAAY,CAErB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,KAAK,CAAC,KAAK,CACpB,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,sBAAO,CAAW,WAAW,AAAC,CAAU,mBAAmB,AAAE,CAAC,AAC7D,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAC1B,UAAU,CAAE,IAAI,UAAU,CAAC,AAC5B,CAAC,AAED,sBAAO,CAAW,CAAC,AAAE,CAAC,AACrB,SAAS,CAAE,IAAI,SAAS,CAAC;CAC1B,CAAC,AAED,sBAAO,CAAC,AAAQ,CAAC,AAAE,CAAC,AACnB,MAAM,CAAE,GAAG,CAAC,CAAC,AACd,CAAC,AAED,KAAK,6CAAC,CAAC,AACN,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,KAAK,CAAE,KAAK,CACZ,cAAc,CAAE,GAAG,CACnB,KAAK,CAAE,IAAI,OAAO,CAAC,CACnB,MAAM,CAAE,OAAO,AAChB,CAAC,AAGD,oBAAK,CAAC,CAAC,8BAAQ,CAAC,AAAC,GAAG,CAAE,KAAK,CAAC,CAAC,AAC7B,oBAAK,CAAC,+BAAC,OAAO,AAAC,CAAC,AAAC,GAAG,CAAE,KAAK,CAAC,CAAC,AAE7B,sBAAO,CAAC,AAAQ,UAAU,AAAE,CAAC,AAC5B,KAAK,CAAE,IAAI,GAAG,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,CAC1B,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,OAAO,CAAC,AAC/B,CAAC,AAED,sBAAO,CAAC,AAAQ,UAAU,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AAC1C,UAAU,CAAE,IAAI,GAAG,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,CAAC,UAAU,CAC1C,KAAK,CAAE,IAAI,GAAG,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,AAC3B,CAAC\"}"
};

const Docs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { owner = "sveltejs" } = $$props;
	let { project = "svelte" } = $$props;
	let { path = "/site/content" } = $$props;
	let { dir = "docs" } = $$props;
	let { edit_title = "edit this section" } = $$props;
	let { sections } = $$props;
	let active_section;
	let container;
	let aside;
	let show_contents = false;

	onMount(() => {
		// don't update `active_section` for headings above level 4, see _sections.js
		const anchors = container.querySelectorAll("[id]:not([data-scrollignore])");

		let positions;

		const onresize = () => {
			const { top } = container.getBoundingClientRect();

			positions = [].map.call(anchors, anchor => {
				return anchor.getBoundingClientRect().top - top;
			});
		};

		let last_id = getFragment();

		const onscroll = () => {
			const { top } = container.getBoundingClientRect();
			let i = anchors.length;

			while (i--) {
				if (positions[i] + top < 40) {
					const anchor = anchors[i];
					const { id } = anchor;

					if (id !== last_id) {
						active_section = id;
						last_id = id;
					}

					return;
				}
			}
		};

		window.addEventListener("scroll", onscroll, true);
		window.addEventListener("resize", onresize, true);

		// wait for fonts to load...
		const timeouts = [setTimeout(onresize, 1000), setTimeout(onscroll, 5000)];

		onresize();
		onscroll();

		return () => {
			window.removeEventListener("scroll", onscroll, true);
			window.removeEventListener("resize", onresize, true);
			timeouts.forEach(timeout => clearTimeout(timeout));
		};
	});

	if ($$props.owner === void 0 && $$bindings.owner && owner !== void 0) $$bindings.owner(owner);
	if ($$props.project === void 0 && $$bindings.project && project !== void 0) $$bindings.project(project);
	if ($$props.path === void 0 && $$bindings.path && path !== void 0) $$bindings.path(path);
	if ($$props.dir === void 0 && $$bindings.dir && dir !== void 0) $$bindings.dir(dir);
	if ($$props.edit_title === void 0 && $$bindings.edit_title && edit_title !== void 0) $$bindings.edit_title(edit_title);
	if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0) $$bindings.sections(sections);
	$$result.css.add(css$4);

	return `<div class="${"content listify svelte-1itkhys"}"${add_attribute("this", container, 1)}>${each(sections, section => `<section${add_attribute("data-id", section.slug, 0)} class="${"svelte-1itkhys"}"><h2 class="${"svelte-1itkhys"}"><span class="${"offset-anchor"}"${add_attribute("id", section.slug, 0)}></span>

				
				<a href="${escape(dir) + "#" + escape(section.slug)}" class="${"anchor"}" aria-hidden></a>

				${section.metadata.title}
				<small class="${"svelte-1itkhys"}"><a href="${"https://github.com/" + escape(owner) + "/" + escape(project) + "/edit/master" + escape(path) + "/" + escape(dir) + "/" + escape(section.file)}"${add_attribute("title", edit_title, 0)} class="${"svelte-1itkhys"}">${validate_component(Icon, "Icon").$$render($$result, { name: "edit" }, {}, {})}</a>
				</small></h2>

			${section.html}
		</section>`)}</div>

<aside class="${["sidebar-container svelte-1itkhys",  ""].join(" ").trim()}"${add_attribute("this", aside, 1)}><div class="${"sidebar svelte-1itkhys"}">
		${validate_component(GuideContents, "GuideContents").$$render(
		$$result,
		{
			sections,
			active_section,
			show_contents,
			dir
		},
		{},
		{}
	)}</div>

	<button class="${"svelte-1itkhys"}">${validate_component(Icon, "Icon").$$render($$result, { name:  "menu" }, {}, {})}</button></aside>`;
});

/* node_modules/@sveltejs/site-kit/components/ParallaxLogo.svelte generated by Svelte v3.31.0 */

const css$5 = {
	code: ".parallax.svelte-1inoott{position:absolute;top:-4rem;right:0rem;width:50rem;will-change:transform;display:none}@media(min-width: 800px){.parallax.svelte-1inoott{display:block}}@media(min-width: 1200px){.parallax.svelte-1inoott{right:calc(50vw - 60rem)}}",
	map: "{\"version\":3,\"file\":\"ParallaxLogo.svelte\",\"sources\":[\"ParallaxLogo.svelte\"],\"sourcesContent\":[\"<script>\\n\\texport let src;\\n\\texport let alt;\\n\\n\\tlet sy = 0;\\n</script>\\n\\n<svelte:window bind:scrollY={sy}/>\\n\\n<style>\\n\\t.parallax {\\n\\t\\tposition: absolute;\\n\\t\\ttop: -4rem;\\n\\t\\tright: 0rem;\\n\\t\\twidth: 50rem;\\n\\t\\twill-change: transform;\\n\\t\\tdisplay: none;\\n\\t}\\n\\n\\t@media (min-width: 800px) {\\n\\t\\t.parallax {\\n\\t\\t\\tdisplay: block;\\n\\t\\t}\\n\\t}\\n\\n\\t@media (min-width: 1200px) {\\n\\t\\t.parallax {\\n\\t\\t\\tright: calc(50vw - 60rem);\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<img {alt} {src} class=\\\"parallax\\\" style=\\\"transform: translate(0, {sy * .2}px)\\\">\"],\"names\":[],\"mappings\":\"AAUC,SAAS,eAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,KAAK,CACV,KAAK,CAAE,IAAI,CACX,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,SAAS,CACtB,OAAO,CAAE,IAAI,AACd,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,SAAS,eAAC,CAAC,AACV,OAAO,CAAE,KAAK,AACf,CAAC,AACF,CAAC,AAED,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3B,SAAS,eAAC,CAAC,AACV,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,AAC1B,CAAC,AACF,CAAC\"}"
};

const ParallaxLogo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { src } = $$props;
	let { alt } = $$props;
	let sy = 0;
	if ($$props.src === void 0 && $$bindings.src && src !== void 0) $$bindings.src(src);
	if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0) $$bindings.alt(alt);
	$$result.css.add(css$5);

	return `



<img${add_attribute("alt", alt, 0)}${add_attribute("src", src, 0)} class="${"parallax svelte-1inoott"}" style="${"transform: translate(0, " + escape(sy * 0.2) + "px)"}">`;
});

/* node_modules/@sveltejs/site-kit/components/Hero.svelte generated by Svelte v3.31.0 */

const css$6 = {
	code: ".hero.svelte-1u1foo2.svelte-1u1foo2{position:relative;margin:10rem auto;padding:0 var(--side-nav);max-width:120rem}h3.svelte-1u1foo2.svelte-1u1foo2{color:var(--text) }.hero.svelte-1u1foo2.svelte-1u1foo2{margin:10rem auto}.hero.svelte-1u1foo2 h3.svelte-1u1foo2,.logotype.svelte-1u1foo2.svelte-1u1foo2{position:relative;left:1.6rem}.hero.svelte-1u1foo2 h3.svelte-1u1foo2{font-size:2rem}.logotype.svelte-1u1foo2.svelte-1u1foo2{height:4rem}@media(min-width: 640px){.logotype.svelte-1u1foo2.svelte-1u1foo2{height:6rem}.hero.svelte-1u1foo2 h3.svelte-1u1foo2{font-size:var(--h3)}}@media(min-width: 800px){.hero.svelte-1u1foo2.svelte-1u1foo2{margin:15rem auto}.hero.svelte-1u1foo2 h3.svelte-1u1foo2,.logotype.svelte-1u1foo2.svelte-1u1foo2{left:3rem}}",
	map: "{\"version\":3,\"file\":\"Hero.svelte\",\"sources\":[\"Hero.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport ParallaxLogo from './ParallaxLogo.svelte';\\n\\n\\texport let title;\\n\\texport let tagline;\\n\\texport let logotype;\\n\\texport let outline;\\n</script>\\n\\n<style>\\n\\t.hero {\\n\\t\\tposition: relative;\\n\\t\\tmargin: 10rem auto;\\n\\t\\tpadding: 0 var(--side-nav);\\n\\t\\tmax-width: 120rem;\\n\\t}\\n\\n\\th3 { color: var(--text) }\\n\\n\\t.hero {\\n\\t\\tmargin: 10rem auto;\\n\\t}\\n\\n\\t.hero h3, .logotype {\\n\\t\\tposition: relative;\\n\\t\\tleft: 1.6rem;\\n\\t}\\n\\n\\t.hero h3 {\\n\\t\\tfont-size: 2rem;\\n\\t}\\n\\n\\t.logotype {\\n\\t\\theight: 4rem;\\n\\t}\\n\\n\\t@media (min-width: 640px) {\\n\\t\\t.logotype {\\n\\t\\t\\theight: 6rem;\\n\\t\\t}\\n\\n\\t\\t.hero h3 {\\n\\t\\t\\tfont-size: var(--h3);\\n\\t\\t}\\n\\t}\\n\\n\\t@media (min-width: 800px) {\\n\\t\\t.hero {\\n\\t\\t\\tmargin: 15rem auto;\\n\\t\\t}\\n\\n\\t\\t.hero h3, .logotype {\\n\\t\\t\\tleft: 3rem;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<ParallaxLogo alt=\\\"{title} logo\\\" src={outline}/>\\n\\n<section class=\\\"hero\\\">\\n\\t<img alt=\\\"{title} logotype\\\" class=\\\"logotype\\\" src={logotype}>\\n\\t<h3>{tagline}</h3>\\n</section>\"],\"names\":[],\"mappings\":\"AAUC,KAAK,8BAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,KAAK,CAAC,IAAI,CAClB,OAAO,CAAE,CAAC,CAAC,IAAI,UAAU,CAAC,CAC1B,SAAS,CAAE,MAAM,AAClB,CAAC,AAED,EAAE,8BAAC,CAAC,AAAC,KAAK,CAAE,IAAI,MAAM,CAAC,CAAC,CAAC,AAEzB,KAAK,8BAAC,CAAC,AACN,MAAM,CAAE,KAAK,CAAC,IAAI,AACnB,CAAC,AAED,oBAAK,CAAC,iBAAE,CAAE,SAAS,8BAAC,CAAC,AACpB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,MAAM,AACb,CAAC,AAED,oBAAK,CAAC,EAAE,eAAC,CAAC,AACT,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,SAAS,8BAAC,CAAC,AACV,MAAM,CAAE,IAAI,AACb,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,SAAS,8BAAC,CAAC,AACV,MAAM,CAAE,IAAI,AACb,CAAC,AAED,oBAAK,CAAC,EAAE,eAAC,CAAC,AACT,SAAS,CAAE,IAAI,IAAI,CAAC,AACrB,CAAC,AACF,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,KAAK,8BAAC,CAAC,AACN,MAAM,CAAE,KAAK,CAAC,IAAI,AACnB,CAAC,AAED,oBAAK,CAAC,iBAAE,CAAE,SAAS,8BAAC,CAAC,AACpB,IAAI,CAAE,IAAI,AACX,CAAC,AACF,CAAC\"}"
};

const Hero = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { title } = $$props;
	let { tagline } = $$props;
	let { logotype } = $$props;
	let { outline } = $$props;
	if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
	if ($$props.tagline === void 0 && $$bindings.tagline && tagline !== void 0) $$bindings.tagline(tagline);
	if ($$props.logotype === void 0 && $$bindings.logotype && logotype !== void 0) $$bindings.logotype(logotype);
	if ($$props.outline === void 0 && $$bindings.outline && outline !== void 0) $$bindings.outline(outline);
	$$result.css.add(css$6);

	return `${validate_component(ParallaxLogo, "ParallaxLogo").$$render($$result, { alt: title + " logo", src: outline }, {}, {})}

<section class="${"hero svelte-1u1foo2"}"><img alt="${escape(title) + " logotype"}" class="${"logotype svelte-1u1foo2"}"${add_attribute("src", logotype, 0)}>
	<h3 class="${"svelte-1u1foo2"}">${escape(tagline)}</h3></section>`;
});

/* node_modules/@sveltejs/site-kit/components/Icons.svelte generated by Svelte v3.31.0 */

const Icons = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `<div style="${"display: none"}">
	<svg><symbol id="${"arrow-left"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"19"}" y1="${"12"}" x2="${"5"}" y2="${"12"}"></line><polyline points="${"12 19 5 12 12 5"}"></polyline></symbol><symbol id="${"arrow-right"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"5"}" y1="${"12"}" x2="${"19"}" y2="${"12"}"></line><polyline points="${"12 5 19 12 12 19"}"></polyline></symbol><symbol id="${"arrow-up"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"12"}" y1="${"19"}" x2="${"12"}" y2="${"5"}"></line><polyline points="${"5 12 12 5 19 12"}"></polyline></symbol><symbol id="${"arrow-down"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"12"}" y1="${"5"}" x2="${"12"}" y2="${"19"}"></line><polyline points="${"19 12 12 19 5 12"}"></polyline></symbol><symbol id="${"check"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><polyline points="${"20 6 9 17 4 12"}"></polyline></symbol><symbol id="${"close"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"18"}" y1="${"6"}" x2="${"6"}" y2="${"18"}"></line><line x1="${"6"}" y1="${"6"}" x2="${"18"}" y2="${"18"}"></line></symbol><symbol id="${"download"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15"}"></path><polyline points="${"7 10 12 15 17 10"}"></polyline><line x1="${"12"}" y1="${"15"}" x2="${"12"}" y2="${"3"}"></line></symbol><symbol id="${"edit"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"}"></path><polygon points="${"18 2 22 6 12 16 8 16 8 12 18 2"}"></polygon></symbol><symbol id="${"github"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"}"></path></symbol><symbol id="${"git-branch"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"6"}" y1="${"3"}" x2="${"6"}" y2="${"15"}"></line><circle cx="${"18"}" cy="${"6"}" r="${"3"}"></circle><circle cx="${"6"}" cy="${"18"}" r="${"3"}"></circle><path d="${"M18 9a9 9 0 0 1-9 9"}"></path></symbol><symbol id="${"log-in"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15"}"></path><polyline points="${"10 17 15 12 10 7"}"></polyline><line x1="${"15"}" y1="${"12"}" x2="${"3"}" y2="${"12"}"></line></symbol><symbol id="${"maximize"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"}"></path></symbol><symbol id="${"maximize-2"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><polyline points="${"15 3 21 3 21 9"}"></polyline><polyline points="${"9 21 3 21 3 15"}"></polyline><line x1="${"21"}" y1="${"3"}" x2="${"14"}" y2="${"10"}"></line><line x1="${"3"}" y1="${"21"}" x2="${"10"}" y2="${"14"}"></line></symbol><symbol id="${"menu"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"3"}" y1="${"12"}" x2="${"21"}" y2="${"12"}"></line><line x1="${"3"}" y1="${"6"}" x2="${"21"}" y2="${"6"}"></line><line x1="${"3"}" y1="${"18"}" x2="${"21"}" y2="${"18"}"></line></symbol><symbol id="${"message-square"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"}"></path></symbol><symbol id="${"minus"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"5"}" y1="${"12"}" x2="${"19"}" y2="${"12"}"></line></symbol><symbol id="${"plus"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><line x1="${"12"}" y1="${"5"}" x2="${"12"}" y2="${"19"}"></line><line x1="${"5"}" y1="${"12"}" x2="${"19"}" y2="${"12"}"></line></symbol><symbol id="${"save"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"}"></path><polyline points="${"17 21 17 13 7 13 7 21"}"></polyline><polyline points="${"7 3 7 8 15 8"}"></polyline></symbol><symbol id="${"link"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M9,7L6,7A2 2 0 0 0 6,17L9,17"}"></path><path d="${"M15,7L18,7A2 2 0 0 1 18,17L15,17"}"></path><path d="${"M7,12L17,12"}"></path></symbol><symbol id="${"chevron"}" class="${"icon"}" viewBox="${"0 0 24 24"}"><path d="${"M2,7 L12,17 L20,7"}"></path></symbol></svg></div>`;
});

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop$1) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop$1) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop$1;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

/* node_modules/@sveltejs/site-kit/components/Nav.svelte generated by Svelte v3.31.0 */

const css$7 = {
	code: "header.svelte-1txnqye{position:fixed;display:flex;align-items:center;justify-content:space-between;width:100vw;height:var(--nav-h);padding:0 var(--side-nav);margin:0 auto;background-color:white;box-shadow:0 -0.4rem 0.9rem 0.2rem rgba(0,0,0,.5);font-family:var(--font);z-index:100;user-select:none;transform:translate(0,calc(-100% - 1rem));transition:transform 0.2s}header.visible.svelte-1txnqye{transform:none}nav.svelte-1txnqye{position:fixed;top:0;left:0;width:100vw;height:var(--nav-h);padding:0 var(--side-nav) 0 var(--side-nav);display:flex;align-items:center;justify-content:space-between;background-color:transparent;transform:none;transition:none;box-shadow:none}.primary.svelte-1txnqye{list-style:none;font-family:var(--font);margin:0;line-height:1}ul.svelte-1txnqye li{display:block;display:none}ul.svelte-1txnqye li.active{display:block}ul.svelte-1txnqye{position:relative;padding:0 3rem 0 0;background:url(/icons/chevron.svg) calc(100% - 1em) 0.05em no-repeat;background-size:1em 1em}ul.svelte-1txnqye::after{position:absolute;content:'';width:100%;height:100%;left:0;top:0}ul.open.svelte-1txnqye{padding:0 0 1em 0;background:white;border-left:1px solid #eee;border-right:1px solid #eee;border-bottom:1px solid #eee;border-radius:0 0 var(--border-r) var(--border-r);align-self:start}ul.open.svelte-1txnqye li{display:block;text-align:right\n\t}ul.open.svelte-1txnqye::after{display:none}ul.svelte-1txnqye li a{font-size:var(--h5);padding:0 .8rem;border:none;color:inherit}ul.open.svelte-1txnqye li a{padding:1.5rem 3.7rem 1.5rem 4rem;display:block}ul.open.svelte-1txnqye li:first-child a{padding-top:2.3rem}.primary.svelte-1txnqye svg{width:2rem;height:2rem}.home.svelte-1txnqye{position:relative;top:-.1rem;width:18rem;height:4.2rem;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;background:0 50% no-repeat;background-size:auto 100%;text-indent:-9999px}ul.svelte-1txnqye li.active a{color:var(--prime)\n\t}.modal-background.svelte-1txnqye{position:fixed;width:100%;height:100%;left:0;top:0;background-color:rgba(255, 255, 255, 0.9)}a.svelte-1txnqye{color:inherit;border-bottom:none;transition:none}ul.svelte-1txnqye li:not(.active) a:hover{color:var(--flash)}@media(min-width: 840px){ul.svelte-1txnqye{padding:0;background:none}ul.open.svelte-1txnqye{padding:0;background:white;border:none;align-self:initial}ul.open.svelte-1txnqye li{display:inline;text-align:left}ul.open.svelte-1txnqye li a{font-size:var(--h5);padding:0 .8rem;display:inline}ul.svelte-1txnqye::after{display:none}ul.svelte-1txnqye li{display:inline !important}.hide-if-desktop.svelte-1txnqye{display:none !important}}",
	map: "{\"version\":3,\"file\":\"Nav.svelte\",\"sources\":[\"Nav.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { onMount, setContext } from 'svelte';\\n\\timport { writable } from 'svelte/store';\\n\\timport Icon from './Icon.svelte';\\n\\n\\texport let segment;\\n\\texport let page;\\n\\texport let logo;\\n\\texport let home = 'Home';\\n\\texport let home_title = 'Homepage';\\n\\n\\tconst current = writable(null);\\n\\tsetContext('nav', current);\\n\\n\\tlet open = false;\\n\\tlet visible = true;\\n\\n\\t// hide nav whenever we navigate\\n\\tpage.subscribe(() => {\\n\\t\\topen = false;\\n\\t});\\n\\n\\tfunction intercept_touchstart(event) {\\n\\t\\tif (!open) {\\n\\t\\t\\tevent.preventDefault();\\n\\t\\t\\tevent.stopPropagation();\\n\\t\\t\\topen = true;\\n\\t\\t}\\n\\t}\\n\\n\\t// Prevents navbar to show/hide when clicking in docs sidebar\\n\\tlet hash_changed = false;\\n\\tfunction handle_hashchange() {\\n\\t\\thash_changed = true;\\n\\t}\\n\\n\\tlet last_scroll = 0;\\n\\tfunction handle_scroll() {\\n\\t\\tconst scroll = window.pageYOffset;\\n\\t\\tif (!hash_changed) {\\n\\t\\t\\tvisible = (scroll < 50 || scroll < last_scroll);\\n\\t\\t}\\n\\n\\t\\tlast_scroll = scroll;\\n\\t\\thash_changed = false;\\n\\t}\\n\\n\\t$: $current = segment;\\n</script>\\n\\n<style>\\n\\theader {\\n\\t\\tposition: fixed;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: space-between;\\n\\t\\twidth: 100vw;\\n\\t\\theight: var(--nav-h);\\n\\t\\tpadding: 0 var(--side-nav);\\n\\t\\tmargin: 0 auto;\\n\\t\\tbackground-color: white;\\n\\t\\tbox-shadow: 0 -0.4rem 0.9rem 0.2rem rgba(0,0,0,.5);\\n\\t\\tfont-family: var(--font);\\n\\t\\tz-index: 100;\\n\\t\\tuser-select: none;\\n\\t\\ttransform: translate(0,calc(-100% - 1rem));\\n\\t\\ttransition: transform 0.2s;\\n\\t}\\n\\n\\theader.visible {\\n\\t\\ttransform: none;\\n\\t}\\n\\n\\tnav {\\n\\t\\tposition: fixed;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 100vw;\\n\\t\\theight: var(--nav-h);\\n\\t\\tpadding: 0 var(--side-nav) 0 var(--side-nav);\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: space-between;\\n\\t\\tbackground-color: transparent;\\n\\t\\ttransform: none;\\n\\t\\ttransition: none;\\n\\t\\tbox-shadow: none;\\n\\t}\\n\\n\\t.primary {\\n\\t\\tlist-style: none;\\n\\t\\tfont-family: var(--font);\\n\\t\\tmargin: 0;\\n\\t\\tline-height: 1;\\n\\t}\\n\\n\\tul :global(li) {\\n\\t\\tdisplay: block;\\n\\t\\tdisplay: none;\\n\\t}\\n\\n\\tul :global(li).active {\\n\\t\\tdisplay: block;\\n\\t}\\n\\n\\tul {\\n\\t\\tposition: relative;\\n\\t\\tpadding: 0 3rem 0 0;\\n\\t\\tbackground: url(/icons/chevron.svg) calc(100% - 1em) 0.05em no-repeat;\\n\\t\\tbackground-size: 1em 1em;\\n\\t}\\n\\n\\tul::after {\\n\\t\\t/* prevent clicks from registering if nav is closed */\\n\\t\\tposition: absolute;\\n\\t\\tcontent: '';\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t}\\n\\n\\tul.open {\\n\\t\\tpadding: 0 0 1em 0;\\n\\t\\tbackground: white;\\n\\t\\tborder-left: 1px solid #eee;\\n\\t\\tborder-right: 1px solid #eee;\\n\\t\\tborder-bottom: 1px solid #eee;\\n\\t\\tborder-radius: 0 0 var(--border-r) var(--border-r);\\n\\t\\talign-self: start;\\n\\t}\\n\\n\\tul.open :global(li) {\\n\\t\\tdisplay: block;\\n\\t\\ttext-align: right\\n\\t}\\n\\n\\tul.open::after {\\n\\t\\tdisplay: none;\\n\\t}\\n\\n\\tul :global(li) :global(a) {\\n\\t\\tfont-size: var(--h5);\\n\\t\\tpadding: 0 .8rem;\\n\\t\\tborder: none;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\tul.open :global(li) :global(a) {\\n\\t\\tpadding: 1.5rem 3.7rem 1.5rem 4rem;\\n\\t\\tdisplay: block;\\n\\t}\\n\\n\\tul.open :global(li):first-child :global(a) {\\n\\t\\tpadding-top: 2.3rem;\\n\\t}\\n\\n\\t.primary :global(svg) {\\n\\t\\twidth: 2rem;\\n\\t\\theight: 2rem;\\n\\t}\\n\\n\\t.home {\\n\\t\\tposition: relative;\\n\\t\\ttop: -.1rem;\\n\\t\\twidth: 18rem;\\n\\t\\theight: 4.2rem;\\n\\t\\t-webkit-tap-highlight-color: transparent;\\n\\t\\t-webkit-touch-callout: none;\\n\\t\\tbackground: 0 50% no-repeat;\\n\\t\\tbackground-size: auto 100%;\\n\\t\\ttext-indent: -9999px;\\n\\t\\t/* z-index: 11; */\\n\\t}\\n\\n\\tul :global(li).active :global(a) {\\n\\t\\tcolor: var(--prime)\\n\\t}\\n\\n\\t.modal-background {\\n\\t\\tposition: fixed;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tbackground-color: rgba(255, 255, 255, 0.9);\\n\\t}\\n\\n\\ta {\\n\\t\\tcolor: inherit;\\n\\t\\tborder-bottom: none;\\n\\t\\ttransition: none;\\n\\t}\\n\\n\\tul :global(li):not(.active) :global(a):hover {\\n\\t\\tcolor: var(--flash);\\n\\t}\\n\\n\\t@media (min-width: 840px) {\\n\\t\\tul {\\n\\t\\t\\tpadding: 0;\\n\\t\\t\\tbackground: none;\\n\\t\\t}\\n\\n\\t\\tul.open {\\n\\t\\t\\tpadding: 0;\\n\\t\\t\\tbackground: white;\\n\\t\\t\\tborder: none;\\n\\t\\t\\talign-self: initial;\\n\\t\\t}\\n\\n\\t\\tul.open :global(li) {\\n\\t\\t\\tdisplay: inline;\\n\\t\\t\\ttext-align: left;\\n\\t\\t}\\n\\n\\t\\tul.open :global(li) :global(a) {\\n\\t\\t\\tfont-size: var(--h5);\\n\\t\\t\\tpadding: 0 .8rem;\\n\\t\\t\\tdisplay: inline;\\n\\t\\t}\\n\\n\\t\\tul::after {\\n\\t\\t\\tdisplay: none;\\n\\t\\t}\\n\\n\\t\\tul :global(li) {\\n\\t\\t\\tdisplay: inline !important;\\n\\t\\t}\\n\\n\\t\\t.hide-if-desktop {\\n\\t\\t\\tdisplay: none !important;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<svelte:window on:hashchange={handle_hashchange} on:scroll={handle_scroll} />\\n\\n<header class:visible=\\\"{visible || open}\\\">\\n\\t<nav>\\n\\t\\t<a\\n\\t\\t\\trel=\\\"prefetch\\\"\\n\\t\\t\\thref=\\\".\\\"\\n\\t\\t\\tclass=\\\"home\\\"\\n\\t\\t\\ttitle=\\\"{home_title}\\\"\\n\\t\\t\\tstyle=\\\"background-image: url({logo})\\\"\\n\\t\\t>{home}</a>\\n\\n\\t\\t{#if open}\\n\\t\\t\\t<div class=\\\"modal-background hide-if-desktop\\\" on:click=\\\"{() => open = false}\\\"></div>\\n\\t\\t{/if}\\n\\n\\t\\t<ul\\n\\t\\t\\tclass=\\\"primary\\\"\\n\\t\\t\\tclass:open\\n\\t\\t\\ton:touchstart|capture={intercept_touchstart}\\n\\t\\t\\ton:mouseenter=\\\"{() => open = true}\\\"\\n\\t\\t\\ton:mouseleave=\\\"{() => open = false}\\\"\\n\\t\\t>\\n\\t\\t\\t<li class=\\\"hide-if-desktop\\\" class:active=\\\"{!segment}\\\"><a rel=\\\"prefetch\\\" href=\\\".\\\">{home}</a></li>\\n\\t\\t\\t<slot></slot>\\n\\t\\t</ul>\\n\\t</nav>\\n</header>\\n\"],\"names\":[],\"mappings\":\"AAmDC,MAAM,eAAC,CAAC,AACP,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aAAa,CAC9B,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,OAAO,CAAC,CACpB,OAAO,CAAE,CAAC,CAAC,IAAI,UAAU,CAAC,CAC1B,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,gBAAgB,CAAE,KAAK,CACvB,UAAU,CAAE,CAAC,CAAC,OAAO,CAAC,MAAM,CAAC,MAAM,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAClD,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,OAAO,CAAE,GAAG,CACZ,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,UAAU,CAAC,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAC1C,UAAU,CAAE,SAAS,CAAC,IAAI,AAC3B,CAAC,AAED,MAAM,QAAQ,eAAC,CAAC,AACf,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,GAAG,eAAC,CAAC,AACJ,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,OAAO,CAAC,CACpB,OAAO,CAAE,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAC5C,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aAAa,CAC9B,gBAAgB,CAAE,WAAW,CAC7B,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,QAAQ,eAAC,CAAC,AACT,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,CAAC,AACf,CAAC,AAED,iBAAE,CAAC,AAAQ,EAAE,AAAE,CAAC,AACf,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,IAAI,AACd,CAAC,AAED,iBAAE,CAAC,AAAQ,EAAE,AAAC,OAAO,AAAC,CAAC,AACtB,OAAO,CAAE,KAAK,AACf,CAAC,AAED,EAAE,eAAC,CAAC,AACH,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CACnB,UAAU,CAAE,IAAI,kBAAkB,CAAC,CAAC,KAAK,IAAI,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,MAAM,CAAC,SAAS,CACrE,eAAe,CAAE,GAAG,CAAC,GAAG,AACzB,CAAC,AAED,iBAAE,OAAO,AAAC,CAAC,AAEV,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,AACP,CAAC,AAED,EAAE,KAAK,eAAC,CAAC,AACR,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAClB,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC3B,YAAY,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC5B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC7B,aAAa,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,UAAU,CAAC,CAClD,UAAU,CAAE,KAAK,AAClB,CAAC,AAED,EAAE,oBAAK,CAAC,AAAQ,EAAE,AAAE,CAAC,AACpB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,KAAK;CAClB,CAAC,AAED,EAAE,oBAAK,OAAO,AAAC,CAAC,AACf,OAAO,CAAE,IAAI,AACd,CAAC,AAED,iBAAE,CAAC,AAAQ,EAAE,AAAC,CAAC,AAAQ,CAAC,AAAE,CAAC,AAC1B,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,OAAO,CAAE,CAAC,CAAC,KAAK,CAChB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,OAAO,AACf,CAAC,AAED,EAAE,oBAAK,CAAC,AAAQ,EAAE,AAAC,CAAC,AAAQ,CAAC,AAAE,CAAC,AAC/B,OAAO,CAAE,MAAM,CAAC,MAAM,CAAC,MAAM,CAAC,IAAI,CAClC,OAAO,CAAE,KAAK,AACf,CAAC,AAED,EAAE,oBAAK,CAAC,AAAQ,EAAE,AAAC,YAAY,CAAC,AAAQ,CAAC,AAAE,CAAC,AAC3C,WAAW,CAAE,MAAM,AACpB,CAAC,AAED,uBAAQ,CAAC,AAAQ,GAAG,AAAE,CAAC,AACtB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC,AAED,KAAK,eAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,MAAM,CACX,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,MAAM,CACd,2BAA2B,CAAE,WAAW,CACxC,qBAAqB,CAAE,IAAI,CAC3B,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,SAAS,CAC3B,eAAe,CAAE,IAAI,CAAC,IAAI,CAC1B,WAAW,CAAE,OAAO,AAErB,CAAC,AAED,iBAAE,CAAC,AAAQ,EAAE,AAAC,OAAO,CAAC,AAAQ,CAAC,AAAE,CAAC,AACjC,KAAK,CAAE,IAAI,OAAO,CAAC;CACpB,CAAC,AAED,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,gBAAgB,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,AAC3C,CAAC,AAED,CAAC,eAAC,CAAC,AACF,KAAK,CAAE,OAAO,CACd,aAAa,CAAE,IAAI,CACnB,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,iBAAE,CAAC,AAAQ,EAAE,AAAC,KAAK,OAAO,CAAC,CAAC,AAAQ,CAAC,AAAC,MAAM,AAAC,CAAC,AAC7C,KAAK,CAAE,IAAI,OAAO,CAAC,AACpB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,EAAE,eAAC,CAAC,AACH,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,EAAE,KAAK,eAAC,CAAC,AACR,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,OAAO,AACpB,CAAC,AAED,EAAE,oBAAK,CAAC,AAAQ,EAAE,AAAE,CAAC,AACpB,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,EAAE,oBAAK,CAAC,AAAQ,EAAE,AAAC,CAAC,AAAQ,CAAC,AAAE,CAAC,AAC/B,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,OAAO,CAAE,CAAC,CAAC,KAAK,CAChB,OAAO,CAAE,MAAM,AAChB,CAAC,AAED,iBAAE,OAAO,AAAC,CAAC,AACV,OAAO,CAAE,IAAI,AACd,CAAC,AAED,iBAAE,CAAC,AAAQ,EAAE,AAAE,CAAC,AACf,OAAO,CAAE,MAAM,CAAC,UAAU,AAC3B,CAAC,AAED,gBAAgB,eAAC,CAAC,AACjB,OAAO,CAAE,IAAI,CAAC,UAAU,AACzB,CAAC,AACF,CAAC\"}"
};

const Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $current;
	let { segment } = $$props;
	let { page } = $$props;
	let { logo } = $$props;
	let { home = "Home" } = $$props;
	let { home_title = "Homepage" } = $$props;
	const current = writable(null);
	validate_store(current, "current");
	$current = get_store_value(current);
	setContext("nav", current);
	let open = false;

	// hide nav whenever we navigate
	page.subscribe(() => {
		open = false;
	});

	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);
	if ($$props.page === void 0 && $$bindings.page && page !== void 0) $$bindings.page(page);
	if ($$props.logo === void 0 && $$bindings.logo && logo !== void 0) $$bindings.logo(logo);
	if ($$props.home === void 0 && $$bindings.home && home !== void 0) $$bindings.home(home);
	if ($$props.home_title === void 0 && $$bindings.home_title && home_title !== void 0) $$bindings.home_title(home_title);
	$$result.css.add(css$7);
	validate_store(current, "current");
	$current = get_store_value(current);
	$current = segment;

	return `

<header class="${["svelte-1txnqye",  "visible" ].join(" ").trim()}"><nav class="${"svelte-1txnqye"}"><a rel="${"prefetch"}" href="${"."}" class="${"home svelte-1txnqye"}"${add_attribute("title", home_title, 0)} style="${"background-image: url(" + escape(logo) + ")"}">${escape(home)}</a>

		${open
	? `<div class="${"modal-background hide-if-desktop svelte-1txnqye"}"></div>`
	: ``}

		<ul class="${["primary svelte-1txnqye", open ? "open" : ""].join(" ").trim()}"><li class="${["hide-if-desktop svelte-1txnqye", !segment ? "active" : ""].join(" ").trim()}"><a rel="${"prefetch"}" href="${"."}" class="${"svelte-1txnqye"}">${escape(home)}</a></li>
			${slots.default ? slots.default({}) : ``}</ul></nav></header>`;
});

/* node_modules/@sveltejs/site-kit/components/NavItem.svelte generated by Svelte v3.31.0 */

const NavItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $current;
	let { segment = null } = $$props;
	let { external = null } = $$props;
	let { title = null } = $$props;
	const current = getContext("nav");
	validate_store(current, "current");
	$current = get_store_value(current);
	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);
	if ($$props.external === void 0 && $$bindings.external && external !== void 0) $$bindings.external(external);
	if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
	validate_store(current, "current");
	$current = get_store_value(current);

	return `${external
	? `<li><a${add_attribute("href", external, 0)}${add_attribute("title", title, 0)}>${slots.default ? slots.default({}) : ``}</a></li>`
	: `<li${add_classes([$current === segment ? "active" : ""].join(" ").trim())}><a rel="${"prefetch"}"${add_attribute("href", segment, 0)}${add_attribute("title", title, 0)}>${slots.default ? slots.default({}) : ``}</a></li>`}`;
});

var contributors = [
	'Rich-Harris',
	'Conduitry',
	'tanhauhau',
	'Swatinem',
	'benmccann',
	'lukeed',
	'jacwright',
	'mindrones',
	'mrkishi',
	'ekhaled',
	'EmilTholin',
	'antony',
	'pngwn',
	'zxbodya',
	'btk5h',
	'jches',
	'tivac',
	'PaulBGD',
	'GarrettGeorge',
	'btakita',
	'FWeinb',
	'dummdidumm',
	'pushkine',
	'evs-chris',
	'colincasey',
	'UnwrittenFun',
	'TehShrike',
	'jacobmischka',
	'halfnelson',
	'dependabot[bot]',
	'kaisermann',
	'Panya',
	'sanderhahn',
	'aphitiel',
	'skippednote',
	'MattiasBuelens',
	'ehrencrona',
	'dimfeld',
	'd3sandoval',
	'Harald-1',
	'Axelen123',
	'm59peacemaker',
	'taylorzane',
	'leporo',
	'sw-yx',
	'dkondrad',
	'stalkerg',
	'esarbanis',
	'hperrin',
	'LostKobrakai',
	'jesseskinner',
	'CreaturesInUnitards',
	'peopledrivemecrazy',
	'umanghome',
	'thollander',
	'emilos',
	'kevmodrome',
	'AlexxNB',
	'AlbertLucianto',
	'cristinecula',
	'MikeMatrix',
	'shinnn',
	'timhall',
	'Wolfr',
	'bre30kra69cs',
	'milahu',
	'Vages',
	'efeskucuk',
	'ItalyPaleAle',
	'andrelmlins',
	'bwbroersma',
	'clarkdo',
	'hong4rc',
	'lukasIO',
	'ElectronSz',
	'NitayRabi',
	'orta',
	'PaulMaly',
	'arxpoetica',
	'samuelgozi',
	'js2me',
	'trbrc',
	'43081j',
	'123aswin123',
	'BillyLevin',
	'dmitrykurmanov',
	'geoffrich',
	'aarongeorge',
	'arackaf',
	'industral',
	'allantito',
	'almaz-khan',
	'amwmedia',
	'benlesh',
	'bfanger',
	'CMessinides',
	'chrishelgert',
	'Crisfole',
	'funkybob',
	'membranophonist',
	'deanmcpherson',
	'neoel',
	'dreitzner',
	'SrZorro',
	'ceifa',
	'Jingmnt',
	'johnmuhl',
	'zlsa',
	'matt3224',
	'mattwolff',
	'nikku',
	'oguzhaninan',
	'PKlknr',
	'varholak-peter',
	'RobinCsl',
	'sercaneraslan',
	'kyrylkov',
	'vascoosx',
	'stephane-vanraes',
	'SteveALee',
	'Th0rN13',
	'thgh',
	'timdeschryver',
	'saibotsivad',
	'cvlab',
	'adrian5',
	'cayasso',
	'cudr',
	'dasZGFz',
	'cbolgiano',
	'gabysantosw',
	'martinandert',
	'mustafa0x',
	'elliotwaite',
	'fjorgemota',
	'vaibhav111tandon',
	'davidaq',
	'rixo',
	'vedam',
	'adamdune',
	'1wheel',
	'ooade',
	'Alaricus',
	'alexnoz',
	'Pierstoval',
	'Alex-CS',
	'aorel',
	'AlexandreCantin',
	'AlexGalays',
	'MeuhMeuh',
	'AmirHosseinHmd1',
	'Phaqui',
	'andreieftimie',
	'talklittle',
	'abruere',
	'ankeetmaini',
	'anthonylegoas',
	'aredridel',
	'arthurdenner',
	'acstll',
	'guzart',
	'el1f',
	'webdesq',
	'remotelydev',
	'benoror',
	'palewire',
	'benschac',
	'bdougherty',
	'bravecow',
	'blittle',
	'c0bra',
	'bsssshhhhhhh',
	'cj81499',
	'camjackson',
	'caroso1222',
	'InsanityOnABun',
	'Cleecanth',
	'chris-morgan',
	'caengen',
	'christianheine',
	'klaussner',
	'clebert',
	'dalemartyn',
	'damianpumar',
	'DanielPower',
	'himynameisdave',
	'davebrent',
	'davemo',
	'widyakumara',
	'dogagenc',
	'cornerfarmer',
	'StarpTech',
	'EddyVinck',
	'ematipico',
	'enstyled',
	'ericdfields',
	'skrifblokk',
	'evanmoncuso',
	'vilarfg',
	'fraserdarwent',
	'Gabswim',
	'gautamkrishnar',
	'GeopJr',
	'gonfva',
	'gka',
	'Denhai',
	'hchatel',
	'IlyaSemenov',
	'newbornfrontender',
	'irshad',
	'irshadshalu',
	'ilblog',
	'IvanSanchez',
	'j-delaney',
	'beegan',
	'jackyef',
	'lunchboxer',
	'jthegedus',
	'foucist',
	'Rukenshia',
	'JeremyBernier',
	'Joxtacy',
	'jesmrie',
	'jwicks31',
	'johman10',
	'dravog7',
	'joncfoo',
	'6eDesign',
	'Jongkeun',
	'kesne',
	'jormaj',
	'tel',
	'JounQin',
	'joaopaulobdac',
	'getkey',
	'pyoner',
	'kjj6198',
	'Karsten7',
	'khtdr',
	'netaisllc',
	'lewoudar',
	'kieranbarker',
	'Kiho',
	'atomAltera',
	'leereamsnyder',
	'div-Leo',
	'leomarquine',
	'axil',
	'itsliamegan',
	'lode',
	'lorenbrichter',
	'lguzzon',
	'lukasmoellerch',
	'lyndsysimon',
	'habibrosyad',
	'baslr',
	'MShuttle',
	'marvinhagemeister',
	'mahenrique94',
	'mdempsky',
	'MaxMilton',
	'mikedubcurry',
	'majkelbed',
	'mterczynski',
	'mkhan45',
	'mtlewis',
	'khorpy',
	'stokesman',
	'Milesq',
	'nick-vincent',
	'nicolasmgaray',
	'charpeni',
	'jacoux',
	'quantuminformation',
	'njbotkin',
	'nolanlawson',
	'Olanetsoft',
	'omeraplak',
	'oscarmattsson',
	'vp2177',
	'plmrry',
	'paulocoghi',
	'pboling',
	'blackwolf12333',
	'RAYDENFilipp',
	'michaelphipps',
	'hontas',
	'raitalharehman',
	'rajnandan1',
	'retotrinkler',
	'rihardsgravis',
	'rohanfaiyazkhan',
	'rohankokane',
	'91k',
	'rmariuzzo',
	'ryanatkn',
	'samccone',
	'hantatsang',
	'mrsauravsahu',
	'scottbedard',
	'eps1lon',
	'sebastian-stephan',
	'shakhbulatgaz',
	'lenovouser',
	'Softmus',
	'CyberAP',
	'buhrmi',
	'sdemjanenko',
	'StevenWeathers',
	'teymour-aldridge',
	'ThomasFerro',
	'tiberiuc',
	'Gohlisch',
	'timgates42',
	'tcrowe',
	'thelgevold',
	'VarunDevPro',
	'Ti-webdev',
	'venkateshwarans',
	'FlipFloop',
	'vidaren',
	'SleepyWerewolf',
	'supermooshman',
	'Vulwsztyn',
	'jakutis',
	'yesmeck',
	'Spice-Z',
	'Zachiah',
	'Zirro',
	'arggh',
	'eh-dub',
	'benib',
	'burningTyger',
	'craigglennie',
	'dmitrage',
	'fiskgrodan',
	'fivemru',
	'hmt',
	'hville',
	'igoradamenko',
	'infuzz',
	'izumiiii',
	'jamesgeorge007',
	'jasdeepgill',
	'jpsc',
	'julian-kuroiwa',
	'zhoukekestar',
	'kindoflew',
	'lonevox',
	'mattstobbs',
	'mellisdesigns',
	'munsocket',
	'nhducit',
	'nomnomnomnom',
	'orange4glace',
	'priyanjitdey94',
	'pynnl',
	'raveling',
	'rdb',
	'red-meadow',
	'rmacklin',
	'rqrqrqrq',
	'rykiplov',
	'simeydotme',
	'vlasy',
	'voldemortensen',
	'warmrobot',
	'juzhiyuan',
	'Ding-Fan'
];

/* src/routes/_components/Contributors.svelte generated by Svelte v3.31.0 */

const css$8 = {
	code: ".contributor.svelte-1a6945s{width:2.4em;height:2.4em;border-radius:50%;text-indent:-9999px;display:inline-block;background:no-repeat url(/contributors.jpg);background-size:auto 102%;margin:0 0.5em 0.5em 0;border:2px solid var(--second)}",
	map: "{\"version\":3,\"file\":\"Contributors.svelte\",\"sources\":[\"Contributors.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport contributors from '../_contributors.js';\\n</script>\\n\\n<style>\\n\\t.contributor {\\n\\t\\twidth: 2.4em;\\n\\t\\theight: 2.4em;\\n\\t\\tborder-radius: 50%;\\n\\t\\ttext-indent: -9999px;\\n\\t\\tdisplay: inline-block;\\n\\t\\tbackground: no-repeat url(/contributors.jpg);\\n\\t\\tbackground-size: auto 102%;\\n\\t\\tmargin: 0 0.5em 0.5em 0;\\n\\t\\tborder: 2px solid var(--second);\\n\\t}\\n</style>\\n\\n{#each contributors as contributor, i}\\n\\t<a\\n\\t\\tclass=\\\"contributor\\\"\\n\\t\\tstyle=\\\"background-position: {(100 * i) / (contributors.length - 1)}% 0\\\"\\n\\t\\thref=\\\"https://github.com/{contributor}\\\">\\n\\t\\t{contributor}\\n\\t</a>\\n{/each}\\n\"],\"names\":[],\"mappings\":\"AAKC,YAAY,eAAC,CAAC,AACb,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,OAAO,CACpB,OAAO,CAAE,YAAY,CACrB,UAAU,CAAE,SAAS,CAAC,IAAI,iBAAiB,CAAC,CAC5C,eAAe,CAAE,IAAI,CAAC,IAAI,CAC1B,MAAM,CAAE,CAAC,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CACvB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,AAChC,CAAC\"}"
};

const Contributors = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css$8);

	return `${each(contributors, (contributor, i) => `<a class="${"contributor svelte-1a6945s"}" style="${"background-position: " + escape(100 * i / (contributors.length - 1)) + "% 0"}" href="${"https://github.com/" + escape(contributor)}">${escape(contributor)}
	</a>`)}`;
});

/* src/components/IntersectionObserver.svelte generated by Svelte v3.31.0 */

const css$9 = {
	code: "div.svelte-1c44y5p{width:100%;height:100%}",
	map: "{\"version\":3,\"file\":\"IntersectionObserver.svelte\",\"sources\":[\"IntersectionObserver.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { onMount } from 'svelte';\\n\\n\\texport let once = false;\\n\\texport let top = 0;\\n\\texport let bottom = 0;\\n\\texport let left = 0;\\n\\texport let right = 0;\\n\\n\\tlet intersecting = false;\\n\\tlet container;\\n\\n\\tonMount(() => {\\n\\t\\tif (typeof IntersectionObserver !== 'undefined') {\\n\\t\\t\\tconst rootMargin = `${bottom}px ${left}px ${top}px ${right}px`;\\n\\n\\t\\t\\tconst observer = new IntersectionObserver(entries => {\\n\\t\\t\\t\\tintersecting = entries[0].isIntersecting;\\n\\t\\t\\t\\tif (intersecting && once) {\\n\\t\\t\\t\\t\\tobserver.unobserve(container);\\n\\t\\t\\t\\t}\\n\\t\\t\\t}, {\\n\\t\\t\\t\\trootMargin\\n\\t\\t\\t});\\n\\n\\t\\t\\tobserver.observe(container);\\n\\t\\t\\treturn () => observer.unobserve(container);\\n\\t\\t}\\n\\n\\t\\tfunction handler() {\\n\\t\\t\\tconst bcr = container.getBoundingClientRect();\\n\\n\\t\\t\\tintersecting = (\\n\\t\\t\\t\\t(bcr.bottom + bottom) > 0 &&\\n\\t\\t\\t\\t(bcr.right + right) > 0 &&\\n\\t\\t\\t\\t(bcr.top - top) < window.innerHeight &&\\n\\t\\t\\t\\t(bcr.left - left) < window.innerWidth\\n\\t\\t\\t);\\n\\n\\t\\t\\tif (intersecting && once) {\\n\\t\\t\\t\\twindow.removeEventListener('scroll', handler);\\n\\t\\t\\t}\\n\\t\\t}\\n\\n\\t\\twindow.addEventListener('scroll', handler);\\n\\t\\treturn () => window.removeEventListener('scroll', handler);\\n\\t});\\n</script>\\n\\n<style>\\n\\tdiv {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n</style>\\n\\n<div bind:this={container}>\\n\\t<slot {intersecting}></slot>\\n</div>\"],\"names\":[],\"mappings\":\"AAkDC,GAAG,eAAC,CAAC,AACJ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC\"}"
};

const IntersectionObserver_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { once = false } = $$props;
	let { top = 0 } = $$props;
	let { bottom = 0 } = $$props;
	let { left = 0 } = $$props;
	let { right = 0 } = $$props;
	let intersecting = false;
	let container;

	onMount(() => {
		if (typeof IntersectionObserver !== "undefined") {
			const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`;

			const observer = new IntersectionObserver(entries => {
					intersecting = entries[0].isIntersecting;

					if (intersecting && once) {
						observer.unobserve(container);
					}
				},
			{ rootMargin });

			observer.observe(container);
			return () => observer.unobserve(container);
		}

		function handler() {
			const bcr = container.getBoundingClientRect();
			intersecting = bcr.bottom + bottom > 0 && bcr.right + right > 0 && bcr.top - top < window.innerHeight && bcr.left - left < window.innerWidth;

			if (intersecting && once) {
				window.removeEventListener("scroll", handler);
			}
		}

		window.addEventListener("scroll", handler);
		return () => window.removeEventListener("scroll", handler);
	});

	if ($$props.once === void 0 && $$bindings.once && once !== void 0) $$bindings.once(once);
	if ($$props.top === void 0 && $$bindings.top && top !== void 0) $$bindings.top(top);
	if ($$props.bottom === void 0 && $$bindings.bottom && bottom !== void 0) $$bindings.bottom(bottom);
	if ($$props.left === void 0 && $$bindings.left && left !== void 0) $$bindings.left(left);
	if ($$props.right === void 0 && $$bindings.right && right !== void 0) $$bindings.right(right);
	$$result.css.add(css$9);
	return `<div class="${"svelte-1c44y5p"}"${add_attribute("this", container, 1)}>${slots.default ? slots.default({ intersecting }) : ``}</div>`;
});

/* node_modules/@sveltejs/svelte-repl/src/SplitPane.svelte generated by Svelte v3.31.0 */

const css$a = {
	code: ".container.svelte-1k0d9r4{position:relative;width:100%;height:100%}.pane.svelte-1k0d9r4{position:relative;float:left;width:100%;height:100%;overflow:auto}.mousecatcher.svelte-1k0d9r4{position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(255,255,255,.01)}.divider.svelte-1k0d9r4{position:absolute;z-index:10;display:none}.divider.svelte-1k0d9r4::after{content:'';position:absolute;background-color:var(--second)}.horizontal.svelte-1k0d9r4{padding:0 8px;width:0;height:100%;cursor:ew-resize}.horizontal.svelte-1k0d9r4::after{left:8px;top:0;width:1px;height:100%}.vertical.svelte-1k0d9r4{padding:8px 0;width:100%;height:0;cursor:ns-resize}.vertical.svelte-1k0d9r4::after{top:8px;left:0;width:100%;height:1px}.left.svelte-1k0d9r4,.right.svelte-1k0d9r4,.divider.svelte-1k0d9r4{display:block}.left.svelte-1k0d9r4,.right.svelte-1k0d9r4{height:100%;float:left}.top.svelte-1k0d9r4,.bottom.svelte-1k0d9r4{position:absolute;width:100%}.top.svelte-1k0d9r4{top:0}.bottom.svelte-1k0d9r4{bottom:0}",
	map: "{\"version\":3,\"file\":\"SplitPane.svelte\",\"sources\":[\"SplitPane.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport * as yootils from 'yootils';\\n\\timport { createEventDispatcher } from 'svelte';\\n\\n\\tconst dispatch = createEventDispatcher();\\n\\n\\texport let type;\\n\\texport let pos = 50;\\n\\texport let fixed = false;\\n\\texport let buffer = 42;\\n\\texport let min;\\n\\texport let max;\\n\\n\\tlet w;\\n\\tlet h;\\n\\t$: size = type === 'vertical' ? h : w;\\n\\n\\t$: min = 100 * (buffer / size);\\n\\t$: max = 100 - min;\\n\\t$: pos = yootils.clamp(pos, min, max);\\n\\n\\tconst refs = {};\\n\\n\\tlet dragging = false;\\n\\n\\tfunction setPos(event) {\\n\\t\\tconst { top, left } = refs.container.getBoundingClientRect();\\n\\n\\t\\tconst px = type === 'vertical'\\n\\t\\t\\t? (event.clientY - top)\\n\\t\\t\\t: (event.clientX - left);\\n\\n\\t\\tpos = 100 * px / size;\\n\\t\\tdispatch('change');\\n\\t}\\n\\n\\tfunction setTouchPos(event) {\\n\\t\\tconst { top, left } = refs.container.getBoundingClientRect();\\n\\n\\t\\tconst px = type === 'vertical'\\n\\t\\t\\t? (event.touches[0].clientY - top)\\n\\t\\t\\t: (event.touches[0].clientX - left);\\n\\n\\t\\tpos = 100 * px / size;\\n\\t\\tdispatch('change');\\n\\t}\\n\\n\\tfunction drag(node, callback) {\\n\\t\\tconst mousedown = event => {\\n\\t\\t\\tif (event.which !== 1) return;\\n\\n\\t\\t\\tevent.preventDefault();\\n\\n\\t\\t\\tdragging = true;\\n\\n\\t\\t\\tconst onmouseup = () => {\\n\\t\\t\\t\\tdragging = false;\\n\\n\\t\\t\\t\\twindow.removeEventListener('mousemove', callback, false);\\n\\t\\t\\t\\twindow.removeEventListener('mouseup', onmouseup, false);\\n\\t\\t\\t};\\n\\n\\t\\t\\twindow.addEventListener('mousemove', callback, false);\\n\\t\\t\\twindow.addEventListener('mouseup', onmouseup, false);\\n\\t\\t}\\n\\n\\t\\tnode.addEventListener('mousedown', mousedown, false);\\n\\n\\t\\treturn {\\n\\t\\t\\tdestroy() {\\n\\t\\t\\t\\tnode.removeEventListener('mousedown', mousedown, false);\\n\\t\\t\\t}\\n\\t\\t};\\n\\t}\\n\\n\\tfunction touchDrag(node, callback) {\\n\\t\\tconst touchdown = event => {\\n\\t\\t\\tif (event.targetTouches.length > 1) return;\\n\\n\\t\\t\\tevent.preventDefault();\\n\\n\\t\\t\\tdragging = true;\\n\\n\\t\\t\\tconst ontouchend = () => {\\n\\t\\t\\t\\tdragging = false;\\n\\n\\t\\t\\t\\twindow.removeEventListener('touchmove', callback, false);\\n\\t\\t\\t\\twindow.removeEventListener('touchend', ontouchend, false);\\n\\t\\t\\t};\\n\\n\\t\\t\\twindow.addEventListener('touchmove', callback, false);\\n\\t\\t\\twindow.addEventListener('touchend', ontouchend, false);\\n\\t\\t}\\n\\n\\t\\tnode.addEventListener('touchstart', touchdown, false);\\n\\n\\t\\treturn {\\n\\t\\t\\tdestroy() {\\n\\t\\t\\t\\tnode.removeEventListener('touchstart', touchdown, false);\\n\\t\\t\\t}\\n\\t\\t};\\n\\t}\\n\\n\\t$: side = type === 'horizontal' ? 'left' : 'top';\\n\\t$: dimension = type === 'horizontal' ? 'width' : 'height';\\n</script>\\n\\n<style>\\n\\t.container {\\n\\t\\tposition: relative;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\t.pane {\\n\\t\\tposition: relative;\\n\\t\\tfloat: left;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\toverflow: auto;\\n\\t}\\n\\n\\t.mousecatcher {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tbackground: rgba(255,255,255,.01);\\n\\t}\\n\\n\\t.divider {\\n\\t\\tposition: absolute;\\n\\t\\tz-index: 10;\\n\\t\\tdisplay: none;\\n\\t}\\n\\n\\t.divider::after {\\n\\t\\tcontent: '';\\n\\t\\tposition: absolute;\\n\\t\\t/* background-color: #eee; */\\n\\t\\tbackground-color: var(--second);\\n\\t}\\n\\n\\t.horizontal {\\n\\t\\tpadding: 0 8px;\\n\\t\\twidth: 0;\\n\\t\\theight: 100%;\\n\\t\\tcursor: ew-resize;\\n\\t}\\n\\n\\t.horizontal::after {\\n\\t\\tleft: 8px;\\n\\t\\ttop: 0;\\n\\t\\twidth: 1px;\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\t.vertical {\\n\\t\\tpadding: 8px 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 0;\\n\\t\\tcursor: ns-resize;\\n\\t}\\n\\n\\t.vertical::after {\\n\\t\\ttop: 8px;\\n\\t\\tleft: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 1px;\\n\\t}\\n\\n\\t.left, .right, .divider {\\n\\t\\tdisplay: block;\\n\\t}\\n\\n\\t.left, .right {\\n\\t\\theight: 100%;\\n\\t\\tfloat: left;\\n\\t}\\n\\n\\t.top, .bottom {\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.top { top: 0; }\\n\\t.bottom { bottom: 0; }\\n</style>\\n\\n<div class=\\\"container\\\" bind:this={refs.container} bind:clientWidth={w} bind:clientHeight={h}>\\n\\t<div class=\\\"pane\\\" style=\\\"{dimension}: {pos}%;\\\">\\n\\t\\t<slot name=\\\"a\\\"></slot>\\n\\t</div>\\n\\n\\t<div class=\\\"pane\\\" style=\\\"{dimension}: {100 - (pos)}%;\\\">\\n\\t\\t<slot name=\\\"b\\\"></slot>\\n\\t</div>\\n\\n\\t{#if !fixed}\\n\\t\\t<div class=\\\"{type} divider\\\" style=\\\"{side}: calc({pos}% - 8px)\\\" use:drag={setPos} use:touchDrag={setTouchPos}></div>\\n\\t{/if}\\n</div>\\n\\n{#if dragging}\\n\\t<div class=\\\"mousecatcher\\\"></div>\\n{/if}\"],\"names\":[],\"mappings\":\"AA4GC,UAAU,eAAC,CAAC,AACX,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC,AAED,KAAK,eAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,IAAI,AACf,CAAC,AAED,aAAa,eAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,AAClC,CAAC,AAED,QAAQ,eAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,IAAI,AACd,CAAC,AAED,uBAAQ,OAAO,AAAC,CAAC,AAChB,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAElB,gBAAgB,CAAE,IAAI,QAAQ,CAAC,AAChC,CAAC,AAED,WAAW,eAAC,CAAC,AACZ,OAAO,CAAE,CAAC,CAAC,GAAG,CACd,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,SAAS,AAClB,CAAC,AAED,0BAAW,OAAO,AAAC,CAAC,AACnB,IAAI,CAAE,GAAG,CACT,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,AACb,CAAC,AAED,SAAS,eAAC,CAAC,AACV,OAAO,CAAE,GAAG,CAAC,CAAC,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,SAAS,AAClB,CAAC,AAED,wBAAS,OAAO,AAAC,CAAC,AACjB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,AACZ,CAAC,AAED,oBAAK,CAAE,qBAAM,CAAE,QAAQ,eAAC,CAAC,AACxB,OAAO,CAAE,KAAK,AACf,CAAC,AAED,oBAAK,CAAE,MAAM,eAAC,CAAC,AACd,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,mBAAI,CAAE,OAAO,eAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,IAAI,eAAC,CAAC,AAAC,GAAG,CAAE,CAAC,AAAE,CAAC,AAChB,OAAO,eAAC,CAAC,AAAC,MAAM,CAAE,CAAC,AAAE,CAAC\"}"
};

const SplitPane = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const dispatch = createEventDispatcher();
	let { type } = $$props;
	let { pos = 50 } = $$props;
	let { fixed = false } = $$props;
	let { buffer = 42 } = $$props;
	let { min } = $$props;
	let { max } = $$props;
	let w;
	let h;
	const refs = {};

	if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
	if ($$props.pos === void 0 && $$bindings.pos && pos !== void 0) $$bindings.pos(pos);
	if ($$props.fixed === void 0 && $$bindings.fixed && fixed !== void 0) $$bindings.fixed(fixed);
	if ($$props.buffer === void 0 && $$bindings.buffer && buffer !== void 0) $$bindings.buffer(buffer);
	if ($$props.min === void 0 && $$bindings.min && min !== void 0) $$bindings.min(min);
	if ($$props.max === void 0 && $$bindings.max && max !== void 0) $$bindings.max(max);
	$$result.css.add(css$a);
	let size;
	let side;
	let dimension;
	size = type === "vertical" ? h : w;
	min = 100 * (buffer / size);
	max = 100 - min;
	pos = yootils.clamp(pos, min, max);
	side = type === "horizontal" ? "left" : "top";
	dimension = type === "horizontal" ? "width" : "height";

	return `<div class="${"container svelte-1k0d9r4"}"${add_attribute("this", refs.container, 1)}><div class="${"pane svelte-1k0d9r4"}" style="${escape(dimension) + ": " + escape(pos) + "%;"}">${slots.a ? slots.a({}) : ``}</div>

	<div class="${"pane svelte-1k0d9r4"}" style="${escape(dimension) + ": " + escape(100 - pos) + "%;"}">${slots.b ? slots.b({}) : ``}</div>

	${!fixed
	? `<div class="${escape(type) + " divider" + " svelte-1k0d9r4"}" style="${escape(side) + ": calc(" + escape(pos) + "% - 8px)"}"></div>`
	: ``}</div>

${ ``}`;
});

/* node_modules/@sveltejs/svelte-repl/src/Input/ComponentSelector.svelte generated by Svelte v3.31.0 */

const css$b = {
	code: ".component-selector.svelte-cghqrp.svelte-cghqrp{position:relative;border-bottom:1px solid #eee;overflow:hidden}.file-tabs.svelte-cghqrp.svelte-cghqrp{border:none;margin:0;white-space:nowrap;overflow-x:auto;overflow-y:hidden;height:10em}.file-tabs.svelte-cghqrp .button.svelte-cghqrp,.file-tabs.svelte-cghqrp button.svelte-cghqrp{position:relative;display:inline-block;font:400 12px/1.5 var(--font);background:white;border:none;border-bottom:3px solid transparent;padding:12px 14px 8px 16px;margin:0;color:#999;border-radius:0;cursor:pointer}.file-tabs.svelte-cghqrp .button.active.svelte-cghqrp{color:#333;border-bottom:3px solid var(--prime)}.editable.svelte-cghqrp.svelte-cghqrp,.uneditable.svelte-cghqrp.svelte-cghqrp,.input-sizer.svelte-cghqrp.svelte-cghqrp,input.svelte-cghqrp.svelte-cghqrp{display:inline-block;position:relative;line-height:1}.input-sizer.svelte-cghqrp.svelte-cghqrp{color:#ccc}input.svelte-cghqrp.svelte-cghqrp{position:absolute;width:100%;left:16px;top:12px;font:400 12px/1.5 var(--font);border:none;color:var(--flash);outline:none;background-color:transparent}.duplicate.svelte-cghqrp.svelte-cghqrp{color:var(--prime)}.remove.svelte-cghqrp.svelte-cghqrp{position:absolute;display:none;right:1px;top:4px;width:16px;text-align:right;padding:12px 0 12px 5px;font-size:8px;cursor:pointer}.remove.svelte-cghqrp.svelte-cghqrp:hover{color:var(--flash)}.file-tabs.svelte-cghqrp .button.active .editable.svelte-cghqrp{cursor:text}.file-tabs.svelte-cghqrp .button.active .remove.svelte-cghqrp{display:block}.file-tabs.svelte-cghqrp .button.drag-over.svelte-cghqrp{background:#67677814}.file-tabs.svelte-cghqrp .button.drag-over.svelte-cghqrp{cursor:move}.add-new.svelte-cghqrp.svelte-cghqrp{position:absolute;left:0;top:0;padding:12px 10px 8px 0 !important;height:40px;text-align:center;background-color:white}.add-new.svelte-cghqrp.svelte-cghqrp:hover{color:var(--flash) !important}.drag-handle.svelte-cghqrp.svelte-cghqrp{cursor:move;width:5px;height:25px;position:absolute;left:5px;top:9px;--drag-handle-color:#dedede;background:linear-gradient(to right,\n\t\t\tvar(--drag-handle-color) 1px, white 1px,\n\t\t\twhite 2px, var(--drag-handle-color) 2px,\n\t\t\tvar(--drag-handle-color) 3px, white 3px,\n\t\t\twhite 4px, var(--drag-handle-color) 4px\n\t\t)}svg.svelte-cghqrp.svelte-cghqrp{position:relative;overflow:hidden;vertical-align:middle;-o-object-fit:contain;object-fit:contain;-webkit-transform-origin:center center;transform-origin:center center;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}",
	map: "{\"version\":3,\"file\":\"ComponentSelector.svelte\",\"sources\":[\"ComponentSelector.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { getContext } from 'svelte';\\n\\n\\texport let handle_select;\\n\\n\\tconst { components, selected, request_focus, rebundle } = getContext('REPL');\\n\\n\\tlet editing = null;\\n\\n\\tfunction selectComponent(component) {\\n\\t\\tif ($selected !== component) {\\n\\t\\t\\tediting = null;\\n\\t\\t\\thandle_select(component);\\n\\t\\t}\\n\\t}\\n\\n\\tfunction editTab(component) {\\n\\t\\tif ($selected === component) {\\n\\t\\t\\tediting = $selected;\\n\\t\\t}\\n\\t}\\n\\n\\tfunction closeEdit() {\\n\\t\\tconst match = /(.+)\\\\.(svelte|js|json|md)$/.exec($selected.name);\\n\\t\\t$selected.name = match ? match[1] : $selected.name;\\n\\t\\tif (isComponentNameUsed($selected)) {\\n\\t\\t\\tlet i = 1;\\n\\t\\t\\tlet name = $selected.name;\\n\\t\\t\\tdo {\\n\\t\\t\\t\\t$selected.name = `${name}_${i++}`;\\n\\t\\t\\t} while (isComponentNameUsed($selected));\\n\\t\\t}\\n\\t\\tif (match && match[2]) $selected.type = match[2];\\n\\n\\n\\t\\tediting = null;\\n\\n\\t\\t// re-select, in case the type changed\\n\\t\\thandle_select($selected);\\n\\n\\t\\tcomponents = components; // TODO necessary?\\n\\n\\t\\t// focus the editor, but wait a beat (so key events aren't misdirected)\\n\\t\\tsetTimeout(request_focus);\\n\\n\\t\\trebundle();\\n\\t}\\n\\n\\tfunction remove(component) {\\n\\t\\tlet result = confirm(`Are you sure you want to delete ${component.name}.${component.type}?`);\\n\\n\\t\\tif (result) {\\n\\t\\t\\tconst index = $components.indexOf(component);\\n\\n\\t\\t\\tif (~index) {\\n\\t\\t\\t\\tcomponents.set($components.slice(0, index).concat($components.slice(index + 1)));\\n\\t\\t\\t} else {\\n\\t\\t\\t\\tconsole.error(`Could not find component! That's... odd`);\\n\\t\\t\\t}\\n\\n\\t\\t\\thandle_select($components[index] || $components[$components.length - 1]);\\n\\t\\t}\\n\\t}\\n\\n\\tfunction selectInput(event) {\\n\\t\\tsetTimeout(() => {\\n\\t\\t\\tevent.target.select();\\n\\t\\t});\\n\\t}\\n\\n\\tlet uid = 1;\\n\\n\\tfunction addNew() {\\n\\t\\tconst component = {\\n\\t\\t\\tname: uid++ ? `Component${uid}` : 'Component1',\\n\\t\\t\\ttype: 'svelte',\\n\\t\\t\\tsource: ''\\n\\t\\t};\\n\\n\\t\\tediting = component;\\n\\n\\t\\tsetTimeout(() => {\\n\\t\\t\\t// TODO we can do this without IDs\\n\\t\\t\\tdocument.getElementById(component.name).scrollIntoView(false);\\n\\t\\t});\\n\\n\\t\\tcomponents.update(components => components.concat(component));\\n\\t\\thandle_select(component);\\n\\t}\\n\\n\\tfunction isComponentNameUsed(editing) {\\n\\t\\treturn $components.find(component => component !== editing && component.name === editing.name);\\n\\t}\\n\\n\\t// drag and drop\\n\\tlet from = null;\\n\\tlet over = null;\\n\\n\\tfunction dragStart(event) {\\n\\t\\tfrom = event.currentTarget.id;\\n\\t}\\n\\n\\tfunction dragLeave() {\\n\\t\\tover = null;\\n\\t}\\n\\n\\tfunction dragOver(event) {\\n\\t\\tevent.preventDefault();\\n\\t\\tover = event.currentTarget.id;\\n\\t}\\n\\n\\tfunction dragEnd(event) {\\n\\t\\tevent.preventDefault();\\n\\n\\t\\tif (from && over) {\\n\\t\\t\\tconst from_index = $components.findIndex(component => component.name === from);\\n\\t\\t\\tconst to_index = $components.findIndex(component => component.name === over);\\n\\n\\t\\t\\tconst from_component = $components[from_index];\\n\\n\\t\\t\\t$components.splice(from_index, 1);\\n\\t\\t\\tcomponents.set($components.slice(0, to_index).concat(from_component).concat($components.slice(to_index)));\\n\\t\\t}\\n\\t\\tfrom = over = null;\\n\\t}\\n</script>\\n\\n<style>\\n\\t.component-selector {\\n\\t\\tposition: relative;\\n\\t\\tborder-bottom: 1px solid #eee;\\n\\t\\toverflow: hidden;\\n\\t}\\n\\n\\t.file-tabs {\\n\\t\\tborder: none;\\n\\t\\tmargin: 0;\\n\\t\\twhite-space: nowrap;\\n\\t\\toverflow-x: auto;\\n\\t\\toverflow-y: hidden;\\n\\t\\theight: 10em;\\n\\t}\\n\\n\\t.file-tabs .button, .file-tabs button {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: inline-block;\\n\\t\\tfont: 400 12px/1.5 var(--font);\\n\\t\\tbackground: white;\\n\\t\\tborder: none;\\n\\t\\tborder-bottom: 3px solid transparent;\\n\\t\\tpadding: 12px 14px 8px 16px;\\n\\t\\tmargin: 0;\\n\\t\\tcolor: #999;\\n\\t\\tborder-radius: 0;\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\t.file-tabs .button.active {\\n\\t\\t/* color: var(--second); */\\n\\t\\tcolor: #333;\\n\\t\\tborder-bottom: 3px solid var(--prime);\\n\\t}\\n\\n\\t.editable, .uneditable, .input-sizer, input {\\n\\t\\tdisplay: inline-block;\\n\\t\\tposition: relative;\\n\\t\\tline-height: 1;\\n\\t}\\n\\n\\t.input-sizer {\\n\\t\\tcolor: #ccc;\\n\\t}\\n\\n\\tinput {\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t\\tleft: 16px;\\n\\t\\ttop: 12px;\\n\\t\\tfont: 400 12px/1.5 var(--font);\\n\\t\\tborder: none;\\n\\t\\tcolor: var(--flash);\\n\\t\\toutline: none;\\n\\t\\tbackground-color: transparent;\\n\\t}\\n\\n\\t.duplicate {\\n\\t\\tcolor: var(--prime);\\n\\t}\\n\\n\\t.remove {\\n\\t\\tposition: absolute;\\n\\t\\tdisplay: none;\\n\\t\\tright: 1px;\\n\\t\\ttop: 4px;\\n\\t\\twidth: 16px;\\n\\t\\ttext-align: right;\\n\\t\\tpadding: 12px 0 12px 5px;\\n\\t\\tfont-size: 8px;\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\t.remove:hover {\\n\\t\\tcolor: var(--flash);\\n\\t}\\n\\n\\t.file-tabs .button.active .editable {\\n\\t\\tcursor: text;\\n\\t}\\n\\n\\t.file-tabs .button.active .remove {\\n\\t\\tdisplay: block;\\n\\t}\\n\\n\\t.file-tabs .button.drag-over {\\n\\t\\tbackground: #67677814;\\n\\t}\\n\\n\\t.file-tabs .button.drag-over {\\n\\t\\tcursor: move;\\n\\t}\\n\\n\\t.add-new {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tpadding: 12px 10px 8px 0 !important;\\n\\t\\theight: 40px;\\n\\t\\ttext-align: center;\\n\\t\\tbackground-color: white;\\n\\t}\\n\\n\\t.add-new:hover {\\n\\t\\tcolor: var(--flash) !important;\\n\\t}\\n\\n\\t.drag-handle {\\n\\t\\tcursor: move;\\n\\t\\twidth: 5px;\\n\\t\\theight: 25px;\\n\\t\\tposition: absolute;\\n\\t\\tleft: 5px;\\n\\t\\ttop: 9px;\\n\\t\\t--drag-handle-color: #dedede;\\n\\t\\tbackground: linear-gradient(to right,\\n\\t\\t\\tvar(--drag-handle-color) 1px, white 1px,\\n\\t\\t\\twhite 2px, var(--drag-handle-color) 2px,\\n\\t\\t\\tvar(--drag-handle-color) 3px, white 3px,\\n\\t\\t\\twhite 4px, var(--drag-handle-color) 4px\\n\\t\\t);\\n\\t}\\n\\n\\tsvg {\\n\\t\\tposition: relative;\\n\\t\\toverflow: hidden;\\n\\t\\tvertical-align: middle;\\n\\t\\t-o-object-fit: contain;\\n\\t\\tobject-fit: contain;\\n\\t\\t-webkit-transform-origin: center center;\\n\\t\\ttransform-origin: center center;\\n\\n\\t\\tstroke: currentColor;\\n\\t\\tstroke-width: 2;\\n\\t\\tstroke-linecap: round;\\n\\t\\tstroke-linejoin: round;\\n\\t\\tfill: none;\\n\\t}\\n</style>\\n\\n<div class=\\\"component-selector\\\">\\n\\t{#if $components.length}\\n\\t\\t<div class=\\\"file-tabs\\\" on:dblclick=\\\"{addNew}\\\">\\n\\t\\t\\t{#each $components as component, index}\\n\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\tid={component.name}\\n\\t\\t\\t\\t\\tclass=\\\"button\\\"\\n\\t\\t\\t\\t\\trole=\\\"button\\\"\\n\\t\\t\\t\\t\\tclass:active=\\\"{component === $selected}\\\"\\n\\t\\t\\t\\t\\tclass:draggable={component !== editing && index !== 0}\\n\\t\\t\\t\\t\\tclass:drag-over={over === component.name}\\n\\t\\t\\t\\t\\ton:click=\\\"{() => selectComponent(component)}\\\"\\n\\t\\t\\t\\t\\ton:dblclick=\\\"{e => e.stopPropagation()}\\\"\\n\\t\\t\\t\\t\\tdraggable={component !== editing}\\n\\t\\t\\t\\t\\ton:dragstart={dragStart}\\n\\t\\t\\t\\t\\ton:dragover={dragOver}\\n\\t\\t\\t\\t\\ton:dragleave={dragLeave}\\n\\t\\t\\t\\t\\ton:drop={dragEnd}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<i class=\\\"drag-handle\\\"></i>\\n\\t\\t\\t\\t\\t{#if component.name === 'App' && component !== editing}\\n\\t\\t\\t\\t\\t\\t<div class=\\\"uneditable\\\">\\n\\t\\t\\t\\t\\t\\t\\tApp.svelte\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\t{#if component === editing}\\n\\t\\t\\t\\t\\t\\t\\t<span class=\\\"input-sizer\\\">{editing.name + (/\\\\./.test(editing.name) ? '' : `.${editing.type}`)}</span>\\n\\n\\t\\t\\t\\t\\t\\t\\t<!-- svelte-ignore a11y-autofocus -->\\n\\t\\t\\t\\t\\t\\t\\t<input\\n\\t\\t\\t\\t\\t\\t\\t\\tautofocus\\n\\t\\t\\t\\t\\t\\t\\t\\tspellcheck={false}\\n\\t\\t\\t\\t\\t\\t\\t\\tbind:value={editing.name}\\n\\t\\t\\t\\t\\t\\t\\t\\ton:focus={selectInput}\\n\\t\\t\\t\\t\\t\\t\\t\\ton:blur={closeEdit}\\n\\t\\t\\t\\t\\t\\t\\t\\ton:keydown={e => e.which === 13 && !isComponentNameUsed(editing) && e.target.blur()}\\n\\t\\t\\t\\t\\t\\t\\t\\tclass:duplicate={isComponentNameUsed(editing)}\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\\"editable\\\"\\n\\t\\t\\t\\t\\t\\t\\t\\ttitle=\\\"edit component name\\\"\\n\\t\\t\\t\\t\\t\\t\\t\\ton:click=\\\"{() => editTab(component)}\\\"\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t\\t\\t{component.name}.{component.type}\\n\\t\\t\\t\\t\\t\\t\\t</div>\\n\\n\\t\\t\\t\\t\\t\\t\\t<span class=\\\"remove\\\" on:click=\\\"{() => remove(component)}\\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t<svg width=\\\"12\\\" height=\\\"12\\\" viewBox=\\\"0 0 24 24\\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<line stroke=\\\"#999\\\" x1='18' y1='6' x2='6' y2='18' />\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<line stroke=\\\"#999\\\" x1='6' y1='6' x2='18' y2='18' />\\n\\t\\t\\t\\t\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/each}\\n\\n\\t\\t\\t<button class=\\\"add-new\\\" on:click={addNew} title=\\\"add new component\\\">\\n\\t\\t\\t\\t<svg width=\\\"12\\\" height=\\\"12\\\" viewBox=\\\"0 0 24 24\\\">\\n\\t\\t\\t\\t\\t<line stroke=\\\"#999\\\" x1='12' y1='5' x2='12' y2='19' />\\n\\t\\t\\t\\t\\t<line stroke=\\\"#999\\\" x1='5' y1='12' x2='19' y2='12' />\\n\\t\\t\\t\\t</svg>\\n\\t\\t\\t</button>\\n\\t\\t</div>\\n\\t{/if}\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAgIC,mBAAmB,4BAAC,CAAC,AACpB,QAAQ,CAAE,QAAQ,CAClB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC7B,QAAQ,CAAE,MAAM,AACjB,CAAC,AAED,UAAU,4BAAC,CAAC,AACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,IAAI,AACb,CAAC,AAED,wBAAU,CAAC,qBAAO,CAAE,wBAAU,CAAC,MAAM,cAAC,CAAC,AACtC,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,YAAY,CACrB,IAAI,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,MAAM,CAAC,CAC9B,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACpC,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,CAC3B,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,CAAC,CAChB,MAAM,CAAE,OAAO,AAChB,CAAC,AAED,wBAAU,CAAC,OAAO,OAAO,cAAC,CAAC,AAE1B,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,OAAO,CAAC,AACtC,CAAC,AAED,qCAAS,CAAE,uCAAW,CAAE,wCAAY,CAAE,KAAK,4BAAC,CAAC,AAC5C,OAAO,CAAE,YAAY,CACrB,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,CAAC,AACf,CAAC,AAED,YAAY,4BAAC,CAAC,AACb,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,KAAK,4BAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,IAAI,CAAE,IAAI,CACV,GAAG,CAAE,IAAI,CACT,IAAI,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,MAAM,CAAC,CAC9B,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,OAAO,CAAC,CACnB,OAAO,CAAE,IAAI,CACb,gBAAgB,CAAE,WAAW,AAC9B,CAAC,AAED,UAAU,4BAAC,CAAC,AACX,KAAK,CAAE,IAAI,OAAO,CAAC,AACpB,CAAC,AAED,OAAO,4BAAC,CAAC,AACR,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,GAAG,CACV,GAAG,CAAE,GAAG,CACR,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,CACjB,OAAO,CAAE,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,GAAG,CACxB,SAAS,CAAE,GAAG,CACd,MAAM,CAAE,OAAO,AAChB,CAAC,AAED,mCAAO,MAAM,AAAC,CAAC,AACd,KAAK,CAAE,IAAI,OAAO,CAAC,AACpB,CAAC,AAED,wBAAU,CAAC,OAAO,OAAO,CAAC,SAAS,cAAC,CAAC,AACpC,MAAM,CAAE,IAAI,AACb,CAAC,AAED,wBAAU,CAAC,OAAO,OAAO,CAAC,OAAO,cAAC,CAAC,AAClC,OAAO,CAAE,KAAK,AACf,CAAC,AAED,wBAAU,CAAC,OAAO,UAAU,cAAC,CAAC,AAC7B,UAAU,CAAE,SAAS,AACtB,CAAC,AAED,wBAAU,CAAC,OAAO,UAAU,cAAC,CAAC,AAC7B,MAAM,CAAE,IAAI,AACb,CAAC,AAED,QAAQ,4BAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,CAAC,CAAC,UAAU,CACnC,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,MAAM,CAClB,gBAAgB,CAAE,KAAK,AACxB,CAAC,AAED,oCAAQ,MAAM,AAAC,CAAC,AACf,KAAK,CAAE,IAAI,OAAO,CAAC,CAAC,UAAU,AAC/B,CAAC,AAED,YAAY,4BAAC,CAAC,AACb,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,GAAG,CACT,GAAG,CAAE,GAAG,CACR,mBAAmB,CAAE,OAAO,CAC5B,UAAU,CAAE,gBAAgB,EAAE,CAAC,KAAK,CAAC;GACpC,IAAI,mBAAmB,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC;GACxC,KAAK,CAAC,GAAG,CAAC,CAAC,IAAI,mBAAmB,CAAC,CAAC,GAAG,CAAC;GACxC,IAAI,mBAAmB,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC;GACxC,KAAK,CAAC,GAAG,CAAC,CAAC,IAAI,mBAAmB,CAAC,CAAC,GAAG;GACvC,AACF,CAAC,AAED,GAAG,4BAAC,CAAC,AACJ,QAAQ,CAAE,QAAQ,CAClB,QAAQ,CAAE,MAAM,CAChB,cAAc,CAAE,MAAM,CACtB,aAAa,CAAE,OAAO,CACtB,UAAU,CAAE,OAAO,CACnB,wBAAwB,CAAE,MAAM,CAAC,MAAM,CACvC,gBAAgB,CAAE,MAAM,CAAC,MAAM,CAE/B,MAAM,CAAE,YAAY,CACpB,YAAY,CAAE,CAAC,CACf,cAAc,CAAE,KAAK,CACrB,eAAe,CAAE,KAAK,CACtB,IAAI,CAAE,IAAI,AACX,CAAC\"}"
};

const ComponentSelector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $selected;
	let $components;
	let { handle_select } = $$props;
	const { components, selected, request_focus, rebundle } = getContext("REPL");
	validate_store(components, "components");
	$components = get_store_value(components);
	validate_store(selected, "selected");
	$selected = get_store_value(selected);
	let editing = null;

	function isComponentNameUsed(editing) {
		return $components.find(component => component !== editing && component.name === editing.name);
	}

	let over = null;

	if ($$props.handle_select === void 0 && $$bindings.handle_select && handle_select !== void 0) $$bindings.handle_select(handle_select);
	$$result.css.add(css$b);
	validate_store(selected, "selected");
	$selected = get_store_value(selected);
	validate_store(components, "components");
	$components = get_store_value(components);

	return `<div class="${"component-selector svelte-cghqrp"}">${$components.length
	? `<div class="${"file-tabs svelte-cghqrp"}">${each($components, (component, index) => `<div${add_attribute("id", component.name, 0)} class="${[
			"button svelte-cghqrp",
			(component === $selected ? "active" : "") + " " + (component !== editing && index !== 0 ? "draggable" : "") + " " + (over === component.name ? "drag-over" : "")
		].join(" ").trim()}" role="${"button"}"${add_attribute("draggable", component !== editing, 0)}><i class="${"drag-handle svelte-cghqrp"}"></i>
					${component.name === "App" && component !== editing
		? `<div class="${"uneditable svelte-cghqrp"}">App.svelte
						</div>`
		: `${component === editing
			? `<span class="${"input-sizer svelte-cghqrp"}">${escape(editing.name + ((/\./).test(editing.name) ? "" : `.${editing.type}`))}</span>

							
							<input autofocus${add_attribute("spellcheck", false, 0)} class="${["svelte-cghqrp", isComponentNameUsed(editing) ? "duplicate" : ""].join(" ").trim()}"${add_attribute("value", editing.name, 1)}>`
			: `<div class="${"editable svelte-cghqrp"}" title="${"edit component name"}">${escape(component.name)}.${escape(component.type)}</div>

							<span class="${"remove svelte-cghqrp"}"><svg width="${"12"}" height="${"12"}" viewBox="${"0 0 24 24"}" class="${"svelte-cghqrp"}"><line stroke="${"#999"}" x1="${"18"}" y1="${"6"}" x2="${"6"}" y2="${"18"}"></line><line stroke="${"#999"}" x1="${"6"}" y1="${"6"}" x2="${"18"}" y2="${"18"}"></line></svg>
							</span>`}`}
				</div>`)}

			<button class="${"add-new svelte-cghqrp"}" title="${"add new component"}"><svg width="${"12"}" height="${"12"}" viewBox="${"0 0 24 24"}" class="${"svelte-cghqrp"}"><line stroke="${"#999"}" x1="${"12"}" y1="${"5"}" x2="${"12"}" y2="${"19"}"></line><line stroke="${"#999"}" x1="${"5"}" y1="${"12"}" x2="${"19"}" y2="${"12"}"></line></svg></button></div>`
	: ``}</div>`;
});

const is_browser = typeof window !== 'undefined';

/* node_modules/@sveltejs/svelte-repl/src/Message.svelte generated by Svelte v3.31.0 */

const css$c = {
	code: ".message.svelte-9488n4{position:relative;color:white;padding:12px 16px 12px 44px;font:400 12px/1.7 var(--font);margin:0;border-top:1px solid white}.navigable.svelte-9488n4{cursor:pointer}.message.svelte-9488n4::before{content:'!';position:absolute;left:12px;top:10px;text-align:center;line-height:1;padding:4px;border-radius:50%;color:white;border:2px solid white;box-sizing:content-box;width:10px;height:10px;font-size:11px;font-weight:700}.truncate.svelte-9488n4{white-space:pre;overflow-x:hidden;text-overflow:ellipsis}p.svelte-9488n4{margin:0}.error.svelte-9488n4{background-color:#da106e}.warning.svelte-9488n4{background-color:#e47e0a}.info.svelte-9488n4{background-color:var(--second)}",
	map: "{\"version\":3,\"file\":\"Message.svelte\",\"sources\":[\"Message.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { getContext } from 'svelte';\\n\\timport { slide } from 'svelte/transition';\\n\\n\\tconst { navigate } = getContext('REPL');\\n\\n\\texport let kind;\\n\\texport let details = null;\\n\\texport let filename = null;\\n\\texport let truncate;\\n\\n\\tfunction message(details) {\\n\\t\\tlet str = details.message || '[missing message]';\\n\\n\\t\\tlet loc = [];\\n\\n\\t\\tif (details.filename && details.filename !== filename) {\\n\\t\\t\\tloc.push(details.filename);\\n\\t\\t}\\n\\n\\t\\tif (details.start) loc.push(details.start.line, details.start.column);\\n\\n\\t\\treturn str + (loc.length ? ` (${loc.join(':')})` : ``);\\n\\t};\\n</script>\\n\\n<style>\\n\\t.message {\\n\\t\\tposition: relative;\\n\\t\\tcolor: white;\\n\\t\\tpadding: 12px 16px 12px 44px;\\n\\t\\tfont: 400 12px/1.7 var(--font);\\n\\t\\tmargin: 0;\\n\\t\\tborder-top: 1px solid white;\\n\\t}\\n\\n\\t.navigable {\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\t.message::before {\\n\\t\\tcontent: '!';\\n\\t\\tposition: absolute;\\n\\t\\tleft: 12px;\\n\\t\\ttop: 10px;\\n\\t\\ttext-align: center;\\n\\t\\tline-height: 1;\\n\\t\\tpadding: 4px;\\n\\t\\tborder-radius: 50%;\\n\\t\\tcolor: white;\\n\\t\\tborder: 2px solid white;\\n\\t\\tbox-sizing: content-box;\\n\\t\\twidth: 10px;\\n\\t\\theight: 10px;\\n\\t\\tfont-size: 11px;\\n\\t\\tfont-weight: 700;\\n\\t}\\n\\n\\t.truncate {\\n\\t\\twhite-space: pre;\\n\\t\\toverflow-x: hidden;\\n\\t\\ttext-overflow: ellipsis;\\n\\t}\\n\\n\\tp {\\n\\t\\tmargin: 0;\\n\\t}\\n\\n\\t.error {\\n\\t\\tbackground-color: #da106e;\\n\\t}\\n\\n\\t.warning {\\n\\t\\tbackground-color: #e47e0a;\\n\\t}\\n\\n\\t.info {\\n\\t\\tbackground-color: var(--second);\\n\\t}\\n</style>\\n\\n<div in:slide={{delay: 150, duration: 100}} out:slide={{duration: 100}} class=\\\"message {kind}\\\" class:truncate>\\n\\t{#if details}\\n\\t\\t<p\\n\\t\\t\\tclass:navigable={details.filename}\\n\\t\\t\\ton:click=\\\"{() => navigate(details)}\\\"\\n\\t\\t>{message(details)}</p>\\n\\t{:else}\\n\\t\\t<slot></slot>\\n\\t{/if}\\n</div>\"],\"names\":[],\"mappings\":\"AA2BC,QAAQ,cAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,CAC5B,IAAI,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,MAAM,CAAC,CAC9B,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AAC5B,CAAC,AAED,UAAU,cAAC,CAAC,AACX,MAAM,CAAE,OAAO,AAChB,CAAC,AAED,sBAAQ,QAAQ,AAAC,CAAC,AACjB,OAAO,CAAE,GAAG,CACZ,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,IAAI,CACV,GAAG,CAAE,IAAI,CACT,UAAU,CAAE,MAAM,CAClB,WAAW,CAAE,CAAC,CACd,OAAO,CAAE,GAAG,CACZ,aAAa,CAAE,GAAG,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CACvB,UAAU,CAAE,WAAW,CACvB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,SAAS,cAAC,CAAC,AACV,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,CAClB,aAAa,CAAE,QAAQ,AACxB,CAAC,AAED,CAAC,cAAC,CAAC,AACF,MAAM,CAAE,CAAC,AACV,CAAC,AAED,MAAM,cAAC,CAAC,AACP,gBAAgB,CAAE,OAAO,AAC1B,CAAC,AAED,QAAQ,cAAC,CAAC,AACT,gBAAgB,CAAE,OAAO,AAC1B,CAAC,AAED,KAAK,cAAC,CAAC,AACN,gBAAgB,CAAE,IAAI,QAAQ,CAAC,AAChC,CAAC\"}"
};

const Message = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const { navigate } = getContext("REPL");
	let { kind } = $$props;
	let { details = null } = $$props;
	let { filename = null } = $$props;
	let { truncate } = $$props;

	function message(details) {
		let str = details.message || "[missing message]";
		let loc = [];

		if (details.filename && details.filename !== filename) {
			loc.push(details.filename);
		}

		if (details.start) loc.push(details.start.line, details.start.column);
		return str + (loc.length ? ` (${loc.join(":")})` : ``);
	}

	
	if ($$props.kind === void 0 && $$bindings.kind && kind !== void 0) $$bindings.kind(kind);
	if ($$props.details === void 0 && $$bindings.details && details !== void 0) $$bindings.details(details);
	if ($$props.filename === void 0 && $$bindings.filename && filename !== void 0) $$bindings.filename(filename);
	if ($$props.truncate === void 0 && $$bindings.truncate && truncate !== void 0) $$bindings.truncate(truncate);
	$$result.css.add(css$c);

	return `<div class="${["message " + escape(kind) + " svelte-9488n4", truncate ? "truncate" : ""].join(" ").trim()}">${details
	? `<p class="${["svelte-9488n4", details.filename ? "navigable" : ""].join(" ").trim()}">${escape(message(details))}</p>`
	: `${slots.default ? slots.default({}) : ``}`}</div>`;
});

/* node_modules/@sveltejs/svelte-repl/src/CodeMirror.svelte generated by Svelte v3.31.0 */

const css$d = {
	code: ".codemirror-container.svelte-s9cc8a.svelte-s9cc8a{position:relative;width:100%;height:100%;border:none;line-height:1.5;overflow:hidden}.codemirror-container.svelte-s9cc8a .CodeMirror{height:100%;background:transparent;font:400 14px/1.7 var(--font-mono);color:var(--base)}.codemirror-container.flex.svelte-s9cc8a .CodeMirror{height:auto}.codemirror-container.flex.svelte-s9cc8a .CodeMirror-lines{padding:0}.codemirror-container.svelte-s9cc8a .CodeMirror-gutters{padding:0 16px 0 8px;border:none}.codemirror-container.svelte-s9cc8a .error-loc{position:relative;border-bottom:2px solid #da106e}.codemirror-container.svelte-s9cc8a .error-line{background-color:rgba(200, 0, 0, .05)}textarea.svelte-s9cc8a.svelte-s9cc8a{visibility:hidden}pre.svelte-s9cc8a.svelte-s9cc8a{position:absolute;width:100%;height:100%;top:0;left:0;border:none;padding:4px 4px 4px 60px;resize:none;font-family:var(--font-mono);font-size:13px;line-height:1.7;user-select:none;pointer-events:none;color:#ccc;tab-size:2;-moz-tab-size:2}.flex.svelte-s9cc8a pre.svelte-s9cc8a{padding:0 0 0 4px;height:auto}",
	map: "{\"version\":3,\"file\":\"CodeMirror.svelte\",\"sources\":[\"CodeMirror.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\timport { is_browser } from './env.js';\\n\\n\\tlet codemirror_promise;\\n\\tlet _CodeMirror;\\n\\n\\tif (is_browser) {\\n\\t\\tcodemirror_promise = import('./codemirror.js');\\n\\n\\t\\tcodemirror_promise.then(mod => {\\n\\t\\t\\t_CodeMirror = mod.default;\\n\\t\\t});\\n\\t}\\n</script>\\n\\n<script>\\n\\timport { onMount, createEventDispatcher } from 'svelte';\\n\\timport Message from './Message.svelte';\\n\\n\\tconst dispatch = createEventDispatcher();\\n\\n\\texport let readonly = false;\\n\\texport let errorLoc = null;\\n\\texport let flex = false;\\n\\texport let lineNumbers = true;\\n\\texport let tab = true;\\n\\n\\tlet w;\\n\\tlet h;\\n\\tlet code = '';\\n\\tlet mode;\\n\\n\\t// We have to expose set and update methods, rather\\n\\t// than making this state-driven through props,\\n\\t// because it's difficult to update an editor\\n\\t// without resetting scroll otherwise\\n\\texport async function set(new_code, new_mode) {\\n\\t\\tif (new_mode !== mode) {\\n\\t\\t\\tawait createEditor(mode = new_mode);\\n\\t\\t}\\n\\n\\t\\tcode = new_code;\\n\\t\\tupdating_externally = true;\\n\\t\\tif (editor) editor.setValue(code);\\n\\t\\tupdating_externally = false;\\n\\t}\\n\\n\\texport function update(new_code) {\\n\\t\\tcode = new_code;\\n\\n\\t\\tif (editor) {\\n\\t\\t\\tconst { left, top } = editor.getScrollInfo();\\n\\t\\t\\teditor.setValue(code = new_code);\\n\\t\\t\\teditor.scrollTo(left, top);\\n\\t\\t}\\n\\t}\\n\\n\\texport function resize() {\\n\\t\\teditor.refresh();\\n\\t}\\n\\n\\texport function focus() {\\n\\t\\teditor.focus();\\n\\t}\\n\\n\\texport function getHistory() {\\n\\t\\treturn editor.getHistory();\\n\\t}\\n\\n\\texport function setHistory(history) {\\n\\t\\teditor.setHistory(history);\\n\\t}\\n\\n\\texport function clearHistory() {\\n\\t\\tif (editor) editor.clearHistory();\\n\\t}\\n\\n\\tconst modes = {\\n\\t\\tjs: {\\n\\t\\t\\tname: 'javascript',\\n\\t\\t\\tjson: false\\n\\t\\t},\\n\\t\\tjson: {\\n\\t\\t\\tname: 'javascript',\\n\\t\\t\\tjson: true\\n\\t\\t},\\n\\t\\tsvelte: {\\n\\t\\t\\tname: 'handlebars',\\n\\t\\t\\tbase: 'text/html'\\n\\t\\t},\\n\\t\\tmd: {\\n\\t\\t\\tname: 'markdown'\\n\\t\\t}\\n\\t};\\n\\n\\tconst refs = {};\\n\\tlet editor;\\n\\tlet updating_externally = false;\\n\\tlet marker;\\n\\tlet error_line;\\n\\tlet destroyed = false;\\n\\tlet CodeMirror;\\n\\n\\t$: if (editor && w && h) {\\n\\t\\teditor.refresh();\\n\\t}\\n\\n\\t$: {\\n\\t\\tif (marker) marker.clear();\\n\\n\\t\\tif (errorLoc) {\\n\\t\\t\\tconst line = errorLoc.line - 1;\\n\\t\\t\\tconst ch = errorLoc.column;\\n\\n\\t\\t\\tmarker = editor.markText({ line, ch }, { line, ch: ch + 1 }, {\\n\\t\\t\\t\\tclassName: 'error-loc'\\n\\t\\t\\t});\\n\\n\\t\\t\\terror_line = line;\\n\\t\\t} else {\\n\\t\\t\\terror_line = null;\\n\\t\\t}\\n\\t}\\n\\n\\tlet previous_error_line;\\n\\t$: if (editor) {\\n\\t\\tif (previous_error_line != null) {\\n\\t\\t\\teditor.removeLineClass(previous_error_line, 'wrap', 'error-line')\\n\\t\\t}\\n\\n\\t\\tif (error_line && (error_line !== previous_error_line)) {\\n\\t\\t\\teditor.addLineClass(error_line, 'wrap', 'error-line');\\n\\t\\t\\tprevious_error_line = error_line;\\n\\t\\t}\\n\\t}\\n\\n\\tonMount(() => {\\n\\t\\t(async () => {\\n\\t\\t\\tif (!_CodeMirror) {\\n\\t\\t\\t\\tlet mod = await codemirror_promise;\\n\\t\\t\\t\\tCodeMirror = mod.default;\\n\\t\\t\\t} else {\\n\\t\\t\\t\\tCodeMirror = _CodeMirror;\\n\\t\\t\\t}\\n\\t\\t\\tawait createEditor(mode || 'svelte');\\n\\t\\t\\tif (editor) editor.setValue(code || '');\\n\\t\\t})();\\n\\n\\t\\treturn () => {\\n\\t\\t\\tdestroyed = true;\\n\\t\\t\\tif (editor) editor.toTextArea();\\n\\t\\t}\\n\\t});\\n\\n\\tlet first = true;\\n\\n\\tasync function createEditor(mode) {\\n\\t\\tif (destroyed || !CodeMirror) return;\\n\\n\\t\\tif (editor) editor.toTextArea();\\n\\n\\t\\tconst opts = {\\n\\t\\t\\tlineNumbers,\\n\\t\\t\\tlineWrapping: true,\\n\\t\\t\\tindentWithTabs: true,\\n\\t\\t\\tindentUnit: 2,\\n\\t\\t\\ttabSize: 2,\\n\\t\\t\\tvalue: '',\\n\\t\\t\\tmode: modes[mode] || {\\n\\t\\t\\t\\tname: mode\\n\\t\\t\\t},\\n\\t\\t\\treadOnly: readonly,\\n\\t\\t\\tautoCloseBrackets: true,\\n\\t\\t\\tautoCloseTags: true,\\n\\t\\t\\textraKeys: {\\n\\t\\t\\t\\t'Enter': 'newlineAndIndentContinueMarkdownList',\\n\\t\\t\\t\\t'Ctrl-/': 'toggleComment',\\n\\t\\t\\t\\t'Cmd-/': 'toggleComment',\\n\\t\\t\\t\\t'Ctrl-Q': function (cm) {\\n\\t\\t\\t\\t\\tcm.foldCode(cm.getCursor());\\n\\t\\t\\t\\t},\\n\\t\\t\\t\\t'Cmd-Q': function (cm) {\\n\\t\\t\\t\\t\\tcm.foldCode(cm.getCursor());\\n\\t\\t\\t\\t}\\n\\t\\t\\t},\\n\\t\\t\\tfoldGutter: true,\\n\\t\\t\\tgutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']\\n\\t\\t};\\n\\n\\t\\tif (!tab) {\\n\\t\\t\\topts.extraKeys['Tab'] = tab;\\n\\t\\t\\topts.extraKeys['Shift-Tab'] = tab;\\n\\t\\t}\\n\\n\\t\\t// Creating a text editor is a lot of work, so we yield\\n\\t\\t// the main thread for a moment. This helps reduce jank\\n\\t\\tif (first) await sleep(50);\\n\\n\\t\\tif (destroyed) return;\\n\\n\\t\\teditor = CodeMirror.fromTextArea(refs.editor, opts);\\n\\n\\t\\teditor.on('change', instance => {\\n\\t\\t\\tif (!updating_externally) {\\n\\t\\t\\t\\tconst value = instance.getValue();\\n\\t\\t\\t\\tdispatch('change', { value });\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tif (first) await sleep(50);\\n\\t\\teditor.refresh();\\n\\n\\t\\tfirst = false;\\n\\t}\\n\\n\\tfunction sleep(ms) {\\n\\t\\treturn new Promise(fulfil => setTimeout(fulfil, ms));\\n\\t}\\n</script>\\n\\n<style>\\n\\t.codemirror-container {\\n\\t\\tposition: relative;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tborder: none;\\n\\t\\tline-height: 1.5;\\n\\t\\toverflow: hidden;\\n\\t}\\n\\n\\t.codemirror-container :global(.CodeMirror) {\\n\\t\\theight: 100%;\\n\\t\\tbackground: transparent;\\n\\t\\tfont: 400 14px/1.7 var(--font-mono);\\n\\t\\tcolor: var(--base);\\n\\t}\\n\\n\\t.codemirror-container.flex :global(.CodeMirror) {\\n\\t\\theight: auto;\\n\\t}\\n\\n\\t.codemirror-container.flex :global(.CodeMirror-lines) {\\n\\t\\tpadding: 0;\\n\\t}\\n\\n\\t.codemirror-container :global(.CodeMirror-gutters) {\\n\\t\\tpadding: 0 16px 0 8px;\\n\\t\\tborder: none;\\n\\t}\\n\\n\\t.codemirror-container :global(.error-loc) {\\n\\t\\tposition: relative;\\n\\t\\tborder-bottom: 2px solid #da106e;\\n\\t}\\n\\n\\t.codemirror-container :global(.error-line) {\\n\\t\\tbackground-color: rgba(200, 0, 0, .05);\\n\\t}\\n\\n\\ttextarea {\\n\\t\\tvisibility: hidden;\\n\\t}\\n\\n\\tpre {\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\tborder: none;\\n\\t\\tpadding: 4px 4px 4px 60px;\\n\\t\\tresize: none;\\n\\t\\tfont-family: var(--font-mono);\\n\\t\\tfont-size: 13px;\\n\\t\\tline-height: 1.7;\\n\\t\\tuser-select: none;\\n\\t\\tpointer-events: none;\\n\\t\\tcolor: #ccc;\\n\\t\\ttab-size: 2;\\n\\t\\t-moz-tab-size: 2;\\n\\t}\\n\\n\\t.flex pre {\\n\\t\\tpadding: 0 0 0 4px;\\n\\t\\theight: auto;\\n\\t}\\n</style>\\n\\n<div class='codemirror-container' class:flex bind:offsetWidth={w} bind:offsetHeight={h}>\\n\\t<!-- svelte-ignore a11y-positive-tabindex -->\\n\\t<textarea\\n\\t\\ttabindex='2'\\n\\t\\tbind:this={refs.editor}\\n\\t\\treadonly\\n\\t\\tvalue={code}\\n\\t></textarea>\\n\\n\\t{#if !CodeMirror}\\n\\t\\t<pre style=\\\"position: absolute; left: 0; top: 0\\\"\\n\\t\\t>{code}</pre>\\n\\n\\t\\t<div style=\\\"position: absolute; width: 100%; bottom: 0\\\">\\n\\t\\t\\t<Message kind='info'>loading editor...</Message>\\n\\t\\t</div>\\n\\t{/if}\\n</div>\"],\"names\":[],\"mappings\":\"AA6NC,qBAAqB,4BAAC,CAAC,AACtB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAChB,QAAQ,CAAE,MAAM,AACjB,CAAC,AAED,mCAAqB,CAAC,AAAQ,WAAW,AAAE,CAAC,AAC3C,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,WAAW,CACvB,IAAI,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,WAAW,CAAC,CACnC,KAAK,CAAE,IAAI,MAAM,CAAC,AACnB,CAAC,AAED,qBAAqB,mBAAK,CAAC,AAAQ,WAAW,AAAE,CAAC,AAChD,MAAM,CAAE,IAAI,AACb,CAAC,AAED,qBAAqB,mBAAK,CAAC,AAAQ,iBAAiB,AAAE,CAAC,AACtD,OAAO,CAAE,CAAC,AACX,CAAC,AAED,mCAAqB,CAAC,AAAQ,mBAAmB,AAAE,CAAC,AACnD,OAAO,CAAE,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,GAAG,CACrB,MAAM,CAAE,IAAI,AACb,CAAC,AAED,mCAAqB,CAAC,AAAQ,UAAU,AAAE,CAAC,AAC1C,QAAQ,CAAE,QAAQ,CAClB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AACjC,CAAC,AAED,mCAAqB,CAAC,AAAQ,WAAW,AAAE,CAAC,AAC3C,gBAAgB,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AACvC,CAAC,AAED,QAAQ,4BAAC,CAAC,AACT,UAAU,CAAE,MAAM,AACnB,CAAC,AAED,GAAG,4BAAC,CAAC,AACJ,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CACzB,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,IAAI,WAAW,CAAC,CAC7B,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,IAAI,CACjB,cAAc,CAAE,IAAI,CACpB,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,CAAC,CACX,aAAa,CAAE,CAAC,AACjB,CAAC,AAED,mBAAK,CAAC,GAAG,cAAC,CAAC,AACV,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAClB,MAAM,CAAE,IAAI,AACb,CAAC\"}"
};

let codemirror_promise;
let _CodeMirror;

if (is_browser) {
	codemirror_promise = Promise.resolve().then(function () { return require('./codemirror-64518479.js'); });

	codemirror_promise.then(mod => {
		_CodeMirror = mod.default;
	});
}

function sleep(ms) {
	return new Promise(fulfil => setTimeout(fulfil, ms));
}

const CodeMirror_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const dispatch = createEventDispatcher();
	let { readonly = false } = $$props;
	let { errorLoc = null } = $$props;
	let { flex = false } = $$props;
	let { lineNumbers = true } = $$props;
	let { tab = true } = $$props;
	let w;
	let h;
	let code = "";
	let mode;

	async function set(new_code, new_mode) {
		if (new_mode !== mode) {
			await createEditor(mode = new_mode);
		}

		code = new_code;
		updating_externally = true;
		if (editor) editor.setValue(code);
		updating_externally = false;
	}

	function update(new_code) {
		code = new_code;

		if (editor) {
			const { left, top } = editor.getScrollInfo();
			editor.setValue(code = new_code);
			editor.scrollTo(left, top);
		}
	}

	function resize() {
		editor.refresh();
	}

	function focus() {
		editor.focus();
	}

	function getHistory() {
		return editor.getHistory();
	}

	function setHistory(history) {
		editor.setHistory(history);
	}

	function clearHistory() {
		if (editor) editor.clearHistory();
	}

	const modes = {
		js: { name: "javascript", json: false },
		json: { name: "javascript", json: true },
		svelte: { name: "handlebars", base: "text/html" },
		md: { name: "markdown" }
	};

	const refs = {};
	let editor;
	let updating_externally = false;
	let marker;
	let error_line;
	let destroyed = false;
	let CodeMirror;
	let previous_error_line;

	onMount(() => {
		(async () => {
			if (!_CodeMirror) {
				let mod = await codemirror_promise;
				CodeMirror = mod.default;
			} else {
				CodeMirror = _CodeMirror;
			}

			await createEditor(mode || "svelte");
			if (editor) editor.setValue(code || "");
		})();

		return () => {
			destroyed = true;
			if (editor) editor.toTextArea();
		};
	});

	let first = true;

	async function createEditor(mode) {
		if (destroyed || !CodeMirror) return;
		if (editor) editor.toTextArea();

		const opts = {
			lineNumbers,
			lineWrapping: true,
			indentWithTabs: true,
			indentUnit: 2,
			tabSize: 2,
			value: "",
			mode: modes[mode] || { name: mode },
			readOnly: readonly,
			autoCloseBrackets: true,
			autoCloseTags: true,
			extraKeys: {
				"Enter": "newlineAndIndentContinueMarkdownList",
				"Ctrl-/": "toggleComment",
				"Cmd-/": "toggleComment",
				"Ctrl-Q"(cm) {
					cm.foldCode(cm.getCursor());
				},
				"Cmd-Q"(cm) {
					cm.foldCode(cm.getCursor());
				}
			},
			foldGutter: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
		};

		if (!tab) {
			opts.extraKeys["Tab"] = tab;
			opts.extraKeys["Shift-Tab"] = tab;
		}

		// Creating a text editor is a lot of work, so we yield
		// the main thread for a moment. This helps reduce jank
		if (first) await sleep(50);

		if (destroyed) return;
		editor = CodeMirror.fromTextArea(refs.editor, opts);

		editor.on("change", instance => {
			if (!updating_externally) {
				const value = instance.getValue();
				dispatch("change", { value });
			}
		});

		if (first) await sleep(50);
		editor.refresh();
		first = false;
	}

	if ($$props.readonly === void 0 && $$bindings.readonly && readonly !== void 0) $$bindings.readonly(readonly);
	if ($$props.errorLoc === void 0 && $$bindings.errorLoc && errorLoc !== void 0) $$bindings.errorLoc(errorLoc);
	if ($$props.flex === void 0 && $$bindings.flex && flex !== void 0) $$bindings.flex(flex);
	if ($$props.lineNumbers === void 0 && $$bindings.lineNumbers && lineNumbers !== void 0) $$bindings.lineNumbers(lineNumbers);
	if ($$props.tab === void 0 && $$bindings.tab && tab !== void 0) $$bindings.tab(tab);
	if ($$props.set === void 0 && $$bindings.set && set !== void 0) $$bindings.set(set);
	if ($$props.update === void 0 && $$bindings.update && update !== void 0) $$bindings.update(update);
	if ($$props.resize === void 0 && $$bindings.resize && resize !== void 0) $$bindings.resize(resize);
	if ($$props.focus === void 0 && $$bindings.focus && focus !== void 0) $$bindings.focus(focus);
	if ($$props.getHistory === void 0 && $$bindings.getHistory && getHistory !== void 0) $$bindings.getHistory(getHistory);
	if ($$props.setHistory === void 0 && $$bindings.setHistory && setHistory !== void 0) $$bindings.setHistory(setHistory);
	if ($$props.clearHistory === void 0 && $$bindings.clearHistory && clearHistory !== void 0) $$bindings.clearHistory(clearHistory);
	$$result.css.add(css$d);

	 {
		if (editor && w && h) {
			editor.refresh();
		}
	}

	 {
		{
			if (marker) marker.clear();

			if (errorLoc) {
				const line = errorLoc.line - 1;
				const ch = errorLoc.column;
				marker = editor.markText({ line, ch }, { line, ch: ch + 1 }, { className: "error-loc" });
				error_line = line;
			} else {
				error_line = null;
			}
		}
	}

	 {
		if (editor) {
			if (previous_error_line != null) {
				editor.removeLineClass(previous_error_line, "wrap", "error-line");
			}

			if (error_line && error_line !== previous_error_line) {
				editor.addLineClass(error_line, "wrap", "error-line");
				previous_error_line = error_line;
			}
		}
	}

	return `<div class="${["codemirror-container svelte-s9cc8a", flex ? "flex" : ""].join(" ").trim()}">
	<textarea tabindex="${"2"}" readonly class="${"svelte-s9cc8a"}"${add_attribute("this", refs.editor, 1)}>${escape(code)}</textarea>

	${!CodeMirror
	? `<pre style="${"position: absolute; left: 0; top: 0"}" class="${"svelte-s9cc8a"}">${escape(code)}</pre>

		<div style="${"position: absolute; width: 100%; bottom: 0"}">${validate_component(Message, "Message").$$render($$result, { kind: "info" }, {}, { default: () => `loading editor...` })}</div>`
	: ``}</div>`;
});

/* node_modules/@sveltejs/svelte-repl/src/Input/ModuleEditor.svelte generated by Svelte v3.31.0 */

const css$e = {
	code: ".editor-wrapper.svelte-m7nlxn{z-index:5;background:var(--back-light);display:flex;flex-direction:column}.editor.svelte-m7nlxn{height:0;flex:1 1 auto}.info.svelte-m7nlxn{background-color:var(--second);max-height:50%;overflow:auto}.columns .editor-wrapper.svelte-m7nlxn{padding-right:8px;height:auto}",
	map: "{\"version\":3,\"file\":\"ModuleEditor.svelte\",\"sources\":[\"ModuleEditor.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { getContext, onMount } from 'svelte';\\n\\timport CodeMirror from '../CodeMirror.svelte';\\n\\timport Message from '../Message.svelte';\\n\\n\\tconst { bundle, selected, handle_change, register_module_editor } = getContext('REPL');\\n\\n\\texport let errorLoc;\\n\\n\\tlet editor;\\n\\tonMount(() => {\\n\\t\\tregister_module_editor(editor);\\n\\t});\\n\\n\\texport function focus() {\\n\\t\\teditor.focus();\\n\\t}\\n</script>\\n\\n<style>\\n\\t.editor-wrapper {\\n\\t\\tz-index: 5;\\n\\t\\tbackground: var(--back-light);\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t}\\n\\n\\t.editor {\\n\\t\\theight: 0;\\n\\t\\tflex: 1 1 auto;\\n\\t}\\n\\n\\t.info {\\n\\t\\tbackground-color: var(--second);\\n\\t\\tmax-height: 50%;\\n\\t\\toverflow: auto;\\n\\t}\\n\\n\\t:global(.columns) .editor-wrapper {\\n\\t\\t/* make it easier to interact with scrollbar */\\n\\t\\tpadding-right: 8px;\\n\\t\\theight: auto;\\n\\t\\t/* height: 100%; */\\n\\t}\\n</style>\\n\\n<div class=\\\"editor-wrapper\\\">\\n\\t<div class=\\\"editor notranslate\\\" translate=\\\"no\\\">\\n\\t\\t<CodeMirror\\n\\t\\t\\tbind:this={editor}\\n\\t\\t\\t{errorLoc}\\n\\t\\t\\ton:change={handle_change}\\n\\t\\t/>\\n\\t</div>\\n\\n\\t<div class=\\\"info\\\">\\n\\t\\t{#if $bundle}\\n\\t\\t\\t{#if $bundle.error}\\n\\t\\t\\t\\t<Message kind=\\\"error\\\" details={$bundle.error} filename=\\\"{$selected.name}.{$selected.type}\\\"/>\\n\\t\\t\\t{:else if $bundle.warnings.length > 0}\\n\\t\\t\\t\\t{#each $bundle.warnings as warning}\\n\\t\\t\\t\\t\\t<Message kind=\\\"warning\\\" details={warning} filename=\\\"{$selected.name}.{$selected.type}\\\"/>\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t{/if}\\n\\t\\t{/if}\\n\\t</div>\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAoBC,eAAe,cAAC,CAAC,AAChB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,IAAI,YAAY,CAAC,CAC7B,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,AACvB,CAAC,AAED,OAAO,cAAC,CAAC,AACR,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,AACf,CAAC,AAED,KAAK,cAAC,CAAC,AACN,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,UAAU,CAAE,GAAG,CACf,QAAQ,CAAE,IAAI,AACf,CAAC,AAEO,QAAQ,AAAC,CAAC,eAAe,cAAC,CAAC,AAElC,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,IAAI,AAEb,CAAC\"}"
};

const ModuleEditor = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $bundle;
	let $selected;
	const { bundle, selected, handle_change, register_module_editor } = getContext("REPL");
	validate_store(bundle, "bundle");
	$bundle = get_store_value(bundle);
	validate_store(selected, "selected");
	$selected = get_store_value(selected);
	let { errorLoc } = $$props;
	let editor;

	onMount(() => {
		register_module_editor(editor);
	});

	function focus() {
		editor.focus();
	}

	if ($$props.errorLoc === void 0 && $$bindings.errorLoc && errorLoc !== void 0) $$bindings.errorLoc(errorLoc);
	if ($$props.focus === void 0 && $$bindings.focus && focus !== void 0) $$bindings.focus(focus);
	$$result.css.add(css$e);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		validate_store(bundle, "bundle");
		$bundle = get_store_value(bundle);
		validate_store(selected, "selected");
		$selected = get_store_value(selected);

		$$rendered = `<div class="${"editor-wrapper svelte-m7nlxn"}"><div class="${"editor notranslate svelte-m7nlxn"}" translate="${"no"}">${validate_component(CodeMirror_1, "CodeMirror").$$render(
			$$result,
			{ errorLoc, this: editor },
			{
				this: $$value => {
					editor = $$value;
					$$settled = false;
				}
			},
			{}
		)}</div>

	<div class="${"info svelte-m7nlxn"}">${$bundle
		? `${$bundle.error
			? `${validate_component(Message, "Message").$$render(
					$$result,
					{
						kind: "error",
						details: $bundle.error,
						filename: $selected.name + "." + $selected.type
					},
					{},
					{}
				)}`
			: `${$bundle.warnings.length > 0
				? `${each($bundle.warnings, warning => `${validate_component(Message, "Message").$$render(
						$$result,
						{
							kind: "warning",
							details: warning,
							filename: $selected.name + "." + $selected.type
						},
						{},
						{}
					)}`)}`
				: ``}`}`
		: ``}</div></div>`;
	} while (!$$settled);

	return $$rendered;
});

var charToInteger = {};
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
for (var i = 0; i < chars.length; i++) {
    charToInteger[chars.charCodeAt(i)] = i;
}
function decode(mappings) {
    var decoded = [];
    var line = [];
    var segment = [
        0,
        0,
        0,
        0,
        0,
    ];
    var j = 0;
    for (var i = 0, shift = 0, value = 0; i < mappings.length; i++) {
        var c = mappings.charCodeAt(i);
        if (c === 44) { // ","
            segmentify(line, segment, j);
            j = 0;
        }
        else if (c === 59) { // ";"
            segmentify(line, segment, j);
            j = 0;
            decoded.push(line);
            line = [];
            segment[0] = 0;
        }
        else {
            var integer = charToInteger[c];
            if (integer === undefined) {
                throw new Error('Invalid character (' + String.fromCharCode(c) + ')');
            }
            var hasContinuationBit = integer & 32;
            integer &= 31;
            value += integer << shift;
            if (hasContinuationBit) {
                shift += 5;
            }
            else {
                var shouldNegate = value & 1;
                value >>>= 1;
                if (shouldNegate) {
                    value = value === 0 ? -0x80000000 : -value;
                }
                segment[j] += value;
                j++;
                value = shift = 0; // reset
            }
        }
    }
    segmentify(line, segment, j);
    decoded.push(line);
    return decoded;
}
function segmentify(line, segment, j) {
    // This looks ugly, but we're creating specialized arrays with a specific
    // length. This is much faster than creating a new array (which v8 expands to
    // a capacity of 17 after pushing the first item), or slicing out a subarray
    // (which is slow). Length 4 is assumed to be the most frequent, followed by
    // length 5 (since not everything will have an associated name), followed by
    // length 1 (it's probably rare for a source substring to not have an
    // associated segment data).
    if (j === 4)
        line.push([segment[0], segment[1], segment[2], segment[3]]);
    else if (j === 5)
        line.push([segment[0], segment[1], segment[2], segment[3], segment[4]]);
    else if (j === 1)
        line.push([segment[0]]);
}

function getLocationFromStack(stack, map) {
	if (!stack) return;
	const last = stack.split('\n')[1];
	const match = /<anonymous>:(\d+):(\d+)\)$/.exec(last);

	if (!match) return null;

	const line = +match[1];
	const column = +match[2];

	return trace({ line, column }, map);
}

function trace(loc, map) {
	const mappings = decode(map.mappings);
	const segments = mappings[loc.line - 1];

	for (let i = 0; i < segments.length; i += 1) {
		const segment = segments[i];
		if (segment[0] === loc.column) {
			const [, sourceIndex, line, column] = segment;
			const source = map.sources[sourceIndex].slice(2);

			return { source, line: line + 1, column };
		}
	}

	return null;
}

function is_date(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}

function tick_spring(ctx, last_value, current_value, target_value) {
    if (typeof current_value === 'number' || is_date(current_value)) {
        // @ts-ignore
        const delta = target_value - current_value;
        // @ts-ignore
        const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
        const spring = ctx.opts.stiffness * delta;
        const damper = ctx.opts.damping * velocity;
        const acceleration = (spring - damper) * ctx.inv_mass;
        const d = (velocity + acceleration) * ctx.dt;
        if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
            return target_value; // settled
        }
        else {
            ctx.settled = false; // signal loop to keep ticking
            // @ts-ignore
            return is_date(current_value) ?
                new Date(current_value.getTime() + d) : current_value + d;
        }
    }
    else if (Array.isArray(current_value)) {
        // @ts-ignore
        return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
    }
    else if (typeof current_value === 'object') {
        const next_value = {};
        for (const k in current_value) {
            // @ts-ignore
            next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
        }
        // @ts-ignore
        return next_value;
    }
    else {
        throw new Error(`Cannot spring ${typeof current_value} values`);
    }
}
function spring(value, opts = {}) {
    const store = writable(value);
    const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
    let last_time;
    let task;
    let current_token;
    let last_value = value;
    let target_value = value;
    let inv_mass = 1;
    let inv_mass_recovery_rate = 0;
    let cancel_task = false;
    function set(new_value, opts = {}) {
        target_value = new_value;
        const token = current_token = {};
        if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
            cancel_task = true; // cancel any running animation
            last_time = now();
            last_value = new_value;
            store.set(value = target_value);
            return Promise.resolve();
        }
        else if (opts.soft) {
            const rate = opts.soft === true ? .5 : +opts.soft;
            inv_mass_recovery_rate = 1 / (rate * 60);
            inv_mass = 0; // infinite mass, unaffected by spring forces
        }
        if (!task) {
            last_time = now();
            cancel_task = false;
            task = loop(now => {
                if (cancel_task) {
                    cancel_task = false;
                    task = null;
                    return false;
                }
                inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                const ctx = {
                    inv_mass,
                    opts: spring,
                    settled: true,
                    dt: (now - last_time) * 60 / 1000
                };
                const next_value = tick_spring(ctx, last_value, value, target_value);
                last_time = now;
                last_value = value;
                store.set(value = next_value);
                if (ctx.settled) {
                    task = null;
                }
                return !ctx.settled;
            });
        }
        return new Promise(fulfil => {
            task.promise.then(() => {
                if (token === current_token)
                    fulfil();
            });
        });
    }
    const spring = {
        set,
        update: (fn, opts) => set(fn(target_value, value), opts),
        subscribe: store.subscribe,
        stiffness,
        damping,
        precision
    };
    return spring;
}

/* node_modules/@sveltejs/svelte-repl/src/Output/PaneWithPanel.svelte generated by Svelte v3.31.0 */

const css$f = {
	code: ".panel-header.svelte-160vuma{height:42px;display:flex;justify-content:space-between;align-items:center;padding:0 0.5em;cursor:pointer}.panel-body.svelte-160vuma{overflow:auto}h3.svelte-160vuma{font:700 12px/1.5 var(--font);color:#333}section.svelte-160vuma{overflow:hidden}",
	map: "{\"version\":3,\"file\":\"PaneWithPanel.svelte\",\"sources\":[\"PaneWithPanel.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { spring } from 'svelte/motion';\\n\\timport SplitPane from '../SplitPane.svelte';\\n\\n\\texport let panel;\\n\\texport let pos = 50;\\n\\tlet previous_pos = Math.min(pos, 70);\\n\\n\\tlet max;\\n\\n\\t// we can't bind to the spring itself, but we\\n\\t// can still use the spring to drive `pos`\\n\\tconst driver = spring(pos);\\n\\t$: pos = $driver;\\n\\n\\tconst toggle = () => {\\n\\t\\tdriver.set(pos, { hard: true });\\n\\n\\t\\tif (pos > 80) {\\n\\t\\t\\tdriver.set(previous_pos);\\n\\t\\t} else {\\n\\t\\t\\tprevious_pos = pos;\\n\\t\\t\\tdriver.set(max);\\n\\t\\t}\\n\\t};\\n</script>\\n\\n<SplitPane bind:max type=\\\"vertical\\\" bind:pos={pos}>\\n\\t<section slot=\\\"a\\\">\\n\\t\\t<slot name=\\\"main\\\"></slot>\\n\\t</section>\\n\\n\\t<section slot=\\\"b\\\">\\n\\t\\t<div class=\\\"panel-header\\\" on:click={toggle}>\\n\\t\\t\\t<h3>{panel}</h3>\\n\\t\\t\\t<slot name=\\\"panel-header\\\"></slot>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\\"panel-body\\\">\\n\\t\\t\\t<slot name=\\\"panel-body\\\"></slot>\\n\\t\\t</div>\\n\\t</section>\\n</SplitPane>\\n\\n<style>\\n\\t.panel-header {\\n\\t\\theight: 42px;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: space-between;\\n\\t\\talign-items: center;\\n\\t\\tpadding: 0 0.5em;\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\t.panel-body {\\n\\t\\toverflow: auto;\\n\\t}\\n\\n\\th3 {\\n\\t\\tfont: 700 12px/1.5 var(--font);\\n\\t\\tcolor: #333;\\n\\t}\\n\\n\\tsection {\\n\\t\\toverflow: hidden;\\n\\t}\\n</style>\"],\"names\":[],\"mappings\":\"AA6CC,aAAa,eAAC,CAAC,AACd,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,CAAC,CAAC,KAAK,CAChB,MAAM,CAAE,OAAO,AAChB,CAAC,AAED,WAAW,eAAC,CAAC,AACZ,QAAQ,CAAE,IAAI,AACf,CAAC,AAED,EAAE,eAAC,CAAC,AACH,IAAI,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,MAAM,CAAC,CAC9B,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,OAAO,eAAC,CAAC,AACR,QAAQ,CAAE,MAAM,AACjB,CAAC\"}"
};

const PaneWithPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $driver;
	let { panel } = $$props;
	let { pos = 50 } = $$props;
	let max;

	// we can't bind to the spring itself, but we
	// can still use the spring to drive `pos`
	const driver = spring(pos);

	validate_store(driver, "driver");
	$driver = get_store_value(driver);

	if ($$props.panel === void 0 && $$bindings.panel && panel !== void 0) $$bindings.panel(panel);
	if ($$props.pos === void 0 && $$bindings.pos && pos !== void 0) $$bindings.pos(pos);
	$$result.css.add(css$f);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		validate_store(driver, "driver");
		$driver = get_store_value(driver);
		pos = $driver;

		$$rendered = `${validate_component(SplitPane, "SplitPane").$$render(
			$$result,
			{ type: "vertical", max, pos },
			{
				max: $$value => {
					max = $$value;
					$$settled = false;
				},
				pos: $$value => {
					pos = $$value;
					$$settled = false;
				}
			},
			{
				a: () => `<section slot="${"a"}" class="${"svelte-160vuma"}">${slots.main ? slots.main({}) : ``}</section>`,
				b: () => `<section slot="${"b"}" class="${"svelte-160vuma"}"><div class="${"panel-header svelte-160vuma"}"><h3 class="${"svelte-160vuma"}">${escape(panel)}</h3>
			${slots["panel-header"] ? slots["panel-header"]({}) : ``}</div>

		<div class="${"panel-body svelte-160vuma"}">${slots["panel-body"] ? slots["panel-body"]({}) : ``}</div></section>`,
				default: () => `

	
`
			}
		)}`;
	} while (!$$settled);

	return $$rendered;
});

let uid = 1;

class ReplProxy {
	constructor(iframe, handlers) {
		this.iframe = iframe;
		this.handlers = handlers;

		this.pending_cmds = new Map();

		this.handle_event = e => this.handle_repl_message(e);
		window.addEventListener('message', this.handle_event, false);
	}

	destroy() {
		window.removeEventListener('message', this.handle_event);
	}

	iframe_command(action, args) {
		return new Promise((resolve, reject) => {
			const cmd_id = uid++;

			this.pending_cmds.set(cmd_id, { resolve, reject });

			this.iframe.contentWindow.postMessage({ action, cmd_id, args }, '*');
		});
	}

	handle_command_message(cmd_data) {
		let action = cmd_data.action;
		let id = cmd_data.cmd_id;
		let handler = this.pending_cmds.get(id);

		if (handler) {
			this.pending_cmds.delete(id);
			if (action === 'cmd_error') {
				let { message, stack } = cmd_data;
				let e = new Error(message);
				e.stack = stack;
				handler.reject(e);
			}

			if (action === 'cmd_ok') {
				handler.resolve(cmd_data.args);
			}
		} else {
			console.error('command not found', id, cmd_data, [...this.pending_cmds.keys()]);
		}
	}

	handle_repl_message(event) {
		if (event.source !== this.iframe.contentWindow) return;

		const { action, args } = event.data;

		switch (action) {
			case 'cmd_error':
			case 'cmd_ok':
				return this.handle_command_message(event.data);
			case 'fetch_progress':
				return this.handlers.on_fetch_progress(args.remaining)
			case 'error':
				return this.handlers.on_error(event.data);
			case 'unhandledrejection':
				return this.handlers.on_unhandled_rejection(event.data);
			case 'console':
				return this.handlers.on_console(event.data);
			case 'console_group':
				return this.handlers.on_console_group(event.data);
			case 'console_group_collapsed':
				return this.handlers.on_console_group_collapsed(event.data);
			case 'console_group_end':
				return this.handlers.on_console_group_end(event.data);
		}
	}

	eval(script) {
		return this.iframe_command('eval', { script });
	}

	handle_links() {
		return this.iframe_command('catch_clicks', {});
	}
}

/* node_modules/svelte-json-tree/src/JSONArrow.svelte generated by Svelte v3.31.0 */

const css$g = {
	code: ".container.svelte-kniv4z{display:inline-block;width:var(--li-identation);cursor:pointer;margin-left:calc(-7px - var(--li-identation));text-align:right}.arrow.svelte-kniv4z{transform-origin:67% 50%;position:relative;line-height:1.1em;font-size:0.75em;margin-left:0;transition:150ms;color:var(--arrow-sign)}.expanded.svelte-kniv4z{transform:rotateZ(90deg) translateX(-3px)}",
	map: "{\"version\":3,\"file\":\"JSONArrow.svelte\",\"sources\":[\"JSONArrow.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { createEventDispatcher } from 'svelte';\\n\\tconst dispatch = createEventDispatcher();\\n\\n  function onClick(event) {\\n    dispatch('click', event);\\n  }\\n\\n  export let expanded;\\n</script>\\n<style>\\n  .container {\\n    display: inline-block;\\n    width: var(--li-identation);\\n    cursor: pointer;\\n    margin-left: calc(-7px - var(--li-identation));\\n    text-align: right;\\n  }\\n  .arrow {\\n    transform-origin: 67% 50%;\\n    position: relative;\\n    line-height: 1.1em;\\n    font-size: 0.75em;\\n    margin-left: 0;\\n    transition: 150ms;\\n    color: var(--arrow-sign);\\n  }\\n  .expanded {\\n    transform: rotateZ(90deg) translateX(-3px);\\n  }\\n</style>\\n\\n<div class=\\\"container\\\" on:click={onClick}>\\n  <div class=\\\"arrow\\\" class:expanded={expanded}>{'\\\\u25B6'}</div>\\n</div>\"],\"names\":[],\"mappings\":\"AAWE,UAAU,cAAC,CAAC,AACV,OAAO,CAAE,YAAY,CACrB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,eAAe,CAAC,CAAC,CAC9C,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,MAAM,cAAC,CAAC,AACN,gBAAgB,CAAE,GAAG,CAAC,GAAG,CACzB,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,KAAK,CAClB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,CAAC,CACd,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,IAAI,YAAY,CAAC,AAC1B,CAAC,AACD,SAAS,cAAC,CAAC,AACT,SAAS,CAAE,QAAQ,KAAK,CAAC,CAAC,WAAW,IAAI,CAAC,AAC5C,CAAC\"}"
};

const JSONArrow = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const dispatch = createEventDispatcher();

	let { expanded } = $$props;
	if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0) $$bindings.expanded(expanded);
	$$result.css.add(css$g);
	return `<div class="${"container svelte-kniv4z"}"><div class="${["arrow svelte-kniv4z", expanded ? "expanded" : ""].join(" ").trim()}">${escape("▶")}</div></div>`;
});

function objType(obj) {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  if (type === 'Object') {
    if (typeof obj[Symbol.iterator] === 'function') {
      return 'Iterable';
    }
    return obj.constructor.name;
  }

  return type;
}

/* node_modules/svelte-json-tree/src/JSONKey.svelte generated by Svelte v3.31.0 */

const css$h = {
	code: "label.svelte-15h461i{display:inline-block;color:var(--label-color);margin:0}.spaced.svelte-15h461i{margin-right:var(--li-colon-space)}",
	map: "{\"version\":3,\"file\":\"JSONKey.svelte\",\"sources\":[\"JSONKey.svelte\"],\"sourcesContent\":[\"<script>\\n  import { isPrimitive } from './objType';\\n  import JSONNode from './JSONNode.svelte';\\n\\n  export let key, isParentExpanded, isParentArray = false, colon = ':';\\n\\n  $: showKey = (isParentExpanded || !isParentArray || key != +key);\\n</script>\\n<style>\\n  label {\\n    display: inline-block;\\n    color: var(--label-color);\\n    margin: 0;\\n  }\\n  .spaced {\\n    margin-right: var(--li-colon-space);\\n  }\\n</style>\\n{#if showKey && key}\\n  <label class:spaced={isParentExpanded}>\\n    <span>{key}{colon}</span>\\n  </label>\\n{/if}\"],\"names\":[],\"mappings\":\"AASE,KAAK,eAAC,CAAC,AACL,OAAO,CAAE,YAAY,CACrB,KAAK,CAAE,IAAI,aAAa,CAAC,CACzB,MAAM,CAAE,CAAC,AACX,CAAC,AACD,OAAO,eAAC,CAAC,AACP,YAAY,CAAE,IAAI,gBAAgB,CAAC,AACrC,CAAC\"}"
};

const JSONKey = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray = false } = $$props,
		{ colon = ":" } = $$props;

	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.colon === void 0 && $$bindings.colon && colon !== void 0) $$bindings.colon(colon);
	$$result.css.add(css$h);
	let showKey;
	showKey = isParentExpanded || !isParentArray || key != +key;

	return `${showKey && key
	? `<label class="${["svelte-15h461i", isParentExpanded ? "spaced" : ""].join(" ").trim()}"><span>${escape(key)}${escape(colon)}</span></label>`
	: ``}`;
});

var contextKey = {};

/* node_modules/svelte-json-tree/src/JSONNested.svelte generated by Svelte v3.31.0 */

const css$i = {
	code: ".indent.svelte-2jkrkt{margin-left:var(--li-identation)}.collapse.svelte-2jkrkt{--li-display:inline;display:inline;font-style:italic}.comma.svelte-2jkrkt{margin-left:-0.5em;margin-right:0.5em}",
	map: "{\"version\":3,\"file\":\"JSONNested.svelte\",\"sources\":[\"JSONNested.svelte\"],\"sourcesContent\":[\"<script>\\n  import { getContext, setContext } from 'svelte';\\n  import contextKey from './context';\\n  import JSONArrow from './JSONArrow.svelte';\\n  import JSONNode from './JSONNode.svelte';\\n  import JSONKey from './JSONKey.svelte';\\n\\n  export let key, keys, colon = ':', label = '', isParentExpanded, isParentArray, isArray = false, bracketOpen, bracketClose;\\n  export let previewKeys = keys;\\n  export let getKey = key => key;\\n  export let getValue = key => key;\\n  export let getPreviewValue = getValue;\\n  export let expanded = false, expandable = true;\\n\\n  const context = getContext(contextKey);\\n  setContext(contextKey, { ...context, colon })\\n\\n  $: slicedKeys = expanded ? keys: previewKeys.slice(0, 5);\\n\\n  $: if (!isParentExpanded) {\\n    expanded = false;\\n  }\\n\\n  function toggleExpand() {\\n    expanded = !expanded;\\n  }\\n\\n  function expand() {\\n    expanded = true;\\n  }\\n\\n</script>\\n<style>\\n  .indent {\\n    margin-left: var(--li-identation);\\n  }\\n  .collapse {\\n    --li-display: inline;\\n    display: inline;\\n    font-style: italic;\\n  }\\n  .comma {\\n    margin-left: -0.5em;\\n    margin-right: 0.5em;\\n  }\\n</style>\\n<li class:indent={isParentExpanded}>\\n  {#if expandable && isParentExpanded}\\n    <JSONArrow on:click={toggleExpand} {expanded} />\\n  {/if}\\n  <JSONKey {key} colon={context.colon} {isParentExpanded} {isParentArray} />\\n  <span><span on:click={toggleExpand}>{label}</span>{bracketOpen}</span>\\n    {#if isParentExpanded}\\n      <ul class:collapse={!expanded} on:click={expand}>\\n        {#each slicedKeys as key, index}\\n          <JSONNode key={getKey(key)} isParentExpanded={expanded} isParentArray={isArray} value={expanded ? getValue(key) : getPreviewValue(key)} />\\n          {#if !expanded && index < previewKeys.length - 1}\\n            <span class=\\\"comma\\\">,</span>\\n          {/if}\\n        {/each}\\n        {#if slicedKeys.length < previewKeys.length }\\n          <span>…</span>\\n        {/if}\\n      </ul>\\n    {:else}\\n      <span>…</span>\\n    {/if}\\n  <span>{bracketClose}</span>\\n</li>\"],\"names\":[],\"mappings\":\"AAiCE,OAAO,cAAC,CAAC,AACP,WAAW,CAAE,IAAI,eAAe,CAAC,AACnC,CAAC,AACD,SAAS,cAAC,CAAC,AACT,YAAY,CAAE,MAAM,CACpB,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,MAAM,cAAC,CAAC,AACN,WAAW,CAAE,MAAM,CACnB,YAAY,CAAE,KAAK,AACrB,CAAC\"}"
};

const JSONNested = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ keys } = $$props,
		{ colon = ":" } = $$props,
		{ label = "" } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props,
		{ isArray = false } = $$props,
		{ bracketOpen } = $$props,
		{ bracketClose } = $$props;

	let { previewKeys = keys } = $$props;
	let { getKey = key => key } = $$props;
	let { getValue = key => key } = $$props;
	let { getPreviewValue = getValue } = $$props;
	let { expanded = false } = $$props, { expandable = true } = $$props;
	const context = getContext(contextKey);
	setContext(contextKey, { ...context, colon });

	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.keys === void 0 && $$bindings.keys && keys !== void 0) $$bindings.keys(keys);
	if ($$props.colon === void 0 && $$bindings.colon && colon !== void 0) $$bindings.colon(colon);
	if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.isArray === void 0 && $$bindings.isArray && isArray !== void 0) $$bindings.isArray(isArray);
	if ($$props.bracketOpen === void 0 && $$bindings.bracketOpen && bracketOpen !== void 0) $$bindings.bracketOpen(bracketOpen);
	if ($$props.bracketClose === void 0 && $$bindings.bracketClose && bracketClose !== void 0) $$bindings.bracketClose(bracketClose);
	if ($$props.previewKeys === void 0 && $$bindings.previewKeys && previewKeys !== void 0) $$bindings.previewKeys(previewKeys);
	if ($$props.getKey === void 0 && $$bindings.getKey && getKey !== void 0) $$bindings.getKey(getKey);
	if ($$props.getValue === void 0 && $$bindings.getValue && getValue !== void 0) $$bindings.getValue(getValue);
	if ($$props.getPreviewValue === void 0 && $$bindings.getPreviewValue && getPreviewValue !== void 0) $$bindings.getPreviewValue(getPreviewValue);
	if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0) $$bindings.expanded(expanded);
	if ($$props.expandable === void 0 && $$bindings.expandable && expandable !== void 0) $$bindings.expandable(expandable);
	$$result.css.add(css$i);
	let slicedKeys;

	 {
		if (!isParentExpanded) {
			expanded = false;
		}
	}

	slicedKeys = expanded ? keys : previewKeys.slice(0, 5);

	return `<li class="${["svelte-2jkrkt", isParentExpanded ? "indent" : ""].join(" ").trim()}">${expandable && isParentExpanded
	? `${validate_component(JSONArrow, "JSONArrow").$$render($$result, { expanded }, {}, {})}`
	: ``}
  ${validate_component(JSONKey, "JSONKey").$$render(
		$$result,
		{
			key,
			colon: context.colon,
			isParentExpanded,
			isParentArray
		},
		{},
		{}
	)}
  <span><span>${escape(label)}</span>${escape(bracketOpen)}</span>
    ${isParentExpanded
	? `<ul class="${["svelte-2jkrkt", !expanded ? "collapse" : ""].join(" ").trim()}">${each(slicedKeys, (key, index) => `${validate_component(JSONNode, "JSONNode").$$render(
			$$result,
			{
				key: getKey(key),
				isParentExpanded: expanded,
				isParentArray: isArray,
				value: expanded ? getValue(key) : getPreviewValue(key)
			},
			{},
			{}
		)}
          ${!expanded && index < previewKeys.length - 1
		? `<span class="${"comma svelte-2jkrkt"}">,</span>`
		: ``}`)}
        ${slicedKeys.length < previewKeys.length
		? `<span>…</span>`
		: ``}</ul>`
	: `<span>…</span>`}
  <span>${escape(bracketClose)}</span></li>`;
});

/* node_modules/svelte-json-tree/src/JSONObjectNode.svelte generated by Svelte v3.31.0 */

const JSONObjectNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props,
		{ nodeType } = $$props;

	let { expanded = false } = $$props;

	function getValue(key) {
		return value[key];
	}

	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.nodeType === void 0 && $$bindings.nodeType && nodeType !== void 0) $$bindings.nodeType(nodeType);
	if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0) $$bindings.expanded(expanded);
	let keys;
	keys = Object.getOwnPropertyNames(value);

	return `${validate_component(JSONNested, "JSONNested").$$render(
		$$result,
		{
			key,
			expanded,
			isParentExpanded,
			isParentArray,
			keys,
			getValue,
			label: nodeType + " ",
			bracketOpen: "{",
			bracketClose: "}"
		},
		{},
		{}
	)}`;
});

/* node_modules/svelte-json-tree/src/JSONArrayNode.svelte generated by Svelte v3.31.0 */

const JSONArrayNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props;

	let { expanded = false } = $$props;
	const filteredKey = new Set(["length"]);

	function getValue(key) {
		return value[key];
	}

	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0) $$bindings.expanded(expanded);
	let keys;
	let previewKeys;
	keys = Object.getOwnPropertyNames(value);
	previewKeys = keys.filter(key => !filteredKey.has(key));

	return `${validate_component(JSONNested, "JSONNested").$$render(
		$$result,
		{
			key,
			expanded,
			isParentExpanded,
			isParentArray,
			isArray: true,
			keys,
			previewKeys,
			getValue,
			label: "Array(" + value.length + ")",
			bracketOpen: "[",
			bracketClose: "]"
		},
		{},
		{}
	)}`;
});

/* node_modules/svelte-json-tree/src/JSONIterableArrayNode.svelte generated by Svelte v3.31.0 */

function getKey(key) {
	return String(key[0]);
}

function getValue$1(key) {
	return key[1];
}

const JSONIterableArrayNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props,
		{ nodeType } = $$props;

	let keys = [];
	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.nodeType === void 0 && $$bindings.nodeType && nodeType !== void 0) $$bindings.nodeType(nodeType);

	 {
		{
			let result = [];
			let i = 0;

			for (const entry of value) {
				result.push([i++, entry]);
			}

			keys = result;
		}
	}

	return `${validate_component(JSONNested, "JSONNested").$$render(
		$$result,
		{
			key,
			isParentExpanded,
			isParentArray,
			keys,
			getKey,
			getValue: getValue$1,
			isArray: true,
			label: nodeType + "(" + keys.length + ")",
			bracketOpen: "{",
			bracketClose: "}"
		},
		{},
		{}
	)}`;
});

class MapEntry {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

/* node_modules/svelte-json-tree/src/JSONIterableMapNode.svelte generated by Svelte v3.31.0 */

function getKey$1(entry) {
	return entry[0];
}

function getValue$2(entry) {
	return entry[1];
}

const JSONIterableMapNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props,
		{ nodeType } = $$props;

	let keys = [];
	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.nodeType === void 0 && $$bindings.nodeType && nodeType !== void 0) $$bindings.nodeType(nodeType);

	 {
		{
			let result = [];
			let i = 0;

			for (const entry of value) {
				result.push([i++, new MapEntry(entry[0], entry[1])]);
			}

			keys = result;
		}
	}

	return `${validate_component(JSONNested, "JSONNested").$$render(
		$$result,
		{
			key,
			isParentExpanded,
			isParentArray,
			keys,
			getKey: getKey$1,
			getValue: getValue$2,
			label: nodeType + "(" + keys.length + ")",
			colon: "",
			bracketOpen: "{",
			bracketClose: "}"
		},
		{},
		{}
	)}`;
});

/* node_modules/svelte-json-tree/src/JSONMapEntryNode.svelte generated by Svelte v3.31.0 */

const JSONMapEntryNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props;

	let { expanded = false } = $$props;
	const keys = ["key", "value"];

	function getValue(key) {
		return value[key];
	}

	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0) $$bindings.expanded(expanded);

	return `${validate_component(JSONNested, "JSONNested").$$render(
		$$result,
		{
			expanded,
			isParentExpanded,
			isParentArray,
			key: isParentExpanded ? String(key) : value.key,
			keys,
			getValue,
			label: isParentExpanded ? ": Entry " : "=> ",
			bracketOpen: "{",
			bracketClose: "}"
		},
		{},
		{}
	)}`;
});

/* node_modules/svelte-json-tree/src/JSONValueNode.svelte generated by Svelte v3.31.0 */

const css$j = {
	code: "li.svelte-1m3zj06{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-1m3zj06{margin-left:var(--li-identation)}.String.svelte-1m3zj06{color:var(--string-color)}.Date.svelte-1m3zj06{color:var(--date-color)}.Number.svelte-1m3zj06{color:var(--number-color)}.Boolean.svelte-1m3zj06{color:var(--boolean-color)}.Null.svelte-1m3zj06{color:var(--null-color)}.Undefined.svelte-1m3zj06{color:var(--undefined-color)}.Function.svelte-1m3zj06{color:var(--function-color);font-style:italic}.Symbol.svelte-1m3zj06{color:var(--symbol-color)}",
	map: "{\"version\":3,\"file\":\"JSONValueNode.svelte\",\"sources\":[\"JSONValueNode.svelte\"],\"sourcesContent\":[\"<script>\\n  import { getContext } from 'svelte';\\n  import contextKey from './context';\\n\\n  import JSONKey from './JSONKey.svelte';\\n\\n  export let key, value, valueGetter = null, isParentExpanded, isParentArray, nodeType;\\n\\n  const { colon } = getContext(contextKey);\\n</script>\\n<style>\\n  li {\\n    user-select: text;\\n    word-wrap: break-word;\\n    word-break: break-all;\\n  }\\n  .indent {\\n    margin-left: var(--li-identation);\\n  }\\n  .String {\\n    color: var(--string-color);\\n  }\\n  .Date {\\n    color: var(--date-color);\\n  }\\n  .Number {\\n    color: var(--number-color);\\n  }\\n  .Boolean {\\n    color: var(--boolean-color);\\n  }\\n  .Null {\\n    color: var(--null-color);\\n  }\\n  .Undefined {\\n    color: var(--undefined-color);\\n  }\\n  .Function {\\n    color: var(--function-color);\\n    font-style: italic;\\n  }\\n  .Symbol {\\n    color: var(--symbol-color);\\n  }\\n</style>\\n<li class:indent={isParentExpanded}>\\n  <JSONKey {key} {colon} {isParentExpanded} {isParentArray} />\\n  <span class={nodeType}>\\n    {valueGetter ? valueGetter(value) : value}\\n  </span>\\n</li>\"],\"names\":[],\"mappings\":\"AAWE,EAAE,eAAC,CAAC,AACF,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,UAAU,CACrB,UAAU,CAAE,SAAS,AACvB,CAAC,AACD,OAAO,eAAC,CAAC,AACP,WAAW,CAAE,IAAI,eAAe,CAAC,AACnC,CAAC,AACD,OAAO,eAAC,CAAC,AACP,KAAK,CAAE,IAAI,cAAc,CAAC,AAC5B,CAAC,AACD,KAAK,eAAC,CAAC,AACL,KAAK,CAAE,IAAI,YAAY,CAAC,AAC1B,CAAC,AACD,OAAO,eAAC,CAAC,AACP,KAAK,CAAE,IAAI,cAAc,CAAC,AAC5B,CAAC,AACD,QAAQ,eAAC,CAAC,AACR,KAAK,CAAE,IAAI,eAAe,CAAC,AAC7B,CAAC,AACD,KAAK,eAAC,CAAC,AACL,KAAK,CAAE,IAAI,YAAY,CAAC,AAC1B,CAAC,AACD,UAAU,eAAC,CAAC,AACV,KAAK,CAAE,IAAI,iBAAiB,CAAC,AAC/B,CAAC,AACD,SAAS,eAAC,CAAC,AACT,KAAK,CAAE,IAAI,gBAAgB,CAAC,CAC5B,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,OAAO,eAAC,CAAC,AACP,KAAK,CAAE,IAAI,cAAc,CAAC,AAC5B,CAAC\"}"
};

const JSONValueNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ valueGetter = null } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props,
		{ nodeType } = $$props;

	const { colon } = getContext(contextKey);
	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.valueGetter === void 0 && $$bindings.valueGetter && valueGetter !== void 0) $$bindings.valueGetter(valueGetter);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.nodeType === void 0 && $$bindings.nodeType && nodeType !== void 0) $$bindings.nodeType(nodeType);
	$$result.css.add(css$j);

	return `<li class="${["svelte-1m3zj06", isParentExpanded ? "indent" : ""].join(" ").trim()}">${validate_component(JSONKey, "JSONKey").$$render(
		$$result,
		{
			key,
			colon,
			isParentExpanded,
			isParentArray
		},
		{},
		{}
	)}
  <span class="${escape(null_to_empty(nodeType)) + " svelte-1m3zj06"}">${escape(valueGetter ? valueGetter(value) : value)}</span></li>`;
});

/* node_modules/svelte-json-tree/src/ErrorNode.svelte generated by Svelte v3.31.0 */

const css$k = {
	code: "li.svelte-zydcof{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-zydcof{margin-left:var(--li-identation)}.collapse.svelte-zydcof{--li-display:inline;display:inline;font-style:italic}",
	map: "{\"version\":3,\"file\":\"ErrorNode.svelte\",\"sources\":[\"ErrorNode.svelte\"],\"sourcesContent\":[\"<script>\\n  import { getContext, setContext } from 'svelte';\\n  import contextKey from './context';\\n  import JSONArrow from './JSONArrow.svelte';\\n  import JSONNode from './JSONNode.svelte';\\n  import JSONKey from './JSONKey.svelte';\\n\\n  export let key, value, isParentExpanded, isParentArray;\\n  export let expanded = false;\\n\\n  $: stack = value.stack.split('\\\\n');\\n\\n  const context = getContext(contextKey);\\n  setContext(contextKey, { ...context, colon: ':' })\\n\\n  $: if (!isParentExpanded) {\\n    expanded = false;\\n  }\\n\\n  function toggleExpand() {\\n    expanded = !expanded;\\n  }\\n</script>\\n<style>\\n  li {\\n    user-select: text;\\n    word-wrap: break-word;\\n    word-break: break-all;\\n  }\\n  .indent {\\n    margin-left: var(--li-identation);\\n  }\\n  .collapse {\\n    --li-display: inline;\\n    display: inline;\\n    font-style: italic;\\n  }\\n</style>\\n<li class:indent={isParentExpanded}>\\n  {#if isParentExpanded}\\n    <JSONArrow on:click={toggleExpand} {expanded} />\\n  {/if}\\n  <JSONKey {key} colon={context.colon} {isParentExpanded} {isParentArray} />\\n  <span on:click={toggleExpand}>Error: {expanded?'':value.message}</span>\\n  {#if isParentExpanded}\\n    <ul class:collapse={!expanded}>\\n      {#if expanded}\\n        <JSONNode key=\\\"message\\\" value={value.message} />\\n        <li>\\n          <JSONKey key=\\\"stack\\\" colon=\\\":\\\" {isParentExpanded} />\\n          <span>\\n            {#each stack as line, index}\\n              <span class:indent={index > 0}>{line}</span><br />\\n            {/each}\\n          </span>\\n        </li>\\n      {/if}\\n    </ul>\\n  {/if}\\n</li>\"],\"names\":[],\"mappings\":\"AAwBE,EAAE,cAAC,CAAC,AACF,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,UAAU,CACrB,UAAU,CAAE,SAAS,AACvB,CAAC,AACD,OAAO,cAAC,CAAC,AACP,WAAW,CAAE,IAAI,eAAe,CAAC,AACnC,CAAC,AACD,SAAS,cAAC,CAAC,AACT,YAAY,CAAE,MAAM,CACpB,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,MAAM,AACpB,CAAC\"}"
};

const ErrorNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props;

	let { expanded = false } = $$props;
	const context = getContext(contextKey);
	setContext(contextKey, { ...context, colon: ":" });

	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);
	if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0) $$bindings.expanded(expanded);
	$$result.css.add(css$k);
	let stack;
	stack = value.stack.split("\n");

	 {
		if (!isParentExpanded) {
			expanded = false;
		}
	}

	return `<li class="${["svelte-zydcof", isParentExpanded ? "indent" : ""].join(" ").trim()}">${isParentExpanded
	? `${validate_component(JSONArrow, "JSONArrow").$$render($$result, { expanded }, {}, {})}`
	: ``}
  ${validate_component(JSONKey, "JSONKey").$$render(
		$$result,
		{
			key,
			colon: context.colon,
			isParentExpanded,
			isParentArray
		},
		{},
		{}
	)}
  <span>Error: ${escape(expanded ? "" : value.message)}</span>
  ${isParentExpanded
	? `<ul class="${["svelte-zydcof", !expanded ? "collapse" : ""].join(" ").trim()}">${expanded
		? `${validate_component(JSONNode, "JSONNode").$$render($$result, { key: "message", value: value.message }, {}, {})}
        <li class="${"svelte-zydcof"}">${validate_component(JSONKey, "JSONKey").$$render(
				$$result,
				{
					key: "stack",
					colon: ":",
					isParentExpanded
				},
				{},
				{}
			)}
          <span>${each(stack, (line, index) => `<span class="${["svelte-zydcof", index > 0 ? "indent" : ""].join(" ").trim()}">${escape(line)}</span><br>`)}</span></li>`
		: ``}</ul>`
	: ``}</li>`;
});

/* node_modules/svelte-json-tree/src/JSONNode.svelte generated by Svelte v3.31.0 */

const JSONNode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { key } = $$props,
		{ value } = $$props,
		{ isParentExpanded } = $$props,
		{ isParentArray } = $$props;

	const nodeType = objType(value);
	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.isParentExpanded === void 0 && $$bindings.isParentExpanded && isParentExpanded !== void 0) $$bindings.isParentExpanded(isParentExpanded);
	if ($$props.isParentArray === void 0 && $$bindings.isParentArray && isParentArray !== void 0) $$bindings.isParentArray(isParentArray);

	return `${nodeType === "Object"
	? `${validate_component(JSONObjectNode, "JSONObjectNode").$$render(
			$$result,
			{
				key,
				value,
				isParentExpanded,
				isParentArray,
				nodeType
			},
			{},
			{}
		)}`
	: `${nodeType === "Error"
		? `${validate_component(ErrorNode, "ErrorNode").$$render(
				$$result,
				{
					key,
					value,
					isParentExpanded,
					isParentArray
				},
				{},
				{}
			)}`
		: `${nodeType === "Array"
			? `${validate_component(JSONArrayNode, "JSONArrayNode").$$render(
					$$result,
					{
						key,
						value,
						isParentExpanded,
						isParentArray
					},
					{},
					{}
				)}`
			: `${nodeType === "Iterable" || nodeType === "Map" || nodeType === "Set"
				? `${typeof value.set === "function"
					? `${validate_component(JSONIterableMapNode, "JSONIterableMapNode").$$render(
							$$result,
							{
								key,
								value,
								isParentExpanded,
								isParentArray,
								nodeType
							},
							{},
							{}
						)}`
					: `${validate_component(JSONIterableArrayNode, "JSONIterableArrayNode").$$render(
							$$result,
							{
								key,
								value,
								isParentExpanded,
								isParentArray,
								nodeType
							},
							{},
							{}
						)}`}`
				: `${nodeType === "MapEntry"
					? `${validate_component(JSONMapEntryNode, "JSONMapEntryNode").$$render(
							$$result,
							{
								key,
								value,
								isParentExpanded,
								isParentArray,
								nodeType
							},
							{},
							{}
						)}`
					: `${nodeType === "String"
						? `${validate_component(JSONValueNode, "JSONValueNode").$$render(
								$$result,
								{
									key,
									value,
									isParentExpanded,
									isParentArray,
									nodeType,
									valueGetter: raw => `"${raw}"`
								},
								{},
								{}
							)}`
						: `${nodeType === "Number"
							? `${validate_component(JSONValueNode, "JSONValueNode").$$render(
									$$result,
									{
										key,
										value,
										isParentExpanded,
										isParentArray,
										nodeType
									},
									{},
									{}
								)}`
							: `${nodeType === "Boolean"
								? `${validate_component(JSONValueNode, "JSONValueNode").$$render(
										$$result,
										{
											key,
											value,
											isParentExpanded,
											isParentArray,
											nodeType,
											valueGetter: raw => raw ? "true" : "false"
										},
										{},
										{}
									)}`
								: `${nodeType === "Date"
									? `${validate_component(JSONValueNode, "JSONValueNode").$$render(
											$$result,
											{
												key,
												value,
												isParentExpanded,
												isParentArray,
												nodeType,
												valueGetter: raw => raw.toISOString()
											},
											{},
											{}
										)}`
									: `${nodeType === "Null"
										? `${validate_component(JSONValueNode, "JSONValueNode").$$render(
												$$result,
												{
													key,
													value,
													isParentExpanded,
													isParentArray,
													nodeType,
													valueGetter: () => "null"
												},
												{},
												{}
											)}`
										: `${nodeType === "Undefined"
											? `${validate_component(JSONValueNode, "JSONValueNode").$$render(
													$$result,
													{
														key,
														value,
														isParentExpanded,
														isParentArray,
														nodeType,
														valueGetter: () => "undefined"
													},
													{},
													{}
												)}`
											: `${nodeType === "Function" || nodeType === "Symbol"
												? `${validate_component(JSONValueNode, "JSONValueNode").$$render(
														$$result,
														{
															key,
															value,
															isParentExpanded,
															isParentArray,
															nodeType,
															valueGetter: raw => raw.toString()
														},
														{},
														{}
													)}`
												: `${validate_component(JSONValueNode, "JSONValueNode").$$render(
														$$result,
														{
															key,
															value,
															isParentExpanded,
															isParentArray,
															nodeType,
															valueGetter: () => `<${nodeType}>`
														},
														{},
														{}
													)}`}`}`}`}`}`}`}`}`}`}`}`}`;
});

/* node_modules/svelte-json-tree/src/index.svelte generated by Svelte v3.31.0 */

const css$l = {
	code: "ul.svelte-fisoh6{--string-color:#cb3f41;--symbol-color:#cb3f41;--boolean-color:#112aa7;--function-color:#112aa7;--number-color:#3029cf;--label-color:#871d8f;--arrow-color:#727272;--null-color:#8d8d8d;--undefined-color:#8d8d8d;--date-color:#8d8d8d;--li-identation:1em;--li-colon-space:0.3em;font-size:var(--json-tree-font-size, 12px);font-family:'Courier New', Courier, monospace}ul.svelte-fisoh6 li{line-height:var(--li-line-height, 1.3);display:var(--li-display, list-item);list-style:none}ul.svelte-fisoh6,ul.svelte-fisoh6 ul{padding:0;margin:0}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script>\\n  import JSONNode from './JSONNode.svelte';\\n  import { setContext } from 'svelte';\\n  import contextKey from './context';\\n\\n  setContext(contextKey, {});\\n\\n  export let key = '', value;\\n</script>\\n<style>\\n  ul {\\n    --string-color: #cb3f41;\\n    --symbol-color: #cb3f41;\\n    --boolean-color: #112aa7;\\n    --function-color: #112aa7;\\n    --number-color: #3029cf;\\n    --label-color: #871d8f;\\n    --arrow-color: #727272;\\n    --null-color: #8d8d8d;\\n    --undefined-color: #8d8d8d;\\n    --date-color: #8d8d8d;\\n    --li-identation: 1em;\\n    --li-colon-space: 0.3em;\\n    font-size: var(--json-tree-font-size, 12px);\\n    font-family: 'Courier New', Courier, monospace;\\n  }\\n  ul :global(li) {\\n    line-height: var(--li-line-height, 1.3);\\n    display: var(--li-display, list-item);\\n    list-style: none;\\n  }\\n  ul, ul :global(ul) {\\n    padding: 0;\\n    margin: 0;\\n  }\\n</style>\\n<ul>\\n  <JSONNode {key} {value} isParentExpanded={true} isParentArray={false} />\\n</ul>\\n\"],\"names\":[],\"mappings\":\"AAUE,EAAE,cAAC,CAAC,AACF,cAAc,CAAE,OAAO,CACvB,cAAc,CAAE,OAAO,CACvB,eAAe,CAAE,OAAO,CACxB,gBAAgB,CAAE,OAAO,CACzB,cAAc,CAAE,OAAO,CACvB,aAAa,CAAE,OAAO,CACtB,aAAa,CAAE,OAAO,CACtB,YAAY,CAAE,OAAO,CACrB,iBAAiB,CAAE,OAAO,CAC1B,YAAY,CAAE,OAAO,CACrB,eAAe,CAAE,GAAG,CACpB,gBAAgB,CAAE,KAAK,CACvB,SAAS,CAAE,IAAI,qBAAqB,CAAC,KAAK,CAAC,CAC3C,WAAW,CAAE,aAAa,CAAC,CAAC,OAAO,CAAC,CAAC,SAAS,AAChD,CAAC,AACD,gBAAE,CAAC,AAAQ,EAAE,AAAE,CAAC,AACd,WAAW,CAAE,IAAI,gBAAgB,CAAC,IAAI,CAAC,CACvC,OAAO,CAAE,IAAI,YAAY,CAAC,UAAU,CAAC,CACrC,UAAU,CAAE,IAAI,AAClB,CAAC,AACD,gBAAE,CAAE,gBAAE,CAAC,AAAQ,EAAE,AAAE,CAAC,AAClB,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,AACX,CAAC\"}"
};

const Src = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	setContext(contextKey, {});
	let { key = "" } = $$props, { value } = $$props;
	if ($$props.key === void 0 && $$bindings.key && key !== void 0) $$bindings.key(key);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	$$result.css.add(css$l);

	return `<ul class="${"svelte-fisoh6"}">${validate_component(JSONNode, "JSONNode").$$render(
		$$result,
		{
			key,
			value,
			isParentExpanded: true,
			isParentArray: false
		},
		{},
		{}
	)}</ul>`;
});

/* node_modules/@sveltejs/svelte-repl/src/Output/ConsoleTable.svelte generated by Svelte v3.31.0 */

const css$m = {
	code: ".table.svelte-12l2iaz{margin:8px;overflow:auto;max-height:200px}table.svelte-12l2iaz{font-size:12px;font-family:var(--font-mono);border-collapse:collapse;line-height:1;border:1px solid #aaa}th.svelte-12l2iaz{background:#f3f3f3;padding:4px 8px;border:1px solid #aaa;position:sticky;top:0}td.svelte-12l2iaz{padding:2px 8px}tr.svelte-12l2iaz:nth-child(2n){background:#f2f7fd}th.svelte-12l2iaz,td.svelte-12l2iaz{border-right:1px solid #aaa}",
	map: "{\"version\":3,\"file\":\"ConsoleTable.svelte\",\"sources\":[\"ConsoleTable.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport JSONNode from 'svelte-json-tree';\\n\\n\\texport let data;\\n\\texport let columns;\\n\\n\\tconst INDEX_KEY = '(index)';\\n\\tconst VALUE_KEY = 'Value';\\n\\n\\t$: keys = Object.keys(data);\\n\\t$: columns_to_render = columns || get_columns_to_render(data, keys);\\n\\n\\tfunction get_columns_to_render(data, keys) {\\n\\t\\tconst columns = new Set([INDEX_KEY]);\\n\\t\\tfor (const key of keys) {\\n\\t\\t\\tconst value = data[key];\\n\\t\\t\\tif (typeof value === 'object') {\\n\\t\\t\\t\\tObject.keys(value).forEach(key => columns.add(key));\\n\\t\\t\\t} else {\\n\\t\\t\\t\\tcolumns.add(VALUE_KEY);\\n\\t\\t\\t}\\n\\t\\t}\\n\\n\\t\\treturn [...columns];\\n\\t}\\n</script>\\n\\n<div class=\\\"table\\\">\\n\\t<table>\\n\\t\\t<thead>\\n\\t\\t\\t<tr>\\n\\t\\t\\t\\t{#each columns_to_render as column}\\n\\t\\t\\t\\t\\t<th>{column}</th>\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t</tr>\\n\\t\\t</thead>\\n\\t\\t<tbody>\\n\\t\\t\\t{#each keys as key}\\n\\t\\t\\t\\t<tr>\\n\\t\\t\\t\\t\\t{#each columns_to_render as column}\\n\\t\\t\\t\\t\\t\\t{#if column === INDEX_KEY}\\n\\t\\t\\t\\t\\t\\t\\t<td>{key}</td>\\n\\t\\t\\t\\t\\t\\t{:else if column === VALUE_KEY}\\n\\t\\t\\t\\t\\t\\t\\t<td><JSONNode value={data[key]} /></td>\\n\\t\\t\\t\\t\\t\\t{:else if column in data[key]}\\n\\t\\t\\t\\t\\t\\t\\t<td><JSONNode value={data[key][column]} /></td>\\n\\t\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\t\\t<td></td>\\n\\t\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t\\t{/each}\\n\\t\\t\\t\\t</tr>\\n\\t\\t\\t{/each}\\n\\t\\t</tbody>\\n\\t</table>\\n</div>\\n\\n<style>\\n\\t.table {\\n\\t\\tmargin: 8px;\\n\\t\\toverflow: auto;\\n\\t\\tmax-height: 200px;\\n\\t}\\n\\ttable {\\n\\t\\tfont-size: 12px;\\n\\t\\tfont-family: var(--font-mono);\\n\\t\\tborder-collapse: collapse;\\n\\t\\tline-height: 1;\\n\\t\\tborder: 1px solid #aaa;\\n\\t}\\n\\tth {\\n\\t\\tbackground: #f3f3f3;\\n\\t\\tpadding: 4px 8px;\\n\\t\\tborder: 1px solid #aaa;\\n\\t\\tposition: sticky;\\n\\t\\ttop: 0;\\n\\t}\\n\\ttd {\\n\\t\\tpadding: 2px 8px;\\n\\t}\\n\\ttr:nth-child(2n) {\\n\\t\\tbackground: #f2f7fd;\\n\\t}\\n\\tth, td {\\n\\t\\tborder-right: 1px solid #aaa;\\n\\t}\\n</style>\"],\"names\":[],\"mappings\":\"AAyDC,MAAM,eAAC,CAAC,AACP,MAAM,CAAE,GAAG,CACX,QAAQ,CAAE,IAAI,CACd,UAAU,CAAE,KAAK,AAClB,CAAC,AACD,KAAK,eAAC,CAAC,AACN,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,WAAW,CAAC,CAC7B,eAAe,CAAE,QAAQ,CACzB,WAAW,CAAE,CAAC,CACd,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,AACvB,CAAC,AACD,EAAE,eAAC,CAAC,AACH,UAAU,CAAE,OAAO,CACnB,OAAO,CAAE,GAAG,CAAC,GAAG,CAChB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,CAAC,AACP,CAAC,AACD,EAAE,eAAC,CAAC,AACH,OAAO,CAAE,GAAG,CAAC,GAAG,AACjB,CAAC,AACD,iBAAE,WAAW,EAAE,CAAC,AAAC,CAAC,AACjB,UAAU,CAAE,OAAO,AACpB,CAAC,AACD,iBAAE,CAAE,EAAE,eAAC,CAAC,AACP,YAAY,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,AAC7B,CAAC\"}"
};

const INDEX_KEY = "(index)";
const VALUE_KEY = "Value";

const ConsoleTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { data } = $$props;
	let { columns } = $$props;

	function get_columns_to_render(data, keys) {
		const columns = new Set([INDEX_KEY]);

		for (const key of keys) {
			const value = data[key];

			if (typeof value === "object") {
				Object.keys(value).forEach(key => columns.add(key));
			} else {
				columns.add(VALUE_KEY);
			}
		}

		return [...columns];
	}

	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0) $$bindings.columns(columns);
	$$result.css.add(css$m);
	let keys;
	let columns_to_render;
	keys = Object.keys(data);
	columns_to_render = columns || get_columns_to_render(data, keys);

	return `<div class="${"table svelte-12l2iaz"}"><table class="${"svelte-12l2iaz"}"><thead><tr class="${"svelte-12l2iaz"}">${each(columns_to_render, column => `<th class="${"svelte-12l2iaz"}">${escape(column)}</th>`)}</tr></thead>
		<tbody>${each(keys, key => `<tr class="${"svelte-12l2iaz"}">${each(columns_to_render, column => `${column === INDEX_KEY
	? `<td class="${"svelte-12l2iaz"}">${escape(key)}</td>`
	: `${column === VALUE_KEY
		? `<td class="${"svelte-12l2iaz"}">${validate_component(Src, "JSONNode").$$render($$result, { value: data[key] }, {}, {})}</td>`
		: `${column in data[key]
			? `<td class="${"svelte-12l2iaz"}">${validate_component(Src, "JSONNode").$$render($$result, { value: data[key][column] }, {}, {})}</td>`
			: `<td class="${"svelte-12l2iaz"}"></td>`}`}`}`)}
				</tr>`)}</tbody></table>
</div>`;
});

/* node_modules/@sveltejs/svelte-repl/src/Output/ConsoleLine.svelte generated by Svelte v3.31.0 */

const css$n = {
	code: ".log.svelte-wz5xz8.svelte-wz5xz8{border-bottom:1px solid #eee;padding:5px 10px 0px;display:flex;position:relative;font-size:12px;font-family:var(--font-mono)}.log.svelte-wz5xz8>*{margin-right:10px;font-family:var(--font-mono)}.console-warn.svelte-wz5xz8.svelte-wz5xz8,.console-system-warn.svelte-wz5xz8.svelte-wz5xz8{background:#fffbe6;border-color:#fff4c4}.console-error.svelte-wz5xz8.svelte-wz5xz8,.console-assert.svelte-wz5xz8.svelte-wz5xz8{background:#fff0f0;border-color:#fed6d7}.console-group.svelte-wz5xz8.svelte-wz5xz8,.arrow.svelte-wz5xz8.svelte-wz5xz8{cursor:pointer;user-select:none}.console-trace.svelte-wz5xz8.svelte-wz5xz8,.console-assert.svelte-wz5xz8.svelte-wz5xz8{border-bottom:none}.console-assert.svelte-wz5xz8+.trace.svelte-wz5xz8{background:#fff0f0;border-color:#fed6d7}.trace.svelte-wz5xz8.svelte-wz5xz8{border-bottom:1px solid #eee;font-size:12px;font-family:var(--font-mono);padding:4px 0 2px}.trace.svelte-wz5xz8>div{margin-left:15px}.count.svelte-wz5xz8.svelte-wz5xz8{color:#999;font-size:12px;line-height:1.2}.info.svelte-wz5xz8.svelte-wz5xz8{color:#666;font-family:var(--font) !important;font-size:12px}.error.svelte-wz5xz8.svelte-wz5xz8{color:#da106e}.outline.svelte-wz5xz8.svelte-wz5xz8{border-left:1px solid #9c9cab;position:absolute;top:0;bottom:-1px}.arrow.svelte-wz5xz8.svelte-wz5xz8{position:absolute;font-size:0.6em;transition:150ms;transform-origin:50% 50%;transform:translateY(1px) translateX(-50%)}.arrow.expand.svelte-wz5xz8.svelte-wz5xz8{transform:translateY(1px) translateX(-50%) rotateZ(90deg)}.title.svelte-wz5xz8.svelte-wz5xz8{font-family:var(--font-mono);font-size:13px;font-weight:bold;padding-left:11px;height:19px}.assert.svelte-wz5xz8.svelte-wz5xz8{padding-left:11px;font-weight:bold;color:#da106e}",
	map: "{\"version\":3,\"file\":\"ConsoleLine.svelte\",\"sources\":[\"ConsoleLine.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport JSONNode from 'svelte-json-tree';\\n\\timport ConsoleTable from './ConsoleTable.svelte';\\n\\n\\texport let log;\\n\\texport let level = 1;\\n\\n\\tfunction toggleGroupCollapse() {\\n\\t\\tlog.collapsed = !log.collapsed;\\n\\t}\\n</script>\\n\\n{#if log.level === 'table'}\\n\\t<ConsoleTable data={log.args[0]} columns={log.args[1]} />\\n{/if}\\n\\n<div class=\\\"log console-{log.level}\\\" style=\\\"padding-left: {level * 15}px\\\" on:click={log.level === 'group' ? toggleGroupCollapse : undefined}>\\n\\t{#if log.count > 1}\\n\\t\\t<span class=\\\"count\\\">{log.count}x</span>\\n\\t{/if}\\n\\n\\t{#if log.level === 'trace' || log.level === 'assert'}\\n\\t\\t<div class=\\\"arrow\\\" class:expand={!log.collapsed} on:click={toggleGroupCollapse}>▶</div>\\n\\t{/if}\\n\\n\\t{#if log.level === 'assert'}\\n\\t\\t<span class=\\\"assert\\\">Assertion failed:</span>\\n\\t{/if}\\n\\n\\t{#if log.level === 'clear'}\\n\\t\\t<span class=\\\"info\\\">Console was cleared</span>\\n\\t{:else if log.level === 'unclonable'}\\n\\t\\t<span class=\\\"info error\\\">Message could not be cloned. Open devtools to see it</span>\\n\\t{:else if log.level === 'group'}\\n\\t\\t<div class=\\\"arrow\\\" class:expand={!log.collapsed}>▶</div>\\n\\t\\t<span class=\\\"title\\\">{log.label}</span>\\n\\t{:else if log.level.startsWith('system')}\\n\\t\\t{#each log.args as arg}\\n\\t\\t\\t{arg}\\n\\t\\t{/each}\\n\\t{:else if log.level === 'table'}\\n\\t\\t<JSONNode value={log.args[0]} />\\n\\t{:else}\\n\\t\\t{#each log.args as arg}\\n\\t\\t\\t<JSONNode value={arg} />\\n\\t\\t{/each}\\n\\t{/if}\\n\\t{#each new Array(level - 1) as _, idx}\\n\\t\\t<div class=\\\"outline\\\" style=\\\"left: {idx * 15 + 15}px\\\" />\\n\\t{/each}\\n</div>\\n\\n{#if log.level === 'group' && !log.collapsed}\\n\\t{#each log.logs as childLog}\\n\\t\\t<svelte:self log={childLog} level={level + 1}/>\\n\\t{/each}\\n{/if}\\n\\n{#if (log.level === 'trace' || log.level === 'assert') && !log.collapsed}\\n\\t<div class=\\\"trace\\\">\\n\\t\\t{#each log.stack.split('\\\\n').slice(2) as stack}\\n\\t\\t\\t<div>{stack.replace(/^\\\\s*at\\\\s+/, '')}</div>\\n\\t\\t{/each}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t.log {\\n\\t\\tborder-bottom: 1px solid #eee;\\n\\t\\tpadding: 5px 10px 0px;\\n\\t\\tdisplay: flex;\\n\\t\\tposition: relative;\\n\\t\\tfont-size: 12px;\\n\\t\\tfont-family: var(--font-mono);\\n\\t}\\n\\n\\t.log > :global(*) {\\n\\t\\tmargin-right: 10px;\\n\\t\\tfont-family: var(--font-mono);\\n\\t}\\n\\n\\t.console-warn, .console-system-warn {\\n\\t\\tbackground: #fffbe6;\\n\\t\\tborder-color: #fff4c4;\\n\\t}\\n\\n\\t.console-error, .console-assert {\\n\\t\\tbackground: #fff0f0;\\n\\t\\tborder-color: #fed6d7;\\n\\t}\\n\\n\\t.console-group, .arrow {\\n\\t\\tcursor: pointer;\\n\\t\\tuser-select: none;\\n\\t}\\n\\n\\t.console-trace, .console-assert {\\n\\t\\tborder-bottom: none;\\n\\t}\\n\\n\\t.console-assert + .trace {\\n\\t\\tbackground: #fff0f0;\\n\\t\\tborder-color: #fed6d7;\\n\\t}\\n\\n\\t.trace {\\n\\t\\tborder-bottom: 1px solid #eee;\\n\\t\\tfont-size: 12px;\\n\\t\\tfont-family: var(--font-mono);\\n\\t\\tpadding: 4px 0 2px;\\n\\t}\\n\\n\\t.trace > :global(div) {\\n\\t\\tmargin-left: 15px;\\n\\t}\\n\\n\\t.count {\\n\\t\\tcolor: #999;\\n\\t\\tfont-size: 12px;\\n\\t\\tline-height: 1.2;\\n\\t}\\n\\n\\t.info {\\n\\t\\tcolor: #666;\\n\\t\\tfont-family: var(--font) !important;\\n\\t\\tfont-size: 12px;\\n\\t}\\n\\n\\t.error {\\n\\t\\tcolor: #da106e; /* todo make this a var */\\n\\t}\\n\\n\\t.outline {\\n\\t\\tborder-left: 1px solid #9c9cab;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tbottom: -1px;\\n\\t}\\n\\n\\t.arrow {\\n\\t\\tposition: absolute;\\n\\t\\tfont-size: 0.6em;\\n\\t\\ttransition: 150ms;\\n\\t\\ttransform-origin: 50% 50%;\\n\\t\\ttransform: translateY(1px) translateX(-50%);\\n\\t}\\n\\n\\t.arrow.expand {\\n\\t\\ttransform: translateY(1px) translateX(-50%) rotateZ(90deg);\\n\\t}\\n\\n\\t.title {\\n\\t\\tfont-family: var(--font-mono);\\n\\t\\tfont-size: 13px;\\n\\t\\tfont-weight: bold;\\n\\t\\tpadding-left: 11px;\\n\\t\\theight: 19px;\\n\\t}\\n\\n\\t.assert {\\n\\t\\tpadding-left: 11px;\\n\\t\\tfont-weight: bold;\\n\\t\\tcolor: #da106e;\\n\\t}\\n</style>\"],\"names\":[],\"mappings\":\"AAmEC,IAAI,4BAAC,CAAC,AACL,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC7B,OAAO,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CACrB,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,WAAW,CAAC,AAC9B,CAAC,AAED,kBAAI,CAAW,CAAC,AAAE,CAAC,AAClB,YAAY,CAAE,IAAI,CAClB,WAAW,CAAE,IAAI,WAAW,CAAC,AAC9B,CAAC,AAED,yCAAa,CAAE,oBAAoB,4BAAC,CAAC,AACpC,UAAU,CAAE,OAAO,CACnB,YAAY,CAAE,OAAO,AACtB,CAAC,AAED,0CAAc,CAAE,eAAe,4BAAC,CAAC,AAChC,UAAU,CAAE,OAAO,CACnB,YAAY,CAAE,OAAO,AACtB,CAAC,AAED,0CAAc,CAAE,MAAM,4BAAC,CAAC,AACvB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,IAAI,AAClB,CAAC,AAED,0CAAc,CAAE,eAAe,4BAAC,CAAC,AAChC,aAAa,CAAE,IAAI,AACpB,CAAC,AAED,6BAAe,CAAG,MAAM,cAAC,CAAC,AACzB,UAAU,CAAE,OAAO,CACnB,YAAY,CAAE,OAAO,AACtB,CAAC,AAED,MAAM,4BAAC,CAAC,AACP,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC7B,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,WAAW,CAAC,CAC7B,OAAO,CAAE,GAAG,CAAC,CAAC,CAAC,GAAG,AACnB,CAAC,AAED,oBAAM,CAAW,GAAG,AAAE,CAAC,AACtB,WAAW,CAAE,IAAI,AAClB,CAAC,AAED,MAAM,4BAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,KAAK,4BAAC,CAAC,AACN,KAAK,CAAE,IAAI,CACX,WAAW,CAAE,IAAI,MAAM,CAAC,CAAC,UAAU,CACnC,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,MAAM,4BAAC,CAAC,AACP,KAAK,CAAE,OAAO,AACf,CAAC,AAED,QAAQ,4BAAC,CAAC,AACT,WAAW,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CAC9B,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,IAAI,AACb,CAAC,AAED,MAAM,4BAAC,CAAC,AACP,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,gBAAgB,CAAE,GAAG,CAAC,GAAG,CACzB,SAAS,CAAE,WAAW,GAAG,CAAC,CAAC,WAAW,IAAI,CAAC,AAC5C,CAAC,AAED,MAAM,OAAO,4BAAC,CAAC,AACd,SAAS,CAAE,WAAW,GAAG,CAAC,CAAC,WAAW,IAAI,CAAC,CAAC,QAAQ,KAAK,CAAC,AAC3D,CAAC,AAED,MAAM,4BAAC,CAAC,AACP,WAAW,CAAE,IAAI,WAAW,CAAC,CAC7B,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,CACjB,YAAY,CAAE,IAAI,CAClB,MAAM,CAAE,IAAI,AACb,CAAC,AAED,OAAO,4BAAC,CAAC,AACR,YAAY,CAAE,IAAI,CAClB,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,OAAO,AACf,CAAC\"}"
};

const ConsoleLine = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { log } = $$props;
	let { level = 1 } = $$props;

	if ($$props.log === void 0 && $$bindings.log && log !== void 0) $$bindings.log(log);
	if ($$props.level === void 0 && $$bindings.level && level !== void 0) $$bindings.level(level);
	$$result.css.add(css$n);

	return `${log.level === "table"
	? `${validate_component(ConsoleTable, "ConsoleTable").$$render($$result, { data: log.args[0], columns: log.args[1] }, {}, {})}`
	: ``}

<div class="${"log console-" + escape(log.level) + " svelte-wz5xz8"}" style="${"padding-left: " + escape(level * 15) + "px"}">${log.count > 1
	? `<span class="${"count svelte-wz5xz8"}">${escape(log.count)}x</span>`
	: ``}

	${log.level === "trace" || log.level === "assert"
	? `<div class="${["arrow svelte-wz5xz8", !log.collapsed ? "expand" : ""].join(" ").trim()}">▶</div>`
	: ``}

	${log.level === "assert"
	? `<span class="${"assert svelte-wz5xz8"}">Assertion failed:</span>`
	: ``}

	${log.level === "clear"
	? `<span class="${"info svelte-wz5xz8"}">Console was cleared</span>`
	: `${log.level === "unclonable"
		? `<span class="${"info error svelte-wz5xz8"}">Message could not be cloned. Open devtools to see it</span>`
		: `${log.level === "group"
			? `<div class="${["arrow svelte-wz5xz8", !log.collapsed ? "expand" : ""].join(" ").trim()}">▶</div>
		<span class="${"title svelte-wz5xz8"}">${escape(log.label)}</span>`
			: `${log.level.startsWith("system")
				? `${each(log.args, arg => `${escape(arg)}`)}`
				: `${log.level === "table"
					? `${validate_component(Src, "JSONNode").$$render($$result, { value: log.args[0] }, {}, {})}`
					: `${each(log.args, arg => `${validate_component(Src, "JSONNode").$$render($$result, { value: arg }, {}, {})}`)}`}`}`}`}`}
	${each(new Array(level - 1), (_, idx) => `<div class="${"outline svelte-wz5xz8"}" style="${"left: " + escape(idx * 15 + 15) + "px"}"></div>`)}</div>

${log.level === "group" && !log.collapsed
	? `${each(log.logs, childLog => `${validate_component(ConsoleLine, "svelte:self").$$render($$result, { log: childLog, level: level + 1 }, {}, {})}`)}`
	: ``}

${(log.level === "trace" || log.level === "assert") && !log.collapsed
	? `<div class="${"trace svelte-wz5xz8"}">${each(log.stack.split("\n").slice(2), stack => `<div>${escape(stack.replace(/^\s*at\s+/, ""))}</div>`)}</div>`
	: ``}`;
});

/* node_modules/@sveltejs/svelte-repl/src/Output/Console.svelte generated by Svelte v3.31.0 */

const Console = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { logs } = $$props;
	if ($$props.logs === void 0 && $$bindings.logs && logs !== void 0) $$bindings.logs(logs);
	return `<div class="${"container"}">${each(logs, log => `${validate_component(ConsoleLine, "ConsoleLine").$$render($$result, { log }, {}, {})}`)}</div>`;
});

var srcdoc = "<!doctype html>\n<html>\n\t<head>\n\t\t<style>\n\t\t\thtml, body {\n\tposition: relative;\n\twidth: 100%;\n\theight: 100%;\n}\n\nbody {\n\tcolor: #333;\n\tmargin: 0;\n\tpadding: 8px;\n\tbox-sizing: border-box;\n\tfont-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen-Sans, Ubuntu, Cantarell, \"Helvetica Neue\", sans-serif;\n}\n\na {\n\tcolor: rgb(0,100,200);\n\ttext-decoration: none;\n}\n\na:hover {\n\ttext-decoration: underline;\n}\n\na:visited {\n\tcolor: rgb(0,80,160);\n}\n\nlabel {\n\tdisplay: block;\n}\n\ninput, button, select, textarea {\n\tfont-family: inherit;\n\tfont-size: inherit;\n\t-webkit-padding: 0.4em 0;\n\tpadding: 0.4em;\n\tmargin: 0 0 0.5em 0;\n\tbox-sizing: border-box;\n\tborder: 1px solid #ccc;\n\tborder-radius: 2px;\n}\n\ninput:disabled {\n\tcolor: #ccc;\n}\n\nbutton {\n\tcolor: #333;\n\tbackground-color: #f4f4f4;\n\toutline: none;\n}\n\nbutton:disabled {\n\tcolor: #999;\n}\n\nbutton:not(:disabled):active {\n\tbackground-color: #ddd;\n}\n\nbutton:focus {\n\tborder-color: #666;\n}\n\n\t\t</style>\n\n\t\t<script>\n\t\t\t(function(){\n\t\t\t\tfunction handle_message(ev) {\n\t\t\t\t\tlet { action, cmd_id } = ev.data;\n\t\t\t\t\tconst send_message = (payload) => parent.postMessage( { ...payload }, ev.origin);\n\t\t\t\t\tconst send_reply = (payload) => send_message({ ...payload, cmd_id });\n\t\t\t\t\tconst send_ok = () => send_reply({ action: 'cmd_ok' });\n\t\t\t\t\tconst send_error = (message, stack) => send_reply({ action: 'cmd_error', message, stack });\n\n\t\t\t\t\tif (action === 'eval') {\n\t\t\t\t\t\ttry {\n\t\t\t\t\t\t\tconst { script } = ev.data.args;\n\t\t\t\t\t\t\teval(script);\n\t\t\t\t\t\t\tsend_ok();\n\t\t\t\t\t\t} catch (e) {\n\t\t\t\t\t\t\tsend_error(e.message, e.stack);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\n\t\t\t\t\tif (action === 'catch_clicks') {\n\t\t\t\t\t\ttry {\n\t\t\t\t\t\t\tconst top_origin = ev.origin;\n\t\t\t\t\t\t\tdocument.body.addEventListener('click', event => {\n\t\t\t\t\t\t\t\tif (event.which !== 1) return;\n\t\t\t\t\t\t\t\tif (event.metaKey || event.ctrlKey || event.shiftKey) return;\n\t\t\t\t\t\t\t\tif (event.defaultPrevented) return;\n\n\t\t\t\t\t\t\t\t// ensure target is a link\n\t\t\t\t\t\t\t\tlet el = event.target;\n\t\t\t\t\t\t\t\twhile (el && el.nodeName !== 'A') el = el.parentNode;\n\t\t\t\t\t\t\t\tif (!el || el.nodeName !== 'A') return;\n\n\t\t\t\t\t\t\t\tif (el.hasAttribute('download') || el.getAttribute('rel') === 'external' || el.target) return;\n\n\t\t\t\t\t\t\t\tevent.preventDefault();\n\n\t\t\t\t\t\t\t\tif (el.href.startsWith(top_origin)) {\n\t\t\t\t\t\t\t\t\tconst url = new URL(el.href);\n\t\t\t\t\t\t\t\t\tif (url.hash[0] === '#') {\n\t\t\t\t\t\t\t\t\t\twindow.location.hash = url.hash;\n\t\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\t\twindow.open(el.href, '_blank');\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\tsend_ok();\n\t\t\t\t\t\t} catch(e) {\n\t\t\t\t\t\t\tsend_error(e.message, e.stack);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\twindow.addEventListener('message', handle_message, false);\n\n\t\t\t\twindow.onerror = function (msg, url, lineNo, columnNo, error) {\n\t\t\t\t\tparent.postMessage({ action: 'error', value: error }, '*');\n\t\t\t\t}\n\n\t\t\t\twindow.addEventListener(\"unhandledrejection\", event => {\n\t\t\t\t\tparent.postMessage({ action: 'unhandledrejection', value: event.reason }, '*');\n\t\t\t\t});\n\t\t\t}).call(this);\n\n\t\t\tlet previous = { level: null, args: null };\n\n\t\t\t['clear', 'log', 'info', 'dir', 'warn', 'error', 'table'].forEach((level) => {\n\t\t\t\tconst original = console[level];\n\t\t\t\tconsole[level] = (...args) => {\n\t\t\t\t\tconst stringifiedArgs = stringify(args);\n\t\t\t\t\tif (\n\t\t\t\t\t\tprevious.level === level &&\n\t\t\t\t\t\tprevious.args &&\n\t\t\t\t\t\tprevious.args === stringifiedArgs\n\t\t\t\t\t) {\n\t\t\t\t\t\tparent.postMessage({ action: 'console', level, duplicate: true }, '*');\n\t\t\t\t\t} else {\n\t\t\t\t\t\tprevious = { level, args: stringifiedArgs };\n\n\t\t\t\t\t\ttry {\n\t\t\t\t\t\t\tparent.postMessage({ action: 'console', level, args }, '*');\n\t\t\t\t\t\t} catch (err) {\n\t\t\t\t\t\t\tparent.postMessage({ action: 'console', level: 'unclonable' }, '*');\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\n\t\t\t\t\toriginal(...args);\n\t\t\t\t}\n\t\t\t});\n\n\t\t\t[\n\t\t\t\t{ method: 'group', action: 'console_group' },\n\t\t\t\t{ method: 'groupEnd', action: 'console_group_end' },\n\t\t\t\t{ method: 'groupCollapsed', action: 'console_group_collapsed' },\n\t\t\t].forEach((group_action) => {\n\t\t\t\tconst original = console[group_action.method];\n\t\t\t\tconsole[group_action.method] = (label) => {\n\t\t\t\t\tparent.postMessage({ action: group_action.action, label }, '*');\n\n\t\t\t\t\toriginal(label);\n\t\t\t\t};\n\t\t\t});\n\n\t\t\tconst timers = new Map();\n\t\t\tconst original_time = console.time;\n\t\t\tconst original_timelog = console.timeLog;\n\t\t\tconst original_timeend = console.timeEnd;\n\n\t\t\tconsole.time = (label = 'default') => {\n\t\t\t\toriginal_time(label);\n\t\t\t\ttimers.set(label, performance.now());\n\t\t\t}\n\t\t\tconsole.timeLog = (label = 'default') => {\n\t\t\t\toriginal_timelog(label);\n\t\t\t\tconst now = performance.now();\n\t\t\t\tif (timers.has(label)) {\n\t\t\t\t\tparent.postMessage({ action: 'console', level: 'system-log', args: [`${label}: ${now - timers.get(label)}ms`] }, '*');\n\t\t\t\t} else {\n\t\t\t\t\tparent.postMessage({ action: 'console', level: 'system-warn', args: [`Timer '${label}' does not exist`] }, '*');\n\t\t\t\t}\n\t\t\t}\n\t\t\tconsole.timeEnd = (label = 'default') => {\n\t\t\t\toriginal_timeend(label);\n\t\t\t\tconst now = performance.now();\n\t\t\t\tif (timers.has(label)) {\n\t\t\t\t\tparent.postMessage({ action: 'console', level: 'system-log', args: [`${label}: ${now - timers.get(label)}ms`] }, '*');\n\t\t\t\t} else {\n\t\t\t\t\tparent.postMessage({ action: 'console', level: 'system-warn', args: [`Timer '${label}' does not exist`] }, '*');\n\t\t\t\t}\n\t\t\t\ttimers.delete(label);\n\t\t\t};\n\n\t\t\tconst original_assert = console.assert;\n\t\t\tconsole.assert = (condition, ...args) => {\n\t\t\t\tif (condition) {\n\t\t\t\t\tconst stack = new Error().stack;\n\t\t\t\t\tparent.postMessage({ action: 'console', level: 'assert', args, stack }, '*');\n\t\t\t\t}\n\t\t\t\toriginal_assert(condition, ...args);\n\t\t\t};\n\n\t\t\tconst counter = new Map();\n\t\t\tconst original_count = console.count;\n\t\t\tconst original_countreset = console.countReset;\n\n\t\t\tconsole.count = (label = 'default') => {\n\t\t\t\tcounter.set(label, (counter.get(label) || 0) + 1);\n\t\t\t\tparent.postMessage({ action: 'console', level: 'system-log', args: `${label}: ${counter.get(label)}` }, '*');\n\t\t\t\toriginal_count(label);\n\t\t\t};\n\n\t\t\tconsole.countReset = (label = 'default') => {\n\t\t\t\tif (counter.has(label)) {\n\t\t\t\t\tcounter.set(label, 0);\n\t\t\t\t} else {\n\t\t\t\t\tparent.postMessage({ action: 'console', level: 'system-warn', args: `Count for '${label}' does not exist` }, '*');\n\t\t\t\t}\n\t\t\t\toriginal_countreset(label);\n\t\t\t};\n\n\t\t\tconst original_trace = console.trace;\n\n\t\t\tconsole.trace = (...args) => {\n\t\t\t\tconst stack = new Error().stack;\n\t\t\t\tparent.postMessage({ action: 'console', level: 'trace', args, stack }, '*');\n\t\t\t\toriginal_trace(...args);\n\t\t\t};\n\n\t\t\tfunction stringify(args) {\n\t\t\t\ttry {\n\t\t\t\t\treturn JSON.stringify(args);\n\t\t\t\t} catch (error) {\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t}\n\t\t</script>\n\t</head>\n\t<body></body>\n</html>";

/* node_modules/@sveltejs/svelte-repl/src/Output/Viewer.svelte generated by Svelte v3.31.0 */

const css$o = {
	code: ".iframe-container.svelte-ivx2cg{position:absolute;background-color:white;border:none;width:100%;height:100%}iframe.svelte-ivx2cg{width:100%;height:100%;border:none;display:block}.greyed-out.svelte-ivx2cg{filter:grayscale(50%) blur(1px);opacity:.25}button.svelte-ivx2cg{color:#999;font-size:12px;text-transform:uppercase;display:block}button.svelte-ivx2cg:hover{color:#333}.overlay.svelte-ivx2cg{position:absolute;bottom:0;width:100%}",
	map: "{\"version\":3,\"file\":\"Viewer.svelte\",\"sources\":[\"Viewer.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { onMount, getContext } from 'svelte';\\n\\timport getLocationFromStack from './getLocationFromStack.js';\\n\\timport SplitPane from '../SplitPane.svelte';\\n\\timport PaneWithPanel from './PaneWithPanel.svelte';\\n\\timport ReplProxy from './ReplProxy.js';\\n\\timport Console from './Console.svelte';\\n\\timport Message from '../Message.svelte';\\n\\timport srcdoc from './srcdoc/index.js';\\n\\n\\tconst { bundle } = getContext('REPL');\\n\\n\\texport let error; // TODO should this be exposed as a prop?\\n\\tlet logs = [];\\n\\tlet log_group_stack = [];\\n\\tlet current_log_group = logs;\\n\\n\\texport function setProp(prop, value) {\\n\\t\\tif (!proxy) return;\\n\\t\\tproxy.setProp(prop, value);\\n\\t}\\n\\n\\texport let status;\\n\\texport let relaxed = false;\\n\\texport let injectedJS = '';\\n\\texport let injectedCSS = '';\\n\\n\\tlet iframe;\\n\\tlet pending_imports = 0;\\n\\tlet pending = false;\\n\\n\\tlet proxy = null;\\n\\n\\tlet ready = false;\\n\\tlet inited = false;\\n\\n\\tlet log_height = 90;\\n\\tlet prev_height;\\n\\n\\tlet last_console_event;\\n\\n\\tonMount(() => {\\n\\t\\tproxy = new ReplProxy(iframe, {\\n\\t\\t\\ton_fetch_progress: progress => {\\n\\t\\t\\t\\tpending_imports = progress;\\n\\t\\t\\t},\\n\\t\\t\\ton_error: event => {\\n\\t\\t\\t\\tpush_logs({ level: 'error', args: [event.value]});\\n\\t\\t\\t},\\n\\t\\t\\ton_unhandled_rejection: event => {\\n\\t\\t\\t\\tlet error = event.value;\\n\\t\\t\\t\\tif (typeof error === 'string') error = { message: error };\\n\\t\\t\\t\\terror.message = 'Uncaught (in promise): ' + error.message;\\n\\t\\t\\t\\tpush_logs({ level: 'error', args: [error]});\\n\\t\\t\\t},\\n\\t\\t\\ton_console: log => {\\n\\t\\t\\t\\tif (log.level === 'clear') {\\n\\t\\t\\t\\t\\tclear_logs();\\n\\t\\t\\t\\t\\tpush_logs(log);\\n\\t\\t\\t\\t} else if (log.duplicate) {\\n\\t\\t\\t\\t\\tincrement_duplicate_log();\\n\\t\\t\\t\\t} else {\\n\\t\\t\\t\\t\\tpush_logs(log);\\n\\t\\t\\t\\t}\\n\\t\\t\\t},\\n\\t\\t\\ton_console_group: action => {\\n\\t\\t\\t\\tgroup_logs(action.label, false);\\n\\t\\t\\t},\\n\\t\\t\\ton_console_group_end: () => {\\n\\t\\t\\t\\tungroup_logs();\\n\\t\\t\\t},\\n\\t\\t\\ton_console_group_collapsed: action => {\\n\\t\\t\\t\\tgroup_logs(action.label, true);\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tiframe.addEventListener('load', () => {\\n\\t\\t\\tproxy.handle_links();\\n\\t\\t\\tready = true;\\n\\t\\t});\\n\\n\\n\\t\\treturn () => {\\n\\t\\t\\tproxy.destroy();\\n\\t\\t}\\n\\t});\\n\\n\\tasync function apply_bundle($bundle) {\\n\\t\\tif (!$bundle || $bundle.error) return;\\n\\n\\t\\ttry {\\n\\t\\t\\tclear_logs();\\n\\n\\t\\t\\tawait proxy.eval(`\\n\\t\\t\\t\\t${injectedJS}\\n\\n\\t\\t\\t\\t${styles}\\n\\n\\t\\t\\t\\tconst styles = document.querySelectorAll('style[id^=svelte-]');\\n\\n\\t\\t\\t\\t${$bundle.dom.code}\\n\\n\\t\\t\\t\\tlet i = styles.length;\\n\\t\\t\\t\\twhile (i--) styles[i].parentNode.removeChild(styles[i]);\\n\\n\\t\\t\\t\\tif (window.component) {\\n\\t\\t\\t\\t\\ttry {\\n\\t\\t\\t\\t\\t\\twindow.component.$destroy();\\n\\t\\t\\t\\t\\t} catch (err) {\\n\\t\\t\\t\\t\\t\\tconsole.error(err);\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t}\\n\\n\\t\\t\\t\\tdocument.body.innerHTML = '';\\n\\t\\t\\t\\twindow.location.hash = '';\\n\\t\\t\\t\\twindow._svelteTransitionManager = null;\\n\\n\\t\\t\\t\\twindow.component = new SvelteComponent.default({\\n\\t\\t\\t\\t\\ttarget: document.body\\n\\t\\t\\t\\t});\\n\\t\\t\\t`);\\n\\n\\t\\t\\terror = null;\\n\\t\\t} catch (e) {\\n\\t\\t\\tshow_error(e);\\n\\t\\t}\\n\\n\\t\\tinited = true;\\n\\t}\\n\\n\\t$: if (ready) apply_bundle($bundle);\\n\\n\\t$: styles = injectedCSS && `{\\n\\t\\tconst style = document.createElement('style');\\n\\t\\tstyle.textContent = ${JSON.stringify(injectedCSS)};\\n\\t\\tdocument.head.appendChild(style);\\n\\t}`;\\n\\n\\tfunction show_error(e) {\\n\\t\\tconst loc = getLocationFromStack(e.stack, $bundle.dom.map);\\n\\t\\tif (loc) {\\n\\t\\t\\te.filename = loc.source;\\n\\t\\t\\te.loc = { line: loc.line, column: loc.column };\\n\\t\\t}\\n\\n\\t\\terror = e;\\n\\t}\\n\\n\\tfunction push_logs(log) {\\n\\t\\tcurrent_log_group.push(last_console_event = log);\\n\\t\\tlogs = logs;\\n\\t}\\n\\n\\tfunction group_logs(label, collapsed) {\\n\\t\\tconst group_log = { level: 'group', label, collapsed, logs: [] };\\n\\t\\tcurrent_log_group.push(group_log);\\n\\t\\tlog_group_stack.push(current_log_group);\\n\\t\\tcurrent_log_group = group_log.logs;\\n\\t\\tlogs = logs;\\n\\t}\\n\\n\\tfunction ungroup_logs() {\\n\\t\\tcurrent_log_group = log_group_stack.pop();\\n\\t}\\n\\n\\tfunction increment_duplicate_log() {\\n\\t\\tconst last_log = current_log_group[current_log_group.length - 1];\\n\\n\\t\\tif (last_log) {\\n\\t\\t\\tlast_log.count = (last_log.count || 1) + 1;\\n\\t\\t\\tlogs = logs;\\n\\t\\t} else {\\n\\t\\t\\tlast_console_event.count = 1;\\n\\t\\t\\tpush_logs(last_console_event);\\n\\t\\t}\\n\\t}\\n\\n\\tfunction on_toggle_console() {\\n\\t\\tif (log_height < 90) {\\n\\t\\t\\tprev_height = log_height;\\n\\t\\t\\tlog_height = 90;\\n\\t\\t} else {\\n\\t\\t\\tlog_height = prev_height || 45;\\n\\t\\t}\\n\\t}\\n\\n\\tfunction clear_logs() {\\n\\t\\tcurrent_log_group = logs = [];\\n\\t}\\n</script>\\n\\n<style>\\n\\t.iframe-container {\\n\\t\\tposition: absolute;\\n\\t\\tbackground-color: white;\\n\\t\\tborder: none;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\tiframe {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\t/* height: calc(100vh - var(--nav-h)); */\\n\\t\\tborder: none;\\n\\t\\tdisplay: block;\\n\\t}\\n\\n\\t.greyed-out {\\n\\t\\tfilter: grayscale(50%) blur(1px);\\n\\t\\topacity: .25;\\n\\t}\\n\\n\\tbutton {\\n\\t\\tcolor: #999;\\n\\t\\tfont-size: 12px;\\n\\t\\ttext-transform: uppercase;\\n\\t\\tdisplay: block;\\n\\t}\\n\\n\\tbutton:hover {\\n\\t\\tcolor: #333;\\n\\t}\\n\\n\\t.overlay {\\n\\t\\tposition: absolute;\\n\\t\\tbottom: 0;\\n\\t\\twidth: 100%;\\n\\t}\\n</style>\\n\\n<div class=\\\"iframe-container\\\">\\n\\t<PaneWithPanel pos={100} panel=\\\"Console\\\">\\n\\t\\t<div slot=\\\"main\\\">\\n\\t\\t\\t<iframe\\n\\t\\t\\t\\ttitle=\\\"Result\\\"\\n\\t\\t\\t\\tclass:inited\\n\\t\\t\\t\\tbind:this={iframe}\\n\\t\\t\\t\\tsandbox=\\\"allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals {relaxed ? 'allow-same-origin' : ''}\\\"\\n\\t\\t\\t\\tclass=\\\"{error || pending || pending_imports ? 'greyed-out' : ''}\\\"\\n\\t\\t\\t\\t{srcdoc}\\n\\t\\t\\t></iframe>\\n\\t\\t</div>\\n\\n\\t\\t<div slot=\\\"panel-header\\\">\\n\\t\\t\\t<button on:click|stopPropagation={clear_logs}>\\n\\t\\t\\t\\t{#if (logs.length > 0)}({logs.length}){/if}\\n\\t\\t\\t\\tClear\\n\\t\\t\\t</button>\\n\\t\\t</div>\\n\\n\\t\\t<section slot=\\\"panel-body\\\">\\n\\t\\t\\t<Console {logs} on:clear={clear_logs}/>\\n\\t\\t</section>\\n\\t</PaneWithPanel>\\n\\n\\t<div class=\\\"overlay\\\">\\n\\t\\t{#if error}\\n\\t\\t\\t<Message kind=\\\"error\\\" details={error}/>\\n\\t\\t{:else if status || !$bundle}\\n\\t\\t\\t<Message kind=\\\"info\\\" truncate>{status || 'loading Svelte compiler...'}</Message>\\n\\t\\t{/if}\\n\\t</div>\\n</div>\"],\"names\":[],\"mappings\":\"AAgMC,iBAAiB,cAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC,AAED,MAAM,cAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CAEZ,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,KAAK,AACf,CAAC,AAED,WAAW,cAAC,CAAC,AACZ,MAAM,CAAE,UAAU,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAChC,OAAO,CAAE,GAAG,AACb,CAAC,AAED,MAAM,cAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,cAAc,CAAE,SAAS,CACzB,OAAO,CAAE,KAAK,AACf,CAAC,AAED,oBAAM,MAAM,AAAC,CAAC,AACb,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,QAAQ,cAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,AACZ,CAAC\"}"
};

const Viewer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $bundle;
	const { bundle } = getContext("REPL");
	validate_store(bundle, "bundle");
	$bundle = get_store_value(bundle);
	let { error } = $$props; // TODO should this be exposed as a prop?
	let logs = [];
	let log_group_stack = [];
	let current_log_group = logs;

	function setProp(prop, value) {
		if (!proxy) return;
		proxy.setProp(prop, value);
	}

	let { status } = $$props;
	let { relaxed = false } = $$props;
	let { injectedJS = "" } = $$props;
	let { injectedCSS = "" } = $$props;
	let iframe;
	let pending_imports = 0;
	let pending = false;
	let proxy = null;
	let ready = false;
	let inited = false;
	let last_console_event;

	onMount(() => {
		proxy = new ReplProxy(iframe,
		{
				on_fetch_progress: progress => {
					pending_imports = progress;
				},
				on_error: event => {
					push_logs({ level: "error", args: [event.value] });
				},
				on_unhandled_rejection: event => {
					let error = event.value;
					if (typeof error === "string") error = { message: error };
					error.message = "Uncaught (in promise): " + error.message;
					push_logs({ level: "error", args: [error] });
				},
				on_console: log => {
					if (log.level === "clear") {
						clear_logs();
						push_logs(log);
					} else if (log.duplicate) {
						increment_duplicate_log();
					} else {
						push_logs(log);
					}
				},
				on_console_group: action => {
					group_logs(action.label, false);
				},
				on_console_group_end: () => {
					ungroup_logs();
				},
				on_console_group_collapsed: action => {
					group_logs(action.label, true);
				}
			});

		iframe.addEventListener("load", () => {
			proxy.handle_links();
			ready = true;
		});

		return () => {
			proxy.destroy();
		};
	});

	async function apply_bundle($bundle) {
		if (!$bundle || $bundle.error) return;

		try {
			clear_logs();

			await proxy.eval(`
				${injectedJS}

				${styles}

				const styles = document.querySelectorAll('style[id^=svelte-]');

				${$bundle.dom.code}

				let i = styles.length;
				while (i--) styles[i].parentNode.removeChild(styles[i]);

				if (window.component) {
					try {
						window.component.$destroy();
					} catch (err) {
						console.error(err);
					}
				}

				document.body.innerHTML = '';
				window.location.hash = '';
				window._svelteTransitionManager = null;

				window.component = new SvelteComponent.default({
					target: document.body
				});
			`);

			error = null;
		} catch(e) {
			show_error(e);
		}

		inited = true;
	}

	function show_error(e) {
		const loc = getLocationFromStack(e.stack, $bundle.dom.map);

		if (loc) {
			e.filename = loc.source;
			e.loc = { line: loc.line, column: loc.column };
		}

		error = e;
	}

	function push_logs(log) {
		current_log_group.push(last_console_event = log);
		logs = logs;
	}

	function group_logs(label, collapsed) {
		const group_log = {
			level: "group",
			label,
			collapsed,
			logs: []
		};

		current_log_group.push(group_log);
		log_group_stack.push(current_log_group);
		current_log_group = group_log.logs;
		logs = logs;
	}

	function ungroup_logs() {
		current_log_group = log_group_stack.pop();
	}

	function increment_duplicate_log() {
		const last_log = current_log_group[current_log_group.length - 1];

		if (last_log) {
			last_log.count = (last_log.count || 1) + 1;
			logs = logs;
		} else {
			last_console_event.count = 1;
			push_logs(last_console_event);
		}
	}

	function clear_logs() {
		current_log_group = logs = [];
	}

	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.setProp === void 0 && $$bindings.setProp && setProp !== void 0) $$bindings.setProp(setProp);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.relaxed === void 0 && $$bindings.relaxed && relaxed !== void 0) $$bindings.relaxed(relaxed);
	if ($$props.injectedJS === void 0 && $$bindings.injectedJS && injectedJS !== void 0) $$bindings.injectedJS(injectedJS);
	if ($$props.injectedCSS === void 0 && $$bindings.injectedCSS && injectedCSS !== void 0) $$bindings.injectedCSS(injectedCSS);
	$$result.css.add(css$o);
	validate_store(bundle, "bundle");
	$bundle = get_store_value(bundle);
	let styles;

	 {
		if (ready) apply_bundle($bundle);
	}

	styles = injectedCSS && `{
		const style = document.createElement('style');
		style.textContent = ${JSON.stringify(injectedCSS)};
		document.head.appendChild(style);
	}`;

	return `<div class="${"iframe-container svelte-ivx2cg"}">${validate_component(PaneWithPanel, "PaneWithPanel").$$render($$result, { pos: 100, panel: "Console" }, {}, {
		main: () => `<div slot="${"main"}"><iframe title="${"Result"}" sandbox="${"allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals " + escape(relaxed ? "allow-same-origin" : "")}" class="${[
			escape(null_to_empty(error || pending || pending_imports ? "greyed-out" : "")) + " svelte-ivx2cg",
			inited ? "inited" : ""
		].join(" ").trim()}"${add_attribute("srcdoc", srcdoc, 0)}${add_attribute("this", iframe, 1)}></iframe></div>`,
		"panel-header": () => `<div slot="${"panel-header"}"><button class="${"svelte-ivx2cg"}">${logs.length > 0 ? `(${escape(logs.length)})` : ``}
				Clear
			</button></div>`,
		"panel-body": () => `<section slot="${"panel-body"}">${validate_component(Console, "Console").$$render($$result, { logs }, {}, {})}</section>`,
		default: () => `

		

		`
	})}

	<div class="${"overlay svelte-ivx2cg"}">${error
	? `${validate_component(Message, "Message").$$render($$result, { kind: "error", details: error }, {}, {})}`
	: `${status || !$bundle
		? `${validate_component(Message, "Message").$$render($$result, { kind: "info", truncate: true }, {}, {
				default: () => `${escape(status || "loading Svelte compiler...")}`
			})}`
		: ``}`}</div></div>`;
});

/* node_modules/@sveltejs/svelte-repl/src/Output/CompilerOptions.svelte generated by Svelte v3.31.0 */

const css$p = {
	code: ".options.svelte-159cly1.svelte-159cly1{padding:0 10px;font-family:var(--font-mono);font-size:13px;color:#999;line-height:1.8}.option.svelte-159cly1.svelte-159cly1{display:block;padding:0 0 0 1.25em;white-space:nowrap;color:#333;user-select:none}.key.svelte-159cly1.svelte-159cly1{display:inline-block;width:9em}.string.svelte-159cly1.svelte-159cly1{color:hsl(41, 37%, 45%)}.boolean.svelte-159cly1.svelte-159cly1{color:hsl(45, 7%, 45%)}label.svelte-159cly1.svelte-159cly1{display:inline-block}label[for].svelte-159cly1.svelte-159cly1{color:var(--string)}input[type=checkbox].svelte-159cly1.svelte-159cly1{top:-1px}input[type=radio].svelte-159cly1.svelte-159cly1{position:absolute;top:auto;overflow:hidden;clip:rect(1px, 1px, 1px, 1px);width:1px;height:1px;white-space:nowrap}input[type=radio].svelte-159cly1+label.svelte-159cly1{padding:0 0 0 1.6em;margin:0 0.6em 0 0;opacity:0.7}input[type=radio].svelte-159cly1:checked+label.svelte-159cly1{opacity:1}input[type=radio].svelte-159cly1+label.svelte-159cly1:before{content:'';background:#eee;display:block;box-sizing:border-box;float:left;width:15px;height:15px;margin-left:-21px;margin-top:4px;vertical-align:top;cursor:pointer;text-align:center;transition:box-shadow 0.1s ease-out}input[type=radio].svelte-159cly1+label.svelte-159cly1:before{background-color:var(--second);border-radius:100%;box-shadow:inset 0 0 0 0.5em rgba(255, 255, 255, .95);border:1px solid var(--second)}input[type=radio].svelte-159cly1:checked+label.svelte-159cly1:before{background-color:var(--prime);box-shadow:inset 0 0 0 .15em rgba(255, 255, 255, .95);border:1px solid var(--second);transition:box-shadow 0.2s ease-out}",
	map: "{\"version\":3,\"file\":\"CompilerOptions.svelte\",\"sources\":[\"CompilerOptions.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { getContext } from 'svelte';\\n\\n\\tconst { compile_options } = getContext('REPL');\\n</script>\\n\\n<style>\\n\\t.options {\\n\\t\\tpadding: 0 10px;\\n\\t\\tfont-family: var(--font-mono);\\n\\t\\tfont-size: 13px;\\n\\t\\tcolor: #999;\\n\\t\\tline-height: 1.8;\\n\\t}\\n\\n\\t.option {\\n\\t\\tdisplay: block;\\n\\t\\tpadding: 0 0 0 1.25em;\\n\\t\\twhite-space: nowrap;\\n\\t\\tcolor: #333;\\n\\t\\tuser-select: none;\\n\\t}\\n\\n\\t.key {\\n\\t\\tdisplay: inline-block;\\n\\t\\twidth: 9em;\\n\\t}\\n\\n\\t.string {\\n\\t\\tcolor: hsl(41, 37%, 45%);\\n\\t}\\n\\n\\t.boolean {\\n\\t\\tcolor: hsl(45, 7%, 45%);\\n\\t}\\n\\n\\tlabel {\\n\\t\\tdisplay: inline-block;\\n\\t}\\n\\n\\tlabel[for] {\\n\\t\\tcolor: var(--string);\\n\\t}\\n\\n\\tinput[type=checkbox] {\\n\\t\\ttop: -1px;\\n\\t}\\n\\n\\tinput[type=radio] {\\n\\t\\tposition: absolute;\\n\\t\\ttop: auto;\\n\\t\\toverflow: hidden;\\n\\t\\tclip: rect(1px, 1px, 1px, 1px);\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t\\twhite-space: nowrap;\\n\\t}\\n\\n\\tinput[type=radio] + label {\\n\\t\\tpadding: 0 0 0 1.6em;\\n\\t\\tmargin: 0 0.6em 0 0;\\n\\t\\topacity: 0.7;\\n\\t}\\n\\n\\tinput[type=radio]:checked + label {\\n\\t\\topacity: 1;\\n\\t}\\n\\n\\t/* input[type=radio]:focus + label {\\n\\t\\tcolor: #00f;\\n\\t\\toutline: 1px dotted #00f;\\n\\t} */\\n\\n\\tinput[type=radio] + label:before {\\n\\t\\tcontent: '';\\n\\t\\tbackground: #eee;\\n\\t\\tdisplay: block;\\n\\t\\tbox-sizing: border-box;\\n\\t\\tfloat: left;\\n\\t\\twidth: 15px;\\n\\t\\theight: 15px;\\n\\t\\tmargin-left: -21px;\\n\\t\\tmargin-top: 4px;\\n\\t\\tvertical-align: top;\\n\\t\\tcursor: pointer;\\n\\t\\ttext-align: center;\\n\\t\\ttransition: box-shadow 0.1s ease-out;\\n\\t}\\n\\n\\tinput[type=radio] + label:before {\\n\\t\\tbackground-color: var(--second);\\n\\t\\tborder-radius: 100%;\\n\\t\\tbox-shadow: inset 0 0 0 0.5em rgba(255, 255, 255, .95);\\n\\t\\tborder: 1px solid var(--second);\\n\\t}\\n\\n\\tinput[type=radio]:checked + label:before {\\n\\t\\tbackground-color: var(--prime);\\n\\t\\tbox-shadow: inset 0 0 0 .15em rgba(255, 255, 255, .95);\\n\\t\\tborder: 1px solid var(--second);\\n\\t\\ttransition: box-shadow 0.2s ease-out;\\n\\t}\\n</style>\\n\\n<div class=\\\"options\\\">\\n\\tresult = svelte.compile(source, &#123;\\n\\t<div class=\\\"option\\\">\\n\\t\\t<span class=\\\"key\\\">generate:</span>\\n\\n\\t\\t<input id=\\\"dom-input\\\" type=\\\"radio\\\" bind:group={$compile_options.generate} value=\\\"dom\\\">\\n\\t\\t<label for=\\\"dom-input\\\"><span class=\\\"string\\\">\\\"dom\\\"</span></label>\\n\\n\\t\\t<input id=\\\"ssr-input\\\" type=\\\"radio\\\" bind:group={$compile_options.generate} value=\\\"ssr\\\">\\n\\t\\t<label for=\\\"ssr-input\\\"><span class=\\\"string\\\">\\\"ssr\\\"</span>,</label>\\n\\t</div>\\n\\n\\t<label class=\\\"option\\\">\\n\\t\\t<span class=\\\"key\\\">dev:</span>\\n\\t\\t<input type=\\\"checkbox\\\" bind:checked={$compile_options.dev}> <span class=\\\"boolean\\\">{$compile_options.dev}</span>,\\n\\t</label>\\n\\n\\t<label class=\\\"option\\\">\\n\\t\\t<span class=\\\"key\\\">css:</span>\\n\\t\\t<input type=\\\"checkbox\\\" bind:checked={$compile_options.css}> <span class=\\\"boolean\\\">{$compile_options.css}</span>,\\n\\t</label>\\n\\n\\t<label class=\\\"option\\\">\\n\\t\\t<span class=\\\"key\\\">hydratable:</span>\\n\\t\\t<input type=\\\"checkbox\\\" bind:checked={$compile_options.hydratable}> <span class=\\\"boolean\\\">{$compile_options.hydratable}</span>,\\n\\t</label>\\n\\n\\t<label class=\\\"option\\\">\\n\\t\\t<span class=\\\"key\\\">customElement:</span>\\n\\t\\t<input type=\\\"checkbox\\\" bind:checked={$compile_options.customElement}> <span class=\\\"boolean\\\">{$compile_options.customElement}</span>,\\n\\t</label>\\n\\n\\t<label class=\\\"option\\\">\\n\\t\\t<span class=\\\"key\\\">immutable:</span>\\n\\t\\t<input type=\\\"checkbox\\\" bind:checked={$compile_options.immutable}> <span class=\\\"boolean\\\">{$compile_options.immutable}</span>,\\n\\t</label>\\n\\n\\t<label class=\\\"option\\\">\\n\\t\\t<span class=\\\"key\\\">legacy:</span>\\n\\t\\t<input type=\\\"checkbox\\\" bind:checked={$compile_options.legacy}> <span class=\\\"boolean\\\">{$compile_options.legacy}</span>\\n\\t</label>\\n\\t});\\n</div>\"],\"names\":[],\"mappings\":\"AAOC,QAAQ,8BAAC,CAAC,AACT,OAAO,CAAE,CAAC,CAAC,IAAI,CACf,WAAW,CAAE,IAAI,WAAW,CAAC,CAC7B,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,CACX,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,OAAO,8BAAC,CAAC,AACR,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,MAAM,CACrB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,IAAI,CACX,WAAW,CAAE,IAAI,AAClB,CAAC,AAED,IAAI,8BAAC,CAAC,AACL,OAAO,CAAE,YAAY,CACrB,KAAK,CAAE,GAAG,AACX,CAAC,AAED,OAAO,8BAAC,CAAC,AACR,KAAK,CAAE,IAAI,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,AACzB,CAAC,AAED,QAAQ,8BAAC,CAAC,AACT,KAAK,CAAE,IAAI,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,AACxB,CAAC,AAED,KAAK,8BAAC,CAAC,AACN,OAAO,CAAE,YAAY,AACtB,CAAC,AAED,KAAK,CAAC,GAAG,CAAC,8BAAC,CAAC,AACX,KAAK,CAAE,IAAI,QAAQ,CAAC,AACrB,CAAC,AAED,KAAK,CAAC,IAAI,CAAC,QAAQ,CAAC,8BAAC,CAAC,AACrB,GAAG,CAAE,IAAI,AACV,CAAC,AAED,KAAK,CAAC,IAAI,CAAC,KAAK,CAAC,8BAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,CACT,QAAQ,CAAE,MAAM,CAChB,IAAI,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAC9B,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,WAAW,CAAE,MAAM,AACpB,CAAC,AAED,KAAK,CAAC,IAAI,CAAC,KAAK,gBAAC,CAAG,KAAK,eAAC,CAAC,AAC1B,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CACpB,MAAM,CAAE,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CACnB,OAAO,CAAE,GAAG,AACb,CAAC,AAED,KAAK,CAAC,IAAI,CAAC,KAAK,gBAAC,QAAQ,CAAG,KAAK,eAAC,CAAC,AAClC,OAAO,CAAE,CAAC,AACX,CAAC,AAOD,KAAK,CAAC,IAAI,CAAC,KAAK,gBAAC,CAAG,oBAAK,OAAO,AAAC,CAAC,AACjC,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,UAAU,CACtB,KAAK,CAAE,IAAI,CACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,KAAK,CAClB,UAAU,CAAE,GAAG,CACf,cAAc,CAAE,GAAG,CACnB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,MAAM,CAClB,UAAU,CAAE,UAAU,CAAC,IAAI,CAAC,QAAQ,AACrC,CAAC,AAED,KAAK,CAAC,IAAI,CAAC,KAAK,gBAAC,CAAG,oBAAK,OAAO,AAAC,CAAC,AACjC,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,aAAa,CAAE,IAAI,CACnB,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CACtD,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,AAChC,CAAC,AAED,KAAK,CAAC,IAAI,CAAC,KAAK,gBAAC,QAAQ,CAAG,oBAAK,OAAO,AAAC,CAAC,AACzC,gBAAgB,CAAE,IAAI,OAAO,CAAC,CAC9B,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CACtD,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,CAC/B,UAAU,CAAE,UAAU,CAAC,IAAI,CAAC,QAAQ,AACrC,CAAC\"}"
};

const CompilerOptions = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $compile_options;
	const { compile_options } = getContext("REPL");
	validate_store(compile_options, "compile_options");
	$compile_options = get_store_value(compile_options);
	$$result.css.add(css$p);
	validate_store(compile_options, "compile_options");
	$compile_options = get_store_value(compile_options);

	return `<div class="${"options svelte-159cly1"}">result = svelte.compile(source, {
	<div class="${"option svelte-159cly1"}"><span class="${"key svelte-159cly1"}">generate:</span>

		<input id="${"dom-input"}" type="${"radio"}" value="${"dom"}" class="${"svelte-159cly1"}">
		<label for="${"dom-input"}" class="${"svelte-159cly1"}"><span class="${"string svelte-159cly1"}">&quot;dom&quot;</span></label>

		<input id="${"ssr-input"}" type="${"radio"}" value="${"ssr"}" class="${"svelte-159cly1"}">
		<label for="${"ssr-input"}" class="${"svelte-159cly1"}"><span class="${"string svelte-159cly1"}">&quot;ssr&quot;</span>,</label></div>

	<label class="${"option svelte-159cly1"}"><span class="${"key svelte-159cly1"}">dev:</span>
		<input type="${"checkbox"}" class="${"svelte-159cly1"}"${add_attribute("checked", $compile_options.dev, 1)}> <span class="${"boolean svelte-159cly1"}">${escape($compile_options.dev)}</span>,
	</label>

	<label class="${"option svelte-159cly1"}"><span class="${"key svelte-159cly1"}">css:</span>
		<input type="${"checkbox"}" class="${"svelte-159cly1"}"${add_attribute("checked", $compile_options.css, 1)}> <span class="${"boolean svelte-159cly1"}">${escape($compile_options.css)}</span>,
	</label>

	<label class="${"option svelte-159cly1"}"><span class="${"key svelte-159cly1"}">hydratable:</span>
		<input type="${"checkbox"}" class="${"svelte-159cly1"}"${add_attribute("checked", $compile_options.hydratable, 1)}> <span class="${"boolean svelte-159cly1"}">${escape($compile_options.hydratable)}</span>,
	</label>

	<label class="${"option svelte-159cly1"}"><span class="${"key svelte-159cly1"}">customElement:</span>
		<input type="${"checkbox"}" class="${"svelte-159cly1"}"${add_attribute("checked", $compile_options.customElement, 1)}> <span class="${"boolean svelte-159cly1"}">${escape($compile_options.customElement)}</span>,
	</label>

	<label class="${"option svelte-159cly1"}"><span class="${"key svelte-159cly1"}">immutable:</span>
		<input type="${"checkbox"}" class="${"svelte-159cly1"}"${add_attribute("checked", $compile_options.immutable, 1)}> <span class="${"boolean svelte-159cly1"}">${escape($compile_options.immutable)}</span>,
	</label>

	<label class="${"option svelte-159cly1"}"><span class="${"key svelte-159cly1"}">legacy:</span>
		<input type="${"checkbox"}" class="${"svelte-159cly1"}"${add_attribute("checked", $compile_options.legacy, 1)}> <span class="${"boolean svelte-159cly1"}">${escape($compile_options.legacy)}</span></label>
	});
</div>`;
});

const workers = new Map();

let uid$1 = 1;

class Compiler {
	constructor(workersUrl, svelteUrl) {
		if (!workers.has(svelteUrl)) {
			const worker = new Worker(`${workersUrl}/compiler.js`);
			worker.postMessage({ type: 'init', svelteUrl });
			workers.set(svelteUrl, worker);
		}

		this.worker = workers.get(svelteUrl);

		this.handlers = new Map();

		this.worker.addEventListener('message', event => {
			const handler = this.handlers.get(event.data.id);

			if (handler) { // if no handler, was meant for a different REPL
				handler(event.data.result);
				this.handlers.delete(event.data.id);
			}
		});
	}

	compile(component, options) {
		return new Promise(fulfil => {
			const id = uid$1++;

			this.handlers.set(id, fulfil);

			this.worker.postMessage({
				id,
				type: 'compile',
				source: component.source,
				options: Object.assign({
					name: component.name,
					filename: `${component.name}.svelte`
				}, options),
				entry: component.name === 'App'
			});
		});
	}

	destroy() {
		this.worker.terminate();
	}
}

/* node_modules/@sveltejs/svelte-repl/src/Output/index.svelte generated by Svelte v3.31.0 */

const css$q = {
	code: ".view-toggle.svelte-4izmoy{height:var(--pane-controls-h);border-bottom:1px solid #eee;white-space:nowrap;box-sizing:border-box}button.svelte-4izmoy{background:white;text-align:left;position:relative;font:400 12px/1.5 var(--font);border:none;border-bottom:3px solid transparent;padding:12px 12px 8px 12px;color:#999;border-radius:0}button.active.svelte-4izmoy{border-bottom:3px solid var(--prime);color:#333}div[slot].svelte-4izmoy{height:100%}.tab-content.svelte-4izmoy{position:absolute;width:100%;height:calc(100% - 42px) !important;opacity:0;pointer-events:none}.tab-content.visible.svelte-4izmoy{opacity:1;pointer-events:all}iframe.svelte-4izmoy{width:100%;height:100%;border:none;display:block}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { getContext, onMount } from 'svelte';\\n\\timport marked from 'marked';\\n\\timport SplitPane from '../SplitPane.svelte';\\n\\timport Viewer from './Viewer.svelte';\\n\\timport PaneWithPanel from './PaneWithPanel.svelte';\\n\\timport CompilerOptions from './CompilerOptions.svelte';\\n\\timport Compiler from './Compiler.js';\\n\\timport CodeMirror from '../CodeMirror.svelte';\\n\\timport { is_browser } from '../env.js';\\n\\n\\tconst { register_output } = getContext('REPL');\\n\\n\\texport let svelteUrl;\\n\\texport let workersUrl;\\n\\texport let status;\\n\\texport let sourceErrorLoc = null;\\n\\texport let runtimeError = null;\\n\\texport let embedded = false;\\n\\texport let relaxed = false;\\n\\texport let injectedJS;\\n\\texport let injectedCSS;\\n\\n\\tlet foo; // TODO workaround for https://github.com/sveltejs/svelte/issues/2122\\n\\n\\tregister_output({\\n\\t\\tset: async (selected, options) => {\\n\\t\\t\\tselected_type = selected.type;\\n\\n\\t\\t\\tif (selected.type === 'js' || selected.type === 'json') {\\n\\t\\t\\t\\tjs_editor.set(`/* Select a component to see its compiled code */`);\\n\\t\\t\\t\\tcss_editor.set(`/* Select a component to see its compiled code */`);\\n\\t\\t\\t\\treturn;\\n\\t\\t\\t}\\n\\n\\t\\t\\tif (selected.type === 'md') {\\n\\t\\t\\t\\tmarkdown = marked(selected.source);\\n\\t\\t\\t\\treturn;\\n\\t\\t\\t}\\n\\n\\t\\t\\tconst compiled = await compiler.compile(selected, options);\\n\\t\\t\\tif (!js_editor) return; // unmounted\\n\\n\\t\\t\\tjs_editor.set(compiled.js, 'js');\\n\\t\\t\\tcss_editor.set(compiled.css, 'css');\\n\\t\\t},\\n\\n\\t\\tupdate: async (selected, options) => {\\n\\t\\t\\tif (selected.type === 'js' || selected.type === 'json') return;\\n\\n\\t\\t\\tif (selected.type === 'md') {\\n\\t\\t\\t\\tmarkdown = marked(selected.source);\\n\\t\\t\\t\\treturn;\\n\\t\\t\\t}\\n\\n\\t\\t\\tconst compiled = await compiler.compile(selected, options);\\n\\t\\t\\tif (!js_editor) return; // unmounted\\n\\n\\t\\t\\tjs_editor.update(compiled.js);\\n\\t\\t\\tcss_editor.update(compiled.css);\\n\\t\\t}\\n\\t});\\n\\n\\tconst compiler = is_browser && new Compiler(workersUrl, svelteUrl);\\n\\n\\t// refs\\n\\tlet viewer;\\n\\tlet js_editor;\\n\\tlet css_editor;\\n\\tconst setters = {};\\n\\n\\tlet view = 'result';\\n\\tlet selected_type = '';\\n\\tlet markdown = '';\\n</script>\\n\\n<style>\\n\\t.view-toggle {\\n\\t\\theight: var(--pane-controls-h);\\n\\t\\tborder-bottom: 1px solid #eee;\\n\\t\\twhite-space: nowrap;\\n\\t\\tbox-sizing: border-box;\\n\\t}\\n\\n\\tbutton {\\n\\t\\t/* width: 50%;\\n\\t\\theight: 100%; */\\n\\t\\tbackground: white;\\n\\t\\ttext-align: left;\\n\\t\\tposition: relative;\\n\\t\\tfont: 400 12px/1.5 var(--font);\\n\\t\\tborder: none;\\n\\t\\tborder-bottom: 3px solid transparent;\\n\\t\\tpadding: 12px 12px 8px 12px;\\n\\t\\tcolor: #999;\\n\\t\\tborder-radius: 0;\\n\\t}\\n\\n\\tbutton.active {\\n\\t\\tborder-bottom: 3px solid var(--prime);\\n\\t\\tcolor: #333;\\n\\t}\\n\\n\\tdiv[slot] {\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\t.tab-content {\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t\\theight: calc(100% - 42px) !important;\\n\\t\\topacity: 0;\\n\\t\\tpointer-events: none;\\n\\t}\\n\\n\\t.tab-content.visible {\\n\\t\\t/* can't use visibility due to a weird painting bug in Chrome */\\n\\t\\topacity: 1;\\n\\t\\tpointer-events: all;\\n\\t}\\n\\tiframe {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tborder: none;\\n\\t\\tdisplay: block;\\n\\t}\\n</style>\\n\\n<div class=\\\"view-toggle\\\">\\n\\t{#if selected_type === 'md'}\\n\\t\\t<button class=\\\"active\\\">Markdown</button>\\n\\t{:else}\\n\\t\\t<button\\n\\t\\t\\tclass:active=\\\"{view === 'result'}\\\"\\n\\t\\t\\ton:click=\\\"{() => view = 'result'}\\\"\\n\\t\\t>Result</button>\\n\\n\\t\\t<button\\n\\t\\t\\tclass:active=\\\"{view === 'js'}\\\"\\n\\t\\t\\ton:click=\\\"{() => view = 'js'}\\\"\\n\\t\\t>JS output</button>\\n\\n\\t\\t<button\\n\\t\\t\\tclass:active=\\\"{view === 'css'}\\\"\\n\\t\\t\\ton:click=\\\"{() => view = 'css'}\\\"\\n\\t\\t>CSS output</button>\\n\\t{/if}\\n</div>\\n\\n<!-- component viewer -->\\n<div class=\\\"tab-content\\\" class:visible=\\\"{selected_type !== 'md' && view === 'result'}\\\">\\n\\t<Viewer\\n\\t\\tbind:this={viewer}\\n\\t\\tbind:error={runtimeError}\\n\\t\\t{status}\\n\\t\\t{relaxed}\\n\\t\\t{injectedJS}\\n\\t\\t{injectedCSS}\\n\\t/>\\n</div>\\n\\n<!-- js output -->\\n<div class=\\\"tab-content\\\" class:visible=\\\"{selected_type !== 'md' && view === 'js'}\\\">\\n\\t{#if embedded}\\n\\t\\t<CodeMirror\\n\\t\\t\\tbind:this={js_editor}\\n\\t\\t\\tmode=\\\"js\\\"\\n\\t\\t\\terrorLoc={sourceErrorLoc}\\n\\t\\t\\treadonly\\n\\t\\t/>\\n\\t{:else}\\n\\t\\t<PaneWithPanel pos={67} panel=\\\"Compiler options\\\">\\n\\t\\t\\t<div slot=\\\"main\\\">\\n\\t\\t\\t\\t<CodeMirror\\n\\t\\t\\t\\t\\tbind:this={js_editor}\\n\\t\\t\\t\\t\\tmode=\\\"js\\\"\\n\\t\\t\\t\\t\\terrorLoc={sourceErrorLoc}\\n\\t\\t\\t\\t\\treadonly\\n\\t\\t\\t\\t/>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<div slot=\\\"panel-body\\\">\\n\\t\\t\\t\\t<CompilerOptions/>\\n\\t\\t\\t</div>\\n\\t\\t</PaneWithPanel>\\n\\t{/if}\\n</div>\\n\\n<!-- css output -->\\n<div class=\\\"tab-content\\\" class:visible=\\\"{selected_type !== 'md' && view === 'css'}\\\">\\n\\t<CodeMirror\\n\\t\\tbind:this={css_editor}\\n\\t\\tmode=\\\"css\\\"\\n\\t\\terrorLoc={sourceErrorLoc}\\n\\t\\treadonly\\n\\t/>\\n</div>\\n\\n<!-- markdown output -->\\n<div class=\\\"tab-content\\\" class:visible=\\\"{selected_type === 'md'}\\\">\\n\\t<iframe title=\\\"Markdown\\\" srcdoc={markdown}></iframe>\\n</div>\"],\"names\":[],\"mappings\":\"AA6EC,YAAY,cAAC,CAAC,AACb,MAAM,CAAE,IAAI,iBAAiB,CAAC,CAC9B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC7B,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,UAAU,AACvB,CAAC,AAED,MAAM,cAAC,CAAC,AAGP,UAAU,CAAE,KAAK,CACjB,UAAU,CAAE,IAAI,CAChB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,MAAM,CAAC,CAC9B,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACpC,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,CAC3B,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,CAAC,AACjB,CAAC,AAED,MAAM,OAAO,cAAC,CAAC,AACd,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,OAAO,CAAC,CACrC,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,GAAG,CAAC,IAAI,CAAC,cAAC,CAAC,AACV,MAAM,CAAE,IAAI,AACb,CAAC,AAED,YAAY,cAAC,CAAC,AACb,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,UAAU,CACpC,OAAO,CAAE,CAAC,CACV,cAAc,CAAE,IAAI,AACrB,CAAC,AAED,YAAY,QAAQ,cAAC,CAAC,AAErB,OAAO,CAAE,CAAC,CACV,cAAc,CAAE,GAAG,AACpB,CAAC,AACD,MAAM,cAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,KAAK,AACf,CAAC\"}"
};

const Output = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const { register_output } = getContext("REPL");
	let { svelteUrl } = $$props;
	let { workersUrl } = $$props;
	let { status } = $$props;
	let { sourceErrorLoc = null } = $$props;
	let { runtimeError = null } = $$props;
	let { embedded = false } = $$props;
	let { relaxed = false } = $$props;
	let { injectedJS } = $$props;
	let { injectedCSS } = $$props;

	register_output({
		set: async (selected, options) => {
			selected_type = selected.type;

			if (selected.type === "js" || selected.type === "json") {
				js_editor.set(`/* Select a component to see its compiled code */`);
				css_editor.set(`/* Select a component to see its compiled code */`);
				return;
			}

			if (selected.type === "md") {
				markdown = marked__default['default'](selected.source);
				return;
			}

			const compiled = await compiler.compile(selected, options);
			if (!js_editor) return; // unmounted
			js_editor.set(compiled.js, "js");
			css_editor.set(compiled.css, "css");
		},
		update: async (selected, options) => {
			if (selected.type === "js" || selected.type === "json") return;

			if (selected.type === "md") {
				markdown = marked__default['default'](selected.source);
				return;
			}

			const compiled = await compiler.compile(selected, options);
			if (!js_editor) return; // unmounted
			js_editor.update(compiled.js);
			css_editor.update(compiled.css);
		}
	});

	const compiler = is_browser && new Compiler(workersUrl, svelteUrl);

	// refs
	let viewer;

	let js_editor;
	let css_editor;
	let view = "result";
	let selected_type = "";
	let markdown = "";
	if ($$props.svelteUrl === void 0 && $$bindings.svelteUrl && svelteUrl !== void 0) $$bindings.svelteUrl(svelteUrl);
	if ($$props.workersUrl === void 0 && $$bindings.workersUrl && workersUrl !== void 0) $$bindings.workersUrl(workersUrl);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.sourceErrorLoc === void 0 && $$bindings.sourceErrorLoc && sourceErrorLoc !== void 0) $$bindings.sourceErrorLoc(sourceErrorLoc);
	if ($$props.runtimeError === void 0 && $$bindings.runtimeError && runtimeError !== void 0) $$bindings.runtimeError(runtimeError);
	if ($$props.embedded === void 0 && $$bindings.embedded && embedded !== void 0) $$bindings.embedded(embedded);
	if ($$props.relaxed === void 0 && $$bindings.relaxed && relaxed !== void 0) $$bindings.relaxed(relaxed);
	if ($$props.injectedJS === void 0 && $$bindings.injectedJS && injectedJS !== void 0) $$bindings.injectedJS(injectedJS);
	if ($$props.injectedCSS === void 0 && $$bindings.injectedCSS && injectedCSS !== void 0) $$bindings.injectedCSS(injectedCSS);
	$$result.css.add(css$q);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `<div class="${"view-toggle svelte-4izmoy"}">${selected_type === "md"
		? `<button class="${"active svelte-4izmoy"}">Markdown</button>`
		: `<button class="${["svelte-4izmoy",  "active" ].join(" ").trim()}">Result</button>

		<button class="${["svelte-4izmoy",  ""].join(" ").trim()}">JS output</button>

		<button class="${["svelte-4izmoy",  ""].join(" ").trim()}">CSS output</button>`}</div>


<div class="${[
			"tab-content svelte-4izmoy",
			selected_type !== "md" && view === "result"
			? "visible"
			: ""
		].join(" ").trim()}">${validate_component(Viewer, "Viewer").$$render(
			$$result,
			{
				status,
				relaxed,
				injectedJS,
				injectedCSS,
				this: viewer,
				error: runtimeError
			},
			{
				this: $$value => {
					viewer = $$value;
					$$settled = false;
				},
				error: $$value => {
					runtimeError = $$value;
					$$settled = false;
				}
			},
			{}
		)}</div>


<div class="${[
			"tab-content svelte-4izmoy",
			selected_type !== "md" && view === "js" ? "visible" : ""
		].join(" ").trim()}">${embedded
		? `${validate_component(CodeMirror_1, "CodeMirror").$$render(
				$$result,
				{
					mode: "js",
					errorLoc: sourceErrorLoc,
					readonly: true,
					this: js_editor
				},
				{
					this: $$value => {
						js_editor = $$value;
						$$settled = false;
					}
				},
				{}
			)}`
		: `${validate_component(PaneWithPanel, "PaneWithPanel").$$render($$result, { pos: 67, panel: "Compiler options" }, {}, {
				main: () => `<div slot="${"main"}" class="${"svelte-4izmoy"}">${validate_component(CodeMirror_1, "CodeMirror").$$render(
					$$result,
					{
						mode: "js",
						errorLoc: sourceErrorLoc,
						readonly: true,
						this: js_editor
					},
					{
						this: $$value => {
							js_editor = $$value;
							$$settled = false;
						}
					},
					{}
				)}</div>`,
				"panel-body": () => `<div slot="${"panel-body"}" class="${"svelte-4izmoy"}">${validate_component(CompilerOptions, "CompilerOptions").$$render($$result, {}, {}, {})}</div>`,
				default: () => `

			`
			})}`}</div>


<div class="${[
			"tab-content svelte-4izmoy",
			selected_type !== "md" && view === "css"
			? "visible"
			: ""
		].join(" ").trim()}">${validate_component(CodeMirror_1, "CodeMirror").$$render(
			$$result,
			{
				mode: "css",
				errorLoc: sourceErrorLoc,
				readonly: true,
				this: css_editor
			},
			{
				this: $$value => {
					css_editor = $$value;
					$$settled = false;
				}
			},
			{}
		)}</div>


<div class="${["tab-content svelte-4izmoy", selected_type === "md" ? "visible" : ""].join(" ").trim()}"><iframe title="${"Markdown"}"${add_attribute("srcdoc", markdown, 0)} class="${"svelte-4izmoy"}"></iframe></div>`;
	} while (!$$settled);

	return $$rendered;
});

const workers$1 = new Map();

let uid$2 = 1;

class Bundler {
	constructor({ workersUrl, packagesUrl, svelteUrl, onstatus }) {
		const hash = `${packagesUrl}:${svelteUrl}`;

		if (!workers$1.has(hash)) {
			const worker = new Worker(`${workersUrl}/bundler.js`);
			worker.postMessage({ type: 'init', packagesUrl, svelteUrl });
			workers$1.set(hash, worker);
		}

		this.worker = workers$1.get(hash);

		this.handlers = new Map();

		this.worker.addEventListener('message', event => {
			const handler = this.handlers.get(event.data.uid);

			if (handler) { // if no handler, was meant for a different REPL
				if (event.data.type === 'status') {
					onstatus(event.data.message);
					return;
				}

				onstatus(null);
				handler(event.data);
				this.handlers.delete(event.data.uid);
			}
		});
	}

	bundle(components) {
		return new Promise(fulfil => {
			this.handlers.set(uid$2, fulfil);

			this.worker.postMessage({
				uid: uid$2,
				type: 'bundle',
				components
			});

			uid$2 += 1;
		});
	}

	destroy() {
		this.worker.terminate();
	}
}

/* node_modules/@sveltejs/svelte-repl/src/Repl.svelte generated by Svelte v3.31.0 */

const css$r = {
	code: ".container.svelte-177xqak{position:relative;width:100%;height:100%}.container.svelte-177xqak section{position:relative;padding:42px 0 0 0;height:100%;box-sizing:border-box}.container.svelte-177xqak section>*:first-child{position:absolute;top:0;left:0;width:100%;height:42px;box-sizing:border-box}.container.svelte-177xqak section>*:last-child{width:100%;height:100%}",
	map: "{\"version\":3,\"file\":\"Repl.svelte\",\"sources\":[\"Repl.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { setContext, createEventDispatcher } from 'svelte';\\n\\timport { writable } from 'svelte/store';\\n\\timport SplitPane from './SplitPane.svelte';\\n\\timport ComponentSelector from './Input/ComponentSelector.svelte';\\n\\timport ModuleEditor from './Input/ModuleEditor.svelte';\\n\\timport Output from './Output/index.svelte';\\n\\timport Bundler from './Bundler.js';\\n\\timport { is_browser } from './env.js';\\n\\n\\texport let workersUrl;\\n\\texport let packagesUrl = 'https://unpkg.com';\\n\\texport let svelteUrl = `${packagesUrl}/svelte`;\\n\\texport let embedded = false;\\n\\texport let orientation = 'columns';\\n\\texport let relaxed = false;\\n\\texport let fixed = false;\\n\\texport let fixedPos = 50;\\n\\texport let injectedJS = '';\\n\\texport let injectedCSS = '';\\n\\n\\tconst historyMap = new Map();\\n\\n\\texport function toJSON() {\\n\\t\\treturn {\\n\\t\\t\\timports: $bundle.imports,\\n\\t\\t\\tcomponents: $components\\n\\t\\t};\\n\\t}\\n\\n\\texport async function set(data) {\\n\\t\\tcomponents.set(data.components);\\n\\t\\tselected.set(data.components[0]);\\n\\n\\t\\trebundle();\\n\\n\\t\\tawait module_editor_ready;\\n\\t\\tawait output_ready;\\n\\n\\t\\tinjectedCSS = data.css || '';\\n\\t\\tawait module_editor.set($selected.source, $selected.type);\\n\\t\\toutput.set($selected, $compile_options);\\n\\n\\t\\thistoryMap.clear();\\n\\t\\tmodule_editor.clearHistory();\\n\\t}\\n\\n\\texport function update(data) {\\n\\t\\tconst { name, type } = $selected || {};\\n\\n\\t\\tcomponents.set(data.components);\\n\\n\\t\\tconst matched_component = data.components.find(file => file.name === name && file.type === type);\\n\\t\\tselected.set(matched_component || data.components[0]);\\n\\n\\t\\tinjectedCSS = data.css || '';\\n\\n\\t\\tif (matched_component) {\\n\\t\\t\\tmodule_editor.update(matched_component.source);\\n\\t\\t\\toutput.update(matched_component, $compile_options);\\n\\t\\t} else {\\n\\t\\t\\tmodule_editor.set(matched_component.source, matched_component.type);\\n\\t\\t\\toutput.set(matched_component, $compile_options);\\n\\n\\t\\t\\tmodule_editor.clearHistory();\\n\\t\\t}\\n\\t}\\n\\n\\tif (!workersUrl) {\\n\\t\\tthrow new Error(`You must supply workersUrl prop to <Repl>`);\\n\\t}\\n\\n\\tconst dispatch = createEventDispatcher();\\n\\n\\tconst components = writable([]);\\n\\tconst selected = writable(null);\\n\\tconst bundle = writable(null);\\n\\n\\tconst compile_options = writable({\\n\\t\\tgenerate: 'dom',\\n\\t\\tdev: false,\\n\\t\\tcss: false,\\n\\t\\thydratable: false,\\n\\t\\tcustomElement: false,\\n\\t\\timmutable: false,\\n\\t\\tlegacy: false\\n\\t});\\n\\n\\tlet module_editor;\\n\\tlet output;\\n\\n\\tlet current_token;\\n\\tasync function rebundle() {\\n\\t\\tconst token = current_token = {};\\n\\t\\tconst result = await bundler.bundle($components);\\n\\t\\tif (result && token === current_token) bundle.set(result);\\n\\t}\\n\\n\\t// TODO this is a horrible kludge, written in a panic. fix it\\n\\tlet fulfil_module_editor_ready;\\n\\tlet module_editor_ready = new Promise(f => fulfil_module_editor_ready = f);\\n\\n\\tlet fulfil_output_ready;\\n\\tlet output_ready = new Promise(f => fulfil_output_ready = f);\\n\\n\\n\\tsetContext('REPL', {\\n\\t\\tcomponents,\\n\\t\\tselected,\\n\\t\\tbundle,\\n\\t\\tcompile_options,\\n\\n\\t\\trebundle,\\n\\n\\t\\tnavigate: item => {\\n\\t\\t\\tconst match = /^(.+)\\\\.(\\\\w+)$/.exec(item.filename);\\n\\t\\t\\tif (!match) return; // ???\\n\\n\\t\\t\\tconst [, name, type] = match;\\n\\t\\t\\tconst component = $components.find(c => c.name === name && c.type === type);\\n\\t\\t\\thandle_select(component);\\n\\n\\t\\t\\t// TODO select the line/column in question\\n\\t\\t},\\n\\n\\t\\thandle_change: event => {\\n\\t\\t\\tselected.update(component => {\\n\\t\\t\\t\\t// TODO this is a bit hacky — we're relying on mutability\\n\\t\\t\\t\\t// so that updating components works... might be better\\n\\t\\t\\t\\t// if a) components had unique IDs, b) we tracked selected\\n\\t\\t\\t\\t// *index* rather than component, and c) `selected` was\\n\\t\\t\\t\\t// derived from `components` and `index`\\n\\t\\t\\t\\tcomponent.source = event.detail.value;\\n\\t\\t\\t\\treturn component;\\n\\t\\t\\t});\\n\\n\\t\\t\\tcomponents.update(c => c);\\n\\n\\t\\t\\t// recompile selected component\\n\\t\\t\\toutput.update($selected, $compile_options);\\n\\n\\t\\t\\trebundle();\\n\\n\\t\\t\\tdispatch('change', {\\n\\t\\t\\t\\tcomponents: $components\\n\\t\\t\\t});\\n\\t\\t},\\n\\n\\t\\tregister_module_editor(editor) {\\n\\t\\t\\tmodule_editor = editor;\\n\\t\\t\\tfulfil_module_editor_ready();\\n\\t\\t},\\n\\n\\t\\tregister_output(handlers) {\\n\\t\\t\\toutput = handlers;\\n\\t\\t\\tfulfil_output_ready();\\n\\t\\t},\\n\\n\\t\\trequest_focus() {\\n\\t\\t\\tmodule_editor.focus();\\n\\t\\t}\\n\\t});\\n\\n\\tfunction handle_select(component) {\\n\\t\\thistoryMap.set(get_component_name($selected), module_editor.getHistory());\\n\\t\\tselected.set(component);\\n\\t\\tmodule_editor.set(component.source, component.type);\\n\\t\\tif (historyMap.has(get_component_name($selected))) {\\n\\t\\t\\tmodule_editor.setHistory(historyMap.get(get_component_name($selected)));\\n\\t\\t} else {\\n\\t\\t\\tmodule_editor.clearHistory();\\n\\t\\t}\\n\\t\\toutput.set($selected, $compile_options);\\n\\t}\\n\\n\\tfunction get_component_name(component) {\\n\\t\\treturn `${component.name}.${component.type}`\\n\\t}\\n\\n\\tlet input;\\n\\tlet sourceErrorLoc;\\n\\tlet runtimeErrorLoc; // TODO refactor this stuff — runtimeErrorLoc is unused\\n\\tlet status = null;\\n\\n\\tconst bundler = is_browser && new Bundler({\\n\\t\\tworkersUrl,\\n\\t\\tpackagesUrl,\\n\\t\\tsvelteUrl,\\n\\t\\tonstatus: message => {\\n\\t\\t\\tstatus = message;\\n\\t\\t}\\n\\t});\\n\\n\\t$: if (output && $selected) {\\n\\t\\toutput.update($selected, $compile_options);\\n\\t}\\n</script>\\n\\n<style>\\n\\t.container {\\n\\t\\tposition: relative;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\t.container :global(section) {\\n\\t\\tposition: relative;\\n\\t\\tpadding: 42px 0 0 0;\\n\\t\\theight: 100%;\\n\\t\\tbox-sizing: border-box;\\n\\t}\\n\\n\\t.container :global(section) > :global(*):first-child {\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 42px;\\n\\t\\tbox-sizing: border-box;\\n\\t}\\n\\n\\t.container :global(section) > :global(*):last-child {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n</style>\\n\\n<div class=\\\"container\\\" class:orientation>\\n\\t<SplitPane\\n\\t\\ttype=\\\"{orientation === 'rows' ? 'vertical' : 'horizontal'}\\\"\\n\\t\\tpos=\\\"{fixed ? fixedPos : orientation === 'rows' ? 50 : 60}\\\"\\n\\t\\t{fixed}\\n\\t>\\n\\t\\t<section slot=a>\\n\\t\\t\\t<ComponentSelector {handle_select}/>\\n\\t\\t\\t<ModuleEditor bind:this={input} errorLoc=\\\"{sourceErrorLoc || runtimeErrorLoc}\\\"/>\\n\\t\\t</section>\\n\\n\\t\\t<section slot=b style='height: 100%;'>\\n\\t\\t\\t<Output {svelteUrl} {workersUrl} {status} {embedded} {relaxed} {injectedJS} {injectedCSS}/>\\n\\t\\t</section>\\n\\t</SplitPane>\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAuMC,UAAU,eAAC,CAAC,AACX,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC,AAED,yBAAU,CAAC,AAAQ,OAAO,AAAE,CAAC,AAC5B,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,UAAU,AACvB,CAAC,AAED,yBAAU,CAAC,AAAQ,OAAO,AAAC,CAAW,CAAC,AAAC,YAAY,AAAC,CAAC,AACrD,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,UAAU,AACvB,CAAC,AAED,yBAAU,CAAC,AAAQ,OAAO,AAAC,CAAW,CAAC,AAAC,WAAW,AAAC,CAAC,AACpD,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC\"}"
};

function get_component_name(component) {
	return `${component.name}.${component.type}`;
}

const Repl = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $bundle;
	let $components;
	let $selected;
	let $compile_options;
	let { workersUrl } = $$props;
	let { packagesUrl = "https://unpkg.com" } = $$props;
	let { svelteUrl = `${packagesUrl}/svelte` } = $$props;
	let { embedded = false } = $$props;
	let { orientation = "columns" } = $$props;
	let { relaxed = false } = $$props;
	let { fixed = false } = $$props;
	let { fixedPos = 50 } = $$props;
	let { injectedJS = "" } = $$props;
	let { injectedCSS = "" } = $$props;
	const historyMap = new Map();

	function toJSON() {
		return {
			imports: $bundle.imports,
			components: $components
		};
	}

	async function set(data) {
		components.set(data.components);
		selected.set(data.components[0]);
		rebundle();
		await module_editor_ready;
		await output_ready;
		injectedCSS = data.css || "";
		await module_editor.set($selected.source, $selected.type);
		output.set($selected, $compile_options);
		historyMap.clear();
		module_editor.clearHistory();
	}

	function update(data) {
		const { name, type } = $selected || {};
		components.set(data.components);
		const matched_component = data.components.find(file => file.name === name && file.type === type);
		selected.set(matched_component || data.components[0]);
		injectedCSS = data.css || "";

		if (matched_component) {
			module_editor.update(matched_component.source);
			output.update(matched_component, $compile_options);
		} else {
			module_editor.set(matched_component.source, matched_component.type);
			output.set(matched_component, $compile_options);
			module_editor.clearHistory();
		}
	}

	if (!workersUrl) {
		throw new Error(`You must supply workersUrl prop to <Repl>`);
	}

	const dispatch = createEventDispatcher();
	const components = writable([]);
	validate_store(components, "components");
	$components = get_store_value(components);
	const selected = writable(null);
	validate_store(selected, "selected");
	$selected = get_store_value(selected);
	const bundle = writable(null);
	validate_store(bundle, "bundle");
	$bundle = get_store_value(bundle);

	const compile_options = writable({
		generate: "dom",
		dev: false,
		css: false,
		hydratable: false,
		customElement: false,
		immutable: false,
		legacy: false
	});

	validate_store(compile_options, "compile_options");
	$compile_options = get_store_value(compile_options);
	let module_editor;
	let output;
	let current_token;

	async function rebundle() {
		const token = current_token = {};
		const result = await bundler.bundle($components);
		if (result && token === current_token) bundle.set(result);
	}

	// TODO this is a horrible kludge, written in a panic. fix it
	let fulfil_module_editor_ready;

	let module_editor_ready = new Promise(f => fulfil_module_editor_ready = f);
	let fulfil_output_ready;
	let output_ready = new Promise(f => fulfil_output_ready = f);

	setContext("REPL", {
		components,
		selected,
		bundle,
		compile_options,
		rebundle,
		navigate: item => {
			const match = (/^(.+)\.(\w+)$/).exec(item.filename);
			if (!match) return; // ???
			const [,name, type] = match;
			const component = $components.find(c => c.name === name && c.type === type);
			handle_select(component);
		}, // TODO select the line/column in question
		handle_change: event => {
			selected.update(component => {
				// TODO this is a bit hacky — we're relying on mutability
				// so that updating components works... might be better
				// if a) components had unique IDs, b) we tracked selected
				// *index* rather than component, and c) `selected` was
				// derived from `components` and `index`
				component.source = event.detail.value;

				return component;
			});

			components.update(c => c);

			// recompile selected component
			output.update($selected, $compile_options);

			rebundle();
			dispatch("change", { components: $components });
		},
		register_module_editor(editor) {
			module_editor = editor;
			fulfil_module_editor_ready();
		},
		register_output(handlers) {
			output = handlers;
			fulfil_output_ready();
		},
		request_focus() {
			module_editor.focus();
		}
	});

	function handle_select(component) {
		historyMap.set(get_component_name($selected), module_editor.getHistory());
		selected.set(component);
		module_editor.set(component.source, component.type);

		if (historyMap.has(get_component_name($selected))) {
			module_editor.setHistory(historyMap.get(get_component_name($selected)));
		} else {
			module_editor.clearHistory();
		}

		output.set($selected, $compile_options);
	}

	let input;
	let runtimeErrorLoc; // TODO refactor this stuff — runtimeErrorLoc is unused
	let status = null;

	const bundler = is_browser && new Bundler({
			workersUrl,
			packagesUrl,
			svelteUrl,
			onstatus: message => {
				status = message;
			}
		});

	if ($$props.workersUrl === void 0 && $$bindings.workersUrl && workersUrl !== void 0) $$bindings.workersUrl(workersUrl);
	if ($$props.packagesUrl === void 0 && $$bindings.packagesUrl && packagesUrl !== void 0) $$bindings.packagesUrl(packagesUrl);
	if ($$props.svelteUrl === void 0 && $$bindings.svelteUrl && svelteUrl !== void 0) $$bindings.svelteUrl(svelteUrl);
	if ($$props.embedded === void 0 && $$bindings.embedded && embedded !== void 0) $$bindings.embedded(embedded);
	if ($$props.orientation === void 0 && $$bindings.orientation && orientation !== void 0) $$bindings.orientation(orientation);
	if ($$props.relaxed === void 0 && $$bindings.relaxed && relaxed !== void 0) $$bindings.relaxed(relaxed);
	if ($$props.fixed === void 0 && $$bindings.fixed && fixed !== void 0) $$bindings.fixed(fixed);
	if ($$props.fixedPos === void 0 && $$bindings.fixedPos && fixedPos !== void 0) $$bindings.fixedPos(fixedPos);
	if ($$props.injectedJS === void 0 && $$bindings.injectedJS && injectedJS !== void 0) $$bindings.injectedJS(injectedJS);
	if ($$props.injectedCSS === void 0 && $$bindings.injectedCSS && injectedCSS !== void 0) $$bindings.injectedCSS(injectedCSS);
	if ($$props.toJSON === void 0 && $$bindings.toJSON && toJSON !== void 0) $$bindings.toJSON(toJSON);
	if ($$props.set === void 0 && $$bindings.set && set !== void 0) $$bindings.set(set);
	if ($$props.update === void 0 && $$bindings.update && update !== void 0) $$bindings.update(update);
	$$result.css.add(css$r);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		validate_store(bundle, "bundle");
		$bundle = get_store_value(bundle);
		validate_store(components, "components");
		$components = get_store_value(components);
		validate_store(selected, "selected");
		$selected = get_store_value(selected);
		validate_store(compile_options, "compile_options");
		$compile_options = get_store_value(compile_options);

		 {
			if (output && $selected) {
				output.update($selected, $compile_options);
			}
		}

		$$rendered = `<div class="${["container svelte-177xqak", orientation ? "orientation" : ""].join(" ").trim()}">${validate_component(SplitPane, "SplitPane").$$render(
			$$result,
			{
				type: orientation === "rows" ? "vertical" : "horizontal",
				pos: fixed ? fixedPos : orientation === "rows" ? 50 : 60,
				fixed
			},
			{},
			{
				a: () => `<section slot="${"a"}">${validate_component(ComponentSelector, "ComponentSelector").$$render($$result, { handle_select }, {}, {})}
			${validate_component(ModuleEditor, "ModuleEditor").$$render(
					$$result,
					{
						errorLoc:  runtimeErrorLoc,
						this: input
					},
					{
						this: $$value => {
							input = $$value;
							$$settled = false;
						}
					},
					{}
				)}</section>`,
				b: () => `<section slot="${"b"}" style="${"height: 100%;"}">${validate_component(Output, "Output").$$render(
					$$result,
					{
						svelteUrl,
						workersUrl,
						status,
						embedded,
						relaxed,
						injectedJS,
						injectedCSS
					},
					{},
					{}
				)}</section>`,
				default: () => `

		`
			}
		)}</div>`;
	} while (!$$settled);

	return $$rendered;
});

function process_example(files) {
	return files
		.map(file => {
			const [name, type] = file.name.split('.');
			return { name, type, source: file.source };
		})
		.sort((a, b) => {
			if (a.name === 'App' && a.type === 'svelte') return -1;
			if (b.name === 'App' && b.type === 'svelte') return 1;

			if (a.type === b.type) return a.name < b.name ? -1 : 1;

			if (a.type === 'svelte') return -1;
			if (b.type === 'svelte') return 1;
		});
}

/* src/components/Repl/InputOutputToggle.svelte generated by Svelte v3.31.0 */

const css$s = {
	code: ".input-output-toggle.svelte-14svxs3{display:grid;user-select:none;flex:0;grid-template-columns:1fr 40px 1fr;grid-gap:0.5em;align-items:center;width:100%;height:42px;border-top:1px solid var(--second)}input.svelte-14svxs3{display:block }span.svelte-14svxs3{color:#ccc }.active.svelte-14svxs3{color:#555 }",
	map: "{\"version\":3,\"file\":\"InputOutputToggle.svelte\",\"sources\":[\"InputOutputToggle.svelte\"],\"sourcesContent\":[\"<script>\\n\\texport let checked;\\n</script>\\n\\n<style>\\n\\t.input-output-toggle {\\n\\t\\tdisplay: grid;\\n\\t\\tuser-select: none;\\n\\t\\tflex: 0;\\n\\t\\tgrid-template-columns: 1fr 40px 1fr;\\n\\t\\tgrid-gap: 0.5em;\\n\\t\\talign-items: center;\\n\\t\\twidth: 100%;\\n\\t\\theight: 42px;\\n\\t\\tborder-top: 1px solid var(--second);\\n\\t}\\n\\n\\tinput { display: block }\\n\\tspan { color: #ccc }\\n\\t.active { color: #555 }\\n</style>\\n\\n<label class=\\\"input-output-toggle\\\">\\n\\t<span class:active={!checked} style=\\\"text-align: right\\\">input</span>\\n\\t<input type=\\\"checkbox\\\" bind:checked>\\n\\t<span class:active={checked}>output</span>\\n</label>\"],\"names\":[],\"mappings\":\"AAKC,oBAAoB,eAAC,CAAC,AACrB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,IAAI,CACjB,IAAI,CAAE,CAAC,CACP,qBAAqB,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CACnC,QAAQ,CAAE,KAAK,CACf,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,AACpC,CAAC,AAED,KAAK,eAAC,CAAC,AAAC,OAAO,CAAE,KAAK,CAAC,CAAC,AACxB,IAAI,eAAC,CAAC,AAAC,KAAK,CAAE,IAAI,CAAC,CAAC,AACpB,OAAO,eAAC,CAAC,AAAC,KAAK,CAAE,IAAI,CAAC,CAAC\"}"
};

const InputOutputToggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { checked } = $$props;
	if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0) $$bindings.checked(checked);
	$$result.css.add(css$s);

	return `<label class="${"input-output-toggle svelte-14svxs3"}"><span style="${"text-align: right"}" class="${["svelte-14svxs3", !checked ? "active" : ""].join(" ").trim()}">input</span>
	<input type="${"checkbox"}" class="${"svelte-14svxs3"}"${add_attribute("checked", checked, 1)}>
	<span class="${["svelte-14svxs3", checked ? "active" : ""].join(" ").trim()}">output</span></label>`;
});

/* src/components/Repl/ReplWidget.svelte generated by Svelte v3.31.0 */

const css$t = {
	code: ".repl-outer.svelte-247fff.svelte-247fff{position:relative;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;background-color:var(--back);overflow:hidden;box-sizing:border-box;--pane-controls-h:4.2rem}.viewport.svelte-247fff.svelte-247fff{width:100%;height:100%;flex:1}.mobile.svelte-247fff .viewport.svelte-247fff{width:200%;height:calc(100% - 42px);transition:transform 0.3s}.mobile.svelte-247fff .offset.svelte-247fff{transform:translate(-50%, 0)}",
	map: "{\"version\":3,\"file\":\"ReplWidget.svelte\",\"sources\":[\"ReplWidget.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport Repl from '@sveltejs/svelte-repl';\\n\\timport { onMount } from 'svelte';\\n\\n\\timport { process_example } from '../../utils/examples';\\n\\timport InputOutputToggle from './InputOutputToggle.svelte';\\n\\n\\texport let version = '3';\\n\\texport let gist = null;\\n\\texport let example = null;\\n\\texport let embedded = false;\\n\\n\\tlet repl;\\n\\tlet name = 'loading...';\\n\\tlet width = false\\n\\t\\t? window.innerWidth - 32\\n\\t\\t: 1000;\\n\\n\\tlet checked = false;\\n\\n\\tonMount(() => {\\n\\t\\tif (version !== 'local') {\\n\\t\\t\\tfetch(`https://unpkg.com/svelte@${version}/package.json`)\\n\\t\\t\\t\\t.then(r => r.json())\\n\\t\\t\\t\\t.then(pkg => {\\n\\t\\t\\t\\t\\tversion = pkg.version;\\n\\t\\t\\t\\t});\\n\\t\\t}\\n\\n\\t\\tif (gist) {\\n\\t\\t\\tfetch(`repl/${gist}.json`).then(r => r.json()).then(data => {\\n\\t\\t\\t\\tconst { description, files } = data;\\n\\n\\t\\t\\t\\tname = description;\\n\\n\\t\\t\\t\\tconst components = Object.keys(files)\\n\\t\\t\\t\\t\\t.map(file => {\\n\\t\\t\\t\\t\\t\\tconst dot = file.lastIndexOf('.');\\n\\t\\t\\t\\t\\t\\tif (!~dot) return;\\n\\n\\t\\t\\t\\t\\t\\tconst source = files[file].content;\\n\\n\\t\\t\\t\\t\\t\\treturn {\\n\\t\\t\\t\\t\\t\\t\\tname: file.slice(0, dot),\\n\\t\\t\\t\\t\\t\\t\\ttype: file.slice(dot + 1),\\n\\t\\t\\t\\t\\t\\t\\tsource\\n\\t\\t\\t\\t\\t\\t};\\n\\t\\t\\t\\t\\t})\\n\\t\\t\\t\\t\\t.filter(x => x.type === 'svelte' || x.type === 'js')\\n\\t\\t\\t\\t\\t.sort((a, b) => {\\n\\t\\t\\t\\t\\t\\tif (a.name === 'App' && a.type === 'svelte') return -1;\\n\\t\\t\\t\\t\\t\\tif (b.name === 'App' && b.type === 'svelte') return 1;\\n\\n\\t\\t\\t\\t\\t\\tif (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;\\n\\n\\t\\t\\t\\t\\t\\treturn a.name < b.name ? -1 : 1;\\n\\t\\t\\t\\t\\t});\\n\\n\\t\\t\\t\\trepl.set({ components });\\n\\t\\t\\t});\\n\\t\\t} else if (example) {\\n\\t\\t\\tfetch(`examples/${example}.json`).then(async response => {\\n\\t\\t\\t\\tif (response.ok) {\\n\\t\\t\\t\\t\\tconst data = await response.json();\\n\\n\\t\\t\\t\\t\\trepl.set({\\n\\t\\t\\t\\t\\t\\tcomponents: process_example(data.files)\\n\\t\\t\\t\\t\\t});\\n\\t\\t\\t\\t}\\n\\t\\t\\t});\\n\\t\\t}\\n\\t});\\n\\n\\t$: if (embedded) document.title = `${name} • Svelte REPL`;\\n\\n\\t$: svelteUrl = false && version === 'local' ?\\n\\t\\t`${location.origin}/repl/local` :\\n\\t\\t`https://unpkg.com/svelte@${version}`;\\n\\n\\tconst rollupUrl = `https://unpkg.com/rollup@1/dist/rollup.browser.js`;\\n\\n\\t$: mobile = width < 560;\\n</script>\\n\\n<style>\\n\\t.repl-outer {\\n\\t\\tposition: relative;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tbackground-color: var(--back);\\n\\t\\toverflow: hidden;\\n\\t\\tbox-sizing: border-box;\\n\\t\\t--pane-controls-h: 4.2rem;\\n\\t}\\n\\n\\t.viewport {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tflex: 1;\\n\\t}\\n\\n\\t.mobile .viewport {\\n\\t\\twidth: 200%;\\n\\t\\theight: calc(100% - 42px);\\n\\t\\ttransition: transform 0.3s;\\n\\t}\\n\\n\\t.mobile .offset {\\n\\t\\ttransform: translate(-50%, 0);\\n\\t}\\n</style>\\n\\n<div class=\\\"repl-outer\\\" bind:clientWidth={width} class:mobile>\\n\\t<div class=\\\"viewport\\\" class:offset={checked}>\\n\\t\\t{#if false}\\n\\t\\t\\t<Repl\\n\\t\\t\\t\\tbind:this={repl}\\n\\t\\t\\t\\tworkersUrl=\\\"workers\\\"\\n\\t\\t\\t\\tfixed={mobile}\\n\\t\\t\\t\\t{svelteUrl}\\n\\t\\t\\t\\t{rollupUrl}\\n\\t\\t\\t\\tembedded\\n\\t\\t\\t\\trelaxed\\n\\t\\t\\t/>\\n\\t\\t{/if}\\n\\t</div>\\n\\n\\t{#if mobile}\\n\\t\\t<InputOutputToggle bind:checked/>\\n\\t{/if}\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAqFC,WAAW,4BAAC,CAAC,AACZ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,QAAQ,CAAE,MAAM,CAChB,UAAU,CAAE,UAAU,CACtB,iBAAiB,CAAE,MAAM,AAC1B,CAAC,AAED,SAAS,4BAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,CAAC,AACR,CAAC,AAED,qBAAO,CAAC,SAAS,cAAC,CAAC,AAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CACzB,UAAU,CAAE,SAAS,CAAC,IAAI,AAC3B,CAAC,AAED,qBAAO,CAAC,OAAO,cAAC,CAAC,AAChB,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,CAAC,CAAC,AAC9B,CAAC\"}"
};

const ReplWidget = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { version = "3" } = $$props;
	let { gist = null } = $$props;
	let { example = null } = $$props;
	let { embedded = false } = $$props;
	let repl;
	let name = "loading...";
	let width =  1000;
	let checked = false;

	onMount(() => {
		if (version !== "local") {
			fetch(`https://unpkg.com/svelte@${version}/package.json`).then(r => r.json()).then(pkg => {
				version = pkg.version;
			});
		}

		if (gist) {
			fetch(`repl/${gist}.json`).then(r => r.json()).then(data => {
				const { description, files } = data;
				name = description;

				const components = Object.keys(files).map(file => {
					const dot = file.lastIndexOf(".");
					if (!~dot) return;
					const source = files[file].content;

					return {
						name: file.slice(0, dot),
						type: file.slice(dot + 1),
						source
					};
				}).filter(x => x.type === "svelte" || x.type === "js").sort((a, b) => {
					if (a.name === "App" && a.type === "svelte") return -1;
					if (b.name === "App" && b.type === "svelte") return 1;
					if (a.type !== b.type) return a.type === "svelte" ? -1 : 1;
					return a.name < b.name ? -1 : 1;
				});

				repl.set({ components });
			});
		} else if (example) {
			fetch(`examples/${example}.json`).then(async response => {
				if (response.ok) {
					const data = await response.json();
					repl.set({ components: process_example(data.files) });
				}
			});
		}
	});
	if ($$props.version === void 0 && $$bindings.version && version !== void 0) $$bindings.version(version);
	if ($$props.gist === void 0 && $$bindings.gist && gist !== void 0) $$bindings.gist(gist);
	if ($$props.example === void 0 && $$bindings.example && example !== void 0) $$bindings.example(example);
	if ($$props.embedded === void 0 && $$bindings.embedded && embedded !== void 0) $$bindings.embedded(embedded);
	$$result.css.add(css$t);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		let mobile;

		 {
			if (embedded) document.title = `${name} • Svelte REPL`;
		}

		mobile = width < 560;

		$$rendered = `<div class="${["repl-outer svelte-247fff", mobile ? "mobile" : ""].join(" ").trim()}"><div class="${["viewport svelte-247fff", checked ? "offset" : ""].join(" ").trim()}">${ ``}</div>

	${mobile
		? `${validate_component(InputOutputToggle, "InputOutputToggle").$$render(
				$$result,
				{ checked },
				{
					checked: $$value => {
						checked = $$value;
						$$settled = false;
					}
				},
				{}
			)}`
		: ``}</div>`;
	} while (!$$settled);

	return $$rendered;
});

/* src/routes/_components/Example.svelte generated by Svelte v3.31.0 */

const css$u = {
	code: ".example.svelte-1t516hp{width:100%}.example.svelte-1t516hp a{color:inherit}.example.svelte-1t516hp>p{margin:4.4rem 2.4rem 2.4rem 0}.repl-container.svelte-1t516hp{width:100%;height:420px;border-radius:var(--border-r);overflow:hidden}@media(min-width: 920px){.example.svelte-1t516hp{display:grid;grid-template-columns:1fr 3fr;grid-gap:0.5em;align-items:start}}",
	map: "{\"version\":3,\"file\":\"Example.svelte\",\"sources\":[\"Example.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { Section } from '@sveltejs/site-kit';\\n\\timport IntersectionObserver from '../../components/IntersectionObserver.svelte';\\n\\timport ReplWidget from '../../components/Repl/ReplWidget.svelte';\\n\\n\\texport let id;\\n</script>\\n\\n<style>\\n\\t.example {\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.example :global(a) {\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t.example > :global(p) {\\n\\t\\tmargin: 4.4rem 2.4rem 2.4rem 0;\\n\\t}\\n\\n\\t.repl-container {\\n\\t\\twidth: 100%;\\n\\t\\theight: 420px;\\n\\t\\tborder-radius: var(--border-r);\\n\\t\\toverflow: hidden;\\n\\t}\\n\\n\\t@media (min-width: 920px) {\\n\\t\\t.example {\\n\\t\\t\\tdisplay: grid;\\n\\t\\t\\tgrid-template-columns: 1fr 3fr;\\n\\t\\t\\tgrid-gap: 0.5em;\\n\\t\\t\\talign-items: start;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<Section>\\n\\t<div class=\\\"example\\\">\\n\\t\\t<slot></slot>\\n\\n\\t\\t<div class=\\\"repl-container\\\">\\n\\t\\t\\t<IntersectionObserver once let:intersecting top={400}>\\n\\t\\t\\t\\t{#if intersecting}\\n\\t\\t\\t\\t\\t<!-- <Lazy this={loadReplWidget} example={id}/> -->\\n\\t\\t\\t\\t\\t<ReplWidget example={id}/>\\n\\t\\t\\t\\t{/if}\\n\\t\\t\\t</IntersectionObserver>\\n\\t\\t</div>\\n\\t</div>\\n</Section>\"],\"names\":[],\"mappings\":\"AASC,QAAQ,eAAC,CAAC,AACT,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,uBAAQ,CAAC,AAAQ,CAAC,AAAE,CAAC,AACpB,KAAK,CAAE,OAAO,AACf,CAAC,AAED,uBAAQ,CAAW,CAAC,AAAE,CAAC,AACtB,MAAM,CAAE,MAAM,CAAC,MAAM,CAAC,MAAM,CAAC,CAAC,AAC/B,CAAC,AAED,eAAe,eAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,IAAI,UAAU,CAAC,CAC9B,QAAQ,CAAE,MAAM,AACjB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,QAAQ,eAAC,CAAC,AACT,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,GAAG,CAAC,GAAG,CAC9B,QAAQ,CAAE,KAAK,CACf,WAAW,CAAE,KAAK,AACnB,CAAC,AACF,CAAC\"}"
};

const Example = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { id } = $$props;
	if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
	$$result.css.add(css$u);

	return `${validate_component(Section, "Section").$$render($$result, {}, {}, {
		default: () => `<div class="${"example svelte-1t516hp"}">${slots.default ? slots.default({}) : ``}

		<div class="${"repl-container svelte-1t516hp"}">${validate_component(IntersectionObserver_1, "IntersectionObserver").$$render($$result, { once: true, top: 400 }, {}, {
			default: ({ intersecting }) => `${intersecting
			? `
					${validate_component(ReplWidget, "ReplWidget").$$render($$result, { example: id }, {}, {})}`
			: ``}`
		})}</div></div>`
	})}`;
});

const companies = [
	{
		href: "https://1password.com",
		src: "organisations/1password.png",
		alt: "1Password logo",
		prominent: true,
	},
	{
		href: "https://yellowpop.com",
		src: "organisations/yellowpop.svg",
		alt: "Yellowpop logo",
		prominent: true,
	},
	{
		href: "https://www.9kawin.co.th",
		src: "organisations/9kawin.svg",
		alt: "9Kawin logo",
	},
	{
		href: "https://ablab.de",
		src: "organisations/ablab.svg",
		alt: "ABLab logo",
	},
	{
		href: "https://absoluteweb.com",
		src: "organisations/absoluteweb.svg",
		alt: "Absolute Web logo",
	},
	{
		href: "https://advnz.de/",
		src: "organisations/advnz.svg",
		alt: "ADVNZ logo",
	},
	{
		href: "https://aedge.dev",
		src: "organisations/aedge.svg",
		alt: "Ædge logo",
	},
	{
		href: "https://alogus.com",
		src: "organisations/alogus.png",
		alt: "Alogus logo",
	},
	{
		href: "https://www.alaskaair.com/",
		style: "background-color: #01426a;",
		src: "organisations/alaskaairlines.svg",
		alt: "Alaska Airlines logo",
		prominent: true,
	},
	{
		href: "https://www.andcru.io",
		src: "organisations/andcru.svg",
		alt: "&Cru logo",
	},
	{
		href: "https://animus.coop",
		src: "organisations/animus-coop.svg",
		alt: "ANIMUS coop",
	},
	{
		href: "https://anoram.com",
		src: "organisations/anoram.svg",
		alt: "Anoram logo",
	},
	{
		href: "https://ant-hill.org",
		src: "organisations/anthill.svg",
		alt: "Ant Hill logo",
	},
	{
		href: "https://appditto.com",
		style: "background-color: #4c6aff;",
		src: "organisations/appditto.svg",
		alt: "Appditto logo",
	},
	{
		href: "https://avast.com",
		src: "organisations/avast.svg",
		alt: "Avast logo",
		prominent: true,
	},
	{
		href: "https://bekchy.com",
		src: "organisations/bekchy.png",
		alt: "Bekchy logo",
	},
	{
		href: "https://beyonk.com",
		src: "organisations/beyonk.svg",
		alt: "Beyonk logo",
	},
	{
		href: "https://blockvigil.com/",
		src: "organisations/blockvigil.png",
		alt: "BlockVigil logo",
	},
	{
		href: "https://www.bluehive.com",
		src: "organisations/bluehive.svg",
		alt: "BlueHive logo",
	},
	{
		href: "https://www.budibase.com",
		src: "organisations/budibase.svg",
		alt: "Budibase logo",
	},
	{
		href: "https://buydotstar.com",
		src: "organisations/buydotstar.svg",
		alt: "buy.* logo",
	},
	{
		href: "https://cashfree.com/",
		style: "background-color: #4d3475;",
		src: "organisations/cashfree.svg",
		alt: "Cashfree logo",
	},
	{
		href: "https://chess.com",
		style: "background-color: #312e2b;",
		src: "organisations/chess.svg",
		alt: "Chess.com logo",
		prominent: true,
	},
	{
		href: "https://chudovo.de",
		src: "organisations/chudovo.svg",
		alt: "chudovo",
	},
	{
		href: "https://app.cliniciannexus.com/",
		src: "organisations/cliniciannexus.png",
		alt: "Clinician Nexus logo",
	},
	{
		href: "https://cloudedots.com",
		src: "organisations/cloudedots.png",
		alt: "Cloudedots",
	},
	{
		href: "https://comigosaude.com.br",
		src: "organisations/comigo.svg",
		alt: "Comigo logo",
	},
	{
		href: "https://constellationanalytics.com",
		src: "organisations/constellation.svg",
		alt: "Constellation Analytics logo",
	},
	{
		href: "https://convincely.com/",
		src: "organisations/convincely.svg",
		alt: "Convincely logo",
	},
	{
		href: "https://cracss.com",
		style: "background-color: #ff7000;",
		src: "organisations/cracss.svg",
		alt: "craCSS.com logo",
	},
	{
		href: "https://crocodaily.com",
		src: "organisations/crocodaily.svg",
		alt: "Crocodaily",
	},
	{
		href: "https://cygnet.io",
		style: " background-color: #2481d7; ",
		src: "organisations/cygnetdigital.svg",
		alt: "Cygnet Digital logo",
	},
	{
		href: "https://www.datacenterjournal.com",
		src: "organisations/datacenterjournal.svg",
		alt: "DataCenterJournal logo",
	},
	{
		href: "https://datawrapper.de",
		src: "organisations/datawrapper.svg",
		alt: "Datawrapper logo",
	},
	{
		href: "https://daydream.software",
		src: "organisations/daydream.svg",
		alt: "Daydream logo",
	},
	{
		href: "https://db.nomics.world",
		style: "background-color: #0f272f;",
		picture: [
			{
				type: "image/webp",
				srcset: "organisations/dbnomics.webp",
			},
		],
		src: "organisations/dbnomics.jpg",
		alt: "DBNomics logo",
	},
	{
		href: "https://deck.nl",
		src: "organisations/deck.svg",
		alt: "Deck logo",
	},
	{
		href: "https://dextra.com.br/pt/",
		src: "organisations/dextra.png",
		alt: "Dextra logo",
	},
	{
		href: "https://drywa.dev",
		style: "background-color: #e95454;",
		src: "organisations/drywa.svg",
		alt: "Drywa logo",
	},
	{
		href: "https://elderguide.com/",
		src: "organisations/elderguide.svg",
		alt: "Elder Guide logo",
	},
  {
    href: "https://www.elo7.com.br",
    src: "organisations/elo7.svg",
    alt: "Elo7 logo"
  },
	{
		href: "https://www.entriwise.com/",
		src: "organisations/entriwise.png",
		alt: "Entriwise logo",
	},
	{
		href: "https://www.entur.org/about-entur/",
		style: "background-color: #191954;",
		src: "organisations/entur.svg",
		alt: "Entur logo",
	},
	{
		href: "http://www.ergonweb.de",
		src: "organisations/ergon.png",
		alt: "ERGON logo",
	},
	{
		href: "https://www.etherbit.dev/",
		src: "organisations/etherbit-dev.svg",
		alt: "Etherbit Dev logo",
	},
	{
		href: "https://www.ethi.me/",
		src: "organisations/ethi.png",
		alt: "Ethi logo",
	},
	{
		href: "https://www.extensive-it.com/appsystem",
		src: "organisations/extensive-it.svg",
		alt: "Extensive-IT logo",
	},
	{
		href: "https://www.factry.io/",
		src: "organisations/factry.png",
		alt: "Factry logo",
	},
	{
		href: "https://farmbox.ae/",
		src: "organisations/farmbox.svg",
		alt: "Farmbox logo",
	},
	{
		href: "https://filestar.com/",
		src: "organisations/filestar.svg",
		alt: "Filestar logo",
	},
	{
		href: "https://formvalidation.io",
		src: "organisations/formvalidation.svg",
		alt: "FormValidation logo",
	},
	{
		href: "https://from-now-on.com",
		src: "organisations/from-now-on.png",
		alt: "From-Now-On logo",
	},
	{
		href: "https://frontendbastards.nl",
		style: "background-color: black;",
		src: "organisations/frontend_bastards.svg",
		alt: "Frontend Bastards logo",
	},
	{
		href: "https://fusioncharts.com",
		src: "organisations/fusioncharts.svg",
		alt: "FusionCharts logo",
		prominent: true,
	},
	{
		href: "https://gilalas.com",
		src: "organisations/gilalas.svg",
		alt: "Gilalas logo",
	},
	{
		href: "https://godaddy.com",
		src: "organisations/godaddy.svg",
		alt: "GoDaddy logo",
		prominent: true,
	},
	{
		href: "https://www.gojek.io/",
		src: "organisations/gojek.svg",
		alt: "Gojek logo",
	},
	{
		href: "https://www.grainger.com",
		src: "organisations/grainger.svg",
		alt: "Grainger logo",
	},
	{
		href: "http://healthtree.org/",
		src: "organisations/healthtree.png",
		alt: "HealthTree logo",
	},
	{
		href: "https://higsch.com/",
		src: "organisations/higsch.svg",
		alt: "Higsch logo",
	},
	{
		href: "https://ifings.com",
		src: "organisations/ifings.svg",
		alt: "iFings logo",
	},
	{
		href: "https://www.ilscipio.com",
		src: "organisations/ilscipio.svg",
		alt: "Ilscipio logo",
	},
	{
		href: "https://in1.pl",
		src: "organisations/in1.svg",
		alt: "in1 logo",
	},
	{
		href: "https://www.infomax.gr",
		src: "organisations/infomax.svg",
		alt: "Infomax Insurance Brokers logo",
	},
	{
		href: "https://iota.org",
		src: "organisations/iota.svg",
		alt: "IOTA logo",
	},
	{
		href: "https://itslearning.com",
		src: "organisations/itslearning.svg",
		alt: "itslearning logo",
	},
	{
		href: "https://jacoux.com",
		src: "organisations/jacoux.png",
		alt: "Jacoux logo",
	},
	{
		href: "https://getjames.app",
		style:
			"background: linear-gradient(to right, #113B5F 0%, #0E304E 100%); background-color: #0E304E;",
		src: "organisations/james.svg",
		alt: "James App",
	},
	{
		href: "https://jdlt.co.uk",
		src: "organisations/jdlt.svg",
		alt: "JDLT logo",
	},
	{
		href: "https://jetruby.com",
		src: "organisations/jetruby.svg",
		alt: "JetRuby logo",
	},
	{
		href: "https://jingmnt.co.za",
		src: "organisations/jingmnt.png",
		alt: "Jingmnt logo",
	},
	{
		href: "https://jolojo.com/",
		style: "background-color: #000;",
		src: "organisations/jolojo.png",
		alt: "Jolojo CMS",
	},
	{
		href: "https://kitchefs.github.io",
		src: "organisations/kitchefs.svg",
		alt: "Kitchefs logo",
	},
	{
		href: "https://klicat.com",
		src: "organisations/klicat.svg",
		alt: "Klicat logo",
	},
	{
		href: "https://koj.co",
		src: "organisations/koj.svg",
		alt: "Koj",
	},
	{
		href: "https://koodoo.io",
		style: "background-color: #343463;",
		src: "organisations/koodoo.svg",
		alt: "Koodoo logo",
	},
	{
		href: "https://laybuy.com",
		src: "organisations/laybuy.svg",
		style: "background-color: #786DFF; color: white;",
		alt: "Laybuy logo",
	},
	{
		href: "https://media.lesechos.fr/infographie",
		src: "organisations/les-echos.svg",
		alt: "Les Echos",
		prominent: true,
	},
	{
		href: "https://www.lessondesk.com",
		src: "organisations/lessondesk.svg",
		alt: "Lesson Desk logo",
	},
	{
		href: "https://librelingo.app/",
		src: "organisations/librelingo.svg",
		alt: "LibreLingo",
	},
	{
		href: "https://luigi-project.io",
		src: "organisations/luigi.png",
		alt: "Luigi logo",
	},
	{
		href: "https://lyty.dev/",
		src: "organisations/lyty-dev.svg",
		alt: "Lyty.dev logo",
	},
	{
		href: "https://maddevs.io",
		src: "organisations/maddevs.svg",
		alt: "Mad Devs logo",
	},
	{
		href: "https://mail.ru",
		src: "organisations/mailru.svg",
		alt: "Mail.ru",
	},
	{
		href: "https://mentorcv.com",
		src: "organisations/mentorcv.png",
		alt: "Mentor CV logo",
	},
	{
		href: "https://www.metrovias.com.ar/",
		style: "background-color: #606463;",
		src: "organisations/metrovias.svg",
		alt: "Metrovias logo",
	},
	{
		href: "https://moselo.com",
		src: "organisations/moselo.svg",
		alt: "Moselo logo",
	},
	{
		href: "http://mustlab.ru",
		src: "organisations/mustlab.png",
		alt: "Mustlab logo",
	},
	{
		href: "https://name-coach.com",
		src: "organisations/namecoach.svg",
		alt: "NameCoach logo",
	},
	{
		href: "https://www.nesta.org.uk",
		src: "organisations/nesta.svg",
		alt: "Nesta logo",
	},
	{
		href: "https://www.nzz.ch",
		src: "organisations/nzz.svg",
		alt: "Neue Zürcher Zeitung logo",
	},
	{
		href: "https://www.nonkositelecoms.com",
		src: "organisations/nonkosi.svg",
		alt: "Nonkosi Telecoms logo",
	},
	{
		href: "https://app.nootiz.com",
		src: "organisations/nootiz.svg",
		alt: "nootiz logo",
	},
	{
		href: "https://noppo.pro",
		src: "organisations/noppo.png",
		alt: "Noppo logo",
	},
	{
		href: "https://oberonspace.xyz",
		src: "organisations/oberonspace.svg",
		alt: "OberonSPACE logo",
	},
	{
		href: "https://ofof.nl",
		src: "organisations/ofof.png",
		alt: "Ofof logo",
	},
	{
		href: "https://ogma.app",
		src: "organisations/ogma.svg",
		alt: "Ogma logo",
	},
	{
		href: "https://omniawrite.com/",
		style: "background-color: #5c3552;",
		src: "organisations/omniawrite.svg",
		alt: "OmniaWrite",
	},
	{
		href: "https://onbench.de",
		src: "organisations/onbench.png",
		alt: "onbench",
	},
	{
		href: "https://opensols.com.co/",
		src: "organisations/opensols.svg",
		alt: "OpenSols",
	},
	{
		href: "https://openstate.eu",
		src: "organisations/open-state-foundation.svg",
		alt: "Open State Foundation logo",
	},
	{
		href: "https://panascais.net",
		src: "organisations/panascais.svg",
		alt: "Panascais logo",
	},
	{
		href: "https://pankod.com",
		src: "organisations/pankod.svg",
		alt: "Pankod logo",
	},
	{
		href: "https://paperform.co",
		src: "organisations/paperform.svg",
		alt: "Paperform logo",
	},
	{
		href: "https://parthpatel.net",
		src: "organisations/parthpatel.jpg",
		alt: "Parth Patel logo",
	},
	{
		href: "https://persona.guide",
		src: "organisations/persona-guide.svg",
		alt: "Persona Guide logo",
	},
	{
		href: "https://phellowseven.com",
		src: "organisations/phellowseven.svg",
		alt: "phellow seven logo",
	},
	{
		href: "https://www.philips.co.uk",
		src: "organisations/philips.svg",
		alt: "Philips logo",
		prominent: true,
	},
	{
		href: "https://www.phonerefer.com",
		src: "organisations/phonerefer.png",
		alt: "PhoneRefer logo",
	},
	{
		href: "https://www.playpilot.com/",
		src: "organisations/playpilot-logo.svg",
		alt: "Playpilot logo",
	},
	{
		href: "https://en.plentyofplans.app",
		src: "organisations/plentyofplans.svg",
		alt: "PlentyOfPlans logo",
	},
	{
		href: "https://postlight.com/",
		src: "organisations/postlight.svg",
		alt: "Postlight logo",
	},
	{
		href: "https://www.prepleaf.com/",
		src: "organisations/prepleaf.svg",
		alt: "Prepleaf logo",
	},
	{
		href: "https://www.pureinteractive.pl",
		src: "organisations/pure_interactive.svg",
		alt: "Pure Interactive logo",
	},
	{
		href: "https://pqina.nl",
		src: "organisations/pqina.svg",
		alt: "PQINA logo",
	},
	{
		href: "https://profullstack.com",
		src: "organisations/profullstack.svg",
		alt: "Profullstack logo",
	},
	{
		href: "https://www.qconcursos.com/",
		src: "organisations/qconcursos.svg",
		alt: "Qconcursos logo",
	},
	{
		href: "https://global.rakuten.com/corp/",
		src: "organisations/rakuten.svg",
		alt: "Rakuten logo",
		prominent: true,
	},
	{
		href: "https://www.rewe-digital.com/en/",
		src: "organisations/rewe-digital-logo.svg",
		alt: "REWE digital logo",
	},
	{
		href: "https://razorpay.com",
		src: "organisations/razorpay.svg",
		alt: "Razorpay logo",
		prominent: true,
	},
	{
		href: "https://santiment.net",
		src: "organisations/santiment.svg",
		alt: "Santiment logo",
	},
	{
		href: "https://www.se.com",
		style: " background-color: #3dcd58; ",
		src: "organisations/Schneider_Electric.svg",
		alt: "Schneider Electric",
		prominent: true,
	},
	{
		href: "https://SendGrowth.com",
		src: "organisations/sendgrowth.svg",
		alt: "SendGrowth logo",
	},
	{
		href: "https://shipbit.de",
		src: "organisations/shipbit.svg",
		alt: "ShipBit logo",
	},
	{
		href: "https://skillbank.io",
		style: "background-color: #22228A;",
		src: "organisations/skillbank.svg",
		alt: "SkillBank.io",
	},
	{
		href: "https://sp.nl",
		src: "organisations/socialist-party.svg",
		alt: "Socialist Party logo",
	},
	{
		href: "https://www.softmus.com.br/",
		src: "organisations/softmus.png",
		alt: "Softmus Tecnologia logo",
	},
	{
		href: "https://sqltribe.com",
		src: "organisations/sqltribe.svg",
		alt: "SQL Tribe logo",
	},
	{
		href: "https://www.stakingrewards.com",
		src: "organisations/stakingrewards.svg",
		alt: "Staking Rewards logo",
	},
	{
		href: "https://www.steembeem.com",
		src: "organisations/steembeem.png",
		alt: "SteemBeem logo",
	},
	{
		href: "https://www.stone.co",
		src: "organisations/stone.svg",
		alt: "Stone Payments logo",
	},
	{
		href: "https://www.strixengine.com",
		src: "organisations/strixcloud.svg",
		alt: "Strix Cloud logo",
		span: "Strix Cloud",
	},
	{
		href: "https://sucuri.net",
		style: "background-color: #5d5d5d;",
		src: "organisations/sucuri.png",
		alt: "Sucuri logo",
	},
	{
		href: "https://www.superchargify.com/",
		src: "organisations/superchargify.svg",
		alt: "Superchargify logo",
	},
	{
		href: "https://swissdevjobs.ch/jobs/JavaScript/All",
		style: "background-color: #1776d2;",
		src: "organisations/swissdev-javascript-jobs.png",
		alt: "SwissDev JavaScript Jobs",
	},
	{
		href: "https://nytimes.com",
		src: "organisations/nyt.svg",
		alt: "The New York Times logo",
		prominent: true,
	},
	{
		href: "https://www.techempower.com",
		src: "organisations/techempower.svg",
		alt: "TechEmpower logo",
	},
	{
		href: "https://that.us",
		src: "organisations/THAT-Full-Wide.svg",
		alt: "THAT Conference logo",
	},
	{
		href: "https://tsh.io",
		src: "organisations/tsh.svg",
		alt: "The Software House logo",
	},
	{
		href: "https://thunderdome.dev",
		src: "organisations/thunderdome.svg",
		alt: "Thunderdome logo",
	},
	{
		href: "https://m.tokopedia.com",
		src: "organisations/tokopedia.svg",
		alt: "Tokopedia logo",
	},
	{
		href: "https://tt.edu.au",
		src: "organisations/tradie-training.png",
		alt: "Tradie Training logo",
	},
	{
		href: "https://vipfy.store",
		src: "organisations/VIPFY.svg",
		alt: "VIPFY logo",
	},
	{
		href: "https://vrstugan.se",
		style: "background-color: #0f1f4c;",
		src: "organisations/vrstugan.svg",
		alt: "VRstugan logo",
	},
	{
		href: "https://wait.nu",
		style: "background-color: #00152A;",
		src: "organisations/wait.svg",
		alt: "Wait",
	},
	{
		href: "https://webdesq.net",
		src: "organisations/webdesq.svg",
		alt: "Webdesq logo",
	},
	{
		href: "https://wiresecure.com/",
		src: "organisations/wiresecure.svg",
		alt: "WireSecure logo",
	},
	{
		href: "https://zeo.org/tr/",
		src: "organisations/zeoagency.svg",
		alt: "Zeo Agency logo",
	},
	{
		href: "https://zevvle.com/",
		src: "organisations/zevvle.svg",
		alt: "Zevvle logo",
	},
	{
		href: "https://gbit.lt/",
		src: "organisations/gbit-logo.svg",
		alt: "Gbit",
	},
	{
		href: "https://www.redlabelabrasives.com/",
		src: "organisations/red-label-logo.png",
		alt: "Red Label Abrasives",
	},
	{
		href: "https://www.fibretiger.co.za",
		src: "organisations/fibre-tiger.png",
		alt: "Fibre Tiger",
	},
	{
		href: "https://budgetbranders.com/",
		src: "organisations/budget-branders-logo.svg",
		alt: "Budget Branders",
	},
	{
		href: "https://cakcuk.io",
		src: "organisations/cakcuk.svg",
		alt: "Cakcuk logo",
	},
	{
		href: "https://sel-home.us",
		src: "organisations/sel_home.png",
		alt: "Sel home",
	},
	{
		href: "https://gieson.com/Library/projects/utilities/timetrek/",
		style: "background-color:#4774b3;",
		src: "organisations/gieson.svg",
		alt: "Gieson TimeTrek Logo",
	},
	{
		href: "https://alphaweb.gap.im",
		src: "organisations/gap.png",
		alt: "Gap Messenger",
	},
	{
		href: "https://zencity.io",
		src: "organisations/zencity.svg",
		alt: "Zencity",
	},
	{
		href: "https://strollyn.com",
		src: "organisations/strollyn.svg",
		alt: "STROLLÿN",
	},
	{
		href: "http://agileleaf.com",
		src: "organisations/agileleaf.svg",
		alt: "Agile Leaf",
	},
	{
		href: "https://tproger.ru",
		src: "organisations/tproger.svg",
		alt: "Tproger («Типичный программист»)",
	},
	{
		href: "https://transloadit.com",
		src: "organisations/transloadit.svg",
		alt: "Transloadit",
	},
	{
		href: "https://www.creative-tim.com/templates/svelte?ref=svelte.dev",
		src: "organisations/ct-logo-text-black.png",
		alt: "Creative Tim",
	},
	{
		href: "https://turgensec.com",
		src: "organisations/TurgenSec.png",
		alt: "TurgenSec",
	},
	{
		href: "https://alextomas.com",
		src: "organisations/alextomas.png",
		alt: "Alex Tomás - Frontend developer",
	},
	{
		href: "https://emakinacee.com/",
		style: "background-color:#000;",
		src: "organisations/emakina-cee.svg",
		alt: "Emakina CEE Logo",
	},
	{
		href: "https://www.ibm.com/",
		src: "organisations/ibm.svg",
		alt: "IBM logo",
		prominent: true,
	},
	{
		href: "https://postis.eu/",
		src: "organisations/postis.svg",
		alt: "Postis",
	},
	{
		href: "https://lost.report/",
		src: "organisations/lostreport.svg",
		alt: "Lost.Report Task Tracker"
	},
	{
		href: "https://www.enablerr.ch/",
		src: "organisations/enablerr.png",
		alt: "enablerr by pier4all"
	},
	{
		href: "https://thalasseus.com/",
		style: "background-color: #000",
		src: "organisations/thalasseus.svg",
		alt: "Thalasseus logo"
	},
	{
		href: "https://about.smartnews.com/en/",
		src: "organisations/smartnews.png",
		alt: "SmartNews"
	},
	{
		href: "https://filevine.com/",
		src: "organisations/filevine.svg",
		alt: "Filevine"
	},
];

/* src/routes/_components/WhosUsingSvelte.svelte generated by Svelte v3.31.0 */

const css$v = {
	code: ".logos.svelte-17pslwe{margin:1em 0 0 0;display:flex;flex-wrap:wrap}a.svelte-17pslwe,button.svelte-17pslwe{height:40px;margin:0 0.5em 0.5em 0;display:flex;align-items:center;border:2px solid var(--second);padding:5px 10px;border-radius:20px;color:var(--text)}.add-yourself.svelte-17pslwe{color:var(--prime)}picture.svelte-17pslwe,img.svelte-17pslwe{height:100%}@media(min-width: 540px){a.svelte-17pslwe,button.svelte-17pslwe{height:60px;padding:10px 20px;border-radius:30px}}",
	map: "{\"version\":3,\"file\":\"WhosUsingSvelte.svelte\",\"sources\":[\"WhosUsingSvelte.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { companies } from './WhosUsingSvelte.js';\\n\\n\\tconst randomizer = ({prominent}) =>  Math.random() + !!prominent;\\n\\n\\tconst doSort = (a, b) => randomizer(b) - randomizer(a);\\n\\n\\tconst sortedCompanies = companies.sort(doSort);\\n\\tconst companiesCount = companies.length;\\n\\tconst _baseNumber = 35;\\n\\tlet limitCompanies = _baseNumber;\\n\\n\\t$: allCompaniesShown = limitCompanies >= companiesCount\\n\\n\\tconst handleShowMore = () => {\\n\\t\\tif (allCompaniesShown) {\\n\\t\\t\\tlimitCompanies = _baseNumber;\\n\\t\\t\\treturn;\\n\\t\\t}\\n\\n\\t\\tlimitCompanies += _baseNumber;\\n\\t}\\n</script>\\n\\n<style>\\n\\t.logos {\\n\\t\\tmargin: 1em 0 0 0;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-wrap: wrap;\\n\\t}\\n\\n\\ta, button {\\n\\t\\theight: 40px;\\n\\t\\tmargin: 0 0.5em 0.5em 0;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tborder: 2px solid var(--second);\\n\\t\\tpadding: 5px 10px;\\n\\t\\tborder-radius: 20px;\\n\\t\\tcolor: var(--text);\\n\\t}\\n\\n\\t.add-yourself {\\n\\t\\tcolor: var(--prime);\\n\\t}\\n\\n\\tpicture,\\n\\timg {\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\t@media (min-width: 540px) {\\n\\t\\ta, button {\\n\\t\\t\\theight: 60px;\\n\\t\\t\\tpadding: 10px 20px;\\n\\t\\t\\tborder-radius: 30px;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<div class=\\\"logos\\\">\\n\\t{#each sortedCompanies as {href, src, alt, style, picture, span}, index}\\n\\t\\t{#if index < limitCompanies}\\n\\t\\t\\t<a\\n\\t\\t\\t\\ttarget=\\\"_blank\\\"\\n\\t\\t\\t\\trel=\\\"noopener\\\"\\n\\t\\t\\t\\t{href}\\n\\t\\t\\t\\tstyle=\\\"{style || ''}\\\">\\n\\t\\t\\t\\t{#if picture}\\n\\t\\t\\t\\t\\t<picture>\\n\\t\\t\\t\\t\\t\\t{#each picture as {type, srcset}}\\n\\t\\t\\t\\t\\t\\t\\t<source {type} {srcset}>\\n\\t\\t\\t\\t\\t\\t{/each}\\n\\t\\t\\t\\t\\t\\t<img {src} {alt} loading=\\\"lazy\\\">\\n\\t\\t\\t\\t\\t</picture>\\n\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t<img {src} {alt} loading=\\\"lazy\\\">\\n\\t\\t\\t\\t\\t{#if span}\\n\\t\\t\\t\\t\\t\\t<span>{span}</span>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t{/if}\\n\\t\\t\\t</a>\\n\\t\\t{/if}\\n\\t{/each}\\n\\t<button\\n\\t\\ton:click={handleShowMore}\\n\\t\\tclass=\\\"add-yourself\\\">\\n\\t\\t<span>show {allCompaniesShown ? 'less' : 'more'}</span>\\n\\t</button>\\n\\t<a\\n\\t\\ttarget=\\\"_blank\\\"\\n\\t\\trel=\\\"noopener\\\"\\n\\t\\thref=\\\"https://github.com/sveltejs/community/blob/master/whos-using-svelte/WhosUsingSvelte.js\\\"\\n\\t\\tclass=\\\"add-yourself\\\">\\n\\t\\t<span>+ your company?</span>\\n\\t</a>\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAyBC,MAAM,eAAC,CAAC,AACP,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACjB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,gBAAC,CAAE,MAAM,eAAC,CAAC,AACV,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,CAAC,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CACvB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,CAC/B,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,aAAa,CAAE,IAAI,CACnB,KAAK,CAAE,IAAI,MAAM,CAAC,AACnB,CAAC,AAED,aAAa,eAAC,CAAC,AACd,KAAK,CAAE,IAAI,OAAO,CAAC,AACpB,CAAC,AAED,sBAAO,CACP,GAAG,eAAC,CAAC,AACJ,MAAM,CAAE,IAAI,AACb,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,gBAAC,CAAE,MAAM,eAAC,CAAC,AACV,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,aAAa,CAAE,IAAI,AACpB,CAAC,AACF,CAAC\"}"
};

const _baseNumber = 35;

const WhosUsingSvelte = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const randomizer = ({ prominent }) => Math.random() + !!prominent;
	const doSort = (a, b) => randomizer(b) - randomizer(a);
	const sortedCompanies = companies.sort(doSort);
	const companiesCount = companies.length;
	let limitCompanies = _baseNumber;

	$$result.css.add(css$v);
	let allCompaniesShown;
	allCompaniesShown = limitCompanies >= companiesCount;

	return `<div class="${"logos svelte-17pslwe"}">${each(sortedCompanies, ({ href, src, alt, style, picture, span }, index) => `${index < limitCompanies
	? `<a target="${"_blank"}" rel="${"noopener"}"${add_attribute("href", href, 0)}${add_attribute("style", style || "", 0)} class="${"svelte-17pslwe"}">${picture
		? `<picture class="${"svelte-17pslwe"}">${each(picture, ({ type, srcset }) => `<source${add_attribute("type", type, 0)}${add_attribute("srcset", srcset, 0)}>`)}
						<img${add_attribute("src", src, 0)}${add_attribute("alt", alt, 0)} loading="${"lazy"}" class="${"svelte-17pslwe"}">
					</picture>`
		: `<img${add_attribute("src", src, 0)}${add_attribute("alt", alt, 0)} loading="${"lazy"}" class="${"svelte-17pslwe"}">
					${span ? `<span>${escape(span)}</span>` : ``}`}
			</a>`
	: ``}`)}
	<button class="${"add-yourself svelte-17pslwe"}"><span>show ${escape(allCompaniesShown ? "less" : "more")}</span></button>
	<a target="${"_blank"}" rel="${"noopener"}" href="${"https://github.com/sveltejs/community/blob/master/whos-using-svelte/WhosUsingSvelte.js"}" class="${"add-yourself svelte-17pslwe"}"><span>+ your company?</span></a></div>`;
});

/* src/routes/index.svelte generated by Svelte v3.31.0 */

const css$w = {
	code: ".back-light{--text:hsl(36, 3%, 44%)}.examples.svelte-4powvv{background:var(--second);color:white;overflow:hidden}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { Blurb, Hero, Section } from '@sveltejs/site-kit';\\n\\timport Contributors from './_components/Contributors.svelte';\\n\\timport Example from './_components/Example.svelte';\\n\\timport WhosUsingSvelte from './_components/WhosUsingSvelte.svelte';\\n\\t// import Lazy from '../components/Lazy.svelte';\\n\\n\\t// TODO this causes a Sapper CSS bug...\\n\\t// function loadReplWidget() {\\n\\t// \\tconsole.log('lazy loading');\\n\\t// \\treturn import('../components/Repl/ReplWidget.svelte').then(mod => mod.default);\\n\\t// }\\n</script>\\n\\n<style>\\n\\t/* darken text for accessibility */\\n\\t/* TODO does this belong elsewhere? */\\n\\t:global(.back-light) {\\n\\t\\t--text: hsl(36, 3%, 44%);\\n\\t}\\n\\n\\t.examples {\\n\\t\\tbackground: var(--second);\\n\\t\\tcolor: white;\\n\\t\\toverflow: hidden;\\n\\t}\\n</style>\\n\\n<svelte:head>\\n\\t<title>Svelte • Cybernetically enhanced web apps</title>\\n\\n\\t<meta name=\\\"twitter:title\\\" content=\\\"Svelte\\\">\\n\\t<meta name=\\\"twitter:description\\\" content=\\\"Cybernetically enhanced web apps\\\">\\n\\t<meta name=\\\"Description\\\" content=\\\"Cybernetically enhanced web apps\\\">\\n</svelte:head>\\n\\n<h1 class=\\\"visually-hidden\\\">Svelte</h1>\\n<Hero\\n\\ttitle=\\\"Svelte\\\"\\n\\ttagline=\\\"Cybernetically enhanced web apps\\\"\\n\\toutline=\\\"svelte-logo-outline.svg\\\"\\n\\tlogotype=\\\"svelte-logotype.svg\\\"\\n/>\\n\\n<Blurb>\\n\\t<a href=\\\"blog/write-less-code\\\" slot=\\\"one\\\">\\n\\t\\t<h2>Write less code</h2>\\n\\t\\t<p>Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript</p>\\n\\n\\t\\t<span class=\\\"learn-more\\\">learn more</span>\\n\\t</a>\\n\\n\\t<a href=\\\"blog/virtual-dom-is-pure-overhead\\\" slot=\\\"two\\\">\\n\\t\\t<h2>No virtual DOM</h2>\\n\\t\\t<p>Svelte compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays fast</p>\\n\\n\\t\\t<span class=\\\"learn-more\\\">learn more</span>\\n\\t</a>\\n\\n\\t<a href=\\\"blog/svelte-3-rethinking-reactivity\\\" slot=\\\"three\\\">\\n\\t\\t<h2>Truly reactive</h2>\\n\\t\\t<p>No more complex state management libraries — Svelte brings reactivity to JavaScript itself</p>\\n\\n\\t\\t<span class=\\\"learn-more\\\">learn more</span>\\n\\t</a>\\n\\n\\t<div class=\\\"description\\\" slot=\\\"what\\\">\\n\\t\\t<p>Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the <em>browser</em>, Svelte shifts that work into a <em>compile step</em> that happens when you build your app.</p>\\n\\n\\t\\t<p>Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.</p>\\n\\n\\t\\t<p><a href=\\\"blog/svelte-3-rethinking-reactivity\\\">Read the introductory blog post</a> to learn more.</p>\\n\\t</div>\\n\\n\\t<div style=\\\"grid-area: start; display: flex; flex-direction: column; min-width: 0\\\" slot=\\\"how\\\">\\n\\t\\t<pre class=\\\"language-bash\\\" style=\\\"margin: 0 0 1em 0; min-width: 0; min-height: 0\\\">\\nnpx degit <a href=\\\"https://github.com/sveltejs/template\\\" style=\\\"user-select: initial;\\\">sveltejs/template</a> my-svelte-project\\n<span class=\\\"token comment\\\"># or download and extract <a href=\\\"https://github.com/sveltejs/template/archive/master.zip\\\">this .zip file</a></span>\\ncd my-svelte-project\\n<span class=\\\"token comment\\\"># to use <a href=\\\"blog/svelte-and-typescript\\\">TypeScript</a> run:</span>\\n<span class=\\\"token comment\\\"># node scripts/setupTypeScript.js</span>\\n\\nnpm install\\nnpm run dev\\n\\t\\t</pre>\\n\\n\\t\\t<p style=\\\"flex: 1\\\">See the <a href=\\\"blog/the-easiest-way-to-get-started\\\">quickstart guide</a> for more information.</p>\\n\\n\\t\\t<p class=\\\"cta\\\"><a rel=\\\"prefetch\\\" href=\\\"tutorial\\\">Learn Svelte</a></p>\\n\\t</div>\\n</Blurb>\\n\\n<div class=\\\"examples\\\">\\n\\t<Example id=\\\"hello-world\\\">\\n\\t\\t<p>Svelte components are built on top of HTML. Just add data.</p>\\n\\t</Example>\\n\\n\\t<Example id=\\\"nested-components\\\">\\n\\t\\t<p>CSS is component-scoped by default — no more style collisions or specificity wars. Or you can <a href=\\\"/blog/svelte-css-in-js\\\">use your favourite CSS-in-JS library</a>.</p>\\n\\t</Example>\\n\\n\\t<Example id=\\\"reactive-assignments\\\">\\n\\t\\t<p>Trigger efficient, granular updates by assigning to local variables. The compiler does the rest.</p>\\n\\t</Example>\\n\\n\\t<Example id=\\\"svg-transitions\\\">\\n\\t\\t<p>Build beautiful UIs with a powerful, performant transition engine built right into the framework.</p>\\n\\t</Example>\\n</div>\\n\\n<Section>\\n\\t<h3>Who's using Svelte?</h3>\\n\\n\\t<WhosUsingSvelte/>\\n</Section>\\n\\n<Section>\\n\\t<h3>Contributors</h3>\\n\\n\\t<p>Svelte is free and open source software, made possible by the work of dozens of volunteers. <a href=\\\"https://github.com/sveltejs/svelte\\\">Join us!</a></p>\\n\\n\\t<Contributors/>\\n</Section>\\n\"],\"names\":[],\"mappings\":\"AAiBS,WAAW,AAAE,CAAC,AACrB,MAAM,CAAE,gBAAgB,AACzB,CAAC,AAED,SAAS,cAAC,CAAC,AACV,UAAU,CAAE,IAAI,QAAQ,CAAC,CACzB,KAAK,CAAE,KAAK,CACZ,QAAQ,CAAE,MAAM,AACjB,CAAC\"}"
};

const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css$w);

	return `${($$result.head += `${($$result.title = `<title>Svelte • Cybernetically enhanced web apps</title>`, "")}<meta name="${"twitter:title"}" content="${"Svelte"}" data-svelte="svelte-wry75o"><meta name="${"twitter:description"}" content="${"Cybernetically enhanced web apps"}" data-svelte="svelte-wry75o"><meta name="${"Description"}" content="${"Cybernetically enhanced web apps"}" data-svelte="svelte-wry75o">`, "")}

<h1 class="${"visually-hidden"}">Svelte</h1>
${validate_component(Hero, "Hero").$$render(
		$$result,
		{
			title: "Svelte",
			tagline: "Cybernetically enhanced web apps",
			outline: "svelte-logo-outline.svg",
			logotype: "svelte-logotype.svg"
		},
		{},
		{}
	)}

${validate_component(Blurb, "Blurb").$$render($$result, {}, {}, {
		one: () => `<a href="${"blog/write-less-code"}" slot="${"one"}"><h2>Write less code</h2>
		<p>Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript</p>

		<span class="${"learn-more"}">learn more</span></a>`,
		two: () => `<a href="${"blog/virtual-dom-is-pure-overhead"}" slot="${"two"}"><h2>No virtual DOM</h2>
		<p>Svelte compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays fast</p>

		<span class="${"learn-more"}">learn more</span></a>`,
		three: () => `<a href="${"blog/svelte-3-rethinking-reactivity"}" slot="${"three"}"><h2>Truly reactive</h2>
		<p>No more complex state management libraries — Svelte brings reactivity to JavaScript itself</p>

		<span class="${"learn-more"}">learn more</span></a>`,
		what: () => `<div class="${"description"}" slot="${"what"}"><p>Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the <em>browser</em>, Svelte shifts that work into a <em>compile step</em> that happens when you build your app.</p>

		<p>Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.</p>

		<p><a href="${"blog/svelte-3-rethinking-reactivity"}">Read the introductory blog post</a> to learn more.</p></div>`,
		how: () => `<div style="${"grid-area: start; display: flex; flex-direction: column; min-width: 0"}" slot="${"how"}"><pre class="${"language-bash"}" style="${"margin: 0 0 1em 0; min-width: 0; min-height: 0"}">npx degit <a href="${"https://github.com/sveltejs/template"}" style="${"user-select: initial;"}">sveltejs/template</a> my-svelte-project
<span class="${"token comment"}"># or download and extract <a href="${"https://github.com/sveltejs/template/archive/master.zip"}">this .zip file</a></span>
cd my-svelte-project
<span class="${"token comment"}"># to use <a href="${"blog/svelte-and-typescript"}">TypeScript</a> run:</span>
<span class="${"token comment"}"># node scripts/setupTypeScript.js</span>

npm install
npm run dev
		</pre>

		<p style="${"flex: 1"}">See the <a href="${"blog/the-easiest-way-to-get-started"}">quickstart guide</a> for more information.</p>

		<p class="${"cta"}"><a rel="${"prefetch"}" href="${"tutorial"}">Learn Svelte</a></p></div>`,
		default: () => `

	

	

	

	`
	})}

<div class="${"examples svelte-4powvv"}">${validate_component(Example, "Example").$$render($$result, { id: "hello-world" }, {}, {
		default: () => `<p>Svelte components are built on top of HTML. Just add data.</p>`
	})}

	${validate_component(Example, "Example").$$render($$result, { id: "nested-components" }, {}, {
		default: () => `<p>CSS is component-scoped by default — no more style collisions or specificity wars. Or you can <a href="${"/blog/svelte-css-in-js"}">use your favourite CSS-in-JS library</a>.</p>`
	})}

	${validate_component(Example, "Example").$$render($$result, { id: "reactive-assignments" }, {}, {
		default: () => `<p>Trigger efficient, granular updates by assigning to local variables. The compiler does the rest.</p>`
	})}

	${validate_component(Example, "Example").$$render($$result, { id: "svg-transitions" }, {}, {
		default: () => `<p>Build beautiful UIs with a powerful, performant transition engine built right into the framework.</p>`
	})}</div>

${validate_component(Section, "Section").$$render($$result, {}, {}, {
		default: () => `<h3>Who&#39;s using Svelte?</h3>

	${validate_component(WhosUsingSvelte, "WhosUsingSvelte").$$render($$result, {}, {}, {})}`
	})}

${validate_component(Section, "Section").$$render($$result, {}, {}, {
		default: () => `<h3>Contributors</h3>

	<p>Svelte is free and open source software, made possible by the work of dozens of volunteers. <a href="${"https://github.com/sveltejs/svelte"}">Join us!</a></p>

	${validate_component(Contributors, "Contributors").$$render($$result, {}, {}, {})}`
	})}`;
});

var component_0 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Routes
});

const CONTEXT_KEY = {};

/* src/components/PreloadingIndicator.svelte generated by Svelte v3.31.0 */

const css$x = {
	code: ".progress-container.svelte-2v07tr{position:absolute;top:0;left:0;width:100%;height:4px;z-index:999}.progress.svelte-2v07tr{position:absolute;left:0;top:0;height:100%;background-color:var(--prime);transition:width 0.4s}.fade.svelte-2v07tr{position:fixed;width:100%;height:100%;background-color:rgba(255,255,255,0.3);pointer-events:none;z-index:998;animation:svelte-2v07tr-fade 0.4s}@keyframes svelte-2v07tr-fade{from{opacity:0 }to{opacity:1 }}",
	map: "{\"version\":3,\"file\":\"PreloadingIndicator.svelte\",\"sources\":[\"PreloadingIndicator.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { onMount } from 'svelte';\\n\\n\\tlet p = 0;\\n\\tlet visible = false;\\n\\n\\tonMount(() => {\\n\\t\\tfunction next() {\\n\\t\\t\\tvisible = true;\\n\\t\\t\\tp += 0.1;\\n\\n\\t\\t\\tconst remaining = 1 - p;\\n\\t\\t\\tif (remaining > 0.15) setTimeout(next, 500 / remaining);\\n\\t\\t}\\n\\n\\t\\tsetTimeout(next, 250);\\n\\t});\\n</script>\\n\\n<style>\\n\\t.progress-container {\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 4px;\\n\\t\\tz-index: 999;\\n\\t}\\n\\n\\t.progress {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\theight: 100%;\\n\\t\\tbackground-color: var(--prime);\\n\\t\\ttransition: width 0.4s;\\n\\t}\\n\\n\\t.fade {\\n\\t\\tposition: fixed;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tbackground-color: rgba(255,255,255,0.3);\\n\\t\\tpointer-events: none;\\n\\t\\tz-index: 998;\\n\\t\\tanimation: fade 0.4s;\\n\\t}\\n\\n\\t@keyframes fade {\\n\\t\\tfrom { opacity: 0 }\\n\\t\\tto { opacity: 1 }\\n\\t}\\n</style>\\n\\n{#if visible}\\n\\t<div class=\\\"progress-container\\\">\\n\\t\\t<div class=\\\"progress\\\" style=\\\"width: {p * 100}%\\\"></div>\\n\\t</div>\\n{/if}\\n\\n{#if p >= 0.4}\\n\\t<div class=\\\"fade\\\"></div>\\n{/if}\"],\"names\":[],\"mappings\":\"AAoBC,mBAAmB,cAAC,CAAC,AACpB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,OAAO,CAAE,GAAG,AACb,CAAC,AAED,SAAS,cAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,OAAO,CAAC,CAC9B,UAAU,CAAE,KAAK,CAAC,IAAI,AACvB,CAAC,AAED,KAAK,cAAC,CAAC,AACN,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CACvC,cAAc,CAAE,IAAI,CACpB,OAAO,CAAE,GAAG,CACZ,SAAS,CAAE,kBAAI,CAAC,IAAI,AACrB,CAAC,AAED,WAAW,kBAAK,CAAC,AAChB,IAAI,AAAC,CAAC,AAAC,OAAO,CAAE,CAAC,CAAC,CAAC,AACnB,EAAE,AAAC,CAAC,AAAC,OAAO,CAAE,CAAC,CAAC,CAAC,AAClB,CAAC\"}"
};

const PreloadingIndicator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let p = 0;
	let visible = false;

	onMount(() => {
		function next() {
			visible = true;
			p += 0.1;
			const remaining = 1 - p;
			if (remaining > 0.15) setTimeout(next, 500 / remaining);
		}

		setTimeout(next, 250);
	});

	$$result.css.add(css$x);

	return `${visible
	? `<div class="${"progress-container svelte-2v07tr"}"><div class="${"progress svelte-2v07tr"}" style="${"width: " + escape(p * 100) + "%"}"></div></div>`
	: ``}

${p >= 0.4
	? `<div class="${"fade svelte-2v07tr"}"></div>`
	: ``}`;
});

/* src/routes/_layout.svelte generated by Svelte v3.31.0 */

const css$y = {
	code: "main.svelte-1ohgwbo{position:relative;margin:0 auto;padding:var(--nav-h) 0 0 0;overflow-x:hidden}",
	map: "{\"version\":3,\"file\":\"_layout.svelte\",\"sources\":[\"_layout.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { setContext } from 'svelte';\\n\\timport { stores } from '@sapper/app';\\n\\timport { Icon, Icons, Nav, NavItem } from '@sveltejs/site-kit';\\n\\timport PreloadingIndicator from '../components/PreloadingIndicator.svelte';\\n\\n\\texport let segment;\\n\\n\\tconst { page, preloading, session } = stores();\\n\\n\\tsetContext('app', {\\n\\t\\tlogin: () => {\\n\\t\\t\\tconst login_window = window.open(`${window.location.origin}/auth/login`, 'login', 'width=600,height=400');\\n\\n\\t\\t\\twindow.addEventListener('message', function handler(event) {\\n\\t\\t\\t\\tlogin_window.close();\\n\\t\\t\\t\\twindow.removeEventListener('message', handler);\\n\\t\\t\\t\\t$session.user = event.data.user;\\n\\t\\t\\t});\\n\\t\\t},\\n\\n\\t\\tlogout: async () => {\\n\\t\\t\\tconst r = await fetch(`/auth/logout`, {\\n\\t\\t\\t\\tcredentials: 'include'\\n\\t\\t\\t});\\n\\n\\t\\t\\tif (r.ok) $session.user = null;\\n\\t\\t}\\n\\t});\\n</script>\\n\\n<Icons/>\\n\\n{#if $preloading}\\n\\t<PreloadingIndicator/>\\n{/if}\\n\\n{#if $page.path !== '/repl/embed'}\\n\\t<Nav {segment} {page} logo=\\\"svelte-logo-horizontal.svg\\\">\\n\\t\\t<NavItem segment=\\\"tutorial\\\">Tutorial</NavItem>\\n\\t\\t<NavItem segment=\\\"docs\\\">API</NavItem>\\n\\t\\t<NavItem segment=\\\"examples\\\">Examples</NavItem>\\n\\t\\t<NavItem segment=\\\"repl\\\">REPL</NavItem>\\n\\t\\t<NavItem segment=\\\"blog\\\">Blog</NavItem>\\n\\t\\t<NavItem segment=\\\"faq\\\">FAQ</NavItem>\\n\\n\\t\\t<NavItem external=\\\"https://sapper.svelte.dev\\\">Sapper</NavItem>\\n\\n\\t\\t<NavItem external=\\\"chat\\\" title=\\\"Discord Chat\\\">\\n\\t\\t\\t<Icon name=\\\"message-square\\\"/>\\n\\t\\t</NavItem>\\n\\n\\t\\t<NavItem external=\\\"https://github.com/sveltejs/svelte\\\" title=\\\"GitHub Repo\\\">\\n\\t\\t\\t<Icon name=\\\"github\\\"/>\\n\\t\\t</NavItem>\\n\\t</Nav>\\n{/if}\\n\\n<main>\\n\\t<slot></slot>\\n</main>\\n\\n<style>\\n\\tmain {\\n\\t\\tposition: relative;\\n\\t\\tmargin: 0 auto;\\n\\t\\t/* padding: var(--nav-h) var(--side-nav) 0 var(--side-nav); */\\n\\t\\tpadding: var(--nav-h) 0 0 0;\\n\\t\\toverflow-x: hidden;\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA+DC,IAAI,eAAC,CAAC,AACL,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CAAC,IAAI,CAEd,OAAO,CAAE,IAAI,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAC3B,UAAU,CAAE,MAAM,AACnB,CAAC\"}"
};

const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	let $preloading;
	let $page;
	let { segment } = $$props;
	const { page, preloading, session } = stores$1();
	validate_store(page, "page");
	$page = get_store_value(page);
	validate_store(preloading, "preloading");
	$preloading = get_store_value(preloading);
	validate_store(session, "session");
	$session = get_store_value(session);

	setContext("app", {
		login: () => {
			const login_window = window.open(`${window.location.origin}/auth/login`, "login", "width=600,height=400");

			window.addEventListener("message", function handler(event) {
				login_window.close();
				window.removeEventListener("message", handler);
				$session.user = event.data.user;
			});
		},
		logout: async () => {
			const r = await fetch(`/auth/logout`, { credentials: "include" });
			if (r.ok) $session.user = null;
		}
	});

	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);
	$$result.css.add(css$y);
	validate_store(session, "session");
	$session = get_store_value(session);
	validate_store(preloading, "preloading");
	$preloading = get_store_value(preloading);
	validate_store(page, "page");
	$page = get_store_value(page);

	return `${validate_component(Icons, "Icons").$$render($$result, {}, {}, {})}

${$preloading
	? `${validate_component(PreloadingIndicator, "PreloadingIndicator").$$render($$result, {}, {}, {})}`
	: ``}

${$page.path !== "/repl/embed"
	? `${validate_component(Nav, "Nav").$$render(
			$$result,
			{
				segment,
				page,
				logo: "svelte-logo-horizontal.svg"
			},
			{},
			{
				default: () => `${validate_component(NavItem, "NavItem").$$render($$result, { segment: "tutorial" }, {}, { default: () => `Tutorial` })}
		${validate_component(NavItem, "NavItem").$$render($$result, { segment: "docs" }, {}, { default: () => `API` })}
		${validate_component(NavItem, "NavItem").$$render($$result, { segment: "examples" }, {}, { default: () => `Examples` })}
		${validate_component(NavItem, "NavItem").$$render($$result, { segment: "repl" }, {}, { default: () => `REPL` })}
		${validate_component(NavItem, "NavItem").$$render($$result, { segment: "blog" }, {}, { default: () => `Blog` })}
		${validate_component(NavItem, "NavItem").$$render($$result, { segment: "faq" }, {}, { default: () => `FAQ` })}

		${validate_component(NavItem, "NavItem").$$render($$result, { external: "https://sapper.svelte.dev" }, {}, { default: () => `Sapper` })}

		${validate_component(NavItem, "NavItem").$$render($$result, { external: "chat", title: "Discord Chat" }, {}, {
					default: () => `${validate_component(Icon, "Icon").$$render($$result, { name: "message-square" }, {}, {})}`
				})}

		${validate_component(NavItem, "NavItem").$$render(
					$$result,
					{
						external: "https://github.com/sveltejs/svelte",
						title: "GitHub Repo"
					},
					{},
					{
						default: () => `${validate_component(Icon, "Icon").$$render($$result, { name: "github" }, {}, {})}`
					}
				)}`
			}
		)}`
	: ``}

<main class="${"svelte-1ohgwbo"}">${slots.default ? slots.default({}) : ``}
</main>`;
});

var root_comp = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Layout
});

/* src/routes/_error.svelte generated by Svelte v3.31.0 */

const css$z = {
	code: ".container.svelte-1vorltb{padding:var(--top-offset) var(--side-nav) 6rem var(--side-nav)}h1.svelte-1vorltb,p.svelte-1vorltb{margin:0 auto }h1.svelte-1vorltb{font-size:2.8em;font-weight:300;margin:0 0 0.5em 0}p.svelte-1vorltb{margin:1em auto }.error.svelte-1vorltb{background-color:var(--second);color:white;padding:12px 16px;font:600 16px/1.7 var(--font);border-radius:2px}",
	map: "{\"version\":3,\"file\":\"_error.svelte\",\"sources\":[\"_error.svelte\"],\"sourcesContent\":[\"<script>\\n\\tconst dev = \\\"development\\\" === 'development';\\n\\n\\texport let status;\\n\\texport let error;\\n\\n\\t// we don't want to use <svelte:window bind:online> here,\\n\\t// because we only care about the online state when\\n\\t// the page first loads\\n\\tconst online = typeof navigator !== 'undefined'\\n\\t\\t? navigator.onLine\\n\\t\\t: true;\\n</script>\\n\\n<style>\\n\\t.container {\\n\\t\\tpadding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);\\n\\t}\\n\\n\\th1, p { margin: 0 auto }\\n\\n\\th1 {\\n\\t\\tfont-size: 2.8em;\\n\\t\\tfont-weight: 300;\\n\\t\\tmargin: 0 0 0.5em 0;\\n\\t}\\n\\n\\tp { margin: 1em auto }\\n\\n\\t.error {\\n\\t\\tbackground-color: var(--second);\\n\\t\\tcolor: white;\\n\\t\\tpadding: 12px 16px;\\n\\t\\tfont: 600 16px/1.7 var(--font);\\n\\t\\tborder-radius: 2px;\\n\\t}\\n\\n\\t/* @media (min-width: 480px) {\\n\\t\\th1 { font-size: 4em }\\n\\t} */\\n</style>\\n\\n<svelte:head>\\n\\t<title>{status}</title>\\n</svelte:head>\\n\\n<div class=\\\"container\\\">\\n\\t{#if online}\\n\\t\\t<h1>Yikes!</h1>\\n\\n\\t\\t{#if error.message}\\n\\t\\t\\t<p class=\\\"error\\\">{status}: {error.message}</p>\\n\\t\\t{:else}\\n\\t\\t\\t<p class=\\\"error\\\">Encountered a {status} error</p>\\n\\t\\t{/if}\\n\\n\\t\\t{#if dev && error.stack}\\n\\t\\t\\t<pre>{error.stack}</pre>\\n\\t\\t{:else}\\n\\t\\t\\t{#if status >= 500}\\n\\t\\t\\t\\t<p>Please try reloading the page.</p>\\n\\t\\t\\t{/if}\\n\\n\\t\\t\\t<p>If the error persists, please drop by <a href=\\\"chat\\\">Discord chatroom</a> and let us know, or raise an issue on <a href=\\\"https://github.com/sveltejs/svelte\\\">GitHub</a>. Thanks!</p>\\n\\t\\t{/if}\\n\\t{:else}\\n\\t\\t<h1>It looks like you're offline</h1>\\n\\n\\t\\t<p>Reload the page once you've found the internet.</p>\\n\\t{/if}\\n</div>\"],\"names\":[],\"mappings\":\"AAeC,UAAU,eAAC,CAAC,AACX,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,CAAC,IAAI,UAAU,CAAC,AAChE,CAAC,AAED,iBAAE,CAAE,CAAC,eAAC,CAAC,AAAC,MAAM,CAAE,CAAC,CAAC,IAAI,CAAC,CAAC,AAExB,EAAE,eAAC,CAAC,AACH,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACpB,CAAC,AAED,CAAC,eAAC,CAAC,AAAC,MAAM,CAAE,GAAG,CAAC,IAAI,CAAC,CAAC,AAEtB,MAAM,eAAC,CAAC,AACP,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,IAAI,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,MAAM,CAAC,CAC9B,aAAa,CAAE,GAAG,AACnB,CAAC\"}"
};

const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { status } = $$props;
	let { error } = $$props;

	// we don't want to use <svelte:window bind:online> here,
	// because we only care about the online state when
	// the page first loads
	const online = typeof navigator !== "undefined"
	? navigator.onLine
	: true;

	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	$$result.css.add(css$z);

	return `${($$result.head += `${($$result.title = `<title>${escape(status)}</title>`, "")}`, "")}

<div class="${"container svelte-1vorltb"}">${online
	? `<h1 class="${"svelte-1vorltb"}">Yikes!</h1>

		${error.message
		? `<p class="${"error svelte-1vorltb"}">${escape(status)}: ${escape(error.message)}</p>`
		: `<p class="${"error svelte-1vorltb"}">Encountered a ${escape(status)} error</p>`}

		${ error.stack
		? `<pre>${escape(error.stack)}</pre>`
		: `${status >= 500
			? `<p class="${"svelte-1vorltb"}">Please try reloading the page.</p>`
			: ``}

			<p class="${"svelte-1vorltb"}">If the error persists, please drop by <a href="${"chat"}">Discord chatroom</a> and let us know, or raise an issue on <a href="${"https://github.com/sveltejs/svelte"}">GitHub</a>. Thanks!</p>`}`
	: `<h1 class="${"svelte-1vorltb"}">It looks like you&#39;re offline</h1>

		<p class="${"svelte-1vorltb"}">Reload the page once you&#39;ve found the internet.</p>`}</div>`;
});

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.31.0 */

const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	let { level2 = null } = $$props;
	let { notify } = $$props;
	afterUpdate(notify);
	setContext(CONTEXT_KEY, stores);
	if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
	if ($$props.level0 === void 0 && $$bindings.level0 && level0 !== void 0) $$bindings.level0(level0);
	if ($$props.level1 === void 0 && $$bindings.level1 && level1 !== void 0) $$bindings.level1(level1);
	if ($$props.level2 === void 0 && $$bindings.level2 && level2 !== void 0) $$bindings.level2(level2);
	if ($$props.notify === void 0 && $$bindings.notify && notify !== void 0) $$bindings.notify(notify);

	return `


${validate_component(Layout, "Layout").$$render($$result, Object.assign({ segment: segments[0] }, level0.props), {}, {
		default: () => `${error
		? `${validate_component(Error$1, "Error").$$render($$result, { error, status }, {}, {})}`
		: `${validate_component(level1.component || missing_component, "svelte:component").$$render($$result, Object.assign({ segment: segments[1] }, level1.props), {}, {
				default: () => `${level2
				? `${validate_component(level2.component || missing_component, "svelte:component").$$render($$result, Object.assign(level2.props), {}, {})}`
				: ``}`
			})}`}`
	})}`;
});

// This file is generated by Sapper — do not edit it!

const ignore = [/^\/examples\.json$/, /^\/examples\/([^/]+?)\.json$/, /^\/tutorial\.json$/, /^\/tutorial\/random-number\/?$/, /^\/tutorial\/([^/]+?)\.json$/, /^\/apps\.json$/, /^\/auth\/callback\/?$/, /^\/auth\/logout\/?$/, /^\/auth\/login\/?$/, /^\/blog\.json$/, /^\/blog\/rss\.xml$/, /^\/blog\/([^/]+?)\.json$/, /^\/chat\/?$/, /^\/docs\.json$/, /^\/repl\/create\.json$/, /^\/repl\/local\/(.+)$/, /^\/repl\/([^/]+?)\.json$/, /^\/faq\.json$/];

const routes = (d => [
	{
		// index.svelte
		pattern: /^\/$/,
		parts: [
			{ i: 0 }
		]
	},

	{
		// examples/index.svelte
		pattern: /^\/examples\/?$/,
		parts: [
			{ i: 1 }
		]
	},

	{
		// tutorial/index.svelte
		pattern: /^\/tutorial\/?$/,
		parts: [
			{ i: 2 },
			{ i: 3 }
		]
	},

	{
		// tutorial/[slug]/index.svelte
		pattern: /^\/tutorial\/([^/]+?)\/?$/,
		parts: [
			{ i: 2 },
			{ i: 4, params: match => ({ slug: d(match[1]) }) }
		]
	},

	{
		// apps/index.svelte
		pattern: /^\/apps\/?$/,
		parts: [
			{ i: 5 }
		]
	},

	{
		// blog/index.svelte
		pattern: /^\/blog\/?$/,
		parts: [
			{ i: 6 }
		]
	},

	{
		// blog/[slug].svelte
		pattern: /^\/blog\/([^/]+?)\/?$/,
		parts: [
			null,
			{ i: 7, params: match => ({ slug: d(match[1]) }) }
		]
	},

	{
		// docs/index.svelte
		pattern: /^\/docs\/?$/,
		parts: [
			{ i: 8 }
		]
	},

	{
		// repl/index.svelte
		pattern: /^\/repl\/?$/,
		parts: [
			{ i: 9 }
		]
	},

	{
		// repl/embed.svelte
		pattern: /^\/repl\/embed\/?$/,
		parts: [
			null,
			{ i: 10 }
		]
	},

	{
		// repl/[id]/index.svelte
		pattern: /^\/repl\/([^/]+?)\/?$/,
		parts: [
			null,
			{ i: 11, params: match => ({ id: d(match[1]) }) }
		]
	},

	{
		// faq/index.svelte
		pattern: /^\/faq\/?$/,
		parts: [
			{ i: 12 }
		]
	}
])(decodeURIComponent);

if (typeof window !== 'undefined') {
	Promise.resolve().then(function () { return require('./sapper-dev-client-baba2825.js'); }).then(client => {
		client.connect(10000);
	});
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

let uid$3 = 1;
let cid;
const _history = typeof history !== 'undefined' ? history : {
    pushState: () => { },
    replaceState: () => { },
    scrollRestoration: 'auto'
};
const scroll_history = {};
let base_url;
let handle_target;
function extract_query(search) {
    const query = Object.create(null);
    if (search.length > 0) {
        search.slice(1).split('&').forEach(searchParam => {
            const [, key, value = ''] = /([^=]*)(?:=(.*))?/.exec(decodeURIComponent(searchParam.replace(/\+/g, ' ')));
            if (typeof query[key] === 'string')
                query[key] = [query[key]];
            if (typeof query[key] === 'object')
                query[key].push(value);
            else
                query[key] = value;
        });
    }
    return query;
}
function select_target(url) {
    if (url.origin !== location.origin)
        return null;
    if (!url.pathname.startsWith(base_url))
        return null;
    let path = url.pathname.slice(base_url.length);
    if (path === '') {
        path = '/';
    }
    // avoid accidental clashes between server routes and page routes
    if (ignore.some(pattern => pattern.test(path)))
        return;
    for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i];
        const match = route.pattern.exec(path);
        if (match) {
            const query = extract_query(url.search);
            const part = route.parts[route.parts.length - 1];
            const params = part.params ? part.params(match) : {};
            const page = { host: location.host, path, query, params };
            return { href: url.href, route, match, page };
        }
    }
}
function scroll_state() {
    return {
        x: pageXOffset,
        y: pageYOffset
    };
}
function navigate(dest, id, noscroll, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const popstate = !!id;
        if (popstate) {
            cid = id;
        }
        else {
            const current_scroll = scroll_state();
            // clicked on a link. preserve scroll state
            scroll_history[cid] = current_scroll;
            cid = id = ++uid$3;
            scroll_history[cid] = noscroll ? current_scroll : { x: 0, y: 0 };
        }
        yield handle_target();
        if (document.activeElement && (document.activeElement instanceof HTMLElement))
            document.activeElement.blur();
        if (!noscroll) {
            let scroll = scroll_history[id];
            let deep_linked;
            if (hash) {
                // scroll is an element id (from a hash), we need to compute y.
                deep_linked = document.getElementById(hash.slice(1));
                if (deep_linked) {
                    scroll = {
                        x: 0,
                        y: deep_linked.getBoundingClientRect().top + scrollY
                    };
                }
            }
            scroll_history[cid] = scroll;
            if (popstate || deep_linked) {
                scrollTo(scroll.x, scroll.y);
            }
            else {
                scrollTo(0, 0);
            }
        }
    });
}

function get_base_uri(window_document) {
    let baseURI = window_document.baseURI;
    if (!baseURI) {
        const baseTags = window_document.getElementsByTagName('base');
        baseURI = baseTags.length ? baseTags[0].href : window_document.URL;
    }
    return baseURI;
}

function goto(href, opts = { noscroll: false, replaceState: false }) {
    const target = select_target(new URL(href, get_base_uri(document)));
    if (target) {
        _history[opts.replaceState ? 'replaceState' : 'pushState']({ id: cid }, '', href);
        return navigate(target, null, opts.noscroll);
    }
    location.href = href;
    return new Promise(() => {
        /* never resolves */
    });
}

function page_store(value) {
    const store = writable(value);
    let ready = true;
    function notify() {
        ready = true;
        store.update(val => val);
    }
    function set(new_value) {
        ready = false;
        store.set(new_value);
    }
    function subscribe(run) {
        let old_value;
        return store.subscribe((new_value) => {
            if (old_value === undefined || (ready && new_value !== old_value)) {
                run(old_value = new_value);
            }
        });
    }
    return { notify, set, subscribe };
}

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;
const stores = {
    page: page_store({}),
    preloading: writable(null),
    session: writable(initial_data && initial_data.session)
};
stores.session.subscribe((value) => __awaiter(void 0, void 0, void 0, function* () {
    return;
}));

const stores$1 = () => getContext(CONTEXT_KEY);

/* src/components/ScreenToggle.svelte generated by Svelte v3.31.0 */

const css$A = {
	code: ".toggle.svelte-vq5kbo{position:fixed;bottom:0;width:100%;height:4.6rem;display:flex;justify-content:center;align-items:center;border-top:1px solid var(--second);background-color:white}button.svelte-vq5kbo{margin:0 .15em;width:4em;height:1em;padding:.2em .4em .3em;border-radius:var(--border-r);line-height:normal;box-sizing:content-box;color:#888;border:1px solid var(--back-light)}.selected.svelte-vq5kbo{background-color:var(--prime);color:white}",
	map: "{\"version\":3,\"file\":\"ScreenToggle.svelte\",\"sources\":[\"ScreenToggle.svelte\"],\"sourcesContent\":[\"<script>\\n\\texport let labels;\\n\\texport let offset = 0;\\n</script>\\n\\n<style>\\n\\t.toggle {\\n\\t\\tposition: fixed;\\n\\t\\tbottom: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 4.6rem;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\tborder-top: 1px solid var(--second);\\n\\t\\tbackground-color: white;\\n\\t}\\n\\n\\tbutton {\\n\\t\\tmargin: 0 .15em;\\n\\t\\twidth: 4em;\\n\\t\\theight: 1em;\\n\\t\\tpadding: .2em .4em .3em;\\n\\t\\tborder-radius: var(--border-r);\\n\\t\\tline-height: normal;\\n\\t\\tbox-sizing: content-box;\\n\\t\\tcolor: #888;\\n\\t\\tborder: 1px solid var(--back-light);\\n\\t}\\n\\n\\t.selected {\\n\\t\\tbackground-color: var(--prime);\\n\\t\\tcolor: white;\\n\\t}\\n</style>\\n\\n<div class=\\\"toggle\\\">\\n\\t{#each labels as label, index}\\n\\t\\t<button\\n\\t\\t\\tclass:selected={offset === index}\\n\\t\\t\\ton:click={() => offset = index}\\n\\t\\t>\\n\\t\\t\\t{label}\\n\\t\\t</button>\\n\\t{/each}\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAMC,OAAO,cAAC,CAAC,AACR,QAAQ,CAAE,KAAK,CACf,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,MAAM,CACd,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,CACnC,gBAAgB,CAAE,KAAK,AACxB,CAAC,AAED,MAAM,cAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,KAAK,CACf,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CACvB,aAAa,CAAE,IAAI,UAAU,CAAC,CAC9B,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,WAAW,CACvB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,YAAY,CAAC,AACpC,CAAC,AAED,SAAS,cAAC,CAAC,AACV,gBAAgB,CAAE,IAAI,OAAO,CAAC,CAC9B,KAAK,CAAE,KAAK,AACb,CAAC\"}"
};

const ScreenToggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { labels } = $$props;
	let { offset = 0 } = $$props;
	if ($$props.labels === void 0 && $$bindings.labels && labels !== void 0) $$bindings.labels(labels);
	if ($$props.offset === void 0 && $$bindings.offset && offset !== void 0) $$bindings.offset(offset);
	$$result.css.add(css$A);

	return `<div class="${"toggle svelte-vq5kbo"}">${each(labels, (label, index) => `<button class="${["svelte-vq5kbo", offset === index ? "selected" : ""].join(" ").trim()}">${escape(label)}
		</button>`)}</div>`;
});

// REPL props

const svelteUrl = `https://unpkg.com/svelte@3`;
const rollupUrl = `https://unpkg.com/rollup@1/dist/rollup.browser.js`;
const mapbox_setup = `window.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;`;

/* src/routes/examples/_TableOfContents.svelte generated by Svelte v3.31.0 */

const css$B = {
	code: ".examples-toc.svelte-agypo9.svelte-agypo9{overflow-y:auto;height:100%;border-right:1px solid var(--second);background-color:var(--second);color:white;padding:3rem 3rem 0 3rem}.examples-toc.svelte-agypo9 li.svelte-agypo9{display:block;line-height:1.2;margin:0 0 4.8rem 0}.section-title.svelte-agypo9.svelte-agypo9{display:block;padding:0 0 0.8rem 0;font:400 var(--h6) var(--font);text-transform:uppercase;letter-spacing:0.12em;font-weight:700}div.svelte-agypo9.svelte-agypo9{display:flex;flex-direction:row;padding:0.2rem 3rem;margin:0 -3rem}div.active.svelte-agypo9.svelte-agypo9{background:rgba(0, 0, 0, 0.15) calc(100% - 3rem) 47% no-repeat\n\t\t\turl(/icons/arrow-right.svg);background-size:1em 1em;color:white}div.active.loading.svelte-agypo9.svelte-agypo9{background:rgba(0, 0, 0, 0.1) calc(100% - 3rem) 47% no-repeat\n\t\t\turl(/icons/loading.svg);background-size:1em 1em;color:white}a.svelte-agypo9.svelte-agypo9{display:flex;flex:1 1 auto;position:relative;color:var(--sidebar-text);border-bottom:none;font-size:1.6rem;align-items:center;justify-content:start;padding:0}a.svelte-agypo9.svelte-agypo9:hover{color:white}.repl-link.svelte-agypo9.svelte-agypo9{flex:0 1 auto;font-size:1.2rem;font-weight:700;margin-right:2.5rem}.thumbnail.svelte-agypo9.svelte-agypo9{background-color:white;object-fit:contain;width:5rem;height:5rem;border-radius:2px;box-shadow:1px 1px 3px rgba(0, 0, 0, 0.13);margin:0.2em 0.5em 0.2em 0}",
	map: "{\"version\":3,\"file\":\"_TableOfContents.svelte\",\"sources\":[\"_TableOfContents.svelte\"],\"sourcesContent\":[\"<script>\\n\\texport let sections = [];\\n\\texport let active_section = null;\\n\\texport let isLoading = false;\\n</script>\\n\\n<style>\\n\\t.examples-toc {\\n\\t\\toverflow-y: auto;\\n\\t\\theight: 100%;\\n\\t\\tborder-right: 1px solid var(--second);\\n\\t\\tbackground-color: var(--second);\\n\\t\\tcolor: white;\\n\\t\\tpadding: 3rem 3rem 0 3rem;\\n\\t}\\n\\n\\t.examples-toc li {\\n\\t\\tdisplay: block;\\n\\t\\tline-height: 1.2;\\n\\t\\tmargin: 0 0 4.8rem 0;\\n\\t}\\n\\n\\t.section-title {\\n\\t\\tdisplay: block;\\n\\t\\tpadding: 0 0 0.8rem 0;\\n\\t\\tfont: 400 var(--h6) var(--font);\\n\\t\\ttext-transform: uppercase;\\n\\t\\tletter-spacing: 0.12em;\\n\\t\\tfont-weight: 700;\\n\\t}\\n\\n\\tdiv {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: row;\\n\\t\\tpadding: 0.2rem 3rem;\\n\\t\\tmargin: 0 -3rem;\\n\\t}\\n\\n\\tdiv.active {\\n\\t\\tbackground: rgba(0, 0, 0, 0.15) calc(100% - 3rem) 47% no-repeat\\n\\t\\t\\turl(/icons/arrow-right.svg);\\n\\t\\tbackground-size: 1em 1em;\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\tdiv.active.loading {\\n\\t\\tbackground: rgba(0, 0, 0, 0.1) calc(100% - 3rem) 47% no-repeat\\n\\t\\t\\turl(/icons/loading.svg);\\n\\t\\tbackground-size: 1em 1em;\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\ta {\\n\\t\\tdisplay: flex;\\n\\t\\tflex: 1 1 auto;\\n\\t\\tposition: relative;\\n\\t\\tcolor: var(--sidebar-text);\\n\\t\\tborder-bottom: none;\\n\\t\\tfont-size: 1.6rem;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: start;\\n\\t\\tpadding: 0;\\n\\t}\\n\\n\\ta:hover {\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\t.repl-link {\\n\\t\\tflex: 0 1 auto;\\n\\t\\tfont-size: 1.2rem;\\n\\t\\tfont-weight: 700;\\n\\t\\tmargin-right: 2.5rem;\\n\\t}\\n\\n\\t.thumbnail {\\n\\t\\tbackground-color: white;\\n\\t\\tobject-fit: contain;\\n\\t\\twidth: 5rem;\\n\\t\\theight: 5rem;\\n\\t\\tborder-radius: 2px;\\n\\t\\tbox-shadow: 1px 1px 3px rgba(0, 0, 0, 0.13);\\n\\t\\tmargin: 0.2em 0.5em 0.2em 0;\\n\\t}\\n</style>\\n\\n<ul class=\\\"examples-toc\\\">\\n\\t{#each sections as section}\\n\\t\\t<li>\\n\\t\\t\\t<span class=\\\"section-title\\\">{section.title}</span>\\n\\n\\t\\t\\t{#each section.examples as example}\\n\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\tclass=\\\"row\\\"\\n\\t\\t\\t\\t\\tclass:active={example.slug === active_section}\\n\\t\\t\\t\\t\\tclass:loading={isLoading}>\\n\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\thref=\\\"examples#{example.slug}\\\"\\n\\t\\t\\t\\t\\t\\tclass=\\\"row\\\"\\n\\t\\t\\t\\t\\t\\tclass:active={example.slug === active_section}\\n\\t\\t\\t\\t\\t\\tclass:loading={isLoading}>\\n\\t\\t\\t\\t\\t\\t<img\\n\\t\\t\\t\\t\\t\\t\\tclass=\\\"thumbnail\\\"\\n\\t\\t\\t\\t\\t\\t\\talt=\\\"{example.title} thumbnail\\\"\\n\\t\\t\\t\\t\\t\\t\\tsrc=\\\"examples/thumbnails/{example.slug}.jpg\\\" />\\n\\n\\t\\t\\t\\t\\t\\t<span>{example.title}</span>\\n\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t\\t{#if example.slug === active_section}\\n\\t\\t\\t\\t\\t\\t<a href=\\\"repl/{example.slug}\\\" class=\\\"repl-link\\\">REPL</a>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/each}\\n\\t\\t</li>\\n\\t{/each}\\n</ul>\\n\"],\"names\":[],\"mappings\":\"AAOC,aAAa,4BAAC,CAAC,AACd,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,CACrC,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,CAAC,CAAC,IAAI,AAC1B,CAAC,AAED,2BAAa,CAAC,EAAE,cAAC,CAAC,AACjB,OAAO,CAAE,KAAK,CACd,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,AACrB,CAAC,AAED,cAAc,4BAAC,CAAC,AACf,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACrB,IAAI,CAAE,GAAG,CAAC,IAAI,IAAI,CAAC,CAAC,IAAI,MAAM,CAAC,CAC/B,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,GAAG,4BAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,MAAM,CAAE,CAAC,CAAC,KAAK,AAChB,CAAC,AAED,GAAG,OAAO,4BAAC,CAAC,AACX,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,SAAS;GAC9D,IAAI,sBAAsB,CAAC,CAC5B,eAAe,CAAE,GAAG,CAAC,GAAG,CACxB,KAAK,CAAE,KAAK,AACb,CAAC,AAED,GAAG,OAAO,QAAQ,4BAAC,CAAC,AACnB,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,SAAS;GAC7D,IAAI,kBAAkB,CAAC,CACxB,eAAe,CAAE,GAAG,CAAC,GAAG,CACxB,KAAK,CAAE,KAAK,AACb,CAAC,AAED,CAAC,4BAAC,CAAC,AACF,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,cAAc,CAAC,CAC1B,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,KAAK,CACtB,OAAO,CAAE,CAAC,AACX,CAAC,AAED,6BAAC,MAAM,AAAC,CAAC,AACR,KAAK,CAAE,KAAK,AACb,CAAC,AAED,UAAU,4BAAC,CAAC,AACX,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,YAAY,CAAE,MAAM,AACrB,CAAC,AAED,UAAU,4BAAC,CAAC,AACX,gBAAgB,CAAE,KAAK,CACvB,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAC3C,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,AAC5B,CAAC\"}"
};

const TableOfContents = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { sections = [] } = $$props;
	let { active_section = null } = $$props;
	let { isLoading = false } = $$props;
	if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0) $$bindings.sections(sections);
	if ($$props.active_section === void 0 && $$bindings.active_section && active_section !== void 0) $$bindings.active_section(active_section);
	if ($$props.isLoading === void 0 && $$bindings.isLoading && isLoading !== void 0) $$bindings.isLoading(isLoading);
	$$result.css.add(css$B);

	return `<ul class="${"examples-toc svelte-agypo9"}">${each(sections, section => `<li class="${"svelte-agypo9"}"><span class="${"section-title svelte-agypo9"}">${escape(section.title)}</span>

			${each(section.examples, example => `<div class="${[
		"row svelte-agypo9",
		(example.slug === active_section ? "active" : "") + " " + (isLoading ? "loading" : "")
	].join(" ").trim()}"><a href="${"examples#" + escape(example.slug)}" class="${[
		"row svelte-agypo9",
		(example.slug === active_section ? "active" : "") + " " + (isLoading ? "loading" : "")
	].join(" ").trim()}"><img class="${"thumbnail svelte-agypo9"}" alt="${escape(example.title) + " thumbnail"}" src="${"examples/thumbnails/" + escape(example.slug) + ".jpg"}">

						<span>${escape(example.title)}</span></a>
					${example.slug === active_section
	? `<a href="${"repl/" + escape(example.slug)}" class="${"repl-link svelte-agypo9"}">REPL</a>`
	: ``}
				</div>`)}
		</li>`)}</ul>`;
});

/* src/routes/examples/index.svelte generated by Svelte v3.31.0 */

const css$C = {
	code: ".examples-container.svelte-1eucojc{position:relative;height:calc(100vh - var(--nav-h));overflow:hidden;padding:0 0 42px 0;box-sizing:border-box}.viewport.svelte-1eucojc{display:grid;width:300%;height:100%;grid-template-columns:33.333% 66.666%;transition:transform .3s;grid-auto-rows:100%}.repl-container.loading.svelte-1eucojc{opacity:0.6}.repl-container.svelte-1eucojc .tab-content,.repl-container.svelte-1eucojc .tab-content.visible{pointer-events:all;opacity:1}.repl-container.svelte-1eucojc .tab-content{visibility:hidden}.repl-container.svelte-1eucojc .tab-content.visible{visibility:visible}.offset-1.svelte-1eucojc{transform:translate(-33.333%, 0)}.offset-2.svelte-1eucojc{transform:translate(-66.666%, 0)}@media(min-width: 768px){.examples-container.svelte-1eucojc{padding:0 }.viewport.svelte-1eucojc{width:100%;height:100%;display:grid;grid-template-columns:var(--sidebar-mid-w) auto;grid-auto-rows:100%;transition:none}.offset-1.svelte-1eucojc,.offset-2.svelte-1eucojc{transform:none}}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<!-- FIXME sometimes it adds a trailing slash when landing -->\\n<script context=\\\"module\\\">\\n\\texport async function preload() {\\n\\t\\tconst sections = await this.fetch(`examples.json`).then(r => r.json());\\n\\t\\tconst title_by_slug = sections.reduce((acc, {examples}) => {\\n\\t\\t\\texamples.forEach(({slug, title}) => {\\n\\t\\t\\t\\tacc[slug] = title;\\n\\t\\t\\t});\\n\\n\\t\\t\\treturn acc;\\n\\t\\t}, {});\\n\\n\\t\\treturn {sections, title_by_slug};\\n\\t}\\n</script>\\n\\n<script>\\n\\timport { onMount } from 'svelte';\\n\\timport { goto } from '@sapper/app';\\n\\timport Repl from '@sveltejs/svelte-repl';\\n\\n\\timport ScreenToggle from '../../components/ScreenToggle.svelte';\\n\\timport {\\n\\t\\tmapbox_setup, // see site/content/examples/15-context/00-context-api\\n\\t\\trollupUrl,\\n\\t\\tsvelteUrl\\n\\t} from '../../config';\\n\\timport { process_example } from '../../utils/examples';\\n\\timport { getFragment } from '@sveltejs/site-kit/utils/navigation';\\n\\timport TableOfContents from './_TableOfContents.svelte';\\n\\n\\texport let sections;\\n\\texport let title_by_slug;\\n\\n\\tlet active_slug;\\n\\tlet width;\\n\\tlet offset = 1;\\n\\tlet repl;\\n\\tlet isLoading = false;\\n\\tconst cache = {};\\n\\n\\tfunction showExampleCodeOnChange() {\\n\\t\\toffset = 1;\\n\\t}\\n\\n\\t$: title = title_by_slug[active_slug] || '';\\n\\t$: first_slug = sections[0].examples[0].slug;\\n\\t$: mobile = width < 768; // note: same as per media query below\\n\\t$: replOrientation = (mobile || width > 1080) ? 'columns' : 'rows';\\n\\t$: if (repl && active_slug) {\\n\\t\\tif (active_slug in cache) {\\n\\t\\t\\trepl.set({ components: cache[active_slug] });\\n\\t\\t\\tshowExampleCodeOnChange();\\n\\t\\t} else {\\n\\t\\t\\tisLoading = true;\\n\\t\\t\\tfetch(`examples/${active_slug}.json`)\\n\\t\\t\\t\\t.then(async response => {\\n\\t\\t\\t\\t\\tif (response.ok) {\\n\\t\\t\\t\\t\\t\\tconst {files} = await response.json();\\n\\t\\t\\t\\t\\t\\treturn process_example(files);\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t})\\n\\t\\t\\t\\t.then(components => {\\n\\t\\t\\t\\t\\tcache[active_slug] = components;\\n\\t\\t\\t\\t\\trepl.set({components});\\n\\t\\t\\t\\t\\tshowExampleCodeOnChange();\\n\\t\\t\\t\\t\\tisLoading = false;\\n\\t\\t\\t\\t})\\n\\t\\t\\t\\t.catch(() => {\\n\\t\\t\\t\\t\\tisLoading = false;\\n\\t\\t\\t\\t});\\n\\t\\t}\\n\\t}\\n\\n\\tonMount(() => {\\n\\t\\tconst onhashchange = () => {\\n\\t\\t\\tactive_slug = getFragment();\\n\\t\\t};\\n\\t\\twindow.addEventListener('hashchange', onhashchange, false);\\n\\n\\t\\tconst fragment = getFragment();\\n\\t\\tif (fragment) {\\n\\t\\t\\tactive_slug = fragment;\\n\\t\\t} else {\\n\\t\\t\\tactive_slug = first_slug;\\n\\t\\t\\tgoto(`examples#${active_slug}`);\\n\\t\\t}\\n\\n\\t\\treturn () => {\\n\\t\\t\\twindow.removeEventListener('hashchange', onhashchange, false);\\n\\t\\t};\\n\\t});\\n</script>\\n\\n<svelte:head>\\n\\t<title>{title} {title ? '•' : ''} Svelte Examples</title>\\n\\n\\t<meta name=\\\"twitter:title\\\" content=\\\"Svelte examples\\\">\\n\\t<meta name=\\\"twitter:description\\\" content=\\\"Cybernetically enhanced web apps\\\">\\n\\t<meta name=\\\"Description\\\" content=\\\"Interactive example Svelte apps\\\">\\n</svelte:head>\\n\\n<h1 class=\\\"visually-hidden\\\">Examples</h1>\\n<div class='examples-container' bind:clientWidth={width}>\\n\\t<div class=\\\"viewport offset-{offset}\\\">\\n\\t\\t<TableOfContents {sections} active_section={active_slug} {isLoading} />\\n\\t\\t<div class=\\\"repl-container\\\" class:loading={isLoading}>\\n\\t\\t\\t<Repl\\n\\t\\t\\t\\tbind:this={repl}\\n\\t\\t\\t\\tworkersUrl=\\\"workers\\\"\\n\\t\\t\\t\\t{svelteUrl}\\n\\t\\t\\t\\t{rollupUrl}\\n\\t\\t\\t\\torientation={replOrientation}\\n\\t\\t\\t\\tfixed={mobile}\\n\\t\\t\\t\\trelaxed\\n\\t\\t\\t\\tinjectedJS={mapbox_setup}\\n\\t\\t\\t/>\\n\\t\\t</div>\\n\\t</div>\\n\\t{#if mobile}\\n\\t<ScreenToggle bind:offset labels={['index', 'input', 'output']}/>\\n\\t{/if}\\n</div>\\n\\n<style>\\n\\t.examples-container {\\n\\t\\tposition: relative;\\n\\t\\theight: calc(100vh - var(--nav-h));\\n\\t\\toverflow: hidden;\\n\\t\\tpadding: 0 0 42px 0;\\n\\t\\tbox-sizing: border-box;\\n\\t}\\n\\n\\t.viewport {\\n\\t\\tdisplay: grid;\\n\\t\\twidth: 300%;\\n\\t\\theight: 100%;\\n\\t\\tgrid-template-columns: 33.333% 66.666%;\\n\\t\\ttransition: transform .3s;\\n\\t\\tgrid-auto-rows: 100%;\\n\\t}\\n\\n\\t.repl-container.loading {\\n\\t\\topacity: 0.6;\\n\\t}\\n\\n\\t/* temp fix for #2499 and #2550 while waiting for a fix for https://github.com/sveltejs/svelte-repl/issues/8 */\\n\\n\\t.repl-container :global(.tab-content),\\n\\t.repl-container :global(.tab-content.visible) {\\n\\t\\tpointer-events: all;\\n\\t\\topacity: 1;\\n\\t}\\n\\t.repl-container :global(.tab-content) {\\n\\t\\tvisibility: hidden;\\n\\t}\\n\\t.repl-container :global(.tab-content.visible) {\\n\\t\\tvisibility: visible;\\n\\t}\\n\\n\\t.offset-1 { transform: translate(-33.333%, 0); }\\n\\t.offset-2 { transform: translate(-66.666%, 0); }\\n\\n\\t@media (min-width: 768px) {\\n\\t\\t.examples-container { padding: 0 }\\n\\n\\t\\t.viewport {\\n\\t\\t\\twidth: 100%;\\n\\t\\t\\theight: 100%;\\n\\t\\t\\tdisplay: grid;\\n\\t\\t\\tgrid-template-columns: var(--sidebar-mid-w) auto;\\n\\t\\t\\tgrid-auto-rows: 100%;\\n\\t\\t\\ttransition: none;\\n\\t\\t}\\n\\n\\t\\t.offset-1, .offset-2 { transform: none; }\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA6HC,mBAAmB,eAAC,CAAC,AACpB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,OAAO,CAAC,CAAC,CAClC,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACnB,UAAU,CAAE,UAAU,AACvB,CAAC,AAED,SAAS,eAAC,CAAC,AACV,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,qBAAqB,CAAE,OAAO,CAAC,OAAO,CACtC,UAAU,CAAE,SAAS,CAAC,GAAG,CACzB,cAAc,CAAE,IAAI,AACrB,CAAC,AAED,eAAe,QAAQ,eAAC,CAAC,AACxB,OAAO,CAAE,GAAG,AACb,CAAC,AAID,8BAAe,CAAC,AAAQ,YAAY,AAAC,CACrC,8BAAe,CAAC,AAAQ,oBAAoB,AAAE,CAAC,AAC9C,cAAc,CAAE,GAAG,CACnB,OAAO,CAAE,CAAC,AACX,CAAC,AACD,8BAAe,CAAC,AAAQ,YAAY,AAAE,CAAC,AACtC,UAAU,CAAE,MAAM,AACnB,CAAC,AACD,8BAAe,CAAC,AAAQ,oBAAoB,AAAE,CAAC,AAC9C,UAAU,CAAE,OAAO,AACpB,CAAC,AAED,SAAS,eAAC,CAAC,AAAC,SAAS,CAAE,UAAU,QAAQ,CAAC,CAAC,CAAC,CAAC,AAAE,CAAC,AAChD,SAAS,eAAC,CAAC,AAAC,SAAS,CAAE,UAAU,QAAQ,CAAC,CAAC,CAAC,CAAC,AAAE,CAAC,AAEhD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,mBAAmB,eAAC,CAAC,AAAC,OAAO,CAAE,CAAC,CAAC,CAAC,AAElC,SAAS,eAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,IAAI,eAAe,CAAC,CAAC,IAAI,CAChD,cAAc,CAAE,IAAI,CACpB,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,wBAAS,CAAE,SAAS,eAAC,CAAC,AAAC,SAAS,CAAE,IAAI,AAAE,CAAC,AAC1C,CAAC\"}"
};

async function preload() {
	const sections = await this.fetch(`examples.json`).then(r => r.json());

	const title_by_slug = sections.reduce(
		(acc, { examples }) => {
			examples.forEach(({ slug, title }) => {
				acc[slug] = title;
			});

			return acc;
		},
		{}
	);

	return { sections, title_by_slug };
}

const Examples = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { sections } = $$props;
	let { title_by_slug } = $$props;
	let active_slug;
	let width;
	let offset = 1;
	let repl;
	let isLoading = false;
	const cache = {};

	function showExampleCodeOnChange() {
		offset = 1;
	}

	onMount(() => {
		const onhashchange = () => {
			active_slug = getFragment();
		};

		window.addEventListener("hashchange", onhashchange, false);
		const fragment = getFragment();

		if (fragment) {
			active_slug = fragment;
		} else {
			active_slug = first_slug;
			goto(`examples#${active_slug}`);
		}

		return () => {
			window.removeEventListener("hashchange", onhashchange, false);
		};
	});

	if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0) $$bindings.sections(sections);
	if ($$props.title_by_slug === void 0 && $$bindings.title_by_slug && title_by_slug !== void 0) $$bindings.title_by_slug(title_by_slug);
	$$result.css.add(css$C);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		let title;
		let first_slug;
		let mobile;
		let replOrientation;
		title = title_by_slug[active_slug] || "";
		first_slug = sections[0].examples[0].slug;
		mobile = width < 768; // note: same as per media query below
		replOrientation = mobile || width > 1080 ? "columns" : "rows";

		 {
			if (repl && active_slug) {
				if (active_slug in cache) {
					repl.set({ components: cache[active_slug] });
					showExampleCodeOnChange();
				} else {
					isLoading = true;

					fetch(`examples/${active_slug}.json`).then(async response => {
						if (response.ok) {
							const { files } = await response.json();
							return process_example(files);
						}
					}).then(components => {
						cache[active_slug] = components;
						repl.set({ components });
						showExampleCodeOnChange();
						isLoading = false;
					}).catch(() => {
						isLoading = false;
					});
				}
			}
		}

		$$rendered = `




${($$result.head += `${($$result.title = `<title>${escape(title)} ${escape(title ? "•" : "")} Svelte Examples</title>`, "")}<meta name="${"twitter:title"}" content="${"Svelte examples"}" data-svelte="svelte-1hcwu6s"><meta name="${"twitter:description"}" content="${"Cybernetically enhanced web apps"}" data-svelte="svelte-1hcwu6s"><meta name="${"Description"}" content="${"Interactive example Svelte apps"}" data-svelte="svelte-1hcwu6s">`, "")}

<h1 class="${"visually-hidden"}">Examples</h1>
<div class="${"examples-container svelte-1eucojc"}"><div class="${"viewport offset-" + escape(offset) + " svelte-1eucojc"}">${validate_component(TableOfContents, "TableOfContents").$$render(
			$$result,
			{
				sections,
				active_section: active_slug,
				isLoading
			},
			{},
			{}
		)}
		<div class="${["repl-container svelte-1eucojc", isLoading ? "loading" : ""].join(" ").trim()}">${validate_component(Repl, "Repl").$$render(
			$$result,
			{
				workersUrl: "workers",
				svelteUrl,
				rollupUrl,
				orientation: replOrientation,
				fixed: mobile,
				relaxed: true,
				injectedJS: mapbox_setup,
				this: repl
			},
			{
				this: $$value => {
					repl = $$value;
					$$settled = false;
				}
			},
			{}
		)}</div></div>
	${mobile
		? `${validate_component(ScreenToggle, "ScreenToggle").$$render(
				$$result,
				{
					labels: ["index", "input", "output"],
					offset
				},
				{
					offset: $$value => {
						offset = $$value;
						$$settled = false;
					}
				},
				{}
			)}`
		: ``}
</div>`;
	} while (!$$settled);

	return $$rendered;
});

var component_1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Examples,
	preload: preload
});

/* src/routes/tutorial/_layout.svelte generated by Svelte v3.31.0 */

async function preload$1() {
	const sections = await this.fetch(`tutorial.json`).then(r => r.json());
	return { sections };
}

const Layout$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { sections } = $$props;
	setContext("tutorial", { sections });
	if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0) $$bindings.sections(sections);
	return `${slots.default ? slots.default({}) : ``}`;
});

var component_2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Layout$1,
	preload: preload$1
});

/* src/routes/tutorial/index.svelte generated by Svelte v3.31.0 */

function preload$2() {
	this.redirect(301, "tutorial/basics");
}

const Tutorial = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return ``;
});

var component_3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Tutorial,
	preload: preload$2
});

/* src/routes/tutorial/[slug]/_TableOfContents.svelte generated by Svelte v3.31.0 */

const css$D = {
	code: "nav.svelte-faku86{display:grid;grid-template-columns:2.5em 1fr 2.5em;border-bottom:1px solid rgba(255,255,255,0.1)}div.svelte-faku86{position:relative;padding:1em 0.5em;font-weight:300;font-size:var(--h6);color:white}a.svelte-faku86{display:block;padding:0.7em 0;text-align:center;opacity:0.75;color:white}a.svelte-faku86:hover{opacity:1}a.disabled.svelte-faku86,a.disabled.svelte-faku86:hover,a.disabled.svelte-faku86:active{color:white;opacity:0.3}span.svelte-faku86{white-space:nowrap;position:relative;top:0.3em}strong.svelte-faku86{opacity:0.7 }select.svelte-faku86{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0.0001;cursor:pointer;-webkit-appearance:none}",
	map: "{\"version\":3,\"file\":\"_TableOfContents.svelte\",\"sources\":[\"_TableOfContents.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { goto } from '@sapper/app';\\n\\timport { Icon } from '@sveltejs/site-kit';\\n\\n\\texport let sections;\\n\\texport let slug;\\n\\texport let selected;\\n\\n\\tfunction navigate(e) {\\n\\t\\tgoto(`tutorial/${e.target.value}`);\\n\\t}\\n</script>\\n\\n<style>\\n\\tnav {\\n\\t\\tdisplay: grid;\\n\\t\\tgrid-template-columns: 2.5em 1fr 2.5em;\\n\\t\\tborder-bottom: 1px solid rgba(255,255,255,0.1);\\n\\t}\\n\\n\\tdiv {\\n\\t\\tposition: relative;\\n\\t\\tpadding: 1em 0.5em;\\n\\t\\tfont-weight: 300;\\n\\t\\tfont-size: var(--h6);\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\ta {\\n\\t\\tdisplay: block;\\n\\t\\tpadding: 0.7em 0;\\n\\t\\ttext-align: center;\\n\\t\\topacity: 0.75;\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\ta:hover {\\n\\t\\topacity: 1;\\n\\t}\\n\\n\\ta.disabled, a.disabled:hover, a.disabled:active {\\n\\t\\tcolor: white;\\n\\t\\topacity: 0.3;\\n\\t}\\n\\n\\tspan {\\n\\t\\twhite-space: nowrap;\\n\\t\\tposition: relative;\\n    \\ttop: 0.3em;\\n\\t}\\n\\n\\tstrong { opacity: 0.7 }\\n\\n\\tselect {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\topacity: 0.0001;\\n\\t\\tcursor: pointer;\\n\\t\\t-webkit-appearance: none;\\n\\t}\\n</style>\\n\\n<nav>\\n\\t<a rel=\\\"prefetch\\\" aria-label=\\\"Previous tutorial step\\\" class=\\\"no-underline\\\" href=\\\"tutorial/{(selected.prev || selected).slug}\\\" class:disabled={!selected.prev}>\\n\\t\\t<Icon name=\\\"arrow-left\\\" />\\n\\t</a>\\n\\n\\t<div>\\n\\t\\t<span>\\n\\t\\t\\t<strong>\\n\\t\\t\\t\\t<span style=\\\"position: relative; top: -0.1em; margin: 0 0.5em 0 0\\\"><Icon name=\\\"menu\\\"/></span>\\n\\t\\t\\t\\t{selected.section.title} /\\n\\t\\t\\t</strong>\\n\\t\\t\\t{selected.chapter.title}\\n\\t\\t</span>\\n\\n\\t\\t<select value={slug} on:change={navigate}>\\n\\t\\t\\t{#each sections as section, i}\\n\\t\\t\\t\\t<optgroup label=\\\"{i + 1}. {section.title}\\\">\\n\\t\\t\\t\\t\\t{#each section.chapters as chapter, i}\\n\\t\\t\\t\\t\\t\\t<option value={chapter.slug}>{String.fromCharCode(i + 97)}. {chapter.title}</option>\\n\\t\\t\\t\\t\\t{/each}\\n\\t\\t\\t\\t</optgroup>\\n\\t\\t\\t{/each}\\n\\t\\t</select>\\n\\t</div>\\n\\n\\t<a rel=\\\"prefetch\\\" aria-label=\\\"Next tutorial step\\\" class=\\\"no-underline\\\" href=\\\"tutorial/{(selected.next || selected).slug}\\\" class:disabled={!selected.next}>\\n\\t\\t<Icon name=\\\"arrow-right\\\" />\\n\\t</a>\\n</nav>\\n\"],\"names\":[],\"mappings\":\"AAcC,GAAG,cAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,KAAK,CAAC,GAAG,CAAC,KAAK,CACtC,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,AAC/C,CAAC,AAED,GAAG,cAAC,CAAC,AACJ,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GAAG,CAAC,KAAK,CAClB,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,KAAK,CAAE,KAAK,AACb,CAAC,AAED,CAAC,cAAC,CAAC,AACF,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,KAAK,CAAC,CAAC,CAChB,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,KAAK,AACb,CAAC,AAED,eAAC,MAAM,AAAC,CAAC,AACR,OAAO,CAAE,CAAC,AACX,CAAC,AAED,CAAC,uBAAS,CAAE,CAAC,uBAAS,MAAM,CAAE,CAAC,uBAAS,OAAO,AAAC,CAAC,AAChD,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,GAAG,AACb,CAAC,AAED,IAAI,cAAC,CAAC,AACL,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,CACf,GAAG,CAAE,KAAK,AACd,CAAC,AAED,MAAM,cAAC,CAAC,AAAC,OAAO,CAAE,GAAG,CAAC,CAAC,AAEvB,MAAM,cAAC,CAAC,AACP,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,MAAM,CACf,MAAM,CAAE,OAAO,CACf,kBAAkB,CAAE,IAAI,AACzB,CAAC\"}"
};

const TableOfContents$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { sections } = $$props;
	let { slug } = $$props;
	let { selected } = $$props;

	if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0) $$bindings.sections(sections);
	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);
	if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0) $$bindings.selected(selected);
	$$result.css.add(css$D);

	return `<nav class="${"svelte-faku86"}"><a rel="${"prefetch"}" aria-label="${"Previous tutorial step"}" class="${["no-underline svelte-faku86", !selected.prev ? "disabled" : ""].join(" ").trim()}" href="${"tutorial/" + escape((selected.prev || selected).slug)}">${validate_component(Icon, "Icon").$$render($$result, { name: "arrow-left" }, {}, {})}</a>

	<div class="${"svelte-faku86"}"><span class="${"svelte-faku86"}"><strong class="${"svelte-faku86"}"><span style="${"position: relative; top: -0.1em; margin: 0 0.5em 0 0"}" class="${"svelte-faku86"}">${validate_component(Icon, "Icon").$$render($$result, { name: "menu" }, {}, {})}</span>
				${escape(selected.section.title)} /
			</strong>
			${escape(selected.chapter.title)}</span>

		<select${add_attribute("value", slug, 0)} class="${"svelte-faku86"}">${each(sections, (section, i) => `<optgroup label="${escape(i + 1) + ". " + escape(section.title)}">${each(section.chapters, (chapter, i) => `<option${add_attribute("value", chapter.slug, 0)}>${escape(String.fromCharCode(i + 97))}. ${escape(chapter.title)}</option>`)}</optgroup>`)}</select></div>

	<a rel="${"prefetch"}" aria-label="${"Next tutorial step"}" class="${["no-underline svelte-faku86", !selected.next ? "disabled" : ""].join(" ").trim()}" href="${"tutorial/" + escape((selected.next || selected).slug)}">${validate_component(Icon, "Icon").$$render($$result, { name: "arrow-right" }, {}, {})}</a></nav>`;
});

/* src/routes/tutorial/[slug]/index.svelte generated by Svelte v3.31.0 */
// needed for context API tutorial

const css$E = {
	code: ".tutorial-outer.svelte-i3ph1f.svelte-i3ph1f{position:relative;height:calc(100vh - var(--nav-h));overflow:hidden;padding:0 0 42px 0;box-sizing:border-box}.viewport.svelte-i3ph1f.svelte-i3ph1f{display:grid;width:300%;height:100%;grid-template-columns:33.333% 66.666%;transition:transform .3s;grid-auto-rows:100%}.offset-1.svelte-i3ph1f.svelte-i3ph1f{transform:translate(-33.333%, 0)}.offset-2.svelte-i3ph1f.svelte-i3ph1f{transform:translate(-66.666%, 0)}@media(min-width: 768px){.tutorial-outer.svelte-i3ph1f.svelte-i3ph1f{padding:0 }.viewport.svelte-i3ph1f.svelte-i3ph1f{width:100%;height:100%;display:grid;grid-template-columns:minmax(33.333%, var(--sidebar-large-w)) auto;grid-auto-rows:100%;transition:none}.offset-1.svelte-i3ph1f.svelte-i3ph1f,.offset-2.svelte-i3ph1f.svelte-i3ph1f{transform:none}}.tutorial-text.svelte-i3ph1f.svelte-i3ph1f{display:flex;flex-direction:column;height:100%;border-right:1px solid var(--second);background-color:var(--second);color:var(--sidebar-text)}.chapter-markup.svelte-i3ph1f.svelte-i3ph1f{padding:3.2rem 4rem;overflow:auto;flex:1;height:0}.chapter-markup.svelte-i3ph1f h2{margin:4rem 0 1.6rem 0;font-size:var(--h3);line-height:1;font-weight:400;color:white}.chapter-markup.svelte-i3ph1f h2:first-child{margin-top:.4rem}.chapter-markup.svelte-i3ph1f a{color:var(--sidebar-text)}.chapter-markup.svelte-i3ph1f a:hover{color:white}.chapter-markup.svelte-i3ph1f ul{padding:0 0 0 2em}.chapter-markup.svelte-i3ph1f blockquote{background-color:rgba(0,0,0,.17);color:var(--sidebar-text)}.chapter-markup.svelte-i3ph1f.svelte-i3ph1f::-webkit-scrollbar{background-color:var(--second);width:8px}.chapter-markup.svelte-i3ph1f.svelte-i3ph1f::-webkit-scrollbar-thumb{background-color:rgba(255,255,255,.7);border-radius:1em}.chapter-markup.svelte-i3ph1f p>code,.chapter-markup.svelte-i3ph1f ul code{color:var(--sidebar-text);background:rgba(0,0,0,.12);padding:.2em .4em .3em;white-space:nowrap;position:relative;top:-0.1em}.controls.svelte-i3ph1f.svelte-i3ph1f{border-top:1px solid rgba(255,255,255,.15);padding:1em 0 0 0;display:flex}.show.svelte-i3ph1f.svelte-i3ph1f{background:var(--prime);padding:.3em .7em;border-radius:var(--border-r);top:.1em;position:relative;font-size:var(--h5);font-weight:300;color:rgba(255,255,255,0.7)}.show.svelte-i3ph1f.svelte-i3ph1f:hover{color:white}a.next.svelte-i3ph1f.svelte-i3ph1f{padding-right:1.2em;background:no-repeat 100% 50% url(/icons/arrow-right.svg);background-size:1em 1em;margin-left:auto}.improve-chapter.svelte-i3ph1f.svelte-i3ph1f{padding:1em 0 .5em 0}.improve-chapter.svelte-i3ph1f a.svelte-i3ph1f{padding:0 .1em;font-size:14px;text-decoration:none;opacity:.3;padding-left:1.2em;background:no-repeat 0 50% url(/icons/edit.svg);background-size:1em 1em}.improve-chapter.svelte-i3ph1f a.svelte-i3ph1f:hover{opacity:1}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\texport async function preload({ params }) {\\n\\t\\tconst res = await this.fetch(`tutorial/${params.slug}.json`);\\n\\n\\t\\tif (!res.ok) {\\n\\t\\t\\treturn this.redirect(301, `tutorial/basics`);\\n\\t\\t}\\n\\n\\t\\treturn {\\n\\t\\t\\tslug: params.slug,\\n\\t\\t\\tchapter: await res.json()\\n\\t\\t};\\n\\t}\\n</script>\\n\\n<script>\\n\\timport Repl from '@sveltejs/svelte-repl';\\n\\timport { getContext } from 'svelte';\\n\\n\\timport ScreenToggle from '../../../components/ScreenToggle.svelte';\\n\\timport TableOfContents from './_TableOfContents.svelte';\\n\\n\\timport {\\n\\t\\tmapbox_setup, // needed for context API tutorial\\n\\t\\trollupUrl,\\n\\t\\tsvelteUrl\\n\\t} from '../../../config';\\n\\n\\texport let slug;\\n\\texport let chapter;\\n\\n\\tconst { sections } = getContext('tutorial');\\n\\n\\tlet repl;\\n\\tlet prev;\\n\\tlet scrollable;\\n\\tconst lookup = new Map();\\n\\n\\tlet width = false ? window.innerWidth : 1000;\\n\\tlet offset = 0;\\n\\n\\tsections.forEach(section => {\\n\\t\\tsection.chapters.forEach(chapter => {\\n\\t\\t\\tconst obj = {\\n\\t\\t\\t\\tslug: chapter.slug,\\n\\t\\t\\t\\tsection,\\n\\t\\t\\t\\tchapter,\\n\\t\\t\\t\\tprev\\n\\t\\t\\t};\\n\\n\\t\\t\\tlookup.set(chapter.slug, obj);\\n\\n\\t\\t\\tif (false) { // pending https://github.com/sveltejs/svelte/issues/2135\\n\\t\\t\\t\\tif (prev) prev.next = obj;\\n\\t\\t\\t\\tprev = obj;\\n\\t\\t\\t}\\n\\t\\t});\\n\\t});\\n\\n\\t// TODO is there a non-hacky way to trigger scroll when chapter changes?\\n\\t$: if (scrollable) chapter, scrollable.scrollTo(0, 0);\\n\\n\\t// TODO: this will need to be changed to the master branch, and probably should be dynamic instead of included\\n\\t//   here statically\\n\\tconst tutorial_repo_link = 'https://github.com/sveltejs/svelte/tree/master/site/content/tutorial';\\n\\n\\t$: selected = lookup.get(slug);\\n\\t$: improve_link = `${tutorial_repo_link}/${selected.chapter.section_dir}/${selected.chapter.chapter_dir}`;\\n\\n\\tconst clone = file => ({\\n\\t\\tname: file.name,\\n\\t\\ttype: file.type,\\n\\t\\tsource: file.source\\n\\t});\\n\\n\\t$: if (repl) {\\n\\t\\tcompleted = false;\\n\\t\\trepl.set({\\n\\t\\t\\tcomponents: chapter.app_a.map(clone)\\n\\t\\t});\\n\\t}\\n\\n\\t$: mobile = width < 768;\\n\\n\\tfunction reset() {\\n\\t\\trepl.update({\\n\\t\\t\\tcomponents: chapter.app_a.map(clone)\\n\\t\\t});\\n\\t}\\n\\n\\tfunction complete() {\\n\\t\\trepl.update({\\n\\t\\t\\tcomponents: chapter.app_b.map(clone)\\n\\t\\t});\\n\\t}\\n\\n\\tlet completed = false;\\n\\n\\tfunction handle_change(event) {\\n\\t\\tcompleted = event.detail.components.every((file, i) => {\\n\\t\\t\\tconst expected = chapter.app_b[i];\\n\\t\\t\\treturn expected && (\\n\\t\\t\\t\\tfile.name === expected.name &&\\n\\t\\t\\t\\tfile.type === expected.type &&\\n\\t\\t\\t\\tfile.source.trim().replace(/\\\\s+$/gm, '') === expected.source.trim().replace(/\\\\s+$/gm, '')\\n\\t\\t\\t);\\n\\t\\t});\\n\\t}\\n</script>\\n\\n<style>\\n\\t.tutorial-outer {\\n\\t\\tposition: relative;\\n\\t\\theight: calc(100vh - var(--nav-h));\\n\\t\\toverflow: hidden;\\n\\t\\tpadding: 0 0 42px 0;\\n\\t\\tbox-sizing: border-box;\\n\\t}\\n\\n\\t.viewport {\\n\\t\\tdisplay: grid;\\n\\t\\twidth: 300%;\\n\\t\\theight: 100%;\\n\\t\\tgrid-template-columns: 33.333% 66.666%;\\n\\t\\ttransition: transform .3s;\\n\\t\\tgrid-auto-rows: 100%;\\n\\t}\\n\\n\\t.offset-1 { transform: translate(-33.333%, 0); }\\n\\t.offset-2 { transform: translate(-66.666%, 0); }\\n\\n\\t@media (min-width: 768px) {\\n\\t\\t.tutorial-outer { padding: 0 }\\n\\n\\t\\t.viewport {\\n\\t\\t\\twidth: 100%;\\n\\t\\t\\theight: 100%;\\n\\t\\t\\tdisplay: grid;\\n\\t\\t\\tgrid-template-columns: minmax(33.333%, var(--sidebar-large-w)) auto;\\n\\t\\t\\tgrid-auto-rows: 100%;\\n\\t\\t\\ttransition: none;\\n\\t\\t}\\n\\n\\t\\t.offset-1, .offset-2 { transform: none; }\\n\\t}\\n\\n\\t.tutorial-text {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\theight: 100%;\\n\\t\\tborder-right: 1px solid var(--second);\\n\\t\\tbackground-color: var(--second);\\n\\t\\tcolor: var(--sidebar-text);\\n\\t}\\n\\n\\t.chapter-markup {\\n\\t\\tpadding: 3.2rem 4rem;\\n\\t\\toverflow: auto;\\n\\t\\tflex: 1;\\n\\t\\theight: 0;\\n\\t}\\n\\n\\t.chapter-markup :global(h2) {\\n\\t\\tmargin: 4rem 0 1.6rem 0;\\n\\t\\tfont-size: var(--h3);\\n\\t\\tline-height: 1;\\n\\t\\tfont-weight: 400;\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\t.chapter-markup :global(h2:first-child) {\\n\\t\\tmargin-top: .4rem;\\n\\t}\\n\\n\\t.chapter-markup :global(a) {\\n\\t\\tcolor: var(--sidebar-text);\\n\\t}\\n\\n\\t.chapter-markup :global(a:hover) {\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\n\\t.chapter-markup :global(ul) {\\n\\t\\tpadding: 0 0 0 2em;\\n\\t}\\n\\n\\t.chapter-markup :global(blockquote) {\\n\\t\\tbackground-color: rgba(0,0,0,.17);\\n\\t\\tcolor: var(--sidebar-text);\\n\\t}\\n\\n\\t.chapter-markup::-webkit-scrollbar {\\n\\t\\tbackground-color: var(--second);\\n\\t\\twidth: 8px;\\n\\t}\\n\\n\\t.chapter-markup::-webkit-scrollbar-thumb {\\n\\t\\tbackground-color: rgba(255,255,255,.7);\\n\\t\\tborder-radius: 1em;\\n\\t}\\n\\n\\t.chapter-markup :global(p) > :global(code),\\n\\t.chapter-markup :global(ul) :global(code) {\\n\\t\\tcolor: var(--sidebar-text);\\n\\t\\tbackground: rgba(0,0,0,.12);\\n\\t\\tpadding: .2em .4em .3em;\\n\\t\\twhite-space: nowrap;\\n\\t\\tposition: relative;\\n\\t\\ttop: -0.1em;\\n\\t}\\n\\n\\t.controls {\\n\\t\\tborder-top: 1px solid rgba(255,255,255,.15);\\n\\t\\tpadding: 1em 0 0 0;\\n\\t\\tdisplay: flex;\\n\\t}\\n\\n\\t.show {\\n\\t\\tbackground: var(--prime);\\n\\t\\tpadding: .3em .7em;\\n\\t\\tborder-radius: var(--border-r);\\n\\t\\ttop: .1em;\\n\\t\\tposition: relative;\\n\\t\\tfont-size: var(--h5);\\n\\t\\tfont-weight: 300;\\n\\t\\tcolor: rgba(255,255,255,0.7);\\n\\t}\\n\\n\\t.show:hover {\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\ta.next {\\n\\t\\tpadding-right: 1.2em;\\n\\t\\tbackground: no-repeat 100% 50% url(/icons/arrow-right.svg);\\n\\t\\tbackground-size: 1em 1em;\\n\\t\\tmargin-left: auto;\\n\\t}\\n\\n\\t.improve-chapter {\\n\\t\\tpadding: 1em 0 .5em 0;\\n\\t}\\n\\n\\t.improve-chapter a {\\n\\t\\tpadding: 0 .1em;\\n\\t\\tfont-size: 14px;\\n\\t\\ttext-decoration: none;\\n\\t\\topacity: .3;\\n\\t\\tpadding-left: 1.2em;\\n\\t\\tbackground: no-repeat 0 50% url(/icons/edit.svg);\\n\\t\\tbackground-size: 1em 1em;\\n\\t}\\n\\n\\t.improve-chapter a:hover {\\n\\t\\topacity: 1;\\n\\t}\\n</style>\\n\\n<svelte:head>\\n\\t<title>{selected.section.title} / {selected.chapter.title} • Svelte Tutorial</title>\\n\\n\\t<meta name=\\\"twitter:title\\\" content=\\\"Svelte tutorial\\\">\\n\\t<meta name=\\\"twitter:description\\\" content=\\\"{selected.section.title} / {selected.chapter.title}\\\">\\n\\t<meta name=\\\"Description\\\" content=\\\"{selected.section.title} / {selected.chapter.title}\\\">\\n</svelte:head>\\n\\n<svelte:window bind:innerWidth={width}/>\\n\\n<div class=\\\"tutorial-outer\\\">\\n\\t<div class=\\\"viewport offset-{offset}\\\">\\n\\t\\t<div class=\\\"tutorial-text\\\">\\n\\t\\t\\t<div class=\\\"table-of-contents\\\">\\n\\t\\t\\t\\t<TableOfContents {sections} {slug} {selected}/>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<div class=\\\"chapter-markup\\\" bind:this={scrollable}>\\n\\t\\t\\t\\t{@html chapter.html}\\n\\n\\t\\t\\t\\t<div class=\\\"controls\\\">\\n\\t\\t\\t\\t\\t{#if chapter.app_b}\\n\\t\\t\\t\\t\\t\\t<!-- TODO disable this button when the contents of the REPL\\n\\t\\t\\t\\t\\t\\t\\tmatches the expected end result -->\\n\\t\\t\\t\\t\\t\\t<button class=\\\"show\\\" on:click=\\\"{() => completed ? reset() : complete()}\\\">\\n\\t\\t\\t\\t\\t\\t\\t{completed ? 'Reset' : 'Show me'}\\n\\t\\t\\t\\t\\t\\t</button>\\n\\t\\t\\t\\t\\t{/if}\\n\\n\\t\\t\\t\\t\\t{#if selected.next}\\n\\t\\t\\t\\t\\t\\t<a class=\\\"next\\\" href=\\\"tutorial/{selected.next.slug}\\\">Next</a>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\n\\t\\t\\t\\t<div class=\\\"improve-chapter\\\">\\n\\t\\t\\t\\t\\t<a class=\\\"no-underline\\\" href={improve_link}>Edit this chapter</a>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\\"tutorial-repl\\\">\\n\\t\\t\\t<Repl\\n\\t\\t\\t\\tbind:this={repl}\\n\\t\\t\\t\\tworkersUrl=\\\"workers\\\"\\n\\t\\t\\t\\t{svelteUrl}\\n\\t\\t\\t\\t{rollupUrl}\\n\\t\\t\\t\\torientation={mobile ? 'columns' : 'rows'}\\n\\t\\t\\t\\tfixed={mobile}\\n\\t\\t\\t\\ton:change={handle_change}\\n\\t\\t\\t\\tinjectedJS={mapbox_setup}\\n\\t\\t\\t\\trelaxed\\n\\t\\t\\t/>\\n\\t\\t</div>\\n\\t</div>\\n\\n\\t{#if mobile}\\n\\t\\t<ScreenToggle bind:offset labels={['tutorial', 'input', 'output']}/>\\n\\t{/if}\\n</div>\\n\"],\"names\":[],\"mappings\":\"AA+GC,eAAe,4BAAC,CAAC,AAChB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,OAAO,CAAC,CAAC,CAClC,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACnB,UAAU,CAAE,UAAU,AACvB,CAAC,AAED,SAAS,4BAAC,CAAC,AACV,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,qBAAqB,CAAE,OAAO,CAAC,OAAO,CACtC,UAAU,CAAE,SAAS,CAAC,GAAG,CACzB,cAAc,CAAE,IAAI,AACrB,CAAC,AAED,SAAS,4BAAC,CAAC,AAAC,SAAS,CAAE,UAAU,QAAQ,CAAC,CAAC,CAAC,CAAC,AAAE,CAAC,AAChD,SAAS,4BAAC,CAAC,AAAC,SAAS,CAAE,UAAU,QAAQ,CAAC,CAAC,CAAC,CAAC,AAAE,CAAC,AAEhD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,eAAe,4BAAC,CAAC,AAAC,OAAO,CAAE,CAAC,CAAC,CAAC,AAE9B,SAAS,4BAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,OAAO,OAAO,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,IAAI,CACnE,cAAc,CAAE,IAAI,CACpB,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,qCAAS,CAAE,SAAS,4BAAC,CAAC,AAAC,SAAS,CAAE,IAAI,AAAE,CAAC,AAC1C,CAAC,AAED,cAAc,4BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,CACrC,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,KAAK,CAAE,IAAI,cAAc,CAAC,AAC3B,CAAC,AAED,eAAe,4BAAC,CAAC,AAChB,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,QAAQ,CAAE,IAAI,CACd,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,AACV,CAAC,AAED,6BAAe,CAAC,AAAQ,EAAE,AAAE,CAAC,AAC5B,MAAM,CAAE,IAAI,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACvB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,WAAW,CAAE,CAAC,CACd,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,KAAK,AACb,CAAC,AAED,6BAAe,CAAC,AAAQ,cAAc,AAAE,CAAC,AACxC,UAAU,CAAE,KAAK,AAClB,CAAC,AAED,6BAAe,CAAC,AAAQ,CAAC,AAAE,CAAC,AAC3B,KAAK,CAAE,IAAI,cAAc,CAAC,AAC3B,CAAC,AAED,6BAAe,CAAC,AAAQ,OAAO,AAAE,CAAC,AACjC,KAAK,CAAE,KAAK,AACb,CAAC,AAGD,6BAAe,CAAC,AAAQ,EAAE,AAAE,CAAC,AAC5B,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,AACnB,CAAC,AAED,6BAAe,CAAC,AAAQ,UAAU,AAAE,CAAC,AACpC,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACjC,KAAK,CAAE,IAAI,cAAc,CAAC,AAC3B,CAAC,AAED,2CAAe,mBAAmB,AAAC,CAAC,AACnC,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,KAAK,CAAE,GAAG,AACX,CAAC,AAED,2CAAe,yBAAyB,AAAC,CAAC,AACzC,gBAAgB,CAAE,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,EAAE,CAAC,CACtC,aAAa,CAAE,GAAG,AACnB,CAAC,AAED,6BAAe,CAAC,AAAQ,CAAC,AAAC,CAAW,IAAI,AAAC,CAC1C,6BAAe,CAAC,AAAQ,EAAE,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AAC1C,KAAK,CAAE,IAAI,cAAc,CAAC,CAC1B,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAC3B,OAAO,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CACvB,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,MAAM,AACZ,CAAC,AAED,SAAS,4BAAC,CAAC,AACV,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAC3C,OAAO,CAAE,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAClB,OAAO,CAAE,IAAI,AACd,CAAC,AAED,KAAK,4BAAC,CAAC,AACN,UAAU,CAAE,IAAI,OAAO,CAAC,CACxB,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,aAAa,CAAE,IAAI,UAAU,CAAC,CAC9B,GAAG,CAAE,IAAI,CACT,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,AAC7B,CAAC,AAED,iCAAK,MAAM,AAAC,CAAC,AACZ,KAAK,CAAE,KAAK,AACb,CAAC,AAED,CAAC,KAAK,4BAAC,CAAC,AACP,aAAa,CAAE,KAAK,CACpB,UAAU,CAAE,SAAS,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,sBAAsB,CAAC,CAC1D,eAAe,CAAE,GAAG,CAAC,GAAG,CACxB,WAAW,CAAE,IAAI,AAClB,CAAC,AAED,gBAAgB,4BAAC,CAAC,AACjB,OAAO,CAAE,GAAG,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,AACtB,CAAC,AAED,8BAAgB,CAAC,CAAC,cAAC,CAAC,AACnB,OAAO,CAAE,CAAC,CAAC,IAAI,CACf,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,IAAI,CACrB,OAAO,CAAE,EAAE,CACX,YAAY,CAAE,KAAK,CACnB,UAAU,CAAE,SAAS,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,eAAe,CAAC,CAChD,eAAe,CAAE,GAAG,CAAC,GAAG,AACzB,CAAC,AAED,8BAAgB,CAAC,eAAC,MAAM,AAAC,CAAC,AACzB,OAAO,CAAE,CAAC,AACX,CAAC\"}"
};

async function preload$3({ params }) {
	const res = await this.fetch(`tutorial/${params.slug}.json`);

	if (!res.ok) {
		return this.redirect(301, `tutorial/basics`);
	}

	return {
		slug: params.slug,
		chapter: await res.json()
	};
}

const tutorial_repo_link = "https://github.com/sveltejs/svelte/tree/master/site/content/tutorial";

const U5Bslugu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { slug } = $$props;
	let { chapter } = $$props;
	const { sections } = getContext("tutorial");
	let repl;
	let prev;
	let scrollable;
	const lookup = new Map();
	let width =  1000;
	let offset = 0;

	sections.forEach(section => {
		section.chapters.forEach(chapter => {
			const obj = {
				slug: chapter.slug,
				section,
				chapter,
				prev
			};

			lookup.set(chapter.slug, obj);
		});
	});

	const clone = file => ({
		name: file.name,
		type: file.type,
		source: file.source
	});

	let completed = false;

	if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0) $$bindings.slug(slug);
	if ($$props.chapter === void 0 && $$bindings.chapter && chapter !== void 0) $$bindings.chapter(chapter);
	$$result.css.add(css$E);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		let selected;
		let improve_link;
		let mobile;

		selected = lookup.get(slug);
		improve_link = `${tutorial_repo_link}/${selected.chapter.section_dir}/${selected.chapter.chapter_dir}`;

		 {
			if (repl) {
				completed = false;
				repl.set({ components: chapter.app_a.map(clone) });
			}
		}

		mobile = width < 768;

		$$rendered = `${($$result.head += `${($$result.title = `<title>${escape(selected.section.title)} / ${escape(selected.chapter.title)} • Svelte Tutorial</title>`, "")}<meta name="${"twitter:title"}" content="${"Svelte tutorial"}" data-svelte="svelte-1xptfdv"><meta name="${"twitter:description"}" content="${escape(selected.section.title) + " / " + escape(selected.chapter.title)}" data-svelte="svelte-1xptfdv"><meta name="${"Description"}" content="${escape(selected.section.title) + " / " + escape(selected.chapter.title)}" data-svelte="svelte-1xptfdv">`, "")}



<div class="${"tutorial-outer svelte-i3ph1f"}"><div class="${"viewport offset-" + escape(offset) + " svelte-i3ph1f"}"><div class="${"tutorial-text svelte-i3ph1f"}"><div class="${"table-of-contents"}">${validate_component(TableOfContents$1, "TableOfContents").$$render($$result, { sections, slug, selected }, {}, {})}</div>

			<div class="${"chapter-markup svelte-i3ph1f"}"${add_attribute("this", scrollable, 1)}>${chapter.html}

				<div class="${"controls svelte-i3ph1f"}">${chapter.app_b
		? `
						<button class="${"show svelte-i3ph1f"}">${escape(completed ? "Reset" : "Show me")}</button>`
		: ``}

					${selected.next
		? `<a class="${"next svelte-i3ph1f"}" href="${"tutorial/" + escape(selected.next.slug)}">Next</a>`
		: ``}</div>

				<div class="${"improve-chapter svelte-i3ph1f"}"><a class="${"no-underline svelte-i3ph1f"}"${add_attribute("href", improve_link, 0)}>Edit this chapter</a></div></div></div>

		<div class="${"tutorial-repl"}">${validate_component(Repl, "Repl").$$render(
			$$result,
			{
				workersUrl: "workers",
				svelteUrl,
				rollupUrl,
				orientation: mobile ? "columns" : "rows",
				fixed: mobile,
				injectedJS: mapbox_setup,
				relaxed: true,
				this: repl
			},
			{
				this: $$value => {
					repl = $$value;
					$$settled = false;
				}
			},
			{}
		)}</div></div>

	${mobile
		? `${validate_component(ScreenToggle, "ScreenToggle").$$render(
				$$result,
				{
					labels: ["tutorial", "input", "output"],
					offset
				},
				{
					offset: $$value => {
						offset = $$value;
						$$settled = false;
					}
				},
				{}
			)}`
		: ``}</div>`;
	} while (!$$settled);

	return $$rendered;
});

var component_4 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': U5Bslugu5D,
	preload: preload$3
});

/* src/routes/apps/index.svelte generated by Svelte v3.31.0 */

const css$F = {
	code: ".apps.svelte-1a795bd.svelte-1a795bd{padding:var(--top-offset) var(--side-nav) 6rem var(--side-nav);max-width:var(--main-width);margin:0 auto}header.svelte-1a795bd.svelte-1a795bd{margin:0 0 1em 0}h1.svelte-1a795bd.svelte-1a795bd{font-size:4rem;font-weight:400}.user.svelte-1a795bd.svelte-1a795bd{display:flex;padding:0 0 0 3.2rem;position:relative;margin:1rem 0 5rem 0;color:var(--text)}.avatar.svelte-1a795bd.svelte-1a795bd{position:absolute;left:0;top:0.1rem;width:2.4rem;height:2.4rem;border:1px solid rgba(0,0,0,0.3);border-radius:0.2rem}ul.svelte-1a795bd.svelte-1a795bd{list-style:none}li.svelte-1a795bd.svelte-1a795bd{margin:0 0 1em 0}h2.svelte-1a795bd.svelte-1a795bd{color:var(--text);font-size:var(--h3);font-weight:400}li.svelte-1a795bd a.svelte-1a795bd{border:none}li.svelte-1a795bd a:hover h2.svelte-1a795bd{color:var(--flash)}li.svelte-1a795bd span.svelte-1a795bd{font-size:14px;color:#999}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\texport async function preload(page, { user }) {\\n\\t\\tlet apps = [];\\n\\t\\tlet offset = null;\\n\\n\\t\\tif (user) {\\n\\t\\t\\tlet url = 'apps.json';\\n\\t\\t\\tif (page.query.offset) {\\n\\t\\t\\t\\turl += `?offset=${encodeURIComponent(page.query.offset)}`;\\n\\t\\t\\t}\\n\\t\\t\\tconst r = await this.fetch(url, {\\n\\t\\t\\t\\tcredentials: 'include'\\n\\t\\t\\t});\\n\\t\\t\\tif (!r.ok) return this.error(r.status, await r.text());\\n\\n\\t\\t\\t({ apps, offset } = await r.json());\\n\\t\\t}\\n\\n\\t\\treturn { user, apps, offset };\\n\\t}\\n</script>\\n\\n<script>\\n\\timport { getContext } from 'svelte';\\n\\n\\texport let user;\\n\\texport let apps;\\n\\texport let offset;\\n\\n\\tconst { login, logout } = getContext('app');\\n\\n\\tconst formatter = new Intl.DateTimeFormat(undefined, {\\n\\t\\tyear: 'numeric',\\n\\t\\tmonth: 'short',\\n\\t\\tday: 'numeric',\\n\\t\\thour: 'numeric',\\n\\t\\tminute: '2-digit'\\n\\t});\\n\\n\\tconst format = str => formatter.format(new Date(str));\\n</script>\\n\\n<svelte:head>\\n\\t<title>Your apps • Svelte</title>\\n</svelte:head>\\n\\n<div class=\\\"apps\\\">\\n\\t{#if user}\\n\\t\\t<header>\\n\\t\\t\\t<h1>Your apps</h1>\\n\\n\\t\\t\\t<div class=\\\"user\\\">\\n\\t\\t\\t\\t<img class=\\\"avatar\\\" alt=\\\"{user.name || user.username} avatar\\\" src=\\\"{user.avatar}\\\">\\n\\t\\t\\t\\t<span>\\n\\t\\t\\t\\t\\t{user.name || user.username}\\n\\t\\t\\t\\t\\t(<a on:click|preventDefault={logout} href=\\\"auth/logout\\\">log out</a>)\\n\\t\\t\\t\\t</span>\\n\\t\\t\\t</div>\\n\\t\\t</header>\\n\\n\\t\\t<ul>\\n\\t\\t\\t{#each apps as app}\\n\\t\\t\\t\\t<li>\\n\\t\\t\\t\\t\\t<a href=\\\"repl/{app.uid}\\\">\\n\\t\\t\\t\\t\\t\\t<h2>{app.name}</h2>\\n\\t\\t\\t\\t\\t\\t<span>updated {format(app.updated_at)}</span>\\n\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t</li>\\n\\t\\t\\t{/each}\\n\\t\\t</ul>\\n\\n\\t\\t{#if offset !== null}\\n\\t\\t\\t<div><a href=\\\"apps?offset={offset}\\\">Next page...</a></div>\\n\\t\\t{/if}\\n\\t{:else}\\n\\t\\t<p>Please <a on:click|preventDefault={login} href=\\\"auth/login\\\">log in</a> to see your saved apps.</p>\\n\\t{/if}\\n</div>\\n\\n<style>\\n\\t.apps {\\n\\t\\tpadding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);\\n\\t\\tmax-width: var(--main-width);\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\n\\theader {\\n\\t\\tmargin: 0 0 1em 0;\\n\\t}\\n\\n\\th1 {\\n\\t\\tfont-size: 4rem;\\n\\t\\tfont-weight: 400;\\n\\t}\\n\\n\\t.user {\\n\\t\\tdisplay: flex;\\n\\t\\tpadding: 0 0 0 3.2rem;\\n\\t\\tposition: relative;\\n\\t\\tmargin: 1rem 0 5rem 0;\\n\\t\\tcolor: var(--text);\\n\\t}\\n\\n\\t.avatar {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0.1rem;\\n\\t\\twidth: 2.4rem;\\n\\t\\theight: 2.4rem;\\n\\t\\tborder: 1px solid rgba(0,0,0,0.3);\\n\\t\\tborder-radius: 0.2rem;\\n\\t}\\n\\n\\tul {\\n\\t\\tlist-style: none;\\n\\t}\\n\\n\\tli {\\n\\t\\tmargin: 0 0 1em 0;\\n\\t}\\n\\n\\th2 {\\n\\t\\tcolor: var(--text);\\n\\t\\tfont-size: var(--h3);\\n\\t\\tfont-weight: 400;\\n\\t}\\n\\n\\tli a {\\n\\t\\tborder: none;\\n\\t}\\n\\n\\tli a:hover h2 {\\n\\t\\tcolor: var(--flash);\\n\\t}\\n\\n\\tli span {\\n\\t\\tfont-size: 14px;\\n\\t\\tcolor: #999;\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAgFC,KAAK,8BAAC,CAAC,AACN,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,CAAC,IAAI,UAAU,CAAC,CAC/D,SAAS,CAAE,IAAI,YAAY,CAAC,CAC5B,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,MAAM,8BAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,AAClB,CAAC,AAED,EAAE,8BAAC,CAAC,AACH,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,KAAK,8BAAC,CAAC,AACN,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,MAAM,CACrB,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACrB,KAAK,CAAE,IAAI,MAAM,CAAC,AACnB,CAAC,AAED,OAAO,8BAAC,CAAC,AACR,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,MAAM,CACX,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,MAAM,CACd,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACjC,aAAa,CAAE,MAAM,AACtB,CAAC,AAED,EAAE,8BAAC,CAAC,AACH,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,EAAE,8BAAC,CAAC,AACH,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,AAClB,CAAC,AAED,EAAE,8BAAC,CAAC,AACH,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,iBAAE,CAAC,CAAC,eAAC,CAAC,AACL,MAAM,CAAE,IAAI,AACb,CAAC,AAED,iBAAE,CAAC,CAAC,MAAM,CAAC,EAAE,eAAC,CAAC,AACd,KAAK,CAAE,IAAI,OAAO,CAAC,AACpB,CAAC,AAED,iBAAE,CAAC,IAAI,eAAC,CAAC,AACR,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,AACZ,CAAC\"}"
};

async function preload$4(page, { user }) {
	let apps = [];
	let offset = null;

	if (user) {
		let url = "apps.json";

		if (page.query.offset) {
			url += `?offset=${encodeURIComponent(page.query.offset)}`;
		}

		const r = await this.fetch(url, { credentials: "include" });
		if (!r.ok) return this.error(r.status, await r.text());
		({ apps, offset } = await r.json());
	}

	return { user, apps, offset };
}

const Apps = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { user } = $$props;
	let { apps } = $$props;
	let { offset } = $$props;
	const { login, logout } = getContext("app");

	const formatter = new Intl.DateTimeFormat(undefined,
	{
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit"
		});

	const format = str => formatter.format(new Date(str));
	if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);
	if ($$props.apps === void 0 && $$bindings.apps && apps !== void 0) $$bindings.apps(apps);
	if ($$props.offset === void 0 && $$bindings.offset && offset !== void 0) $$bindings.offset(offset);
	$$result.css.add(css$F);

	return `${($$result.head += `${($$result.title = `<title>Your apps • Svelte</title>`, "")}`, "")}

<div class="${"apps svelte-1a795bd"}">${user
	? `<header class="${"svelte-1a795bd"}"><h1 class="${"svelte-1a795bd"}">Your apps</h1>

			<div class="${"user svelte-1a795bd"}"><img class="${"avatar svelte-1a795bd"}" alt="${escape(user.name || user.username) + " avatar"}"${add_attribute("src", user.avatar, 0)}>
				<span>${escape(user.name || user.username)}
					(<a href="${"auth/logout"}">log out</a>)
				</span></div></header>

		<ul class="${"svelte-1a795bd"}">${each(apps, app => `<li class="${"svelte-1a795bd"}"><a href="${"repl/" + escape(app.uid)}" class="${"svelte-1a795bd"}"><h2 class="${"svelte-1a795bd"}">${escape(app.name)}</h2>
						<span class="${"svelte-1a795bd"}">updated ${escape(format(app.updated_at))}</span></a>
				</li>`)}</ul>

		${offset !== null
		? `<div><a href="${"apps?offset=" + escape(offset)}">Next page...</a></div>`
		: ``}`
	: `<p>Please <a href="${"auth/login"}">log in</a> to see your saved apps.</p>`}
</div>`;
});

var component_5 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Apps,
	preload: preload$4
});

/* src/routes/blog/index.svelte generated by Svelte v3.31.0 */

const css$G = {
	code: ".posts.svelte-1v4cdw2.svelte-1v4cdw2.svelte-1v4cdw2{grid-template-columns:1fr 1fr;grid-gap:1em;min-height:calc(100vh - var(--nav-h));padding:var(--top-offset) var(--side-nav) 6rem var(--side-nav);max-width:var(--main-width);margin:0 auto}h2.svelte-1v4cdw2.svelte-1v4cdw2.svelte-1v4cdw2{display:inline-block;margin:3.2rem 0 0.4rem 0;color:var(--text);max-width:18em;font-size:var(--h3);font-weight:400}.post.svelte-1v4cdw2.svelte-1v4cdw2.svelte-1v4cdw2:first-child{margin:0 0 2rem 0;padding:0 0 4rem 0;border-bottom:var(--border-w) solid #6767785b}.post.svelte-1v4cdw2:first-child h2.svelte-1v4cdw2.svelte-1v4cdw2{font-size:4rem;font-weight:400;color:var(--second)}.post.svelte-1v4cdw2.svelte-1v4cdw2.svelte-1v4cdw2:first-child::before,.post.svelte-1v4cdw2.svelte-1v4cdw2.svelte-1v4cdw2:nth-child(2)::before{content:'Latest post • ' attr(data-pubdate);color:var(--flash);font-size:var(--h6);font-weight:400;letter-spacing:.05em;text-transform:uppercase}.post.svelte-1v4cdw2.svelte-1v4cdw2.svelte-1v4cdw2:nth-child(2)::before{content:'Older posts'}.post.svelte-1v4cdw2 p.svelte-1v4cdw2.svelte-1v4cdw2{font-size:var(--h5);max-width:30em;color:var(--second)}.post.svelte-1v4cdw2>a.svelte-1v4cdw2.svelte-1v4cdw2{display:block }.posts.svelte-1v4cdw2 a.svelte-1v4cdw2.svelte-1v4cdw2:hover,.posts.svelte-1v4cdw2 a.svelte-1v4cdw2:hover>h2.svelte-1v4cdw2{color:var(--flash)\n\t}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\texport async function preload() {\\n\\t\\tconst posts = await this.fetch(`blog.json`).then(r => r.json());\\n\\t\\treturn { posts };\\n\\t}\\n</script>\\n\\n<script>\\n\\texport let posts;\\n</script>\\n\\n<svelte:head>\\n\\t<title>Blog • Svelte</title>\\n\\t<link rel=\\\"alternate\\\" type=\\\"application/rss+xml\\\" title=\\\"Svelte blog\\\" href=\\\"https://svelte.dev/blog/rss.xml\\\">\\n\\n\\t<meta name=\\\"twitter:title\\\" content=\\\"Svelte blog\\\">\\n\\t<meta name=\\\"twitter:description\\\" content=\\\"Articles about Svelte and UI development\\\">\\n\\t<meta name=\\\"Description\\\" content=\\\"Articles about Svelte and UI development\\\">\\n</svelte:head>\\n\\n<h1 class=\\\"visually-hidden\\\">Blog</h1>\\n<div class='posts stretch'>\\n\\t{#each posts as post}\\n\\t\\t<article class='post' data-pubdate={post.metadata.dateString}>\\n\\t\\t\\t<a class=\\\"no-underline\\\" rel='prefetch' href='blog/{post.slug}' title='Read the article »'>\\n\\t\\t\\t\\t<h2>{post.metadata.title}</h2>\\n\\t\\t\\t\\t<p>{post.metadata.description}</p>\\n\\t\\t\\t</a>\\n\\t\\t</article>\\n\\t{/each}\\n</div>\\n\\n<style>\\n\\t.posts {\\n\\t\\tgrid-template-columns: 1fr 1fr;\\n\\t\\tgrid-gap: 1em;\\n\\t\\tmin-height: calc(100vh - var(--nav-h));\\n\\t\\tpadding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);\\n\\t\\tmax-width: var(--main-width);\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\n\\th2 {\\n\\t\\tdisplay: inline-block;\\n\\t\\tmargin: 3.2rem 0 0.4rem 0;\\n\\t\\tcolor: var(--text);\\n\\t\\tmax-width: 18em;\\n\\t\\tfont-size: var(--h3);\\n\\t\\tfont-weight: 400;\\n\\t}\\n\\n\\t.post:first-child {\\n\\t\\tmargin: 0 0 2rem 0;\\n\\t\\tpadding: 0 0 4rem 0;\\n\\t\\tborder-bottom: var(--border-w) solid #6767785b; /* based on --second */\\n\\t}\\n\\n\\t.post:first-child h2 {\\n\\t\\tfont-size: 4rem;\\n\\t\\tfont-weight: 400;\\n\\t\\tcolor: var(--second);\\n\\t}\\n\\n\\t.post:first-child::before,\\n\\t.post:nth-child(2)::before {\\n\\t\\tcontent: 'Latest post • ' attr(data-pubdate);\\n\\t\\tcolor: var(--flash);\\n\\t\\tfont-size: var(--h6);\\n\\t\\tfont-weight: 400;\\n\\t\\tletter-spacing: .05em;\\n\\t\\ttext-transform: uppercase;\\n\\t}\\n\\n\\t.post:nth-child(2)::before {\\n\\t\\tcontent: 'Older posts';\\n\\t}\\n\\n\\t.post p {\\n\\t\\tfont-size: var(--h5);\\n\\t\\tmax-width: 30em;\\n\\t\\tcolor: var(--second);\\n\\t}\\n\\n\\t.post > a { display: block }\\n\\n\\t.posts a:hover,\\n\\t.posts a:hover > h2 {\\n\\t\\tcolor: var(--flash)\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAiCC,MAAM,6CAAC,CAAC,AACP,qBAAqB,CAAE,GAAG,CAAC,GAAG,CAC9B,QAAQ,CAAE,GAAG,CACb,UAAU,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,OAAO,CAAC,CAAC,CACtC,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,CAAC,IAAI,UAAU,CAAC,CAC/D,SAAS,CAAE,IAAI,YAAY,CAAC,CAC5B,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,EAAE,6CAAC,CAAC,AACH,OAAO,CAAE,YAAY,CACrB,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACzB,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,SAAS,CAAE,IAAI,CACf,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,kDAAK,YAAY,AAAC,CAAC,AAClB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAClB,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACnB,aAAa,CAAE,IAAI,UAAU,CAAC,CAAC,KAAK,CAAC,SAAS,AAC/C,CAAC,AAED,oBAAK,YAAY,CAAC,EAAE,8BAAC,CAAC,AACrB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,QAAQ,CAAC,AACrB,CAAC,AAED,kDAAK,YAAY,QAAQ,CACzB,kDAAK,WAAW,CAAC,CAAC,QAAQ,AAAC,CAAC,AAC3B,OAAO,CAAE,gBAAgB,CAAC,KAAK,YAAY,CAAC,CAC5C,KAAK,CAAE,IAAI,OAAO,CAAC,CACnB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,KAAK,CACrB,cAAc,CAAE,SAAS,AAC1B,CAAC,AAED,kDAAK,WAAW,CAAC,CAAC,QAAQ,AAAC,CAAC,AAC3B,OAAO,CAAE,aAAa,AACvB,CAAC,AAED,oBAAK,CAAC,CAAC,8BAAC,CAAC,AACR,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,QAAQ,CAAC,AACrB,CAAC,AAED,oBAAK,CAAG,CAAC,8BAAC,CAAC,AAAC,OAAO,CAAE,KAAK,CAAC,CAAC,AAE5B,qBAAM,CAAC,+BAAC,MAAM,CACd,qBAAM,CAAC,gBAAC,MAAM,CAAG,EAAE,eAAC,CAAC,AACpB,KAAK,CAAE,IAAI,OAAO,CAAC;CACpB,CAAC\"}"
};

async function preload$5() {
	const posts = await this.fetch(`blog.json`).then(r => r.json());
	return { posts };
}

const Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { posts } = $$props;
	if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0) $$bindings.posts(posts);
	$$result.css.add(css$G);

	return `${($$result.head += `${($$result.title = `<title>Blog • Svelte</title>`, "")}<link rel="${"alternate"}" type="${"application/rss+xml"}" title="${"Svelte blog"}" href="${"https://svelte.dev/blog/rss.xml"}" data-svelte="svelte-1dp4qdr"><meta name="${"twitter:title"}" content="${"Svelte blog"}" data-svelte="svelte-1dp4qdr"><meta name="${"twitter:description"}" content="${"Articles about Svelte and UI development"}" data-svelte="svelte-1dp4qdr"><meta name="${"Description"}" content="${"Articles about Svelte and UI development"}" data-svelte="svelte-1dp4qdr">`, "")}

<h1 class="${"visually-hidden"}">Blog</h1>
<div class="${"posts stretch svelte-1v4cdw2"}">${each(posts, post => `<article class="${"post svelte-1v4cdw2"}"${add_attribute("data-pubdate", post.metadata.dateString, 0)}><a class="${"no-underline svelte-1v4cdw2"}" rel="${"prefetch"}" href="${"blog/" + escape(post.slug)}" title="${"Read the article »"}"><h2 class="${"svelte-1v4cdw2"}">${escape(post.metadata.title)}</h2>
				<p class="${"svelte-1v4cdw2"}">${escape(post.metadata.description)}</p></a>
		</article>`)}
</div>`;
});

var component_6 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Blog,
	preload: preload$5
});

/* src/routes/blog/[slug].svelte generated by Svelte v3.31.0 */

const css$H = {
	code: ".post.svelte-193hhtk.svelte-193hhtk{padding:var(--top-offset) var(--side-nav) 6rem var(--side-nav);max-width:var(--main-width);margin:0 auto}h1.svelte-193hhtk.svelte-193hhtk{font-size:4rem;font-weight:400}.standfirst.svelte-193hhtk.svelte-193hhtk{font-size:var(--h4);color:var(--second);margin:0 0 1em 0}.byline.svelte-193hhtk.svelte-193hhtk{margin:0 0 6rem 0;padding:1.6rem 0 0 0;border-top:var(--border-w) solid #6767785b;font-size:var(--h6);text-transform:uppercase}.byline.svelte-193hhtk a.svelte-193hhtk{}.byline.svelte-193hhtk a.svelte-193hhtk:hover{}.post.svelte-193hhtk h1.svelte-193hhtk{color:var(--second);max-width:20em;margin:0 0 .8rem 0}.post.svelte-193hhtk h2{margin:2em 0 0.5em 0;color:var(--text);font-size:var(--h3);font-weight:300}.post.svelte-193hhtk figure{margin:1.6rem 0 3.2rem 0}.post.svelte-193hhtk figure img{max-width:100%}.post.svelte-193hhtk figcaption{color:var(--second);text-align:left}.post.svelte-193hhtk video{width:100%}.post.svelte-193hhtk blockquote{max-width:none;border-left:4px solid #eee;background:#f9f9f9;border-radius:0 var(--border-r) var(--border-r) 0}.post.svelte-193hhtk code{padding:.3rem .8rem .3rem;margin:0 0.2rem;top:-.1rem;background:var(--back-api)}.post.svelte-193hhtk pre code{padding:0;margin:0;top:0;background:transparent}.post.svelte-193hhtk aside{float:right;margin:0 0 1em 1em;width:16rem;color:var(--second);z-index:2}.post.svelte-193hhtk .max{width:100%}.post.svelte-193hhtk iframe{width:100%;height:420px;margin:2em 0;border-radius:var(--border-r);border:0.8rem solid var(--second)}.post.svelte-193hhtk .anchor{top:calc((var(--h3) - 24px) / 2)}.post.svelte-193hhtk a{padding:0;transition:none}.post.svelte-193hhtk a:not(:hover){border:none}@media(max-width: 768px){.post.svelte-193hhtk .anchor{transform:scale(0.6);opacity:1;left:-1.0em}}@media(min-width: 910px){.post.svelte-193hhtk .max{width:calc(100vw - 2 * var(--side-nav));margin:0 calc(var(--main-width) / 2 - 50vw);text-align:center}.post.svelte-193hhtk .max>*{width:100%;max-width:1200px}.post.svelte-193hhtk iframe{width:100%;max-width:1100px;margin:2em auto}}",
	map: "{\"version\":3,\"file\":\"[slug].svelte\",\"sources\":[\"[slug].svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\texport async function preload({ params }) {\\n\\t\\tconst res = await this.fetch(`blog/${params.slug}.json`);\\n\\t\\treturn res.ok ? { post: await res.json() } : this.error(404, 'Not found');\\n\\t}\\n</script>\\n\\n<script>\\n\\texport let post;\\n</script>\\n\\n<svelte:head>\\n\\t<title>{post.metadata.title}</title>\\n\\n\\t<meta name=\\\"twitter:title\\\" content={post.metadata.title}>\\n\\t<meta name=\\\"twitter:description\\\" content={post.metadata.description}>\\n\\t<meta name=\\\"Description\\\" content={post.metadata.description}>\\n</svelte:head>\\n\\n<article class='post listify'>\\n\\t<h1>{post.metadata.title}</h1>\\n\\t<p class='standfirst'>{post.metadata.description}</p>\\n\\n\\t<p class='byline'><a href='{post.metadata.authorURL}'>{post.metadata.author}</a> <time datetime='{post.metadata.pubdate}'>{post.metadata.dateString}</time></p>\\n\\n\\t{@html post.html}\\n</article>\\n\\n<style>\\n\\t.post {\\n\\t\\tpadding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);\\n\\t\\tmax-width: var(--main-width);\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\n\\th1 {\\n\\t\\tfont-size: 4rem;\\n\\t\\tfont-weight: 400;\\n\\t}\\n\\n\\t.standfirst {\\n\\t\\tfont-size: var(--h4);\\n\\t\\tcolor: var(--second);\\n\\t\\tmargin: 0 0 1em 0;\\n\\t}\\n\\n\\t.byline {\\n\\t\\tmargin: 0 0 6rem 0;\\n\\t\\tpadding: 1.6rem 0 0 0;\\n\\t\\tborder-top: var(--border-w) solid #6767785b;\\n\\t\\tfont-size: var(--h6);\\n\\t\\ttext-transform: uppercase;\\n\\t}\\n\\n\\t.byline a {\\n\\t\\t/* border-bottom: none; */\\n\\t\\t/* font-weight: 600; */\\n\\t}\\n\\n\\t.byline a:hover {\\n\\t\\t/* border-bottom: 2px solid var(--prime); */\\n\\t}\\n\\n\\t.post h1 {\\n\\t\\tcolor: var(--second);\\n\\t\\tmax-width: 20em;\\n\\t\\tmargin: 0 0 .8rem 0;\\n\\t}\\n\\n\\t.post :global(h2) {\\n\\t\\tmargin: 2em 0 0.5em 0;\\n\\t\\t/* color: var(--second); */\\n\\t\\tcolor: var(--text);\\n\\t\\tfont-size: var(--h3);\\n\\t\\tfont-weight: 300;\\n\\t}\\n\\n\\t.post :global(figure) {\\n\\t\\tmargin: 1.6rem 0 3.2rem 0;\\n\\t}\\n\\n\\t.post :global(figure) :global(img) {\\n\\t\\tmax-width: 100%;\\n\\t}\\n\\n\\t.post :global(figcaption) {\\n\\t\\tcolor: var(--second);\\n\\t\\ttext-align: left;\\n\\t}\\n\\n\\t.post :global(video) {\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.post :global(blockquote) {\\n\\t\\tmax-width: none;\\n\\t\\tborder-left: 4px solid #eee;\\n\\t\\tbackground: #f9f9f9;\\n\\t\\tborder-radius: 0 var(--border-r) var(--border-r) 0;\\n\\t}\\n\\n\\t.post :global(code) {\\n\\t\\tpadding: .3rem .8rem .3rem;\\n\\t\\tmargin: 0 0.2rem;\\n\\t\\ttop: -.1rem;\\n\\t\\tbackground: var(--back-api);\\n\\t}\\n\\n\\t.post :global(pre) :global(code) {\\n\\t\\tpadding: 0;\\n\\t\\tmargin: 0;\\n\\t\\ttop: 0;\\n\\t\\tbackground: transparent;\\n\\t}\\n\\n\\t.post :global(aside) {\\n\\t\\tfloat: right;\\n\\t\\tmargin: 0 0 1em 1em;\\n\\t\\twidth: 16rem;\\n\\t\\tcolor: var(--second);\\n\\t\\tz-index: 2;\\n\\t}\\n\\n\\t.post :global(.max) {\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.post :global(iframe) {\\n\\t\\twidth: 100%;\\n\\t\\theight: 420px;\\n\\t\\tmargin: 2em 0;\\n\\t\\tborder-radius: var(--border-r);\\n\\t\\tborder: 0.8rem solid var(--second);\\n\\t}\\n\\n\\t.post :global(.anchor) {\\n\\t\\ttop: calc((var(--h3) - 24px) / 2);\\n\\t}\\n\\n\\t.post :global(a) {\\n\\t\\tpadding: 0;\\n\\t\\ttransition: none;\\n\\t}\\n\\n\\t.post :global(a):not(:hover) {\\n\\t\\tborder: none;\\n\\t}\\n\\n\\t@media (max-width: 768px) {\\n\\t\\t.post :global(.anchor) {\\n\\t\\t\\ttransform: scale(0.6);\\n\\t\\t\\topacity: 1;\\n\\t\\t\\tleft: -1.0em;\\n\\t\\t}\\n\\t}\\n\\n\\t@media (min-width: 910px) {\\n\\t\\t.post :global(.max) {\\n\\t\\t\\twidth: calc(100vw - 2 * var(--side-nav));\\n\\t\\t\\tmargin: 0 calc(var(--main-width) / 2 - 50vw);\\n\\t\\t\\ttext-align: center;\\n\\t\\t}\\n\\n\\t\\t.post :global(.max) > :global(*) {\\n\\t\\t\\twidth: 100%;\\n\\t\\t\\tmax-width: 1200px;\\n\\t\\t}\\n\\n\\t\\t.post :global(iframe) {\\n\\t\\t\\twidth: 100%;\\n\\t\\t\\tmax-width: 1100px;\\n\\t\\t\\tmargin: 2em auto;\\n\\t\\t}\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA6BC,KAAK,8BAAC,CAAC,AACN,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,CAAC,IAAI,UAAU,CAAC,CAC/D,SAAS,CAAE,IAAI,YAAY,CAAC,CAC5B,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,EAAE,8BAAC,CAAC,AACH,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,WAAW,8BAAC,CAAC,AACZ,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,KAAK,CAAE,IAAI,QAAQ,CAAC,CACpB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,AAClB,CAAC,AAED,OAAO,8BAAC,CAAC,AACR,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAClB,OAAO,CAAE,MAAM,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACrB,UAAU,CAAE,IAAI,UAAU,CAAC,CAAC,KAAK,CAAC,SAAS,CAC3C,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,cAAc,CAAE,SAAS,AAC1B,CAAC,AAED,sBAAO,CAAC,CAAC,eAAC,CAAC,AAGX,CAAC,AAED,sBAAO,CAAC,gBAAC,MAAM,AAAC,CAAC,AAEjB,CAAC,AAED,oBAAK,CAAC,EAAE,eAAC,CAAC,AACT,KAAK,CAAE,IAAI,QAAQ,CAAC,CACpB,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACpB,CAAC,AAED,oBAAK,CAAC,AAAQ,EAAE,AAAE,CAAC,AAClB,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAErB,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,oBAAK,CAAC,AAAQ,MAAM,AAAE,CAAC,AACtB,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,AAC1B,CAAC,AAED,oBAAK,CAAC,AAAQ,MAAM,AAAC,CAAC,AAAQ,GAAG,AAAE,CAAC,AACnC,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,oBAAK,CAAC,AAAQ,UAAU,AAAE,CAAC,AAC1B,KAAK,CAAE,IAAI,QAAQ,CAAC,CACpB,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,oBAAK,CAAC,AAAQ,KAAK,AAAE,CAAC,AACrB,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,oBAAK,CAAC,AAAQ,UAAU,AAAE,CAAC,AAC1B,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAC3B,UAAU,CAAE,OAAO,CACnB,aAAa,CAAE,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAAC,AACnD,CAAC,AAED,oBAAK,CAAC,AAAQ,IAAI,AAAE,CAAC,AACpB,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAC1B,MAAM,CAAE,CAAC,CAAC,MAAM,CAChB,GAAG,CAAE,MAAM,CACX,UAAU,CAAE,IAAI,UAAU,CAAC,AAC5B,CAAC,AAED,oBAAK,CAAC,AAAQ,GAAG,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AACjC,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,GAAG,CAAE,CAAC,CACN,UAAU,CAAE,WAAW,AACxB,CAAC,AAED,oBAAK,CAAC,AAAQ,KAAK,AAAE,CAAC,AACrB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,GAAG,CACnB,KAAK,CAAE,KAAK,CACZ,KAAK,CAAE,IAAI,QAAQ,CAAC,CACpB,OAAO,CAAE,CAAC,AACX,CAAC,AAED,oBAAK,CAAC,AAAQ,IAAI,AAAE,CAAC,AACpB,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,oBAAK,CAAC,AAAQ,MAAM,AAAE,CAAC,AACtB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,GAAG,CAAC,CAAC,CACb,aAAa,CAAE,IAAI,UAAU,CAAC,CAC9B,MAAM,CAAE,MAAM,CAAC,KAAK,CAAC,IAAI,QAAQ,CAAC,AACnC,CAAC,AAED,oBAAK,CAAC,AAAQ,OAAO,AAAE,CAAC,AACvB,GAAG,CAAE,KAAK,CAAC,IAAI,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AAClC,CAAC,AAED,oBAAK,CAAC,AAAQ,CAAC,AAAE,CAAC,AACjB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,oBAAK,CAAC,AAAQ,CAAC,AAAC,KAAK,MAAM,CAAC,AAAC,CAAC,AAC7B,MAAM,CAAE,IAAI,AACb,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,oBAAK,CAAC,AAAQ,OAAO,AAAE,CAAC,AACvB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,OAAO,CAAE,CAAC,CACV,IAAI,CAAE,MAAM,AACb,CAAC,AACF,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,oBAAK,CAAC,AAAQ,IAAI,AAAE,CAAC,AACpB,KAAK,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CACxC,MAAM,CAAE,CAAC,CAAC,KAAK,IAAI,YAAY,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAC5C,UAAU,CAAE,MAAM,AACnB,CAAC,AAED,oBAAK,CAAC,AAAQ,IAAI,AAAC,CAAW,CAAC,AAAE,CAAC,AACjC,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,MAAM,AAClB,CAAC,AAED,oBAAK,CAAC,AAAQ,MAAM,AAAE,CAAC,AACtB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,GAAG,CAAC,IAAI,AACjB,CAAC,AACF,CAAC\"}"
};

async function preload$6({ params }) {
	const res = await this.fetch(`blog/${params.slug}.json`);

	return res.ok
	? { post: await res.json() }
	: this.error(404, "Not found");
}

const U5Bslugu5D$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { post } = $$props;
	if ($$props.post === void 0 && $$bindings.post && post !== void 0) $$bindings.post(post);
	$$result.css.add(css$H);

	return `${($$result.head += `${($$result.title = `<title>${escape(post.metadata.title)}</title>`, "")}<meta name="${"twitter:title"}"${add_attribute("content", post.metadata.title, 0)} data-svelte="svelte-1eb4tfw"><meta name="${"twitter:description"}"${add_attribute("content", post.metadata.description, 0)} data-svelte="svelte-1eb4tfw"><meta name="${"Description"}"${add_attribute("content", post.metadata.description, 0)} data-svelte="svelte-1eb4tfw">`, "")}

<article class="${"post listify svelte-193hhtk"}"><h1 class="${"svelte-193hhtk"}">${escape(post.metadata.title)}</h1>
	<p class="${"standfirst svelte-193hhtk"}">${escape(post.metadata.description)}</p>

	<p class="${"byline svelte-193hhtk"}"><a${add_attribute("href", post.metadata.authorURL, 0)} class="${"svelte-193hhtk"}">${escape(post.metadata.author)}</a> <time${add_attribute("datetime", post.metadata.pubdate, 0)}>${escape(post.metadata.dateString)}</time></p>

	${post.html}
</article>`;
});

var component_7 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': U5Bslugu5D$1,
	preload: preload$6
});

/* src/routes/docs/index.svelte generated by Svelte v3.31.0 */

async function preload$7() {
	const sections = await this.fetch(`docs.json`).then(r => r.json());
	return { sections };
}

const Docs_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { sections } = $$props;
	if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0) $$bindings.sections(sections);

	return `${($$result.head += `${($$result.title = `<title>API Docs • Svelte</title>`, "")}<meta name="${"twitter:title"}" content="${"Svelte API docs"}" data-svelte="svelte-i2j3de"><meta name="${"twitter:description"}" content="${"Cybernetically enhanced web apps"}" data-svelte="svelte-i2j3de"><meta name="${"Description"}" content="${"Cybernetically enhanced web apps"}" data-svelte="svelte-i2j3de">`, "")}

<h1 class="${"visually-hidden"}">API Docs</h1>
${validate_component(Docs, "Docs").$$render($$result, { sections }, {}, {})}`;
});

var component_8 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Docs_1,
	preload: preload$7
});

/* src/routes/repl/index.svelte generated by Svelte v3.31.0 */

function preload$8({ query }) {
	const { gist, example, version } = query;

	// redirect to v2 REPL if appropriate
	if ((/^[^>]?[12]/).test(version)) {
		const q = Object.keys(query).map(key => `${key}=${query[key]}`).join("&");
		return this.redirect(302, `https://v2.svelte.dev/repl?${q}`);
	}

	const id = gist || example || "hello-world";
	const q = version ? `?version=${version}` : ``;
	this.redirect(301, `repl/${id}${q}`);
}

const Repl$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return ``;
});

var component_9 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Repl$1,
	preload: preload$8
});

/* src/routes/repl/embed.svelte generated by Svelte v3.31.0 */

const css$I = {
	code: ".repl-outer.svelte-icca0y{position:fixed;top:0;left:0;width:100%;height:100%;background-color:var(--back);overflow:hidden;box-sizing:border-box;--pane-controls-h:4.2rem;display:flex;flex-direction:column}",
	map: "{\"version\":3,\"file\":\"embed.svelte\",\"sources\":[\"embed.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\texport function preload({ query }) {\\n\\t\\treturn {\\n\\t\\t\\tversion: query.version,\\n\\t\\t\\tgist: query.gist,\\n\\t\\t\\texample: query.example\\n\\t\\t};\\n\\t}\\n</script>\\n\\n<script>\\n\\timport ReplWidget from '../../components/Repl/ReplWidget.svelte';\\n\\n\\texport let version = '3';\\n\\texport let gist;\\n\\texport let example;\\n</script>\\n\\n<style>\\n\\t.repl-outer {\\n\\t\\tposition: fixed;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tbackground-color: var(--back);\\n\\t\\toverflow: hidden;\\n\\t\\tbox-sizing: border-box;\\n\\t\\t--pane-controls-h: 4.2rem;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t}\\n</style>\\n\\n<svelte:head>\\n\\t<title>REPL • Svelte</title>\\n\\n\\t<meta name=\\\"twitter:title\\\" content=\\\"Svelte REPL\\\">\\n\\t<meta name=\\\"twitter:description\\\" content=\\\"Cybernetically enhanced web apps\\\">\\n\\t<meta name=\\\"Description\\\" content=\\\"Interactive Svelte playground\\\">\\n</svelte:head>\\n\\n<div class=\\\"repl-outer\\\">\\n\\t{#if false}\\n\\t\\t<ReplWidget {version} {gist} {example} embedded={true}/>\\n\\t{/if}\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAmBC,WAAW,cAAC,CAAC,AACZ,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,QAAQ,CAAE,MAAM,CAChB,UAAU,CAAE,UAAU,CACtB,iBAAiB,CAAE,MAAM,CACzB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,AACvB,CAAC\"}"
};

function preload$9({ query }) {
	return {
		version: query.version,
		gist: query.gist,
		example: query.example
	};
}

const Embed = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { version = "3" } = $$props;
	let { gist } = $$props;
	let { example } = $$props;
	if ($$props.version === void 0 && $$bindings.version && version !== void 0) $$bindings.version(version);
	if ($$props.gist === void 0 && $$bindings.gist && gist !== void 0) $$bindings.gist(gist);
	if ($$props.example === void 0 && $$bindings.example && example !== void 0) $$bindings.example(example);
	$$result.css.add(css$I);

	return `${($$result.head += `${($$result.title = `<title>REPL • Svelte</title>`, "")}<meta name="${"twitter:title"}" content="${"Svelte REPL"}" data-svelte="svelte-12ufkeu"><meta name="${"twitter:description"}" content="${"Cybernetically enhanced web apps"}" data-svelte="svelte-12ufkeu"><meta name="${"Description"}" content="${"Interactive Svelte playground"}" data-svelte="svelte-12ufkeu">`, "")}

<div class="${"repl-outer svelte-icca0y"}">${ ``}</div>`;
});

var component_10 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Embed,
	preload: preload$9
});

/* src/routes/repl/[id]/_components/AppControls/UserMenu.svelte generated by Svelte v3.31.0 */

const css$J = {
	code: ".user.svelte-1jk26jo.svelte-1jk26jo{position:relative;display:inline-block;padding:0em 1.2rem 0 1.6rem;height:0.8em;line-height:1;z-index:99}.user.svelte-1jk26jo.svelte-1jk26jo::after{position:absolute;content:'';width:100%;height:3.2rem;left:0;top:0}span.svelte-1jk26jo.svelte-1jk26jo{line-height:1;display:none;font-family:var(--font);font-size:1.6rem;opacity:0.7}.user.svelte-1jk26jo:hover span.svelte-1jk26jo{opacity:1}img.svelte-1jk26jo.svelte-1jk26jo{position:absolute;top:-0.05em;right:0;width:2.1rem;height:2.1rem;border:1px solid rgba(255,255,255,0.3);border-radius:0.2rem}.menu.svelte-1jk26jo.svelte-1jk26jo{position:absolute;width:calc(100% + 1.6rem);min-width:10em;top:3rem;right:-1.6rem;background-color:var(--second);padding:0.8rem 1.6rem;z-index:99;text-align:left;border-radius:0.4rem;display:flex;flex-direction:column}.menu.svelte-1jk26jo button.svelte-1jk26jo,.menu.svelte-1jk26jo a.svelte-1jk26jo{background-color:transparent;font-family:var(--font);font-size:1.6rem;opacity:0.7;padding:0.4rem 0;text-decoration:none;text-align:left;border:none;color:inherit}.menu.svelte-1jk26jo button.svelte-1jk26jo:hover,.menu.svelte-1jk26jo a.svelte-1jk26jo:hover{opacity:1;color:inherit}@media(min-width: 600px){.user.svelte-1jk26jo.svelte-1jk26jo{padding:0em 3.2rem 0 1.6rem}img.svelte-1jk26jo.svelte-1jk26jo{width:2.4rem;height:2.4rem}span.svelte-1jk26jo.svelte-1jk26jo{display:inline-block}}",
	map: "{\"version\":3,\"file\":\"UserMenu.svelte\",\"sources\":[\"UserMenu.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { getContext } from 'svelte';\\n\\timport { stores } from '@sapper/app';\\n\\tconst { session } = stores();\\n\\n\\tconst { logout } = getContext('app');\\n\\n\\tlet showMenu = false;\\n\\tlet name;\\n\\n\\t$: name = $session.user.name || $session.user.username;\\n</script>\\n\\n<div class=\\\"user\\\" on:mouseenter=\\\"{() => showMenu = true}\\\" on:mouseleave=\\\"{() => showMenu = false}\\\">\\n\\t<span>{name}</span>\\n\\t<img alt=\\\"{name} avatar\\\" src=\\\"{$session.user.avatar}\\\">\\n\\n\\t{#if showMenu}\\n\\t\\t<div class=\\\"menu\\\">\\n\\t\\t\\t<a href=\\\"apps\\\">Your saved apps</a>\\n\\t\\t\\t<button on:click={logout}>Log out</button>\\n\\t\\t</div>\\n\\t{/if}\\n</div>\\n\\n<style>\\n\\t.user {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: inline-block;\\n\\t\\tpadding: 0em 1.2rem 0 1.6rem;\\n\\t\\theight: 0.8em;\\n\\t\\tline-height: 1;\\n\\t\\tz-index: 99;\\n\\t}\\n\\n\\t.user::after {\\n\\t\\t/* embiggen hit zone, so log out menu doesn't disappear */\\n\\t\\tposition: absolute;\\n\\t\\tcontent: '';\\n\\t\\twidth: 100%;\\n\\t\\theight: 3.2rem;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t}\\n\\n\\tspan {\\n\\t\\t/* position: relative; padding: 0 2em 0 0; */\\n\\t\\tline-height: 1;\\n\\t\\tdisplay: none;\\n\\t\\tfont-family: var(--font);\\n\\t\\tfont-size: 1.6rem;\\n\\t\\topacity: 0.7;\\n\\t}\\n\\n\\t.user:hover span {\\n\\t\\topacity: 1;\\n\\t}\\n\\n\\timg {\\n\\t\\tposition: absolute;\\n\\t\\ttop: -0.05em;\\n\\t\\tright: 0;\\n\\t\\twidth: 2.1rem;\\n\\t\\theight: 2.1rem;\\n\\t\\tborder: 1px solid rgba(255,255,255,0.3);\\n\\t\\tborder-radius: 0.2rem;\\n\\t}\\n\\n\\t.menu {\\n\\t\\tposition: absolute;\\n\\t\\twidth: calc(100% + 1.6rem);\\n\\t\\tmin-width: 10em;\\n\\t\\ttop: 3rem;\\n\\t\\tright: -1.6rem;\\n\\t\\tbackground-color: var(--second);\\n\\t\\tpadding: 0.8rem 1.6rem;\\n\\t\\tz-index: 99;\\n\\t\\ttext-align: left;\\n\\t\\tborder-radius: 0.4rem;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t}\\n\\n\\t.menu button, .menu a {\\n\\t\\tbackground-color: transparent;\\n\\t\\tfont-family: var(--font);\\n\\t\\tfont-size: 1.6rem;\\n\\t\\topacity: 0.7;\\n\\t\\tpadding: 0.4rem 0;\\n\\t\\ttext-decoration: none;\\n\\t\\ttext-align: left;\\n\\t\\tborder: none;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t.menu button:hover, .menu a:hover {\\n\\t\\topacity: 1;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t@media (min-width: 600px) {\\n\\t\\t.user {\\n\\t\\t\\tpadding: 0em 3.2rem 0 1.6rem;\\n\\t\\t}\\n\\n\\t\\timg {\\n\\t\\t\\twidth: 2.4rem;\\n\\t\\t\\theight: 2.4rem;\\n\\t\\t}\\n\\n\\t\\tspan {\\n\\t\\t\\tdisplay: inline-block;\\n\\t\\t}\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA0BC,KAAK,8BAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,YAAY,CACrB,OAAO,CAAE,GAAG,CAAC,MAAM,CAAC,CAAC,CAAC,MAAM,CAC5B,MAAM,CAAE,KAAK,CACb,WAAW,CAAE,CAAC,CACd,OAAO,CAAE,EAAE,AACZ,CAAC,AAED,mCAAK,OAAO,AAAC,CAAC,AAEb,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,MAAM,CACd,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,AACP,CAAC,AAED,IAAI,8BAAC,CAAC,AAEL,WAAW,CAAE,CAAC,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,SAAS,CAAE,MAAM,CACjB,OAAO,CAAE,GAAG,AACb,CAAC,AAED,oBAAK,MAAM,CAAC,IAAI,eAAC,CAAC,AACjB,OAAO,CAAE,CAAC,AACX,CAAC,AAED,GAAG,8BAAC,CAAC,AACJ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,OAAO,CACZ,KAAK,CAAE,CAAC,CACR,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,MAAM,CACd,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CACvC,aAAa,CAAE,MAAM,AACtB,CAAC,AAED,KAAK,8BAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,MAAM,CAAC,CAC1B,SAAS,CAAE,IAAI,CACf,GAAG,CAAE,IAAI,CACT,KAAK,CAAE,OAAO,CACd,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,OAAO,CAAE,MAAM,CAAC,MAAM,CACtB,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,MAAM,CACrB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,AACvB,CAAC,AAED,oBAAK,CAAC,qBAAM,CAAE,oBAAK,CAAC,CAAC,eAAC,CAAC,AACtB,gBAAgB,CAAE,WAAW,CAC7B,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,SAAS,CAAE,MAAM,CACjB,OAAO,CAAE,GAAG,CACZ,OAAO,CAAE,MAAM,CAAC,CAAC,CACjB,eAAe,CAAE,IAAI,CACrB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,OAAO,AACf,CAAC,AAED,oBAAK,CAAC,qBAAM,MAAM,CAAE,oBAAK,CAAC,gBAAC,MAAM,AAAC,CAAC,AAClC,OAAO,CAAE,CAAC,CACV,KAAK,CAAE,OAAO,AACf,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,KAAK,8BAAC,CAAC,AACN,OAAO,CAAE,GAAG,CAAC,MAAM,CAAC,CAAC,CAAC,MAAM,AAC7B,CAAC,AAED,GAAG,8BAAC,CAAC,AACJ,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,MAAM,AACf,CAAC,AAED,IAAI,8BAAC,CAAC,AACL,OAAO,CAAE,YAAY,AACtB,CAAC,AACF,CAAC\"}"
};

const UserMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	const { session } = stores$1();
	validate_store(session, "session");
	$session = get_store_value(session);
	const { logout } = getContext("app");
	let name;
	$$result.css.add(css$J);
	validate_store(session, "session");
	$session = get_store_value(session);
	name = $session.user.name || $session.user.username;

	return `<div class="${"user svelte-1jk26jo"}"><span class="${"svelte-1jk26jo"}">${escape(name)}</span>
	<img alt="${escape(name) + " avatar"}"${add_attribute("src", $session.user.avatar, 0)} class="${"svelte-1jk26jo"}">

	${ ``}
</div>`;
});

/* src/routes/repl/[id]/_components/AppControls/index.svelte generated by Svelte v3.31.0 */

const css$K = {
	code: ".app-controls.svelte-1xhvee5.svelte-1xhvee5{position:absolute;top:0;left:0;width:100%;height:var(--app-controls-h);display:flex;align-items:center;justify-content:space-between;padding:.6rem var(--side-nav);background-color:var(--second);color:white;white-space:nowrap;flex:0}.icon.svelte-1xhvee5.svelte-1xhvee5{position:relative;top:-0.1rem;display:inline-block;padding:0.2em;opacity:.7;transition:opacity .3s;font-family:var(--font);font-size:1.6rem;color:white;line-height:1;margin:0 0 0 0.2em}.icon.svelte-1xhvee5.svelte-1xhvee5:hover{opacity:1 }.icon.svelte-1xhvee5.svelte-1xhvee5:disabled{opacity:.3 }.icon[title^='fullscreen'].svelte-1xhvee5.svelte-1xhvee5{display:none }input.svelte-1xhvee5.svelte-1xhvee5{background:transparent;border:none;color:currentColor;font-family:var(--font);font-size:1.6rem;opacity:0.7;outline:none;flex:1}input.svelte-1xhvee5.svelte-1xhvee5:focus{opacity:1}button.svelte-1xhvee5 span.svelte-1xhvee5{display:none}@media(min-width: 600px){.icon[title^='fullscreen'].svelte-1xhvee5.svelte-1xhvee5{display:inline }button.svelte-1xhvee5 span.svelte-1xhvee5{display:inline-block}}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { createEventDispatcher, getContext } from 'svelte';\\n\\timport { stores } from '@sapper/app';\\n\\timport UserMenu from './UserMenu.svelte';\\n\\timport { Icon } from '@sveltejs/site-kit';\\n\\timport * as doNotZip from 'do-not-zip';\\n\\timport downloadBlob from '../../../_utils/downloadBlob.js';\\n\\timport { enter } from '../../../../../utils/events.js';\\n\\timport { isMac } from '../../../../../utils/compat.js';\\n\\n\\tconst dispatch = createEventDispatcher();\\n\\tconst { session } = stores();\\n\\tconst { login } = getContext('app');\\n\\n\\texport let repl;\\n\\texport let gist;\\n\\texport let name;\\n\\texport let zen_mode;\\n\\texport let bundle;\\n\\n\\tlet saving = false;\\n\\tlet downloading = false;\\n\\tlet justSaved = false;\\n\\tlet justForked = false;\\n\\n\\tfunction wait(ms) {\\n\\t\\treturn new Promise(f => setTimeout(f, ms));\\n\\t}\\n\\n\\t$: canSave = $session.user && gist && gist.owner === $session.user.uid;\\n\\n\\tfunction handleKeydown(event) {\\n\\t\\tif (event.key === 's' && (isMac ? event.metaKey : event.ctrlKey)) {\\n\\t\\t\\tevent.preventDefault();\\n\\t\\t\\tsave();\\n\\t\\t}\\n\\t}\\n\\n\\tasync function fork(intentWasSave) {\\n\\t\\tsaving = true;\\n\\n\\t\\tconst { components } = repl.toJSON();\\n\\n\\t\\ttry {\\n\\t\\t\\tconst r = await fetch(`repl/create.json`, {\\n\\t\\t\\t\\tmethod: 'POST',\\n\\t\\t\\t\\tcredentials: 'include',\\n\\t\\t\\t\\tbody: JSON.stringify({\\n\\t\\t\\t\\t\\tname,\\n\\t\\t\\t\\t\\tfiles: components.map(component => ({\\n\\t\\t\\t\\t\\t\\tname: `${component.name}.${component.type}`,\\n\\t\\t\\t\\t\\t\\tsource: component.source\\n\\t\\t\\t\\t\\t}))\\n\\t\\t\\t\\t})\\n\\t\\t\\t});\\n\\n\\t\\t\\tif (r.status < 200 || r.status >= 300) {\\n\\t\\t\\t\\tconst { error } = await r.json();\\n\\t\\t\\t\\tthrow new Error(`Received an HTTP ${r.status} response: ${error}`);\\n\\t\\t\\t}\\n\\n\\t\\t\\tconst gist = await r.json();\\n\\t\\t\\tdispatch('forked', { gist });\\n\\n\\t\\t\\tif (intentWasSave) {\\n\\t\\t\\t\\tjustSaved = true;\\n\\t\\t\\t\\tawait wait(600);\\n\\t\\t\\t\\tjustSaved = false;\\n\\t\\t\\t} else {\\n\\t\\t\\t\\tjustForked = true;\\n\\t\\t\\t\\tawait wait(600);\\n\\t\\t\\t\\tjustForked = false;\\n\\t\\t\\t}\\n\\t\\t} catch (err) {\\n\\t\\t\\tif (navigator.onLine) {\\n\\t\\t\\t\\talert(err.message);\\n\\t\\t\\t} else {\\n\\t\\t\\t\\talert(`It looks like you're offline! Find the internet and try again`);\\n\\t\\t\\t}\\n\\t\\t}\\n\\n\\t\\tsaving = false;\\n\\t}\\n\\n\\tasync function save() {\\n\\t\\tif (saving) return;\\n\\n\\t\\tif (!canSave) {\\n\\t\\t\\tfork(true);\\n\\t\\t\\treturn;\\n\\t\\t}\\n\\n\\t\\tsaving = true;\\n\\n\\t\\ttry {\\n\\t\\t\\t// Send all files back to API\\n\\t\\t\\t// ~> Any missing files are considered deleted!\\n\\t\\t\\tconst { components } = repl.toJSON();\\n\\n\\t\\t\\tconst r = await fetch(`repl/${gist.uid}.json`, {\\n\\t\\t\\t\\tmethod: 'PATCH',\\n\\t\\t\\t\\tcredentials: 'include',\\n\\t\\t\\t\\tbody: JSON.stringify({\\n\\t\\t\\t\\t\\tname,\\n\\t\\t\\t\\t\\tfiles: components.map(component => ({\\n\\t\\t\\t\\t\\t\\tname: `${component.name}.${component.type}`,\\n\\t\\t\\t\\t\\t\\tsource: component.source\\n\\t\\t\\t\\t\\t}))\\n\\t\\t\\t\\t})\\n\\t\\t\\t});\\n\\n\\t\\t\\tif (r.status < 200 || r.status >= 300) {\\n\\t\\t\\t\\tconst { error } = await r.json();\\n\\t\\t\\t\\tthrow new Error(`Received an HTTP ${r.status} response: ${error}`);\\n\\t\\t\\t}\\n\\n\\t\\t\\tawait r.json();\\n\\n\\t\\t\\tjustSaved = true;\\n\\t\\t\\tawait wait(600);\\n\\t\\t\\tjustSaved = false;\\n\\t\\t} catch (err) {\\n\\t\\t\\tif (navigator.onLine) {\\n\\t\\t\\t\\talert(err.message);\\n\\t\\t\\t} else {\\n\\t\\t\\t\\talert(`It looks like you're offline! Find the internet and try again`);\\n\\t\\t\\t}\\n\\t\\t}\\n\\n\\t\\tsaving = false;\\n\\t}\\n\\n\\tasync function download() {\\n\\t\\tdownloading = true;\\n\\n\\t\\tconst { components, imports } = repl.toJSON();\\n\\n\\t\\tconst files = await (await fetch('/svelte-app.json')).json();\\n\\n\\t\\tif (imports.length > 0) {\\n\\t\\t\\tconst idx = files.findIndex(({ path }) => path === 'package.json');\\n\\t\\t\\tconst pkg = JSON.parse(files[idx].data);\\n\\t\\t\\tconst { devDependencies } = pkg;\\n\\t\\t\\timports.forEach(mod => {\\n\\t\\t\\t\\tconst match = /^(@[^/]+\\\\/)?[^@/]+/.exec(mod);\\n\\t\\t\\t\\tdevDependencies[match[0]] = 'latest';\\n\\t\\t\\t});\\n\\t\\t\\tpkg.devDependencies = devDependencies;\\n\\t\\t\\tfiles[idx].data = JSON.stringify(pkg, null, '  ');\\n\\t\\t}\\n\\n\\t\\tfiles.push(...components.map(component => ({ path: `src/${component.name}.${component.type}`, data: component.source })));\\n\\t\\tfiles.push({\\n\\t\\t\\tpath: `src/main.js`, data: `import App from './App.svelte';\\n\\nvar app = new App({\\n\\ttarget: document.body\\n});\\n\\nexport default app;` });\\n\\n\\t\\tdownloadBlob(doNotZip.toBlob(files), 'svelte-app.zip');\\n\\n\\t\\tdownloading = false;\\n\\t}\\n</script>\\n\\n<svelte:window on:keydown={handleKeydown} />\\n\\n<div class=\\\"app-controls\\\">\\n\\t<input\\n\\t\\tbind:value={name}\\n\\t\\ton:focus=\\\"{e => e.target.select()}\\\"\\n\\t\\tuse:enter=\\\"{e => e.target.blur()}\\\"\\n\\t>\\n\\n\\t<div style=\\\"text-align: right; margin-right:.4rem\\\">\\n\\t\\t<button class=\\\"icon\\\" on:click=\\\"{() => zen_mode = !zen_mode}\\\" title=\\\"fullscreen editor\\\">\\n\\t\\t\\t{#if zen_mode}\\n\\t\\t\\t\\t<Icon name=\\\"close\\\" />\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\t<Icon name=\\\"maximize\\\" />\\n\\t\\t\\t{/if}\\n\\t\\t</button>\\n\\n\\t\\t<button class=\\\"icon\\\" disabled={downloading} on:click={download} title=\\\"download zip file\\\">\\n\\t\\t\\t<Icon name=\\\"download\\\" />\\n\\t\\t</button>\\n\\n\\t\\t<button class=\\\"icon\\\" disabled=\\\"{saving || !$session.user}\\\" on:click={() => fork(false)} title=\\\"fork\\\">\\n\\t\\t\\t{#if justForked}\\n\\t\\t\\t\\t<Icon name=\\\"check\\\" />\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\t<Icon name=\\\"git-branch\\\" />\\n\\t\\t\\t{/if}\\n\\t\\t</button>\\n\\n\\t\\t<button class=\\\"icon\\\" disabled=\\\"{saving || !$session.user}\\\" on:click={save} title=\\\"save\\\">\\n\\t\\t\\t{#if justSaved}\\n\\t\\t\\t\\t<Icon name=\\\"check\\\" />\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\t<Icon name=\\\"save\\\" />\\n\\t\\t\\t{/if}\\n\\t\\t</button>\\n\\n\\t\\t{#if $session.user}\\n\\t\\t\\t<UserMenu/>\\n\\t\\t{:else}\\n\\t\\t\\t<button class=\\\"icon\\\" on:click|preventDefault={login}>\\n\\t\\t\\t\\t<Icon name=\\\"log-in\\\" />\\n\\t\\t\\t\\t<span>&nbsp;Log in to save</span>\\n\\t\\t\\t</button>\\n\\t\\t{/if}\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.app-controls {\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 100%;\\n\\t\\theight: var(--app-controls-h);\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: space-between;\\n\\t\\tpadding: .6rem var(--side-nav);\\n\\t\\tbackground-color: var(--second);\\n\\t\\tcolor: white;\\n\\t\\twhite-space: nowrap;\\n\\t\\tflex: 0;\\n\\t}\\n\\n\\t.icon {\\n\\t\\tposition: relative;\\n\\t\\ttop: -0.1rem;\\n\\t\\tdisplay: inline-block;\\n\\t\\tpadding: 0.2em;\\n\\t\\topacity: .7;\\n\\t\\ttransition: opacity .3s;\\n\\t\\tfont-family: var(--font);\\n\\t\\tfont-size: 1.6rem;\\n\\t\\tcolor: white;\\n\\t\\t/* width: 1.6em;\\n\\t\\theight: 1.6em; */\\n\\t\\tline-height: 1;\\n\\t\\tmargin: 0 0 0 0.2em;\\n\\t}\\n\\n\\t.icon:hover    { opacity: 1 }\\n\\t.icon:disabled { opacity: .3 }\\n\\n\\t.icon[title^='fullscreen'] { display: none }\\n\\n\\tinput {\\n\\t\\tbackground: transparent;\\n\\t\\tborder: none;\\n\\t\\tcolor: currentColor;\\n\\t\\tfont-family: var(--font);\\n\\t\\tfont-size: 1.6rem;\\n\\t\\topacity: 0.7;\\n\\t\\toutline: none;\\n\\t\\tflex: 1;\\n\\t}\\n\\n\\tinput:focus {\\n\\t\\topacity: 1;\\n\\t}\\n\\n\\tbutton span {\\n\\t\\tdisplay: none;\\n\\t}\\n\\n\\t@media (min-width: 600px) {\\n\\t\\t.icon[title^='fullscreen'] { display: inline }\\n\\n\\t\\tbutton span {\\n\\t\\t\\tdisplay: inline-block;\\n\\t\\t}\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAyNC,aAAa,8BAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,gBAAgB,CAAC,CAC7B,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aAAa,CAC9B,OAAO,CAAE,KAAK,CAAC,IAAI,UAAU,CAAC,CAC9B,gBAAgB,CAAE,IAAI,QAAQ,CAAC,CAC/B,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,MAAM,CACnB,IAAI,CAAE,CAAC,AACR,CAAC,AAED,KAAK,8BAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,OAAO,CACZ,OAAO,CAAE,YAAY,CACrB,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,OAAO,CAAC,GAAG,CACvB,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,KAAK,CAGZ,WAAW,CAAE,CAAC,CACd,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,AACpB,CAAC,AAED,mCAAK,MAAM,AAAI,CAAC,AAAC,OAAO,CAAE,CAAC,CAAC,CAAC,AAC7B,mCAAK,SAAS,AAAC,CAAC,AAAC,OAAO,CAAE,EAAE,CAAC,CAAC,AAE9B,KAAK,CAAC,KAAK,EAAE,YAAY,CAAC,8BAAC,CAAC,AAAC,OAAO,CAAE,IAAI,CAAC,CAAC,AAE5C,KAAK,8BAAC,CAAC,AACN,UAAU,CAAE,WAAW,CACvB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,YAAY,CACnB,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,SAAS,CAAE,MAAM,CACjB,OAAO,CAAE,GAAG,CACZ,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,AACR,CAAC,AAED,mCAAK,MAAM,AAAC,CAAC,AACZ,OAAO,CAAE,CAAC,AACX,CAAC,AAED,qBAAM,CAAC,IAAI,eAAC,CAAC,AACZ,OAAO,CAAE,IAAI,AACd,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,KAAK,CAAC,KAAK,EAAE,YAAY,CAAC,8BAAC,CAAC,AAAC,OAAO,CAAE,MAAM,CAAC,CAAC,AAE9C,qBAAM,CAAC,IAAI,eAAC,CAAC,AACZ,OAAO,CAAE,YAAY,AACtB,CAAC,AACF,CAAC\"}"
};

const AppControls = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	const dispatch = createEventDispatcher();
	const { session } = stores$1();
	validate_store(session, "session");
	$session = get_store_value(session);
	const { login } = getContext("app");
	let { repl } = $$props;
	let { gist } = $$props;
	let { name } = $$props;
	let { zen_mode } = $$props;
	let { bundle } = $$props;

	if ($$props.repl === void 0 && $$bindings.repl && repl !== void 0) $$bindings.repl(repl);
	if ($$props.gist === void 0 && $$bindings.gist && gist !== void 0) $$bindings.gist(gist);
	if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
	if ($$props.zen_mode === void 0 && $$bindings.zen_mode && zen_mode !== void 0) $$bindings.zen_mode(zen_mode);
	if ($$props.bundle === void 0 && $$bindings.bundle && bundle !== void 0) $$bindings.bundle(bundle);
	$$result.css.add(css$K);
	validate_store(session, "session");
	$session = get_store_value(session);
	let canSave;
	canSave = $session.user && gist && gist.owner === $session.user.uid;

	return `

<div class="${"app-controls svelte-1xhvee5"}"><input class="${"svelte-1xhvee5"}"${add_attribute("value", name, 1)}>

	<div style="${"text-align: right; margin-right:.4rem"}"><button class="${"icon svelte-1xhvee5"}" title="${"fullscreen editor"}">${zen_mode
	? `${validate_component(Icon, "Icon").$$render($$result, { name: "close" }, {}, {})}`
	: `${validate_component(Icon, "Icon").$$render($$result, { name: "maximize" }, {}, {})}`}</button>

		<button class="${"icon svelte-1xhvee5"}" ${ ""} title="${"download zip file"}">${validate_component(Icon, "Icon").$$render($$result, { name: "download" }, {}, {})}</button>

		<button class="${"icon svelte-1xhvee5"}" ${ !$session.user ? "disabled" : ""} title="${"fork"}">${ `${validate_component(Icon, "Icon").$$render($$result, { name: "git-branch" }, {}, {})}`}</button>

		<button class="${"icon svelte-1xhvee5"}" ${ !$session.user ? "disabled" : ""} title="${"save"}">${ `${validate_component(Icon, "Icon").$$render($$result, { name: "save" }, {}, {})}`}</button>

		${$session.user
	? `${validate_component(UserMenu, "UserMenu").$$render($$result, {}, {}, {})}`
	: `<button class="${"icon svelte-1xhvee5"}">${validate_component(Icon, "Icon").$$render($$result, { name: "log-in" }, {}, {})}
				<span class="${"svelte-1xhvee5"}"> Log in to save</span></button>`}</div>
</div>`;
});

/* src/routes/repl/[id]/index.svelte generated by Svelte v3.31.0 */

const css$L = {
	code: ".repl-outer.svelte-13ln553.svelte-13ln553{position:relative;height:calc(100vh - var(--nav-h));--app-controls-h:5.6rem;--pane-controls-h:4.2rem;overflow:hidden;background-color:var(--back);padding:var(--app-controls-h) 0 0 0;box-sizing:border-box;display:flex;flex-direction:column}.viewport.svelte-13ln553.svelte-13ln553{width:100%;height:100%}.mobile.svelte-13ln553 .viewport.svelte-13ln553{width:200%;height:calc(100% - 42px);transition:transform 0.3s;flex:1}.mobile.svelte-13ln553 .offset.svelte-13ln553{transform:translate(-50%, 0)}.viewport.svelte-13ln553 .tab-content,.viewport.svelte-13ln553 .tab-content.visible{pointer-events:all;opacity:1}.viewport.svelte-13ln553 .tab-content{visibility:hidden}.viewport.svelte-13ln553 .tab-content.visible{visibility:visible}.zen-mode.svelte-13ln553.svelte-13ln553{position:fixed;width:100%;height:100%;top:0;z-index:111}@keyframes svelte-13ln553-fade-in{0%{opacity:0 }100%{opacity:1 }}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\texport function preload({ params, query }) {\\n\\t\\treturn {\\n\\t\\t\\tversion: query.version || '3',\\n\\t\\t\\tid: params.id\\n\\t\\t};\\n\\t}\\n</script>\\n\\n<script>\\n\\timport Repl from '@sveltejs/svelte-repl';\\n\\timport { onMount } from 'svelte';\\n\\timport { goto, stores } from '@sapper/app';\\n\\timport InputOutputToggle from '../../../components/Repl/InputOutputToggle.svelte';\\n\\timport AppControls from './_components/AppControls/index.svelte';\\n\\n\\texport let version;\\n\\texport let id;\\n\\n\\tconst { session } = stores();\\n\\n\\tlet repl;\\n\\tlet gist;\\n\\tlet name = 'Loading...';\\n\\tlet zen_mode = false;\\n\\tlet is_relaxed_gist = false;\\n\\tlet width = false ? window.innerWidth : 1000;\\n\\tlet checked = false;\\n\\n\\tfunction update_query_string(version) {\\n\\t\\tconst params = [];\\n\\n\\t\\tif (version !== 'latest') params.push(`version=${version}`);\\n\\n\\t\\tconst url = params.length > 0\\n\\t\\t\\t? `repl/${id}?${params.join('&')}`\\n\\t\\t\\t: `repl/${id}`;\\n\\n\\t\\thistory.replaceState({}, 'x', url);\\n\\t}\\n\\n\\t$: if (typeof history !== 'undefined') update_query_string(version);\\n\\n\\tfunction fetch_gist(id) {\\n\\t\\tif (gist && gist.uid === id) {\\n\\t\\t\\t// if the id changed because we just forked, don't refetch\\n\\t\\t\\treturn;\\n\\t\\t}\\n\\n\\t\\t// TODO handle `relaxed` logic\\n\\t\\tfetch(`repl/${id}.json`).then(r => {\\n\\t\\t\\tif (r.ok) {\\n\\t\\t\\t\\tr.json().then(data => {\\n\\t\\t\\t\\t\\tgist = data;\\n\\t\\t\\t\\t\\tname = data.name;\\n\\n\\t\\t\\t\\t\\tis_relaxed_gist = data.relaxed;\\n\\n\\t\\t\\t\\t\\tconst components = data.files.map(file => {\\n\\t\\t\\t\\t\\t\\tconst dot = file.name.lastIndexOf(\\\".\\\");\\n\\t\\t\\t\\t\\t\\tlet name = file.name.slice(0, dot);\\n\\t\\t\\t\\t\\t\\tlet type = file.name.slice(dot + 1);\\n\\n\\t\\t\\t\\t\\t\\tif (type === 'html') type = 'svelte'; // TODO do this on the server\\n\\t\\t\\t\\t\\t\\treturn { name, type, source: file.source };\\n\\t\\t\\t\\t\\t});\\n\\n\\t\\t\\t\\t\\tcomponents.sort((a, b) => {\\n\\t\\t\\t\\t\\t\\tif (a.name === 'App' && a.type === 'svelte') return -1;\\n\\t\\t\\t\\t\\t\\tif (b.name === 'App' && b.type === 'svelte') return 1;\\n\\n\\t\\t\\t\\t\\t\\tif (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;\\n\\n\\t\\t\\t\\t\\t\\treturn a.name < b.name ? -1 : 1;\\n\\t\\t\\t\\t\\t});\\n\\n\\t\\t\\t\\t\\trepl.set({ components });\\n\\t\\t\\t\\t});\\n\\t\\t\\t} else {\\n\\t\\t\\t\\tconsole.warn('TODO: 404 Gist');\\n\\t\\t\\t}\\n\\t\\t});\\n\\t}\\n\\n\\t$: if (false) fetch_gist(id);\\n\\n\\tonMount(() => {\\n\\t\\tif (version !== 'local') {\\n\\t\\t\\tfetch(`https://unpkg.com/svelte@${version || '3'}/package.json`)\\n\\t\\t\\t\\t.then(r => r.json())\\n\\t\\t\\t\\t.then(pkg => {\\n\\t\\t\\t\\t\\tversion = pkg.version;\\n\\t\\t\\t\\t});\\n\\t\\t}\\n\\t});\\n\\n\\tfunction handle_fork(event) {\\n\\t\\tconsole.log('> handle_fork', event);\\n\\t\\tgist = event.detail.gist;\\n\\t\\tgoto(`/repl/${gist.uid}?version=${version}`);\\n\\t}\\n\\n\\t$: svelteUrl = false && version === 'local' ?\\n\\t\\t`${location.origin}/repl/local` :\\n\\t\\t`https://unpkg.com/svelte@${version}`;\\n\\n\\tconst rollupUrl = `https://unpkg.com/rollup@1/dist/rollup.browser.js`;\\n\\n\\t// needed for context API example\\n\\tconst mapbox_setup = `window.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;`;\\n\\n\\t$: mobile = width < 540;\\n\\n\\t$: relaxed = is_relaxed_gist || ($session.user && gist && $session.user.uid === gist.owner);\\n</script>\\n\\n<style>\\n\\t.repl-outer {\\n\\t\\tposition: relative;\\n\\t\\theight: calc(100vh - var(--nav-h));\\n\\t\\t--app-controls-h: 5.6rem;\\n\\t\\t--pane-controls-h: 4.2rem;\\n\\t\\toverflow: hidden;\\n\\t\\tbackground-color: var(--back);\\n\\t\\tpadding: var(--app-controls-h) 0 0 0;\\n\\t\\t/* margin: 0 calc(var(--side-nav) * -1); */\\n\\t\\tbox-sizing: border-box;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t}\\n\\n\\t.viewport {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\t.mobile .viewport {\\n\\t\\twidth: 200%;\\n\\t\\theight: calc(100% - 42px);\\n\\t\\ttransition: transform 0.3s;\\n\\t\\tflex: 1;\\n\\t}\\n\\n\\t.mobile .offset {\\n\\t\\ttransform: translate(-50%, 0);\\n\\t}\\n\\n\\t/* temp fix for #2499 and #2550 while waiting for a fix for https://github.com/sveltejs/svelte-repl/issues/8 */\\n\\n\\t.viewport :global(.tab-content),\\n\\t.viewport :global(.tab-content.visible) {\\n\\t\\tpointer-events: all;\\n\\t\\topacity: 1;\\n\\t}\\n\\t.viewport :global(.tab-content) {\\n\\t\\tvisibility: hidden;\\n\\t}\\n\\t.viewport :global(.tab-content.visible) {\\n\\t\\tvisibility: visible;\\n\\t}\\n\\n\\t.zen-mode {\\n\\t\\tposition: fixed;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\ttop: 0;\\n\\t\\tz-index: 111;\\n\\t}\\n\\n\\t.pane { width: 100%; height: 100% }\\n\\n\\t.loading {\\n\\t\\ttext-align: center;\\n\\t\\tcolor: var(--second);\\n\\t\\tfont-weight: 400;\\n\\t\\tmargin: 2em 0 0 0;\\n\\t\\topacity: 0;\\n\\t\\tanimation: fade-in .4s;\\n\\t\\tanimation-delay: .2s;\\n\\t\\tanimation-fill-mode: both;\\n\\t}\\n\\n\\t@keyframes fade-in {\\n\\t\\t0%   { opacity: 0 }\\n\\t\\t100% { opacity: 1 }\\n\\t}\\n\\n\\t.input {\\n\\t\\tpadding: 2.4em 0 0 0;\\n\\t}\\n</style>\\n\\n<svelte:head>\\n\\t<title>{name} • REPL • Svelte</title>\\n\\n\\t<meta name=\\\"twitter:title\\\" content=\\\"Svelte REPL\\\">\\n\\t<meta name=\\\"twitter:description\\\" content=\\\"Cybernetically enhanced web apps\\\">\\n\\t<meta name=\\\"Description\\\" content=\\\"Interactive Svelte playground\\\">\\n</svelte:head>\\n\\n<svelte:window bind:innerWidth={width}/>\\n\\n<div class=\\\"repl-outer {zen_mode ? 'zen-mode' : ''}\\\" class:mobile>\\n\\t<AppControls\\n\\t\\t{gist}\\n\\t\\t{repl}\\n\\t\\tbind:name\\n\\t\\tbind:zen_mode\\n\\t\\ton:forked={handle_fork}\\n\\t/>\\n\\n\\t{#if false}\\n\\t\\t<div class=\\\"viewport\\\" class:offset={checked}>\\n\\t\\t\\t<Repl\\n\\t\\t\\t\\tbind:this={repl}\\n\\t\\t\\t\\tworkersUrl=\\\"workers\\\"\\n\\t\\t\\t\\t{svelteUrl}\\n\\t\\t\\t\\t{rollupUrl}\\n\\t\\t\\t\\t{relaxed}\\n\\t\\t\\t\\tfixed={mobile}\\n\\t\\t\\t\\tinjectedJS={mapbox_setup}\\n\\t\\t\\t/>\\n\\t\\t</div>\\n\\n\\t\\t{#if mobile}\\n\\t\\t\\t<InputOutputToggle bind:checked/>\\n\\t\\t{/if}\\n\\t{/if}\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAqHC,WAAW,8BAAC,CAAC,AACZ,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,OAAO,CAAC,CAAC,CAClC,gBAAgB,CAAE,MAAM,CACxB,iBAAiB,CAAE,MAAM,CACzB,QAAQ,CAAE,MAAM,CAChB,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,OAAO,CAAE,IAAI,gBAAgB,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAEpC,UAAU,CAAE,UAAU,CACtB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,AACvB,CAAC,AAED,SAAS,8BAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC,AAED,sBAAO,CAAC,SAAS,eAAC,CAAC,AAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CACzB,UAAU,CAAE,SAAS,CAAC,IAAI,CAC1B,IAAI,CAAE,CAAC,AACR,CAAC,AAED,sBAAO,CAAC,OAAO,eAAC,CAAC,AAChB,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,CAAC,CAAC,AAC9B,CAAC,AAID,wBAAS,CAAC,AAAQ,YAAY,AAAC,CAC/B,wBAAS,CAAC,AAAQ,oBAAoB,AAAE,CAAC,AACxC,cAAc,CAAE,GAAG,CACnB,OAAO,CAAE,CAAC,AACX,CAAC,AACD,wBAAS,CAAC,AAAQ,YAAY,AAAE,CAAC,AAChC,UAAU,CAAE,MAAM,AACnB,CAAC,AACD,wBAAS,CAAC,AAAQ,oBAAoB,AAAE,CAAC,AACxC,UAAU,CAAE,OAAO,AACpB,CAAC,AAED,SAAS,8BAAC,CAAC,AACV,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,GAAG,AACb,CAAC,AAeD,WAAW,sBAAQ,CAAC,AACnB,EAAE,AAAG,CAAC,AAAC,OAAO,CAAE,CAAC,CAAC,CAAC,AACnB,IAAI,AAAC,CAAC,AAAC,OAAO,CAAE,CAAC,CAAC,CAAC,AACpB,CAAC\"}"
};

function preload$a({ params, query }) {
	return {
		version: query.version || "3",
		id: params.id
	};
}

const U5Bidu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	let { version } = $$props;
	let { id } = $$props;
	const { session } = stores$1();
	validate_store(session, "session");
	$session = get_store_value(session);
	let repl;
	let gist;
	let name = "Loading...";
	let zen_mode = false;
	let width =  1000;

	function update_query_string(version) {
		const params = [];
		if (version !== "latest") params.push(`version=${version}`);

		const url = params.length > 0
		? `repl/${id}?${params.join("&")}`
		: `repl/${id}`;

		history.replaceState({}, "x", url);
	}

	onMount(() => {
		if (version !== "local") {
			fetch(`https://unpkg.com/svelte@${version || "3"}/package.json`).then(r => r.json()).then(pkg => {
				version = pkg.version;
			});
		}
	});

	if ($$props.version === void 0 && $$bindings.version && version !== void 0) $$bindings.version(version);
	if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
	$$result.css.add(css$L);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		validate_store(session, "session");
		$session = get_store_value(session);
		let mobile;
		let relaxed;

		 {
			if (typeof history !== "undefined") update_query_string(version);
		}

		mobile = width < 540;
		relaxed =  $session.user && gist && $session.user.uid === gist.owner;

		$$rendered = `${($$result.head += `${($$result.title = `<title>${escape(name)} • REPL • Svelte</title>`, "")}<meta name="${"twitter:title"}" content="${"Svelte REPL"}" data-svelte="svelte-d7d7y5"><meta name="${"twitter:description"}" content="${"Cybernetically enhanced web apps"}" data-svelte="svelte-d7d7y5"><meta name="${"Description"}" content="${"Interactive Svelte playground"}" data-svelte="svelte-d7d7y5">`, "")}



<div class="${[
			"repl-outer " + escape(zen_mode ? "zen-mode" : "") + " svelte-13ln553",
			mobile ? "mobile" : ""
		].join(" ").trim()}">${validate_component(AppControls, "AppControls").$$render(
			$$result,
			{ gist, repl, name, zen_mode },
			{
				name: $$value => {
					name = $$value;
					$$settled = false;
				},
				zen_mode: $$value => {
					zen_mode = $$value;
					$$settled = false;
				}
			},
			{}
		)}

	${ ``}</div>`;
	} while (!$$settled);

	return $$rendered;
});

var component_11 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': U5Bidu5D,
	preload: preload$a
});

/* src/routes/faq/index.svelte generated by Svelte v3.31.0 */

const css$M = {
	code: ".faqs.svelte-1ty6sog.svelte-1ty6sog{grid-template-columns:1fr 1fr;grid-gap:1em;min-height:calc(100vh - var(--nav-h));padding:var(--top-offset) var(--side-nav) 6rem var(--side-nav);max-width:var(--main-width);margin:0 auto}h2.svelte-1ty6sog.svelte-1ty6sog{display:inline-block;margin:3.2rem 0 1rem 0;color:var(--text);max-width:18em;font-size:var(--h3);font-weight:400}.faq.svelte-1ty6sog.svelte-1ty6sog:first-child{margin:0 0 2rem 0;padding:0 0 4rem 0;border-bottom:var(--border-w) solid #6767785b}.faq.svelte-1ty6sog:first-child h2.svelte-1ty6sog{font-size:4rem;font-weight:400;color:var(--second)}.faq.svelte-1ty6sog p.svelte-1ty6sog{font-size:var(--h5);max-width:30em;color:var(--second)}.faqs .faq ul{margin-left:3.2rem}.faqs.svelte-1ty6sog .anchor{top:calc((var(--h3) - 24px) / 2)}@media(max-width: 768px){.faqs.svelte-1ty6sog .anchor{transform:scale(0.6);opacity:1;left:-1.0em}}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n\\texport async function preload() {\\n\\t\\tconst faqs = await this.fetch(`faq.json`).then(r => r.json());\\n\\t\\treturn { faqs };\\n\\t}\\n</script>\\n\\n<script>\\n\\tconst description = \\\"Frequently Asked Questions about Svelte\\\"\\n\\n\\texport let faqs;\\n</script>\\n\\n<svelte:head>\\n\\t<title>Frequently Asked Questions • Svelte</title>\\n\\n\\t<meta name=\\\"twitter:title\\\" content=\\\"Svelte FAQ\\\">\\n\\t<meta name=\\\"twitter:description\\\" content={description}>\\n\\t<meta name=\\\"Description\\\" content={description}>\\n</svelte:head>\\n\\n<div class='faqs stretch'>\\n\\t<h1>Frequently Asked Questions</h1>\\n\\t{#each faqs as faq}\\n\\n\\t\\t<article class='faq'>\\n\\t\\t\\t<h2>\\n\\t\\t\\t<span id={faq.fragment} class=\\\"offset-anchor\\\"></span>\\n\\t\\t\\t<a class=\\\"anchor\\\" rel='prefetch' href='faq#{faq.fragment}' title='{faq.question}'>&nbsp;</a>\\n\\t\\t\\t{faq.metadata.question}\\n\\t\\t\\t</h2>\\n\\t\\t\\t<p>{@html faq.answer}</p>\\n\\t\\t</article>\\n\\t{/each}\\n</div>\\n\\n<style>\\n\\t.faqs {\\n\\t\\tgrid-template-columns: 1fr 1fr;\\n\\t\\tgrid-gap: 1em;\\n\\t\\tmin-height: calc(100vh - var(--nav-h));\\n\\t\\tpadding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);\\n\\t\\tmax-width: var(--main-width);\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\n\\th2 {\\n\\t\\tdisplay: inline-block;\\n\\t\\tmargin: 3.2rem 0 1rem 0;\\n\\t\\tcolor: var(--text);\\n\\t\\tmax-width: 18em;\\n\\t\\tfont-size: var(--h3);\\n\\t\\tfont-weight: 400;\\n\\t}\\n\\n\\t.faq:first-child {\\n\\t\\tmargin: 0 0 2rem 0;\\n\\t\\tpadding: 0 0 4rem 0;\\n\\t\\tborder-bottom: var(--border-w) solid #6767785b; /* based on --second */\\n\\t}\\n\\n\\t.faq:first-child h2 {\\n\\t\\tfont-size: 4rem;\\n\\t\\tfont-weight: 400;\\n\\t\\tcolor: var(--second);\\n\\t}\\n\\n\\t.faq p {\\n\\t\\tfont-size: var(--h5);\\n\\t\\tmax-width: 30em;\\n\\t\\tcolor: var(--second);\\n\\t}\\n\\n\\t:global(.faqs .faq ul) {\\n\\t\\tmargin-left: 3.2rem;\\n\\t}\\n\\n\\t.faqs :global(.anchor) {\\n\\t\\ttop: calc((var(--h3) - 24px) / 2);\\n\\t}\\n\\n\\t@media (max-width: 768px) {\\n\\t\\t.faqs :global(.anchor) {\\n\\t\\t\\ttransform: scale(0.6);\\n\\t\\t\\topacity: 1;\\n\\t\\t\\tleft: -1.0em;\\n\\t\\t}\\n\\t}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAqCC,KAAK,8BAAC,CAAC,AACN,qBAAqB,CAAE,GAAG,CAAC,GAAG,CAC9B,QAAQ,CAAE,GAAG,CACb,UAAU,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,IAAI,OAAO,CAAC,CAAC,CACtC,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,IAAI,CAAC,IAAI,UAAU,CAAC,CAC/D,SAAS,CAAE,IAAI,YAAY,CAAC,CAC5B,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,EAAE,8BAAC,CAAC,AACH,OAAO,CAAE,YAAY,CACrB,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACvB,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,SAAS,CAAE,IAAI,CACf,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,kCAAI,YAAY,AAAC,CAAC,AACjB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAClB,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACnB,aAAa,CAAE,IAAI,UAAU,CAAC,CAAC,KAAK,CAAC,SAAS,AAC/C,CAAC,AAED,mBAAI,YAAY,CAAC,EAAE,eAAC,CAAC,AACpB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,QAAQ,CAAC,AACrB,CAAC,AAED,mBAAI,CAAC,CAAC,eAAC,CAAC,AACP,SAAS,CAAE,IAAI,IAAI,CAAC,CACpB,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,QAAQ,CAAC,AACrB,CAAC,AAEO,aAAa,AAAE,CAAC,AACvB,WAAW,CAAE,MAAM,AACpB,CAAC,AAED,oBAAK,CAAC,AAAQ,OAAO,AAAE,CAAC,AACvB,GAAG,CAAE,KAAK,CAAC,IAAI,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AAClC,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,oBAAK,CAAC,AAAQ,OAAO,AAAE,CAAC,AACvB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,OAAO,CAAE,CAAC,CACV,IAAI,CAAE,MAAM,AACb,CAAC,AACF,CAAC\"}"
};

async function preload$b() {
	const faqs = await this.fetch(`faq.json`).then(r => r.json());
	return { faqs };
}

const description = "Frequently Asked Questions about Svelte";

const Faq = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { faqs } = $$props;
	if ($$props.faqs === void 0 && $$bindings.faqs && faqs !== void 0) $$bindings.faqs(faqs);
	$$result.css.add(css$M);

	return `${($$result.head += `${($$result.title = `<title>Frequently Asked Questions • Svelte</title>`, "")}<meta name="${"twitter:title"}" content="${"Svelte FAQ"}" data-svelte="svelte-r4p7co"><meta name="${"twitter:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-r4p7co"><meta name="${"Description"}"${add_attribute("content", description, 0)} data-svelte="svelte-r4p7co">`, "")}

<div class="${"faqs stretch svelte-1ty6sog"}"><h1>Frequently Asked Questions</h1>
	${each(faqs, faq => `<article class="${"faq svelte-1ty6sog"}"><h2 class="${"svelte-1ty6sog"}"><span${add_attribute("id", faq.fragment, 0)} class="${"offset-anchor"}"></span>
			<a class="${"anchor"}" rel="${"prefetch"}" href="${"faq#" + escape(faq.fragment)}"${add_attribute("title", faq.question, 0)}> </a>
			${escape(faq.metadata.question)}</h2>
			<p class="${"svelte-1ty6sog"}">${faq.answer}</p>
		</article>`)}
</div>`;
});

var component_12 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Faq,
	preload: preload$b
});

// This file is generated by Sapper — do not edit it!

const d = decodeURIComponent;

const manifest = {
	server_routes: [
		{
			// examples/index.json.js
			pattern: /^\/examples\.json$/,
			handlers: route_0,
			params: () => ({})
		},

		{
			// examples/[slug].json.js
			pattern: /^\/examples\/([^/]+?)\.json$/,
			handlers: route_1,
			params: match => ({ slug: d(match[1]) })
		},

		{
			// tutorial/index.json.js
			pattern: /^\/tutorial\.json$/,
			handlers: route_2,
			params: () => ({})
		},

		{
			// tutorial/random-number.js
			pattern: /^\/tutorial\/random-number\/?$/,
			handlers: route_3,
			params: () => ({})
		},

		{
			// tutorial/[slug]/index.json.js
			pattern: /^\/tutorial\/([^/]+?)\.json$/,
			handlers: route_4,
			params: match => ({ slug: d(match[1]) })
		},

		{
			// apps/index.json.js
			pattern: /^\/apps\.json$/,
			handlers: route_5,
			params: () => ({})
		},

		{
			// auth/callback.js
			pattern: /^\/auth\/callback\/?$/,
			handlers: route_6,
			params: () => ({})
		},

		{
			// auth/logout.js
			pattern: /^\/auth\/logout\/?$/,
			handlers: route_7,
			params: () => ({})
		},

		{
			// auth/login.js
			pattern: /^\/auth\/login\/?$/,
			handlers: route_8,
			params: () => ({})
		},

		{
			// blog/index.json.js
			pattern: /^\/blog\.json$/,
			handlers: route_9,
			params: () => ({})
		},

		{
			// blog/rss.xml.js
			pattern: /^\/blog\/rss\.xml$/,
			handlers: route_10,
			params: () => ({})
		},

		{
			// blog/[slug].json.js
			pattern: /^\/blog\/([^/]+?)\.json$/,
			handlers: route_11,
			params: match => ({ slug: d(match[1]) })
		},

		{
			// chat.js
			pattern: /^\/chat\/?$/,
			handlers: route_12,
			params: () => ({})
		},

		{
			// docs/index.json.js
			pattern: /^\/docs\.json$/,
			handlers: route_13,
			params: () => ({})
		},

		{
			// repl/create.json.js
			pattern: /^\/repl\/create\.json$/,
			handlers: route_14,
			params: () => ({})
		},

		{
			// repl/local/[...file].js
			pattern: /^\/repl\/local\/(.+)$/,
			handlers: route_15,
			params: match => ({ file: d(match[1]).split('/') })
		},

		{
			// repl/[id]/index.json.js
			pattern: /^\/repl\/([^/]+?)\.json$/,
			handlers: route_16,
			params: match => ({ id: d(match[1]) })
		},

		{
			// faq/index.json.js
			pattern: /^\/faq\.json$/,
			handlers: route_17,
			params: () => ({})
		}
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: component_0 }
			]
		},

		{
			// examples/index.svelte
			pattern: /^\/examples\/?$/,
			parts: [
				{ name: "examples", file: "examples/index.svelte", component: component_1 }
			]
		},

		{
			// tutorial/index.svelte
			pattern: /^\/tutorial\/?$/,
			parts: [
				{ name: "tutorial__layout", file: "tutorial/_layout.svelte", component: component_2 },
				{ name: "tutorial", file: "tutorial/index.svelte", component: component_3 }
			]
		},

		{
			// tutorial/[slug]/index.svelte
			pattern: /^\/tutorial\/([^/]+?)\/?$/,
			parts: [
				{ name: "tutorial__layout", file: "tutorial/_layout.svelte", component: component_2 },
				{ name: "tutorial_$slug", file: "tutorial/[slug]/index.svelte", component: component_4, params: match => ({ slug: d(match[1]) }) }
			]
		},

		{
			// apps/index.svelte
			pattern: /^\/apps\/?$/,
			parts: [
				{ name: "apps", file: "apps/index.svelte", component: component_5 }
			]
		},

		{
			// blog/index.svelte
			pattern: /^\/blog\/?$/,
			parts: [
				{ name: "blog", file: "blog/index.svelte", component: component_6 }
			]
		},

		{
			// blog/[slug].svelte
			pattern: /^\/blog\/([^/]+?)\/?$/,
			parts: [
				null,
				{ name: "blog_$slug", file: "blog/[slug].svelte", component: component_7, params: match => ({ slug: d(match[1]) }) }
			]
		},

		{
			// docs/index.svelte
			pattern: /^\/docs\/?$/,
			parts: [
				{ name: "docs", file: "docs/index.svelte", component: component_8 }
			]
		},

		{
			// repl/index.svelte
			pattern: /^\/repl\/?$/,
			parts: [
				{ name: "repl", file: "repl/index.svelte", component: component_9 }
			]
		},

		{
			// repl/embed.svelte
			pattern: /^\/repl\/embed\/?$/,
			parts: [
				null,
				{ name: "repl_embed", file: "repl/embed.svelte", component: component_10 }
			]
		},

		{
			// repl/[id]/index.svelte
			pattern: /^\/repl\/([^/]+?)\/?$/,
			parts: [
				null,
				{ name: "repl_$id", file: "repl/[id]/index.svelte", component: component_11, params: match => ({ id: d(match[1]) }) }
			]
		},

		{
			// faq/index.svelte
			pattern: /^\/faq\/?$/,
			parts: [
				{ name: "faq", file: "faq/index.svelte", component: component_12 }
			]
		}
	],

	root_comp,
	error: Error$1
};

const build_dir = "__sapper__/dev";

const src_dir = "src";

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomdeleted+xml":["atomdeleted"],"application/atomsvc+xml":["atomsvc"],"application/atsc-dwd+xml":["dwd"],"application/atsc-held+xml":["held"],"application/atsc-rsat+xml":["rsat"],"application/bdoc":["bdoc"],"application/calendar+xml":["xcs"],"application/ccxml+xml":["ccxml"],"application/cdfx+xml":["cdfx"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/emotionml+xml":["emotionml"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/fdt+xml":["fdt"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/its+xml":["its"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lgr+xml":["lgr"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mmt-aei+xml":["maei"],"application/mmt-usd+xml":["musd"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/mrb-consumer+xml":["*xdf"],"application/mrb-publish+xml":["*xdf"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/node":["cjs"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/p2p-overlay+xml":["relo"],"application/patch-ops-error+xml":["*xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/provenance+xml":["provx"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/route-apd+xml":["rapd"],"application/route-s-tsid+xml":["sls"],"application/route-usd+xml":["rusd"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/senml+xml":["senmlx"],"application/sensml+xml":["sensmlx"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/swid+xml":["swidtag"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/toml":["toml"],"application/ttml+xml":["ttml"],"application/urc-ressheet+xml":["rsheet"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-att+xml":["xav"],"application/xcap-caps+xml":["xca"],"application/xcap-diff+xml":["xdf"],"application/xcap-el+xml":["xel"],"application/xcap-error+xml":["xer"],"application/xcap-ns+xml":["xns"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xliff+xml":["xlf"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mobile-xmf":["mxmf"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/hej2k":["hej2"],"image/hsj2":["hsj2"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jph":["jph"],"image/jphc":["jhc"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/jxra":["jxra"],"image/jxrs":["jxrs"],"image/jxs":["jxs"],"image/jxsc":["jxsc"],"image/jxsi":["jxsi"],"image/jxss":["jxss"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/mtl":["mtl"],"model/obj":["obj"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var lite = new Mime_1(standard);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function get_server_route_handler(routes) {
    function handle_route(route, req, res, next) {
        return __awaiter$1(this, void 0, void 0, function* () {
            req.params = route.params(route.pattern.exec(req.path));
            const method = req.method.toLowerCase();
            // 'delete' cannot be exported from a module because it is a keyword,
            // so check for 'del' instead
            const method_export = method === 'delete' ? 'del' : method;
            const handle_method = route.handlers[method_export];
            if (handle_method) {
                if (process.env.SAPPER_EXPORT) {
                    const { write, end, setHeader } = res;
                    const chunks = [];
                    const headers = {};
                    // intercept data so that it can be exported
                    res.write = function (chunk) {
                        chunks.push(Buffer.from(chunk));
                        return write.apply(res, [chunk]);
                    };
                    res.setHeader = function (name, value) {
                        headers[name.toLowerCase()] = value;
                        setHeader.apply(res, [name, value]);
                    };
                    res.end = function (chunk) {
                        if (chunk)
                            chunks.push(Buffer.from(chunk));
                        end.apply(res, [chunk]);
                        process.send({
                            __sapper__: true,
                            event: 'file',
                            url: req.url,
                            method: req.method,
                            status: res.statusCode,
                            type: headers['content-type'],
                            body: Buffer.concat(chunks)
                        });
                    };
                }
                const handle_next = (err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(err.message);
                    }
                    else {
                        process.nextTick(next);
                    }
                };
                try {
                    yield handle_method(req, res, handle_next);
                }
                catch (err) {
                    console.error(err);
                    handle_next(err);
                }
            }
            else {
                // no matching handler for method
                process.nextTick(next);
            }
        });
    }
    return function find_route(req, res, next) {
        for (const route of routes) {
            if (route.pattern.test(req.path)) {
                handle_route(route, req, res, next);
                return;
            }
        }
        next();
    };
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse$1;

/**
 * Module variables.
 * @private
 */

var decode$1 = decodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse$1(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode$1;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var chars$1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return "new RegExp(" + stringifyString(thing.source) + ", \"" + thing.flags + "\")";
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars$1[num % chars$1.length] + name;
        num = ~~(num / chars$1.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped$1) {
            result += escaped$1[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream__default['default'].Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream__default['default'].PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream__default['default']) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream__default['default']) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream__default['default'])) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream__default['default'] && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream__default['default']) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find$1(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find$1(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find$1(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find$1(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find$1(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find$1(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find$1(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http__default['default'].STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url__default['default'].parse;
const format_url = Url__default['default'].format;

const streamDestructionSupported = 'destroy' in Stream__default['default'].Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream__default['default'].Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream__default['default'].PassThrough;
const resolve_url = Url__default['default'].resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch$1(url, opts) {

	// allow custom promise
	if (!fetch$1.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch$1.Promise;

	// wrap http.request into fetch
	return new fetch$1.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https__default['default'] : http__default['default']).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream__default['default'].Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch$1.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch$1(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib__default['default'].Z_SYNC_FLUSH,
				finishFlush: zlib__default['default'].Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib__default['default'].createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib__default['default'].createInflate());
					} else {
						body = body.pipe(zlib__default['default'].createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib__default['default'].createBrotliDecompress === 'function') {
				body = body.pipe(zlib__default['default'].createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch$1.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch$1.Promise = global.Promise;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
var encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode$1$1 = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

var base64 = {
	encode: encode,
	decode: decode$1$1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode$1 = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode$2 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var base64Vlq = {
	encode: encode$1,
	decode: decode$2
};

function createCommonjsModule$1(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var util = createCommonjsModule$1(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
});

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet;

var arraySet = {
	ArraySet: ArraySet_1
};

var binarySearch = createCommonjsModule$1(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
});

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var quickSort = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$1 = arraySet.ArraySet;

var quickSort$1 = quickSort.quickSort;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

var SourceMapConsumer_1 = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet$1.fromArray(names.map(String), true);
  this._sources = ArraySet$1.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet$1.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet$1.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort$1(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64Vlq.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort$1(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort$1(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort$1(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort$1(this.__originalMappings, util.compareByOriginalPositions);
  };

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;

function get_sourcemap_url(contents) {
    const reversed = contents
        .split('\n')
        .reverse()
        .join('\n');
    const match = /\/[/*]#[ \t]+sourceMappingURL=([^\s'"]+?)(?:[ \t]+|$)/gm.exec(reversed);
    if (match)
        return match[1];
    return undefined;
}
const file_cache = new Map();
function get_file_contents(file_path) {
    if (file_cache.has(file_path)) {
        return file_cache.get(file_path);
    }
    try {
        const data = fs__default['default'].readFileSync(file_path, 'utf8');
        file_cache.set(file_path, data);
        return data;
    }
    catch (_a) {
        return undefined;
    }
}
function sourcemap_stacktrace(stack) {
    const replace = (line) => line.replace(/^ {4}at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?)\)?/, (input, var_name, file_path, line_num, column) => {
        if (!file_path)
            return input;
        const contents = get_file_contents(file_path);
        if (!contents)
            return input;
        const sourcemap_url = get_sourcemap_url(contents);
        if (!sourcemap_url)
            return input;
        let dir = path__default['default'].dirname(file_path);
        let sourcemap_data;
        if (/^data:application\/json[^,]+base64,/.test(sourcemap_url)) {
            const raw_data = sourcemap_url.slice(sourcemap_url.indexOf(',') + 1);
            try {
                sourcemap_data = Buffer.from(raw_data, 'base64').toString();
            }
            catch (_a) {
                return input;
            }
        }
        else {
            const sourcemap_path = path__default['default'].resolve(dir, sourcemap_url);
            const data = get_file_contents(sourcemap_path);
            if (!data)
                return input;
            sourcemap_data = data;
            dir = path__default['default'].dirname(sourcemap_path);
        }
        let raw_sourcemap;
        try {
            raw_sourcemap = JSON.parse(sourcemap_data);
        }
        catch (_b) {
            return input;
        }
        const consumer = new SourceMapConsumer$1(raw_sourcemap);
        const pos = consumer.originalPositionFor({
            line: Number(line_num),
            column: Number(column),
            bias: SourceMapConsumer$1.LEAST_UPPER_BOUND
        });
        if (!pos.source)
            return input;
        const source_path = path__default['default'].resolve(dir, pos.source);
        const source = `${source_path}:${pos.line || 0}:${pos.column || 0}`;
        if (!var_name)
            return `    at ${source}`;
        return `    at ${var_name} (${source})`;
    });
    file_cache.clear();
    return stack
        .split('\n')
        .map(replace)
        .join('\n');
}

function get_page_handler(manifest, session_getter) {
    const get_build_info =  () => JSON.parse(fs__default['default'].readFileSync(path__default['default'].join(build_dir, 'build.json'), 'utf-8'))
        ;
    const template =  () => read_template(src_dir)
        ;
    const has_service_worker = fs__default['default'].existsSync(path__default['default'].join(build_dir, 'service-worker.js'));
    const { pages, error: error_route } = manifest;
    function bail(res, err) {
        console.error(err);
        const message =  escape_html(typeof err === 'string' ? err : err.message) ;
        res.statusCode = 500;
        res.end(`<pre>${message}</pre>`);
    }
    function handle_error(req, res, statusCode, error) {
        handle_page({
            pattern: null,
            parts: [
                { name: null, component: { default: error_route } }
            ]
        }, req, res, statusCode, error || 'Unknown error');
    }
    function handle_page(page, req, res, status = 200, error = null) {
        var _a, _b;
        return __awaiter$1(this, void 0, void 0, function* () {
            const is_service_worker_index = req.path === '/service-worker-index.html';
            const build_info = get_build_info();
            res.setHeader('Content-Type', 'text/html');
            // preload main js and css
            // TODO detect other stuff we can preload like fonts?
            let preload_files = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
            if ((_a = build_info === null || build_info === void 0 ? void 0 : build_info.css) === null || _a === void 0 ? void 0 : _a.main) {
                preload_files = preload_files.concat((_b = build_info === null || build_info === void 0 ? void 0 : build_info.css) === null || _b === void 0 ? void 0 : _b.main);
            }
            let es6_preload = false;
            if (build_info.bundler === 'rollup') {
                es6_preload = true;
                const route = page.parts[page.parts.length - 1].file;
                const deps = build_info.dependencies[route];
                if (deps) {
                    preload_files = preload_files.concat(deps);
                }
            }
            else if (!error && !is_service_worker_index) {
                page.parts.forEach(part => {
                    if (!part)
                        return;
                    // using concat because it could be a string or an array. thanks webpack!
                    preload_files = preload_files.concat(build_info.assets[part.name]);
                });
            }
            const link = preload_files
                .filter((v, i, a) => a.indexOf(v) === i) // remove any duplicates
                .filter(file => file && !file.match(/\.map$/)) // exclude source maps
                .map((file) => {
                const as = /\.css$/.test(file) ? 'style' : 'script';
                const rel = es6_preload && as === 'script' ? 'modulepreload' : 'preload';
                return `<${req.baseUrl}/client/${file}>;rel="${rel}";as="${as}"`;
            })
                .join(', ');
            res.setHeader('Link', link);
            let session;
            try {
                session = yield session_getter(req, res);
            }
            catch (err) {
                return bail(res, err);
            }
            let redirect;
            let preload_error;
            const preload_context = {
                redirect: (statusCode, location) => {
                    if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
                        throw new Error('Conflicting redirects');
                    }
                    location = location.replace(/^\//g, ''); // leading slash (only)
                    redirect = { statusCode, location };
                },
                error: (statusCode, message) => {
                    preload_error = { statusCode, message };
                },
                fetch: (url, opts) => {
                    const protocol = req.socket.encrypted ? 'https' : 'http';
                    const parsed = new Url__default['default'].URL(url, `${protocol}://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' : ''}`);
                    opts = Object.assign({}, opts);
                    const include_credentials = (opts.credentials === 'include' ||
                        opts.credentials !== 'omit' && parsed.origin === `${protocol}://127.0.0.1:${process.env.PORT}`);
                    if (include_credentials) {
                        opts.headers = Object.assign({}, opts.headers);
                        const cookies = Object.assign({}, parse_1(req.headers.cookie || ''), parse_1(opts.headers.cookie || ''));
                        const set_cookie = res.getHeader('Set-Cookie');
                        (Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach((s) => {
                            const m = /([^=]+)=([^;]+)/.exec(s);
                            if (m)
                                cookies[m[1]] = m[2];
                        });
                        const str = Object.keys(cookies)
                            .map(key => `${key}=${cookies[key]}`)
                            .join('; ');
                        opts.headers.cookie = str;
                        if (!opts.headers.authorization && req.headers.authorization) {
                            opts.headers.authorization = req.headers.authorization;
                        }
                    }
                    return fetch$1(parsed.href, opts);
                }
            };
            let preloaded;
            let match;
            let params;
            try {
                const root_preload = manifest.root_comp.preload || (() => { });
                const root_preloaded = root_preload.call(preload_context, {
                    host: req.headers.host,
                    path: req.path,
                    query: req.query,
                    params: {}
                }, session);
                match = error ? null : page.pattern.exec(req.path);
                let toPreload = [root_preloaded];
                if (!is_service_worker_index) {
                    toPreload = toPreload.concat(page.parts.map(part => {
                        if (!part)
                            return null;
                        // the deepest level is used below, to initialise the store
                        params = part.params ? part.params(match) : {};
                        return part.component.preload
                            ? part.component.preload.call(preload_context, {
                                host: req.headers.host,
                                path: req.path,
                                query: req.query,
                                params
                            }, session)
                            : {};
                    }));
                }
                preloaded = yield Promise.all(toPreload);
            }
            catch (err) {
                if (error) {
                    return bail(res, err);
                }
                preload_error = { statusCode: 500, message: err };
                preloaded = []; // appease TypeScript
            }
            try {
                if (redirect) {
                    const location = Url__default['default'].resolve((req.baseUrl || '') + '/', redirect.location);
                    res.statusCode = redirect.statusCode;
                    res.setHeader('Location', location);
                    res.end();
                    return;
                }
                if (preload_error) {
                    if (!error) {
                        handle_error(req, res, preload_error.statusCode, preload_error.message);
                    }
                    else {
                        bail(res, preload_error.message);
                    }
                    return;
                }
                const segments = req.path.split('/').filter(Boolean);
                // TODO make this less confusing
                const layout_segments = [segments[0]];
                let l = 1;
                page.parts.forEach((part, i) => {
                    layout_segments[l] = segments[i + 1];
                    if (!part)
                        return null;
                    l++;
                });
                if (error instanceof Error && error.stack) {
                    error.stack = sourcemap_stacktrace(error.stack);
                }
                const pageContext = {
                    host: req.headers.host,
                    path: req.path,
                    query: req.query,
                    params,
                    error: error
                        ? error instanceof Error
                            ? error
                            : { message: error, name: 'PreloadError' }
                        : null
                };
                const props = {
                    stores: {
                        page: {
                            subscribe: writable(pageContext).subscribe
                        },
                        preloading: {
                            subscribe: writable(null).subscribe
                        },
                        session: writable(session)
                    },
                    segments: layout_segments,
                    status: error ? status : 200,
                    error: pageContext.error,
                    level0: {
                        props: preloaded[0]
                    },
                    level1: {
                        segment: segments[0],
                        props: {}
                    }
                };
                if (!is_service_worker_index) {
                    let level_index = 1;
                    for (let i = 0; i < page.parts.length; i += 1) {
                        const part = page.parts[i];
                        if (!part)
                            continue;
                        props[`level${level_index++}`] = {
                            component: part.component.default,
                            props: preloaded[i + 1] || {},
                            segment: segments[i]
                        };
                    }
                }
                const { html, head, css } = App.render(props);
                const serialized = {
                    preloaded: `[${preloaded.map(data => try_serialize(data, err => {
                        console.error(`Failed to serialize preloaded data to transmit to the client at the /${segments.join('/')} route: ${err.message}`);
                        console.warn('The client will re-render over the server-rendered page fresh instead of continuing where it left off. See https://sapper.svelte.dev/docs#Return_value for more information');
                    })).join(',')}]`,
                    session: session && try_serialize(session, err => {
                        throw new Error(`Failed to serialize session data: ${err.message}`);
                    }),
                    error: error && serialize_error(props.error)
                };
                let script = `__SAPPER__={${[
                    error && `error:${serialized.error},status:${status}`,
                    `baseUrl:"${req.baseUrl}"`,
                    serialized.preloaded && `preloaded:${serialized.preloaded}`,
                    serialized.session && `session:${serialized.session}`
                ].filter(Boolean).join(',')}};`;
                if (has_service_worker) {
                    script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
                }
                const file = [].concat(build_info.assets.main).filter(f => f && /\.js$/.test(f))[0];
                const main = `${req.baseUrl}/client/${file}`;
                // users can set a CSP nonce using res.locals.nonce
                const nonce_value = (res.locals && res.locals.nonce) ? res.locals.nonce : '';
                const nonce_attr = nonce_value ? ` nonce="${nonce_value}"` : '';
                if (build_info.bundler === 'rollup') {
                    if (build_info.legacy_assets) {
                        const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
                        script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
                    }
                    else {
                        script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
                    }
                }
                else {
                    script += `</script><script${nonce_attr} src="${main}" defer>`;
                }
                let styles;
                // TODO make this consistent across apps
                // TODO embed build_info in placeholder.ts
                if (build_info.css && build_info.css.main) {
                    const css_chunks = new Set(build_info.css.main);
                    page.parts.forEach(part => {
                        if (!part || !build_info.dependencies)
                            return;
                        const deps_for_part = build_info.dependencies[part.file];
                        if (deps_for_part) {
                            deps_for_part.filter(d => d.endsWith('.css')).forEach(chunk => {
                                css_chunks.add(chunk);
                            });
                        }
                    });
                    styles = Array.from(css_chunks)
                        .map(href => `<link rel="stylesheet" href="client/${href}">`)
                        .join('');
                }
                else {
                    styles = (css && css.code ? `<style${nonce_attr}>${css.code}</style>` : '');
                }
                const body = template()
                    .replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
                    .replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
                    .replace('%sapper.html%', () => html)
                    .replace('%sapper.head%', () => head)
                    .replace('%sapper.styles%', () => styles)
                    .replace(/%sapper\.cspnonce%/g, () => nonce_value);
                res.statusCode = status;
                res.end(body);
            }
            catch (err) {
                if (error) {
                    bail(res, err);
                }
                else {
                    handle_error(req, res, 500, err);
                }
            }
        });
    }
    return function find_route(req, res, next) {
        const path = req.path === '/service-worker-index.html' ? '/' : req.path;
        const page = pages.find(page => page.pattern.test(path));
        if (page) {
            handle_page(page, req, res);
        }
        else {
            handle_error(req, res, 404, 'Not found');
        }
    };
}
function read_template(dir = build_dir) {
    return fs__default['default'].readFileSync(`${dir}/template.html`, 'utf-8');
}
function try_serialize(data, fail) {
    try {
        return devalue(data);
    }
    catch (err) {
        if (fail)
            fail(err);
        return null;
    }
}
// Ensure we return something truthy so the client will not re-render the page over the error
function serialize_error(error) {
    if (!error)
        return null;
    let serialized = try_serialize(error);
    if (!serialized) {
        const { name, message, stack } = error;
        serialized = try_serialize({ name, message, stack });
    }
    if (!serialized) {
        serialized = '{}';
    }
    return serialized;
}
function escape_html(html) {
    const chars = {
        '"': 'quot',
        '\'': '#39',
        '&': 'amp',
        '<': 'lt',
        '>': 'gt'
    };
    return html.replace(/["'&<>]/g, c => `&${chars[c]};`);
}

function middleware(opts = {}) {
    const { session, ignore } = opts;
    let emitted_basepath = false;
    return compose_handlers(ignore, [
        (req, res, next) => {
            if (req.baseUrl === undefined) {
                let originalUrl = req.originalUrl || req.url;
                if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
                    originalUrl += '/';
                }
                req.baseUrl = originalUrl
                    ? originalUrl.slice(0, -req.url.length)
                    : '';
            }
            if (!emitted_basepath && process.send) {
                process.send({
                    __sapper__: true,
                    event: 'basepath',
                    basepath: req.baseUrl
                });
                emitted_basepath = true;
            }
            if (req.path === undefined) {
                req.path = req.url.replace(/\?.*/, '');
            }
            next();
        },
        fs__default['default'].existsSync(path__default['default'].join(build_dir, 'service-worker.js')) && serve({
            pathname: '/service-worker.js',
            cache_control: 'no-cache, no-store, must-revalidate'
        }),
        fs__default['default'].existsSync(path__default['default'].join(build_dir, 'service-worker.js.map')) && serve({
            pathname: '/service-worker.js.map',
            cache_control: 'no-cache, no-store, must-revalidate'
        }),
        serve({
            prefix: '/client/',
            cache_control:  'no-cache' 
        }),
        get_server_route_handler(manifest.server_routes),
        get_page_handler(manifest, session || noop$2)
    ].filter(Boolean));
}
function compose_handlers(ignore, handlers) {
    const total = handlers.length;
    function nth_handler(n, req, res, next) {
        if (n >= total) {
            return next();
        }
        handlers[n](req, res, () => nth_handler(n + 1, req, res, next));
    }
    return !ignore
        ? (req, res, next) => nth_handler(0, req, res, next)
        : (req, res, next) => {
            if (should_ignore(req.path, ignore)) {
                next();
            }
            else {
                nth_handler(0, req, res, next);
            }
        };
}
function should_ignore(uri, val) {
    if (Array.isArray(val))
        return val.some(x => should_ignore(uri, x));
    if (val instanceof RegExp)
        return val.test(uri);
    if (typeof val === 'function')
        return val(uri);
    return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}
function serve({ prefix, pathname, cache_control }) {
    const filter = pathname
        ? (req) => req.path === pathname
        : (req) => req.path.startsWith(prefix);
    const read =  (file) => fs__default['default'].readFileSync(path__default['default'].join(build_dir, file))
        ;
    return (req, res, next) => {
        if (filter(req)) {
            const type = lite.getType(req.path);
            try {
                const file = path__default['default'].posix.normalize(decodeURIComponent(req.path));
                const data = read(file);
                res.setHeader('Content-Type', type);
                res.setHeader('Cache-Control', cache_control);
                res.end(data);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    next();
                }
                else {
                    console.error(err);
                    res.statusCode = 500;
                    res.end('an error occurred while reading a static file from disk');
                }
            }
        }
        else {
            next();
        }
    };
}
function noop$2() { }

const { PORT = 3000 } = process.env;

const app = polka__default['default']({
	onError: (err, req, res) => {
		const error = err.message || err;
		const code = err.code || err.status || 500;
		res.headersSent || send__default['default'](res, code, { error }, {
			'content-type': 'text/plain'
		});
	}
});

if (process.env.PGHOST) {
	app.use(authenticate());
}

app.use(
	sirv__default['default']('static', {
		dev: "development" === 'development',
		setHeaders(res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
		}
	}),

	middleware({
		session: req => ({
			user: sanitize_user(req.user)
		})
	})
);

app.listen(PORT);

exports.commonjsGlobal = commonjsGlobal;
exports.createCommonjsModule = createCommonjsModule;