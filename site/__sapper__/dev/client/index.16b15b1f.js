import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, v as validate_slots, U as getContext, p as space, e as element, K as query_selector_all, f as detach_dev, q as claim_space, a as claim_element, b as children, g as attr_dev, h as add_location, j as insert_dev, z as noop, D as validate_each_argument, A as text, B as claim_text, w as append_dev, C as set_data_dev, y as listen_dev, ad as prevent_default, E as empty, F as destroy_each } from './client.2d8aba47.js';

/* src/routes/apps/index.svelte generated by Svelte v3.31.0 */
const file = "src/routes/apps/index.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[7] = list[i];
	return child_ctx;
}

// (75:1) {:else}
function create_else_block(ctx) {
	let p;
	let t0;
	let a;
	let t1;
	let t2;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			p = element("p");
			t0 = text("Please ");
			a = element("a");
			t1 = text("log in");
			t2 = text(" to see your saved apps.");
			this.h();
		},
		l: function claim(nodes) {
			p = claim_element(nodes, "P", {});
			var p_nodes = children(p);
			t0 = claim_text(p_nodes, "Please ");
			a = claim_element(p_nodes, "A", { href: true });
			var a_nodes = children(a);
			t1 = claim_text(a_nodes, "log in");
			a_nodes.forEach(detach_dev);
			t2 = claim_text(p_nodes, " to see your saved apps.");
			p_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(a, "href", "auth/login");
			add_location(a, file, 75, 12, 1544);
			add_location(p, file, 75, 2, 1534);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, t0);
			append_dev(p, a);
			append_dev(a, t1);
			append_dev(p, t2);

			if (!mounted) {
				dispose = listen_dev(a, "click", prevent_default(/*login*/ ctx[3]), false, true, false);
				mounted = true;
			}
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(75:1) {:else}",
		ctx
	});

	return block;
}

