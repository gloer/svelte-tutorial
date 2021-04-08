import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, v as validate_slots, L as globals, z as noop } from './client.2d8aba47.js';

/* src/routes/repl/index.svelte generated by Svelte v3.31.0 */

const { Object: Object_1 } = globals;

function create_fragment(ctx) {
	const block = {
		c: noop,
		l: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
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

function preload({ query }) {
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

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Repl", slots, []);
	const writable_props = [];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Repl> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ preload });
	return [];
}

class Repl extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Repl",
			options,
			id: create_fragment.name
		});
	}
}

export default Repl;
export { preload };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguMmUzNGM1M2IuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvcmVwbC9pbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdCBjb250ZXh0PVwibW9kdWxlXCI+XG5cdGV4cG9ydCBmdW5jdGlvbiBwcmVsb2FkKHsgcXVlcnkgfSkge1xuXHRcdGNvbnN0IHsgZ2lzdCwgZXhhbXBsZSwgdmVyc2lvbiB9ID0gcXVlcnk7XG5cblx0XHQvLyByZWRpcmVjdCB0byB2MiBSRVBMIGlmIGFwcHJvcHJpYXRlXG5cdFx0aWYgKC9eW14+XT9bMTJdLy50ZXN0KHZlcnNpb24pKSB7XG5cdFx0XHRjb25zdCBxID0gT2JqZWN0LmtleXMocXVlcnkpLm1hcChrZXkgPT4gYCR7a2V5fT0ke3F1ZXJ5W2tleV19YCkuam9pbignJicpO1xuXHRcdFx0cmV0dXJuIHRoaXMucmVkaXJlY3QoMzAyLCBgaHR0cHM6Ly92Mi5zdmVsdGUuZGV2L3JlcGw/JHtxfWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGlkID0gZ2lzdCB8fCBleGFtcGxlIHx8ICdoZWxsby13b3JsZCc7XG5cdFx0Y29uc3QgcSA9IHZlcnNpb24gPyBgP3ZlcnNpb249JHt2ZXJzaW9ufWAgOiBgYDtcblxuXHRcdHRoaXMucmVkaXJlY3QoMzAxLCBgcmVwbC8ke2lkfSR7cX1gKTtcblx0fVxuPC9zY3JpcHQ+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FDaUIsT0FBTyxHQUFHLEtBQUs7U0FDdEIsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEtBQUssS0FBSzs7O01BR3BDLFlBQVksRUFBQyxJQUFJLENBQUMsT0FBTztRQUN0QixDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRztTQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsZ0NBQWdDLENBQUM7OztPQUdwRCxFQUFFLEdBQUcsSUFBSSxJQUFJLE9BQU8sSUFBSSxhQUFhO09BQ3JDLENBQUMsR0FBRyxPQUFPLGVBQWUsT0FBTztDQUV2QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxFQUFFLEdBQUcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9
