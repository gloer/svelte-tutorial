import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, v as validate_slots, e as element, p as space, A as text, K as query_selector_all, a as claim_element, f as detach_dev, q as claim_space, b as children, B as claim_text, g as attr_dev, h as add_location, w as append_dev, j as insert_dev, C as set_data_dev, z as noop, ac as HtmlTag } from './client.2d8aba47.js';

/* src/routes/blog/[slug].svelte generated by Svelte v3.31.0 */

const file = "src/routes/blog/[slug].svelte";

function create_fragment(ctx) {
	let title_value;
	let meta0;
	let meta0_content_value;
	let meta1;
	let meta1_content_value;
	let meta2;
	let meta2_content_value;
	let t0;
	let article;
	let h1;
	let t1_value = /*post*/ ctx[0].metadata.title + "";
	let t1;
	let t2;
	let p0;
	let t3_value = /*post*/ ctx[0].metadata.description + "";
	let t3;
	let t4;
	let p1;
	let a;
	let t5_value = /*post*/ ctx[0].metadata.author + "";
	let t5;
	let a_href_value;
	let t6;
	let time;
	let t7_value = /*post*/ ctx[0].metadata.dateString + "";
	let t7;
	let time_datetime_value;
	let t8;
	let html_tag;
	let raw_value = /*post*/ ctx[0].html + "";
	document.title = title_value = /*post*/ ctx[0].metadata.title;

	const block = {
		c: function create() {
			meta0 = element("meta");
			meta1 = element("meta");
			meta2 = element("meta");
			t0 = space();
			article = element("article");
			h1 = element("h1");
			t1 = text(t1_value);
			t2 = space();
			p0 = element("p");
			t3 = text(t3_value);
			t4 = space();
			p1 = element("p");
			a = element("a");
			t5 = text(t5_value);
			t6 = space();
			time = element("time");
			t7 = text(t7_value);
			t8 = space();
			this.h();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all("[data-svelte=\"svelte-1eb4tfw\"]", document.head);
			meta0 = claim_element(head_nodes, "META", { name: true, content: true });
			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
			meta2 = claim_element(head_nodes, "META", { name: true, content: true });
			head_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			article = claim_element(nodes, "ARTICLE", { class: true });
			var article_nodes = children(article);
			h1 = claim_element(article_nodes, "H1", { class: true });
			var h1_nodes = children(h1);
			t1 = claim_text(h1_nodes, t1_value);
			h1_nodes.forEach(detach_dev);
			t2 = claim_space(article_nodes);
			p0 = claim_element(article_nodes, "P", { class: true });
			var p0_nodes = children(p0);
			t3 = claim_text(p0_nodes, t3_value);
			p0_nodes.forEach(detach_dev);
			t4 = claim_space(article_nodes);
			p1 = claim_element(article_nodes, "P", { class: true });
			var p1_nodes = children(p1);
			a = claim_element(p1_nodes, "A", { href: true, class: true });
			var a_nodes = children(a);
			t5 = claim_text(a_nodes, t5_value);
			a_nodes.forEach(detach_dev);
			t6 = claim_space(p1_nodes);
			time = claim_element(p1_nodes, "TIME", { datetime: true });
			var time_nodes = children(time);
			t7 = claim_text(time_nodes, t7_value);
			time_nodes.forEach(detach_dev);
			p1_nodes.forEach(detach_dev);
			t8 = claim_space(article_nodes);
			article_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(meta0, "name", "twitter:title");
			attr_dev(meta0, "content", meta0_content_value = /*post*/ ctx[0].metadata.title);
			add_location(meta0, file, 14, 1, 314);
			attr_dev(meta1, "name", "twitter:description");
			attr_dev(meta1, "content", meta1_content_value = /*post*/ ctx[0].metadata.description);
			add_location(meta1, file, 15, 1, 373);
			attr_dev(meta2, "name", "Description");
			attr_dev(meta2, "content", meta2_content_value = /*post*/ ctx[0].metadata.description);
			add_location(meta2, file, 16, 1, 444);
			attr_dev(h1, "class", "svelte-193hhtk");
			add_location(h1, file, 20, 1, 554);
			attr_dev(p0, "class", "standfirst svelte-193hhtk");
			add_location(p0, file, 21, 1, 586);
			attr_dev(a, "href", a_href_value = /*post*/ ctx[0].metadata.authorURL);
			attr_dev(a, "class", "svelte-193hhtk");
			add_location(a, file, 23, 19, 660);
			attr_dev(time, "datetime", time_datetime_value = /*post*/ ctx[0].metadata.pubdate);
			add_location(time, file, 23, 82, 723);
			attr_dev(p1, "class", "byline svelte-193hhtk");
			add_location(p1, file, 23, 1, 642);
			html_tag = new HtmlTag(null);
			attr_dev(article, "class", "post listify svelte-193hhtk");
			add_location(article, file, 19, 0, 522);
		},
		m: function mount(target, anchor) {
			append_dev(document.head, meta0);
			append_dev(document.head, meta1);
			append_dev(document.head, meta2);
			insert_dev(target, t0, anchor);
			insert_dev(target, article, anchor);
			append_dev(article, h1);
			append_dev(h1, t1);
			append_dev(article, t2);
			append_dev(article, p0);
			append_dev(p0, t3);
			append_dev(article, t4);
			append_dev(article, p1);
			append_dev(p1, a);
			append_dev(a, t5);
			append_dev(p1, t6);
			append_dev(p1, time);
			append_dev(time, t7);
			append_dev(article, t8);
			html_tag.m(raw_value, article);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*post*/ 1 && title_value !== (title_value = /*post*/ ctx[0].metadata.title)) {
				document.title = title_value;
			}

			if (dirty & /*post*/ 1 && meta0_content_value !== (meta0_content_value = /*post*/ ctx[0].metadata.title)) {
				attr_dev(meta0, "content", meta0_content_value);
			}

			if (dirty & /*post*/ 1 && meta1_content_value !== (meta1_content_value = /*post*/ ctx[0].metadata.description)) {
				attr_dev(meta1, "content", meta1_content_value);
			}

			if (dirty & /*post*/ 1 && meta2_content_value !== (meta2_content_value = /*post*/ ctx[0].metadata.description)) {
				attr_dev(meta2, "content", meta2_content_value);
			}

			if (dirty & /*post*/ 1 && t1_value !== (t1_value = /*post*/ ctx[0].metadata.title + "")) set_data_dev(t1, t1_value);
			if (dirty & /*post*/ 1 && t3_value !== (t3_value = /*post*/ ctx[0].metadata.description + "")) set_data_dev(t3, t3_value);
			if (dirty & /*post*/ 1 && t5_value !== (t5_value = /*post*/ ctx[0].metadata.author + "")) set_data_dev(t5, t5_value);

			if (dirty & /*post*/ 1 && a_href_value !== (a_href_value = /*post*/ ctx[0].metadata.authorURL)) {
				attr_dev(a, "href", a_href_value);
			}

			if (dirty & /*post*/ 1 && t7_value !== (t7_value = /*post*/ ctx[0].metadata.dateString + "")) set_data_dev(t7, t7_value);

			if (dirty & /*post*/ 1 && time_datetime_value !== (time_datetime_value = /*post*/ ctx[0].metadata.pubdate)) {
				attr_dev(time, "datetime", time_datetime_value);
			}

			if (dirty & /*post*/ 1 && raw_value !== (raw_value = /*post*/ ctx[0].html + "")) html_tag.p(raw_value);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			detach_dev(meta0);
			detach_dev(meta1);
			detach_dev(meta2);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(article);
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

async function preload({ params }) {
	const res = await this.fetch(`blog/${params.slug}.json`);

	return res.ok
	? { post: await res.json() }
	: this.error(404, "Not found");
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("U5Bslugu5D", slots, []);
	let { post } = $$props;
	const writable_props = ["post"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<U5Bslugu5D> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("post" in $$props) $$invalidate(0, post = $$props.post);
	};

	$$self.$capture_state = () => ({ preload, post });

	$$self.$inject_state = $$props => {
		if ("post" in $$props) $$invalidate(0, post = $$props.post);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [post];
}

class U5Bslugu5D extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { post: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "U5Bslugu5D",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*post*/ ctx[0] === undefined && !("post" in props)) {
			console.warn("<U5Bslugu5D> was created without expected prop 'post'");
		}
	}

	get post() {
		throw new Error("<U5Bslugu5D>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set post(value) {
		throw new Error("<U5Bslugu5D>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export default U5Bslugu5D;
export { preload };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiW3NsdWddLmFiYTA3MTc5LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcm91dGVzL2Jsb2cvW3NsdWddLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0IGNvbnRleHQ9XCJtb2R1bGVcIj5cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByZWxvYWQoeyBwYXJhbXMgfSkge1xuXHRcdGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZmV0Y2goYGJsb2cvJHtwYXJhbXMuc2x1Z30uanNvbmApO1xuXHRcdHJldHVybiByZXMub2sgPyB7IHBvc3Q6IGF3YWl0IHJlcy5qc29uKCkgfSA6IHRoaXMuZXJyb3IoNDA0LCAnTm90IGZvdW5kJyk7XG5cdH1cbjwvc2NyaXB0PlxuXG48c2NyaXB0PlxuXHRleHBvcnQgbGV0IHBvc3Q7XG48L3NjcmlwdD5cblxuPHN2ZWx0ZTpoZWFkPlxuXHQ8dGl0bGU+e3Bvc3QubWV0YWRhdGEudGl0bGV9PC90aXRsZT5cblxuXHQ8bWV0YSBuYW1lPVwidHdpdHRlcjp0aXRsZVwiIGNvbnRlbnQ9e3Bvc3QubWV0YWRhdGEudGl0bGV9PlxuXHQ8bWV0YSBuYW1lPVwidHdpdHRlcjpkZXNjcmlwdGlvblwiIGNvbnRlbnQ9e3Bvc3QubWV0YWRhdGEuZGVzY3JpcHRpb259PlxuXHQ8bWV0YSBuYW1lPVwiRGVzY3JpcHRpb25cIiBjb250ZW50PXtwb3N0Lm1ldGFkYXRhLmRlc2NyaXB0aW9ufT5cbjwvc3ZlbHRlOmhlYWQ+XG5cbjxhcnRpY2xlIGNsYXNzPSdwb3N0IGxpc3RpZnknPlxuXHQ8aDE+e3Bvc3QubWV0YWRhdGEudGl0bGV9PC9oMT5cblx0PHAgY2xhc3M9J3N0YW5kZmlyc3QnPntwb3N0Lm1ldGFkYXRhLmRlc2NyaXB0aW9ufTwvcD5cblxuXHQ8cCBjbGFzcz0nYnlsaW5lJz48YSBocmVmPSd7cG9zdC5tZXRhZGF0YS5hdXRob3JVUkx9Jz57cG9zdC5tZXRhZGF0YS5hdXRob3J9PC9hPiA8dGltZSBkYXRldGltZT0ne3Bvc3QubWV0YWRhdGEucHViZGF0ZX0nPntwb3N0Lm1ldGFkYXRhLmRhdGVTdHJpbmd9PC90aW1lPjwvcD5cblxuXHR7QGh0bWwgcG9zdC5odG1sfVxuPC9hcnRpY2xlPlxuXG48c3R5bGU+XG5cdC5wb3N0IHtcblx0XHRwYWRkaW5nOiB2YXIoLS10b3Atb2Zmc2V0KSB2YXIoLS1zaWRlLW5hdikgNnJlbSB2YXIoLS1zaWRlLW5hdik7XG5cdFx0bWF4LXdpZHRoOiB2YXIoLS1tYWluLXdpZHRoKTtcblx0XHRtYXJnaW46IDAgYXV0bztcblx0fVxuXG5cdGgxIHtcblx0XHRmb250LXNpemU6IDRyZW07XG5cdFx0Zm9udC13ZWlnaHQ6IDQwMDtcblx0fVxuXG5cdC5zdGFuZGZpcnN0IHtcblx0XHRmb250LXNpemU6IHZhcigtLWg0KTtcblx0XHRjb2xvcjogdmFyKC0tc2Vjb25kKTtcblx0XHRtYXJnaW46IDAgMCAxZW0gMDtcblx0fVxuXG5cdC5ieWxpbmUge1xuXHRcdG1hcmdpbjogMCAwIDZyZW0gMDtcblx0XHRwYWRkaW5nOiAxLjZyZW0gMCAwIDA7XG5cdFx0Ym9yZGVyLXRvcDogdmFyKC0tYm9yZGVyLXcpIHNvbGlkICM2NzY3Nzg1Yjtcblx0XHRmb250LXNpemU6IHZhcigtLWg2KTtcblx0XHR0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuXHR9XG5cblx0LmJ5bGluZSBhIHtcblx0XHQvKiBib3JkZXItYm90dG9tOiBub25lOyAqL1xuXHRcdC8qIGZvbnQtd2VpZ2h0OiA2MDA7ICovXG5cdH1cblxuXHQuYnlsaW5lIGE6aG92ZXIge1xuXHRcdC8qIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS1wcmltZSk7ICovXG5cdH1cblxuXHQucG9zdCBoMSB7XG5cdFx0Y29sb3I6IHZhcigtLXNlY29uZCk7XG5cdFx0bWF4LXdpZHRoOiAyMGVtO1xuXHRcdG1hcmdpbjogMCAwIC44cmVtIDA7XG5cdH1cblxuXHQucG9zdCA6Z2xvYmFsKGgyKSB7XG5cdFx0bWFyZ2luOiAyZW0gMCAwLjVlbSAwO1xuXHRcdC8qIGNvbG9yOiB2YXIoLS1zZWNvbmQpOyAqL1xuXHRcdGNvbG9yOiB2YXIoLS10ZXh0KTtcblx0XHRmb250LXNpemU6IHZhcigtLWgzKTtcblx0XHRmb250LXdlaWdodDogMzAwO1xuXHR9XG5cblx0LnBvc3QgOmdsb2JhbChmaWd1cmUpIHtcblx0XHRtYXJnaW46IDEuNnJlbSAwIDMuMnJlbSAwO1xuXHR9XG5cblx0LnBvc3QgOmdsb2JhbChmaWd1cmUpIDpnbG9iYWwoaW1nKSB7XG5cdFx0bWF4LXdpZHRoOiAxMDAlO1xuXHR9XG5cblx0LnBvc3QgOmdsb2JhbChmaWdjYXB0aW9uKSB7XG5cdFx0Y29sb3I6IHZhcigtLXNlY29uZCk7XG5cdFx0dGV4dC1hbGlnbjogbGVmdDtcblx0fVxuXG5cdC5wb3N0IDpnbG9iYWwodmlkZW8pIHtcblx0XHR3aWR0aDogMTAwJTtcblx0fVxuXG5cdC5wb3N0IDpnbG9iYWwoYmxvY2txdW90ZSkge1xuXHRcdG1heC13aWR0aDogbm9uZTtcblx0XHRib3JkZXItbGVmdDogNHB4IHNvbGlkICNlZWU7XG5cdFx0YmFja2dyb3VuZDogI2Y5ZjlmOTtcblx0XHRib3JkZXItcmFkaXVzOiAwIHZhcigtLWJvcmRlci1yKSB2YXIoLS1ib3JkZXItcikgMDtcblx0fVxuXG5cdC5wb3N0IDpnbG9iYWwoY29kZSkge1xuXHRcdHBhZGRpbmc6IC4zcmVtIC44cmVtIC4zcmVtO1xuXHRcdG1hcmdpbjogMCAwLjJyZW07XG5cdFx0dG9wOiAtLjFyZW07XG5cdFx0YmFja2dyb3VuZDogdmFyKC0tYmFjay1hcGkpO1xuXHR9XG5cblx0LnBvc3QgOmdsb2JhbChwcmUpIDpnbG9iYWwoY29kZSkge1xuXHRcdHBhZGRpbmc6IDA7XG5cdFx0bWFyZ2luOiAwO1xuXHRcdHRvcDogMDtcblx0XHRiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcblx0fVxuXG5cdC5wb3N0IDpnbG9iYWwoYXNpZGUpIHtcblx0XHRmbG9hdDogcmlnaHQ7XG5cdFx0bWFyZ2luOiAwIDAgMWVtIDFlbTtcblx0XHR3aWR0aDogMTZyZW07XG5cdFx0Y29sb3I6IHZhcigtLXNlY29uZCk7XG5cdFx0ei1pbmRleDogMjtcblx0fVxuXG5cdC5wb3N0IDpnbG9iYWwoLm1heCkge1xuXHRcdHdpZHRoOiAxMDAlO1xuXHR9XG5cblx0LnBvc3QgOmdsb2JhbChpZnJhbWUpIHtcblx0XHR3aWR0aDogMTAwJTtcblx0XHRoZWlnaHQ6IDQyMHB4O1xuXHRcdG1hcmdpbjogMmVtIDA7XG5cdFx0Ym9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXIpO1xuXHRcdGJvcmRlcjogMC44cmVtIHNvbGlkIHZhcigtLXNlY29uZCk7XG5cdH1cblxuXHQucG9zdCA6Z2xvYmFsKC5hbmNob3IpIHtcblx0XHR0b3A6IGNhbGMoKHZhcigtLWgzKSAtIDI0cHgpIC8gMik7XG5cdH1cblxuXHQucG9zdCA6Z2xvYmFsKGEpIHtcblx0XHRwYWRkaW5nOiAwO1xuXHRcdHRyYW5zaXRpb246IG5vbmU7XG5cdH1cblxuXHQucG9zdCA6Z2xvYmFsKGEpOm5vdCg6aG92ZXIpIHtcblx0XHRib3JkZXI6IG5vbmU7XG5cdH1cblxuXHRAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcblx0XHQucG9zdCA6Z2xvYmFsKC5hbmNob3IpIHtcblx0XHRcdHRyYW5zZm9ybTogc2NhbGUoMC42KTtcblx0XHRcdG9wYWNpdHk6IDE7XG5cdFx0XHRsZWZ0OiAtMS4wZW07XG5cdFx0fVxuXHR9XG5cblx0QG1lZGlhIChtaW4td2lkdGg6IDkxMHB4KSB7XG5cdFx0LnBvc3QgOmdsb2JhbCgubWF4KSB7XG5cdFx0XHR3aWR0aDogY2FsYygxMDB2dyAtIDIgKiB2YXIoLS1zaWRlLW5hdikpO1xuXHRcdFx0bWFyZ2luOiAwIGNhbGModmFyKC0tbWFpbi13aWR0aCkgLyAyIC0gNTB2dyk7XG5cdFx0XHR0ZXh0LWFsaWduOiBjZW50ZXI7XG5cdFx0fVxuXG5cdFx0LnBvc3QgOmdsb2JhbCgubWF4KSA+IDpnbG9iYWwoKikge1xuXHRcdFx0d2lkdGg6IDEwMCU7XG5cdFx0XHRtYXgtd2lkdGg6IDEyMDBweDtcblx0XHR9XG5cblx0XHQucG9zdCA6Z2xvYmFsKGlmcmFtZSkge1xuXHRcdFx0d2lkdGg6IDEwMCU7XG5cdFx0XHRtYXgtd2lkdGg6IDExMDBweDtcblx0XHRcdG1hcmdpbjogMmVtIGF1dG87XG5cdFx0fVxuXHR9XG48L3N0eWxlPlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O3lCQW9CTSxHQUFJLElBQUMsUUFBUSxDQUFDLEtBQUs7Ozs7eUJBQ0QsR0FBSSxJQUFDLFFBQVEsQ0FBQyxXQUFXOzs7Ozt5QkFFTyxHQUFJLElBQUMsUUFBUSxDQUFDLE1BQU07Ozs7O3lCQUFnRCxHQUFJLElBQUMsUUFBUSxDQUFDLFVBQVU7Ozs7OzBCQUU1SSxHQUFJLElBQUMsSUFBSTt5Q0FiUixHQUFJLElBQUMsUUFBUSxDQUFDLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkRBRVMsR0FBSSxJQUFDLFFBQVEsQ0FBQyxLQUFLOzs7NkRBQ2IsR0FBSSxJQUFDLFFBQVEsQ0FBQyxXQUFXOzs7NkRBQ2pDLEdBQUksSUFBQyxRQUFRLENBQUMsV0FBVzs7Ozs7OytDQU8vQixHQUFJLElBQUMsUUFBUSxDQUFDLFNBQVM7Ozs2REFBK0MsR0FBSSxJQUFDLFFBQVEsQ0FBQyxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUVBWC9HLEdBQUksSUFBQyxRQUFRLENBQUMsS0FBSzs7OztxRkFFUyxHQUFJLElBQUMsUUFBUSxDQUFDLEtBQUs7Ozs7cUZBQ2IsR0FBSSxJQUFDLFFBQVEsQ0FBQyxXQUFXOzs7O3FGQUNqQyxHQUFJLElBQUMsUUFBUSxDQUFDLFdBQVc7Ozs7K0RBSXRELEdBQUksSUFBQyxRQUFRLENBQUMsS0FBSzsrREFDRCxHQUFJLElBQUMsUUFBUSxDQUFDLFdBQVc7K0RBRU8sR0FBSSxJQUFDLFFBQVEsQ0FBQyxNQUFNOzt1RUFBL0MsR0FBSSxJQUFDLFFBQVEsQ0FBQyxTQUFTOzs7OytEQUF3RSxHQUFJLElBQUMsUUFBUSxDQUFDLFVBQVU7O3FGQUFqRCxHQUFJLElBQUMsUUFBUSxDQUFDLE9BQU87Ozs7aUVBRWhILEdBQUksSUFBQyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUF4Qk0sT0FBTyxHQUFHLE1BQU07T0FDL0IsR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLFNBQVMsTUFBTSxDQUFDLElBQUk7O1FBQ3pDLEdBQUcsQ0FBQyxFQUFFO0tBQUssSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJO0dBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVzs7Ozs7O09BSzlELElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9