// (48:1) {#if user}
function create_if_block(ctx) {
	let header;
	let h1;
	let t0;
	let t1;
	let div;
	let img;
	let img_alt_value;
	let img_src_value;
	let t2;
	let span;
	let t3_value = (/*user*/ ctx[0].name || /*user*/ ctx[0].username) + "";
	let t3;
	let t4;
	let a;
	let t5;
	let t6;
	let t7;
	let ul;
	let t8;
	let if_block_anchor;
	let mounted;
	let dispose;
	let each_value = /*apps*/ ctx[1];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	let if_block = /*offset*/ ctx[2] !== null && create_if_block_1(ctx);

	const block = {
		c: function create() {
			header = element("header");
			h1 = element("h1");
			t0 = text("Your apps");
			t1 = space();
			div = element("div");
			img = element("img");
			t2 = space();
			span = element("span");
			t3 = text(t3_value);
			t4 = text("\n\t\t\t\t\t(");
			a = element("a");
			t5 = text("log out");
			t6 = text(")");
			t7 = space();
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t8 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.h();
		},
		l: function claim(nodes) {
			header = claim_element(nodes, "HEADER", { class: true });
			var header_nodes = children(header);
			h1 = claim_element(header_nodes, "H1", { class: true });
			var h1_nodes = children(h1);
			t0 = claim_text(h1_nodes, "Your apps");
			h1_nodes.forEach(detach_dev);
			t1 = claim_space(header_nodes);
			div = claim_element(header_nodes, "DIV", { class: true });
			var div_nodes = children(div);
			img = claim_element(div_nodes, "IMG", { class: true, alt: true, src: true });
			t2 = claim_space(div_nodes);
			span = claim_element(div_nodes, "SPAN", {});
			var span_nodes = children(span);
			t3 = claim_text(span_nodes, t3_value);
			t4 = claim_text(span_nodes, "\n\t\t\t\t\t(");
			a = claim_element(span_nodes, "A", { href: true });
			var a_nodes = children(a);
			t5 = claim_text(a_nodes, "log out");
			a_nodes.forEach(detach_dev);
			t6 = claim_text(span_nodes, ")");
			span_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			header_nodes.forEach(detach_dev);
			t7 = claim_space(nodes);
			ul = claim_element(nodes, "UL", { class: true });
			var ul_nodes = children(ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(ul_nodes);
			}

			ul_nodes.forEach(detach_dev);
			t8 = claim_space(nodes);
			if (if_block) if_block.l(nodes);
			if_block_anchor = empty();
			this.h();
		},
		h: function hydrate() {
			attr_dev(h1, "class", "svelte-1a795bd");
			add_location(h1, file, 49, 3, 958);
			attr_dev(img, "class", "avatar svelte-1a795bd");
			attr_dev(img, "alt", img_alt_value = "" + ((/*user*/ ctx[0].name || /*user*/ ctx[0].username) + " avatar"));
			if (img.src !== (img_src_value = /*user*/ ctx[0].avatar)) attr_dev(img, "src", img_src_value);
			add_location(img, file, 52, 4, 1004);
			attr_dev(a, "href", "auth/logout");
			add_location(a, file, 55, 6, 1138);
			add_location(span, file, 53, 4, 1091);
			attr_dev(div, "class", "user svelte-1a795bd");
			add_location(div, file, 51, 3, 981);
			attr_dev(header, "class", "svelte-1a795bd");
			add_location(header, file, 48, 2, 946);
			attr_dev(ul, "class", "svelte-1a795bd");
			add_location(ul, file, 60, 2, 1243);
		},
		m: function mount(target, anchor) {
			insert_dev(target, header, anchor);
			append_dev(header, h1);
			append_dev(h1, t0);
			append_dev(header, t1);
			append_dev(header, div);
			append_dev(div, img);
			append_dev(div, t2);
			append_dev(div, span);
			append_dev(span, t3);
			append_dev(span, t4);
			append_dev(span, a);
			append_dev(a, t5);
			append_dev(span, t6);
			insert_dev(target, t7, anchor);
			insert_dev(target, ul, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			insert_dev(target, t8, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);

			if (!mounted) {
				dispose = listen_dev(a, "click", prevent_default(/*logout*/ ctx[4]), false, true, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (dirty & /*user*/ 1 && img_alt_value !== (img_alt_value = "" + ((/*user*/ ctx[0].name || /*user*/ ctx[0].username) + " avatar"))) {
				attr_dev(img, "alt", img_alt_value);
			}

			if (dirty & /*user*/ 1 && img.src !== (img_src_value = /*user*/ ctx[0].avatar)) {
				attr_dev(img, "src", img_src_value);
			}

			if (dirty & /*user*/ 1 && t3_value !== (t3_value = (/*user*/ ctx[0].name || /*user*/ ctx[0].username) + "")) set_data_dev(t3, t3_value);

			if (dirty & /*apps, format*/ 34) {
				each_value = /*apps*/ ctx[1];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(ul, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (/*offset*/ ctx[2] !== null) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(header);
			if (detaching) detach_dev(t7);
			if (detaching) detach_dev(ul);
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(t8);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(48:1) {#if user}",
		ctx
	});

	return block;
}

// (62:3) {#each apps as app}
function create_each_block(ctx) {
	let li;
	let a;
	let h2;
	let t0_value = /*app*/ ctx[7].name + "";
	let t0;
	let t1;
	let span;
	let t2;
	let t3_value = /*format*/ ctx[5](/*app*/ ctx[7].updated_at) + "";
	let t3;
	let a_href_value;
	let t4;

	const block = {
		c: function create() {
			li = element("li");
			a = element("a");
			h2 = element("h2");
			t0 = text(t0_value);
			t1 = space();
			span = element("span");
			t2 = text("updated ");
			t3 = text(t3_value);
			t4 = space();
			this.h();
		},
		l: function claim(nodes) {
			li = claim_element(nodes, "LI", { class: true });
			var li_nodes = children(li);
			a = claim_element(li_nodes, "A", { href: true, class: true });
			var a_nodes = children(a);
			h2 = claim_element(a_nodes, "H2", { class: true });
			var h2_nodes = children(h2);
			t0 = claim_text(h2_nodes, t0_value);
			h2_nodes.forEach(detach_dev);
			t1 = claim_space(a_nodes);
			span = claim_element(a_nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			t2 = claim_text(span_nodes, "updated ");
			t3 = claim_text(span_nodes, t3_value);
			span_nodes.forEach(detach_dev);
			a_nodes.forEach(detach_dev);
			t4 = claim_space(li_nodes);
			li_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(h2, "class", "svelte-1a795bd");
			add_location(h2, file, 64, 6, 1317);
			attr_dev(span, "class", "svelte-1a795bd");
			add_location(span, file, 65, 6, 1343);
			attr_dev(a, "href", a_href_value = "repl/" + /*app*/ ctx[7].uid);
			attr_dev(a, "class", "svelte-1a795bd");
			add_location(a, file, 63, 5, 1285);
			attr_dev(li, "class", "svelte-1a795bd");
			add_location(li, file, 62, 4, 1275);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, a);
			append_dev(a, h2);
			append_dev(h2, t0);
			append_dev(a, t1);
			append_dev(a, span);
			append_dev(span, t2);
			append_dev(span, t3);
			append_dev(li, t4);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*apps*/ 2 && t0_value !== (t0_value = /*app*/ ctx[7].name + "")) set_data_dev(t0, t0_value);
			if (dirty & /*apps*/ 2 && t3_value !== (t3_value = /*format*/ ctx[5](/*app*/ ctx[7].updated_at) + "")) set_data_dev(t3, t3_value);

			if (dirty & /*apps*/ 2 && a_href_value !== (a_href_value = "repl/" + /*app*/ ctx[7].uid)) {
				attr_dev(a, "href", a_href_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(62:3) {#each apps as app}",
		ctx
	});

	return block;
}

// (72:2) {#if offset !== null}
function create_if_block_1(ctx) {
	let div;
	let a;
	let t;
	let a_href_value;

	const block = {
		c: function create() {
			div = element("div");
			a = element("a");
			t = text("Next page...");
			this.h();
		},
		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", {});
			var div_nodes = children(div);
			a = claim_element(div_nodes, "A", { href: true });
			var a_nodes = children(a);
			t = claim_text(a_nodes, "Next page...");
			a_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(a, "href", a_href_value = "apps?offset=" + /*offset*/ ctx[2]);
			add_location(a, file, 72, 8, 1461);
			add_location(div, file, 72, 3, 1456);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, a);
			append_dev(a, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*offset*/ 4 && a_href_value !== (a_href_value = "apps?offset=" + /*offset*/ ctx[2])) {
				attr_dev(a, "href", a_href_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(72:2) {#if offset !== null}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let t;
	let div;

	function select_block_type(ctx, dirty) {
		if (/*user*/ ctx[0]) return create_if_block;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			t = space();
			div = element("div");
			if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all("[data-svelte=\"svelte-1nbk3j6\"]", document.head);
			head_nodes.forEach(detach_dev);
			t = claim_space(nodes);
			div = claim_element(nodes, "DIV", { class: true });
			var div_nodes = children(div);
			if_block.l(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			document.title = "Your apps • Svelte";
			attr_dev(div, "class", "apps svelte-1a795bd");
			add_location(div, file, 46, 0, 913);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
			insert_dev(target, div, anchor);
			if_block.m(div, null);
		},
		p: function update(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(div);
			if_block.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

async function preload(page, { user }) {
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

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Apps", slots, []);
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
	const writable_props = ["user", "apps", "offset"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Apps> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("user" in $$props) $$invalidate(0, user = $$props.user);
		if ("apps" in $$props) $$invalidate(1, apps = $$props.apps);
		if ("offset" in $$props) $$invalidate(2, offset = $$props.offset);
	};

	$$self.$capture_state = () => ({
		preload,
		getContext,
		user,
		apps,
		offset,
		login,
		logout,
		formatter,
		format
	});

	$$self.$inject_state = $$props => {
		if ("user" in $$props) $$invalidate(0, user = $$props.user);
		if ("apps" in $$props) $$invalidate(1, apps = $$props.apps);
		if ("offset" in $$props) $$invalidate(2, offset = $$props.offset);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [user, apps, offset, login, logout, format];
}

class Apps extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { user: 0, apps: 1, offset: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Apps",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
			console.warn("<Apps> was created without expected prop 'user'");
		}

		if (/*apps*/ ctx[1] === undefined && !("apps" in props)) {
			console.warn("<Apps> was created without expected prop 'apps'");
		}

		if (/*offset*/ ctx[2] === undefined && !("offset" in props)) {
			console.warn("<Apps> was created without expected prop 'offset'");
		}
	}

	get user() {
		throw new Error("<Apps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set user(value) {
		throw new Error("<Apps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get apps() {
		throw new Error("<Apps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set apps(value) {
		throw new Error("<Apps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get offset() {
		throw new Error("<Apps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set offset(value) {
		throw new Error("<Apps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export default Apps;
export { preload };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguMTZiMTViMWYuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXBwcy9pbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdCBjb250ZXh0PVwibW9kdWxlXCI+XG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVsb2FkKHBhZ2UsIHsgdXNlciB9KSB7XG5cdFx0bGV0IGFwcHMgPSBbXTtcblx0XHRsZXQgb2Zmc2V0ID0gbnVsbDtcblxuXHRcdGlmICh1c2VyKSB7XG5cdFx0XHRsZXQgdXJsID0gJ2FwcHMuanNvbic7XG5cdFx0XHRpZiAocGFnZS5xdWVyeS5vZmZzZXQpIHtcblx0XHRcdFx0dXJsICs9IGA/b2Zmc2V0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhZ2UucXVlcnkub2Zmc2V0KX1gO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgciA9IGF3YWl0IHRoaXMuZmV0Y2godXJsLCB7XG5cdFx0XHRcdGNyZWRlbnRpYWxzOiAnaW5jbHVkZSdcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFyLm9rKSByZXR1cm4gdGhpcy5lcnJvcihyLnN0YXR1cywgYXdhaXQgci50ZXh0KCkpO1xuXG5cdFx0XHQoeyBhcHBzLCBvZmZzZXQgfSA9IGF3YWl0IHIuanNvbigpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyB1c2VyLCBhcHBzLCBvZmZzZXQgfTtcblx0fVxuPC9zY3JpcHQ+XG5cbjxzY3JpcHQ+XG5cdGltcG9ydCB7IGdldENvbnRleHQgfSBmcm9tICdzdmVsdGUnO1xuXG5cdGV4cG9ydCBsZXQgdXNlcjtcblx0ZXhwb3J0IGxldCBhcHBzO1xuXHRleHBvcnQgbGV0IG9mZnNldDtcblxuXHRjb25zdCB7IGxvZ2luLCBsb2dvdXQgfSA9IGdldENvbnRleHQoJ2FwcCcpO1xuXG5cdGNvbnN0IGZvcm1hdHRlciA9IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KHVuZGVmaW5lZCwge1xuXHRcdHllYXI6ICdudW1lcmljJyxcblx0XHRtb250aDogJ3Nob3J0Jyxcblx0XHRkYXk6ICdudW1lcmljJyxcblx0XHRob3VyOiAnbnVtZXJpYycsXG5cdFx0bWludXRlOiAnMi1kaWdpdCdcblx0fSk7XG5cblx0Y29uc3QgZm9ybWF0ID0gc3RyID0+IGZvcm1hdHRlci5mb3JtYXQobmV3IERhdGUoc3RyKSk7XG48L3NjcmlwdD5cblxuPHN2ZWx0ZTpoZWFkPlxuXHQ8dGl0bGU+WW91ciBhcHBzIOKAosKgU3ZlbHRlPC90aXRsZT5cbjwvc3ZlbHRlOmhlYWQ+XG5cbjxkaXYgY2xhc3M9XCJhcHBzXCI+XG5cdHsjaWYgdXNlcn1cblx0XHQ8aGVhZGVyPlxuXHRcdFx0PGgxPllvdXIgYXBwczwvaDE+XG5cblx0XHRcdDxkaXYgY2xhc3M9XCJ1c2VyXCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCJhdmF0YXJcIiBhbHQ9XCJ7dXNlci5uYW1lIHx8IHVzZXIudXNlcm5hbWV9IGF2YXRhclwiIHNyYz1cInt1c2VyLmF2YXRhcn1cIj5cblx0XHRcdFx0PHNwYW4+XG5cdFx0XHRcdFx0e3VzZXIubmFtZSB8fCB1c2VyLnVzZXJuYW1lfVxuXHRcdFx0XHRcdCg8YSBvbjpjbGlja3xwcmV2ZW50RGVmYXVsdD17bG9nb3V0fSBocmVmPVwiYXV0aC9sb2dvdXRcIj5sb2cgb3V0PC9hPilcblx0XHRcdFx0PC9zcGFuPlxuXHRcdFx0PC9kaXY+XG5cdFx0PC9oZWFkZXI+XG5cblx0XHQ8dWw+XG5cdFx0XHR7I2VhY2ggYXBwcyBhcyBhcHB9XG5cdFx0XHRcdDxsaT5cblx0XHRcdFx0XHQ8YSBocmVmPVwicmVwbC97YXBwLnVpZH1cIj5cblx0XHRcdFx0XHRcdDxoMj57YXBwLm5hbWV9PC9oMj5cblx0XHRcdFx0XHRcdDxzcGFuPnVwZGF0ZWQge2Zvcm1hdChhcHAudXBkYXRlZF9hdCl9PC9zcGFuPlxuXHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0PC9saT5cblx0XHRcdHsvZWFjaH1cblx0XHQ8L3VsPlxuXG5cdFx0eyNpZiBvZmZzZXQgIT09IG51bGx9XG5cdFx0XHQ8ZGl2PjxhIGhyZWY9XCJhcHBzP29mZnNldD17b2Zmc2V0fVwiPk5leHQgcGFnZS4uLjwvYT48L2Rpdj5cblx0XHR7L2lmfVxuXHR7OmVsc2V9XG5cdFx0PHA+UGxlYXNlIDxhIG9uOmNsaWNrfHByZXZlbnREZWZhdWx0PXtsb2dpbn0gaHJlZj1cImF1dGgvbG9naW5cIj5sb2cgaW48L2E+IHRvIHNlZSB5b3VyIHNhdmVkIGFwcHMuPC9wPlxuXHR7L2lmfVxuPC9kaXY+XG5cbjxzdHlsZT5cblx0LmFwcHMge1xuXHRcdHBhZGRpbmc6IHZhcigtLXRvcC1vZmZzZXQpIHZhcigtLXNpZGUtbmF2KSA2cmVtIHZhcigtLXNpZGUtbmF2KTtcblx0XHRtYXgtd2lkdGg6IHZhcigtLW1haW4td2lkdGgpO1xuXHRcdG1hcmdpbjogMCBhdXRvO1xuXHR9XG5cblx0aGVhZGVyIHtcblx0XHRtYXJnaW46IDAgMCAxZW0gMDtcblx0fVxuXG5cdGgxIHtcblx0XHRmb250LXNpemU6IDRyZW07XG5cdFx0Zm9udC13ZWlnaHQ6IDQwMDtcblx0fVxuXG5cdC51c2VyIHtcblx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdHBhZGRpbmc6IDAgMCAwIDMuMnJlbTtcblx0XHRwb3NpdGlvbjogcmVsYXRpdmU7XG5cdFx0bWFyZ2luOiAxcmVtIDAgNXJlbSAwO1xuXHRcdGNvbG9yOiB2YXIoLS10ZXh0KTtcblx0fVxuXG5cdC5hdmF0YXIge1xuXHRcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcblx0XHRsZWZ0OiAwO1xuXHRcdHRvcDogMC4xcmVtO1xuXHRcdHdpZHRoOiAyLjRyZW07XG5cdFx0aGVpZ2h0OiAyLjRyZW07XG5cdFx0Ym9yZGVyOiAxcHggc29saWQgcmdiYSgwLDAsMCwwLjMpO1xuXHRcdGJvcmRlci1yYWRpdXM6IDAuMnJlbTtcblx0fVxuXG5cdHVsIHtcblx0XHRsaXN0LXN0eWxlOiBub25lO1xuXHR9XG5cblx0bGkge1xuXHRcdG1hcmdpbjogMCAwIDFlbSAwO1xuXHR9XG5cblx0aDIge1xuXHRcdGNvbG9yOiB2YXIoLS10ZXh0KTtcblx0XHRmb250LXNpemU6IHZhcigtLWgzKTtcblx0XHRmb250LXdlaWdodDogNDAwO1xuXHR9XG5cblx0bGkgYSB7XG5cdFx0Ym9yZGVyOiBub25lO1xuXHR9XG5cblx0bGkgYTpob3ZlciBoMiB7XG5cdFx0Y29sb3I6IHZhcigtLWZsYXNoKTtcblx0fVxuXG5cdGxpIHNwYW4ge1xuXHRcdGZvbnQtc2l6ZTogMTRweDtcblx0XHRjb2xvcjogIzk5OTtcblx0fVxuPC9zdHlsZT5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OytEQTJFd0MsR0FBSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBckJ2QyxHQUFJLElBQUMsSUFBSSxhQUFJLEdBQUksSUFBQyxRQUFROzs7Ozs7Ozs7Ozs7MkJBT3RCLEdBQUk7Ozs7Z0NBQVQsTUFBSTs7OzsyQkFVRixHQUFNLFFBQUssSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0RBbkJRLEdBQUksSUFBQyxJQUFJLGFBQUksR0FBSSxJQUFDLFFBQVE7NkNBQWdCLEdBQUksSUFBQyxNQUFNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnRUFHakQsR0FBTTs7Ozs7Z0ZBSFYsR0FBSSxJQUFDLElBQUksYUFBSSxHQUFJLElBQUMsUUFBUTs7OzttRUFBZ0IsR0FBSSxJQUFDLE1BQU07Ozs7Z0VBRTdFLEdBQUksSUFBQyxJQUFJLGFBQUksR0FBSSxJQUFDLFFBQVE7OzswQkFPdEIsR0FBSTs7OzsrQkFBVCxNQUFJOzs7Ozs7Ozs7Ozs7Ozs7O29DQUFKLE1BQUk7OztrQkFVRixHQUFNLFFBQUssSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQVBYLEdBQUcsSUFBQyxJQUFJOzs7OzsyQkFDRSxHQUFNLFlBQUMsR0FBRyxJQUFDLFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0RBRnRCLEdBQUcsSUFBQyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OERBQ2hCLEdBQUcsSUFBQyxJQUFJO2lFQUNFLEdBQU0sWUFBQyxHQUFHLElBQUMsVUFBVTs7Z0ZBRnRCLEdBQUcsSUFBQyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0VBU0csR0FBTTs7Ozs7Ozs7Ozs0RkFBTixHQUFNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBekI5QixHQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBOUNhLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSTtLQUNyQyxJQUFJO0tBQ0osTUFBTSxHQUFHLElBQUk7O0tBRWIsSUFBSTtNQUNILEdBQUcsR0FBRyxXQUFXOztNQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07R0FDcEIsR0FBRyxlQUFlLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTs7O1FBRWpELENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFDN0IsV0FBVyxFQUFFLFNBQVM7T0FFbEIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxDQUFDLElBQUk7S0FFaEQsSUFBSSxFQUFFLE1BQU0sV0FBVyxDQUFDLENBQUMsSUFBSTs7O1VBR3hCLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTTs7Ozs7O09BT2pCLElBQUk7T0FDSixJQUFJO09BQ0osTUFBTTtTQUVULEtBQUssRUFBRSxNQUFNLEtBQUssVUFBVSxDQUFDLEtBQUs7O09BRXBDLFNBQVMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVM7O0dBQ2xELElBQUksRUFBRSxTQUFTO0dBQ2YsS0FBSyxFQUFFLE9BQU87R0FDZCxHQUFHLEVBQUUsU0FBUztHQUNkLElBQUksRUFBRSxTQUFTO0dBQ2YsTUFBTSxFQUFFLFNBQVM7OztPQUdaLE1BQU0sR0FBRyxHQUFHLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==