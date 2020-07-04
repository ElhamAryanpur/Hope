
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
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
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/box.svelte generated by Svelte v3.19.1 */

    const file = "src/components/box.svelte";

    function create_fragment(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "box svelte-eznfy1");
    			add_location(div, file, 12, 0, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/pages/Menu.svelte generated by Svelte v3.19.1 */
    const file$1 = "src/pages/Menu.svelte";

    // (18:4) <Box>
    function create_default_slot_1(ctx) {
    	let div;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Dashboard";
    			attr_dev(div, "class", "svelte-1vvgm24");
    			add_location(div, file$1, 18, 6, 247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			dispose = listen_dev(div, "click", /*click_handler*/ ctx[0], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(18:4) <Box>",
    		ctx
    	});

    	return block;
    }

    // (25:4) <Box>
    function create_default_slot(ctx) {
    	let div;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Table";
    			attr_dev(div, "class", "svelte-1vvgm24");
    			add_location(div, file$1, 25, 6, 364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[1], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(25:4) <Box>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let tr0;
    	let td0;
    	let t;
    	let tr1;
    	let td1;
    	let current;

    	const box0 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const box1 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			create_component(box0.$$.fragment);
    			t = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			create_component(box1.$$.fragment);
    			add_location(td0, file$1, 16, 2, 226);
    			add_location(tr0, file$1, 15, 0, 219);
    			add_location(td1, file$1, 23, 2, 343);
    			add_location(tr1, file$1, 22, 0, 336);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			mount_component(box0, td0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td1);
    			mount_component(box1, td1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				box0_changes.$$scope = { dirty, ctx };
    			}

    			box0.$set(box0_changes);
    			const box1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				box1_changes.$$scope = { dirty, ctx };
    			}

    			box1.$set(box1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box0.$$.fragment, local);
    			transition_in(box1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box0.$$.fragment, local);
    			transition_out(box1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			destroy_component(box0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(tr1);
    			destroy_component(box1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	window.changePage = function (to = "account") {
    		window.choosen = to;
    		window.updateChoosen();
    	};

    	const click_handler = () => window.changePage("dash");
    	const click_handler_1 = () => window.changePage("table");
    	$$self.$capture_state = () => ({ Box, window });
    	return [click_handler, click_handler_1];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/lib/center.svelte generated by Svelte v3.19.1 */

    function center(element) {
    	element.setAttribute("style", `left: ${window.innerWidth / 2 - element.clientWidth / 2}px;
      top: ${window.innerHeight / 2 - element.clientHeight / 2}px;`);

    	window.addEventListener("resize", () => {
    		element.setAttribute("style", `left: ${window.innerWidth / 2 - element.clientWidth / 2}px;
      top: ${window.innerHeight / 2 - element.clientHeight / 2}px;`);
    	});
    }

    /* src/components/dialog.svelte generated by Svelte v3.19.1 */
    const file$2 = "src/components/dialog.svelte";

    // (87:0) {#if LOADED === true}
    function create_if_block_1(ctx) {
    	let table1;
    	let table0;
    	let tr0;
    	let td0;
    	let h2;
    	let t0;
    	let t1;
    	let td1;
    	let button_1;
    	let t3;
    	let tr1;
    	let td2;
    	let center_action;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			table1 = element("table");
    			table0 = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			td1 = element("td");
    			button_1 = element("button");
    			button_1.textContent = "X";
    			t3 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			if (default_slot) default_slot.c();
    			attr_dev(h2, "class", "unselectable");
    			add_location(h2, file$2, 91, 10, 1609);
    			attr_dev(td0, "colspan", "5");
    			add_location(td0, file$2, 90, 8, 1582);
    			attr_dev(button_1, "class", "unselectable svelte-14fnlop");
    			add_location(button_1, file$2, 94, 10, 1684);
    			add_location(td1, file$2, 93, 8, 1669);
    			add_location(tr0, file$2, 89, 6, 1569);
    			attr_dev(td2, "colspan", "6");
    			add_location(td2, file$2, 100, 8, 1834);
    			add_location(tr1, file$2, 99, 6, 1821);
    			attr_dev(table0, "class", "table svelte-14fnlop");
    			add_location(table0, file$2, 88, 4, 1541);
    			attr_dev(table1, "class", "dialog svelte-14fnlop");
    			attr_dev(table1, "id", /*id*/ ctx[0]);
    			add_location(table1, file$2, 87, 2, 1498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table1, anchor);
    			append_dev(table1, table0);
    			append_dev(table0, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, h2);
    			append_dev(h2, t0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, button_1);
    			append_dev(table0, t3);
    			append_dev(table0, tr1);
    			append_dev(tr1, td2);

    			if (default_slot) {
    				default_slot.m(td2, null);
    			}

    			current = true;

    			dispose = [
    				listen_dev(button_1, "click", /*click_handler*/ ctx[8], false, false, false),
    				action_destroyer(center_action = center.call(null, table1))
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 64) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr_dev(table1, "id", /*id*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table1);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(87:0) {#if LOADED === true}",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if button != false}
    function create_if_block(ctx) {
    	let button_1;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			t = text(/*button*/ ctx[2]);
    			attr_dev(button_1, "class", "box svelte-14fnlop");
    			attr_dev(button_1, "style", /*style*/ ctx[3]);
    			add_location(button_1, file$2, 108, 2, 1950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, t);
    			dispose = listen_dev(button_1, "click", /*click_handler_1*/ ctx[9], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*button*/ 4) set_data_dev(t, /*button*/ ctx[2]);

    			if (dirty & /*style*/ 8) {
    				attr_dev(button_1, "style", /*style*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(108:0) {#if button != false}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*LOADED*/ ctx[4] === true && create_if_block_1(ctx);
    	let if_block1 = /*button*/ ctx[2] != false && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*LOADED*/ ctx[4] === true) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*button*/ ctx[2] != false) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { id } = $$props;

    	if (id == undefined) {
    		id = "dialog";
    	}

    	let { title } = $$props;

    	if (title == undefined) {
    		title = "";
    	}

    	let { button } = $$props;

    	if (button == undefined) {
    		button = false;
    	}

    	let { style } = $$props;

    	if (style == undefined) {
    		style = "";
    	}

    	let { open } = $$props;

    	if (open == undefined) {
    		open = "false";
    	}

    	let LOADED = false;

    	onMount(() => {

    		if (button) ; else {
    			window.dialog_show(id);
    		}

    		if (open == "false") {
    			window.dialog_close(id);
    		}
    	});

    	window.dialog_show = id => {
    		//document.getElementById(id).style.display = "";
    		$$invalidate(4, LOADED = true);
    	};

    	window.dialog_close = id => {
    		//document.getElementById(id).style.display = "none";
    		$$invalidate(4, LOADED = false);
    	};

    	const writable_props = ["id", "title", "button", "style", "open"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	const click_handler = () => window.dialog_close(id);
    	const click_handler_1 = () => window.dialog_show(id);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("button" in $$props) $$invalidate(2, button = $$props.button);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    		if ("open" in $$props) $$invalidate(5, open = $$props.open);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Box,
    		center,
    		id,
    		title,
    		button,
    		style,
    		open,
    		onMount,
    		LOADED,
    		undefined,
    		window
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("button" in $$props) $$invalidate(2, button = $$props.button);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    		if ("open" in $$props) $$invalidate(5, open = $$props.open);
    		if ("LOADED" in $$props) $$invalidate(4, LOADED = $$props.LOADED);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		id,
    		title,
    		button,
    		style,
    		LOADED,
    		open,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			id: 0,
    			title: 1,
    			button: 2,
    			style: 3,
    			open: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Dialog> was created without expected prop 'id'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Dialog> was created without expected prop 'title'");
    		}

    		if (/*button*/ ctx[2] === undefined && !("button" in props)) {
    			console.warn("<Dialog> was created without expected prop 'button'");
    		}

    		if (/*style*/ ctx[3] === undefined && !("style" in props)) {
    			console.warn("<Dialog> was created without expected prop 'style'");
    		}

    		if (/*open*/ ctx[5] === undefined && !("open" in props)) {
    			console.warn("<Dialog> was created without expected prop 'open'");
    		}
    	}

    	get id() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Dash.svelte generated by Svelte v3.19.1 */
    const file$3 = "src/pages/Dash.svelte";

    function create_fragment$3(ctx) {
    	let table;

    	const block = {
    		c: function create() {
    			table = element("table");
    			attr_dev(table, "class", "svelte-1h9adpl");
    			add_location(table, file$3, 10, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	$$self.$capture_state = () => ({ Dialog });
    	return [];
    }

    class Dash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dash",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/lib/enc.svelte generated by Svelte v3.19.1 */

    var Base64 = {
    	// private property
    	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    	// public method for encoding
    	encode(input) {
    		var output = "";
    		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    		var i = 0;
    		input = Base64._utf8_encode(input);

    		while (i < input.length) {
    			chr1 = input.charCodeAt(i++);
    			chr2 = input.charCodeAt(i++);
    			chr3 = input.charCodeAt(i++);
    			enc1 = chr1 >> 2;
    			enc2 = (chr1 & 3) << 4 | chr2 >> 4;
    			enc3 = (chr2 & 15) << 2 | chr3 >> 6;
    			enc4 = chr3 & 63;

    			if (isNaN(chr2)) {
    				enc3 = enc4 = 64;
    			} else if (isNaN(chr3)) {
    				enc4 = 64;
    			}

    			output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    		}

    		return output;
    	},
    	// public method for decoding
    	decode(input) {
    		var output = "";
    		var chr1, chr2, chr3;
    		var enc1, enc2, enc3, enc4;
    		var i = 0;
    		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    		while (i < input.length) {
    			enc1 = this._keyStr.indexOf(input.charAt(i++));
    			enc2 = this._keyStr.indexOf(input.charAt(i++));
    			enc3 = this._keyStr.indexOf(input.charAt(i++));
    			enc4 = this._keyStr.indexOf(input.charAt(i++));
    			chr1 = enc1 << 2 | enc2 >> 4;
    			chr2 = (enc2 & 15) << 4 | enc3 >> 2;
    			chr3 = (enc3 & 3) << 6 | enc4;
    			output = output + String.fromCharCode(chr1);

    			if (enc3 != 64) {
    				output = output + String.fromCharCode(chr2);
    			}

    			if (enc4 != 64) {
    				output = output + String.fromCharCode(chr3);
    			}
    		}

    		output = Base64._utf8_decode(output);
    		return output;
    	},
    	// private method for UTF-8 encoding
    	_utf8_encode(string) {
    		string = string.replace(/\r\n/g, "\n");
    		var utftext = "";

    		for (var n = 0; n < string.length; n++) {
    			var c = string.charCodeAt(n);

    			if (c < 128) {
    				utftext += String.fromCharCode(c);
    			} else if (c > 127 && c < 2048) {
    				utftext += String.fromCharCode(c >> 6 | 192);
    				utftext += String.fromCharCode(c & 63 | 128);
    			} else {
    				utftext += String.fromCharCode(c >> 12 | 224);
    				utftext += String.fromCharCode(c >> 6 & 63 | 128);
    				utftext += String.fromCharCode(c & 63 | 128);
    			}
    		}

    		return utftext;
    	},
    	// private method for UTF-8 decoding
    	_utf8_decode(utftext) {
    		var string = "";
    		var i = 0;
    		var c = c1 = c2 = 0;

    		while (i < utftext.length) {
    			c = utftext.charCodeAt(i);

    			if (c < 128) {
    				string += String.fromCharCode(c);
    				i++;
    			} else if (c > 191 && c < 224) {
    				c2 = utftext.charCodeAt(i + 1);
    				string += String.fromCharCode((c & 31) << 6 | c2 & 63);
    				i += 2;
    			} else {
    				c2 = utftext.charCodeAt(i + 1);
    				c3 = utftext.charCodeAt(i + 2);
    				string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
    				i += 3;
    			}
    		}

    		return string;
    	}
    };

    function encode(unencoded) {
    	var encoded = Base64.encode(unencoded);
    	return encoded.replace("+", "-").replace("/", "_").replace(/=+$/, "");
    }

    /* src/table/TableNew.svelte generated by Svelte v3.19.1 */
    const file$4 = "src/table/TableNew.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (88:2) {#each fieldList as i, n}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let input;
    	let input_placeholder_value;
    	let t0;
    	let td1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t4;
    	let br;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[7].call(input, /*n*/ ctx[13]);
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[8].call(select, /*n*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input = element("input");
    			t0 = space();
    			td1 = element("td");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "text";
    			option1 = element("option");
    			option1.textContent = "number";
    			option2 = element("option");
    			option2.textContent = "date";
    			t4 = space();
    			br = element("br");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = "Field " + (/*n*/ ctx[13] + 1));
    			add_location(input, file$4, 90, 8, 1963);
    			attr_dev(td0, "class", "style svelte-mscjn2");
    			add_location(td0, file$4, 89, 6, 1936);
    			option0.__value = "text";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 98, 10, 2173);
    			option1.__value = "number";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 99, 10, 2218);
    			option2.__value = "date";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 100, 10, 2267);
    			if (/*fieldTypes*/ ctx[2][`${/*n*/ ctx[13]}`] === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$4, 97, 8, 2122);
    			add_location(br, file$4, 102, 8, 2328);
    			attr_dev(td1, "class", "style svelte-mscjn2");
    			add_location(td1, file$4, 96, 6, 2095);
    			attr_dev(tr, "class", "style svelte-mscjn2");
    			add_location(tr, file$4, 88, 4, 1911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input);
    			set_input_value(input, /*fieldValues*/ ctx[1][`${/*n*/ ctx[13]}`]);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*fieldTypes*/ ctx[2][`${/*n*/ ctx[13]}`]);
    			append_dev(td1, t4);
    			append_dev(td1, br);

    			dispose = [
    				listen_dev(input, "input", input_input_handler),
    				listen_dev(select, "change", select_change_handler)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*fieldValues*/ 2 && input.value !== /*fieldValues*/ ctx[1][`${/*n*/ ctx[13]}`]) {
    				set_input_value(input, /*fieldValues*/ ctx[1][`${/*n*/ ctx[13]}`]);
    			}

    			if (dirty & /*fieldTypes*/ 4) {
    				select_option(select, /*fieldTypes*/ ctx[2][`${/*n*/ ctx[13]}`]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(88:2) {#each fieldList as i, n}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let span;
    	let t1;
    	let td1;
    	let input0;
    	let input0_updating = false;
    	let t2;
    	let br0;
    	let t3;
    	let tr1;
    	let td2;
    	let t5;
    	let td3;
    	let t7;
    	let t8;
    	let br1;
    	let t9;
    	let br2;
    	let t10;
    	let br3;
    	let t11;
    	let tr2;
    	let td4;
    	let input1;
    	let t12;
    	let td5;
    	let button;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[6].call(input0);
    	}

    	let each_value = /*fieldList*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			span = element("span");
    			span.textContent = "Number Of Fields:";
    			t1 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "Field Name";
    			t5 = space();
    			td3 = element("td");
    			td3.textContent = "Field Type";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			br1 = element("br");
    			t9 = space();
    			br2 = element("br");
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			input1 = element("input");
    			t12 = space();
    			td5 = element("td");
    			button = element("button");
    			button.textContent = "Create Table";
    			add_location(span, file$4, 76, 6, 1639);
    			attr_dev(td0, "class", "svelte-mscjn2");
    			add_location(td0, file$4, 75, 4, 1628);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file$4, 79, 6, 1695);
    			attr_dev(td1, "class", "svelte-mscjn2");
    			add_location(td1, file$4, 78, 4, 1684);
    			attr_dev(tr0, "class", "svelte-mscjn2");
    			add_location(tr0, file$4, 74, 2, 1619);
    			add_location(br0, file$4, 82, 2, 1767);
    			attr_dev(td2, "class", "style svelte-mscjn2");
    			add_location(td2, file$4, 84, 4, 1799);
    			attr_dev(td3, "class", "style svelte-mscjn2");
    			add_location(td3, file$4, 85, 4, 1837);
    			attr_dev(tr1, "class", "style svelte-mscjn2");
    			add_location(tr1, file$4, 83, 2, 1776);
    			add_location(br1, file$4, 106, 2, 2369);
    			add_location(br2, file$4, 107, 2, 2378);
    			add_location(br3, file$4, 108, 2, 2387);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Table Name");
    			add_location(input1, file$4, 111, 6, 2416);
    			attr_dev(td4, "class", "svelte-mscjn2");
    			add_location(td4, file$4, 110, 4, 2405);
    			attr_dev(button, "class", "svelte-mscjn2");
    			add_location(button, file$4, 114, 6, 2511);
    			attr_dev(td5, "class", "svelte-mscjn2");
    			add_location(td5, file$4, 113, 4, 2500);
    			attr_dev(tr2, "class", "svelte-mscjn2");
    			add_location(tr2, file$4, 109, 2, 2396);
    			add_location(table, file$4, 73, 0, 1609);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, span);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*numberOfFields*/ ctx[0]);
    			append_dev(table, t2);
    			append_dev(table, br0);
    			append_dev(table, t3);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t5);
    			append_dev(tr1, td3);
    			append_dev(table, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(table, t8);
    			append_dev(table, br1);
    			append_dev(table, t9);
    			append_dev(table, br2);
    			append_dev(table, t10);
    			append_dev(table, br3);
    			append_dev(table, t11);
    			append_dev(table, tr2);
    			append_dev(tr2, td4);
    			append_dev(td4, input1);
    			set_input_value(input1, /*tableName*/ ctx[3]);
    			append_dev(tr2, t12);
    			append_dev(tr2, td5);
    			append_dev(td5, button);

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    				listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!input0_updating && dirty & /*numberOfFields*/ 1) {
    				set_input_value(input0, /*numberOfFields*/ ctx[0]);
    			}

    			input0_updating = false;

    			if (dirty & /*fieldTypes, fieldValues, fieldList*/ 22) {
    				each_value = /*fieldList*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*tableName*/ 8 && input1.value !== /*tableName*/ ctx[3]) {
    				set_input_value(input1, /*tableName*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let numberOfFields = 2;

    	function createTable() {
    		const data = {
    			name: tableName,
    			values: fieldValues,
    			types: fieldTypes
    		};

    		window.TableDB.get("tableNames", doc => {
    			if (doc.names.includes(tableName) != true) {
    				if (doc == null) {
    					window.TableDB.put("tableNames", { names: [data.name] });
    					window.TableDB.put(data.name, data);
    				} else {
    					const d = doc;
    					d.names.push(data.name);
    					window.TableDB.put("tableNames", d);
    					window.TableDB.put(data.name, data);
    				}

    				$$invalidate(1, fieldValues = ["id", ...fieldValues]);
    				$$invalidate(2, fieldTypes = ["INTEGER PRIMARY KEY AUTOINCREMENT", ...fieldTypes]);
    				const encFieldValues = [];

    				for (var i = 0; i < fieldValues.length; i++) {
    					encFieldValues.push(encode(fieldValues[i]));
    				}

    				const newData = {
    					name: tableName,
    					values: encFieldValues,
    					types: fieldTypes
    				};

    				window.socket.emit("new table", newData);
    			}
    		});

    		window.dialog_close(`new-table`);
    	}

    	let fieldValues = [];
    	let fieldTypes = [];
    	let tableName = "";

    	function input0_input_handler() {
    		numberOfFields = to_number(this.value);
    		$$invalidate(0, numberOfFields);
    	}

    	function input_input_handler(n) {
    		fieldValues[`${n}`] = this.value;
    		$$invalidate(1, fieldValues);
    	}

    	function select_change_handler(n) {
    		fieldTypes[`${n}`] = select_value(this);
    		$$invalidate(2, fieldTypes);
    	}

    	function input1_input_handler() {
    		tableName = this.value;
    		$$invalidate(3, tableName);
    	}

    	const click_handler = () => createTable();

    	$$self.$capture_state = () => ({
    		encode,
    		numberOfFields,
    		createTable,
    		fieldValues,
    		fieldTypes,
    		tableName,
    		fieldList,
    		window
    	});

    	$$self.$inject_state = $$props => {
    		if ("numberOfFields" in $$props) $$invalidate(0, numberOfFields = $$props.numberOfFields);
    		if ("fieldValues" in $$props) $$invalidate(1, fieldValues = $$props.fieldValues);
    		if ("fieldTypes" in $$props) $$invalidate(2, fieldTypes = $$props.fieldTypes);
    		if ("tableName" in $$props) $$invalidate(3, tableName = $$props.tableName);
    		if ("fieldList" in $$props) $$invalidate(4, fieldList = $$props.fieldList);
    	};

    	let fieldList;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*numberOfFields*/ 1) {
    			 $$invalidate(4, fieldList = (NOF => {
    				const l = [];

    				for (var i = 0; i < NOF; i++) {
    					l.push("text");
    				}

    				return l;
    			})(numberOfFields));
    		}
    	};

    	return [
    		numberOfFields,
    		fieldValues,
    		fieldTypes,
    		tableName,
    		fieldList,
    		createTable,
    		input0_input_handler,
    		input_input_handler,
    		select_change_handler,
    		input1_input_handler,
    		click_handler
    	];
    }

    class TableNew extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableNew",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/table/Table.svelte generated by Svelte v3.19.1 */
    const file$5 = "src/table/Table.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (57:0) <Dialog   id="new-table"   button="New Table"   style="padding: 7px; border-radius: 0px; height: 100px; width: 100px;   margin-left: 0px; animation: fadeInDown 0.7s;"   title="Create A New Table">
    function create_default_slot$1(ctx) {
    	let current;
    	const tablenew = new TableNew({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tablenew.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablenew, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablenew.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablenew.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablenew, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(57:0) <Dialog   id=\\\"new-table\\\"   button=\\\"New Table\\\"   style=\\\"padding: 7px; border-radius: 0px; height: 100px; width: 100px;   margin-left: 0px; animation: fadeInDown 0.7s;\\\"   title=\\\"Create A New Table\\\">",
    		ctx
    	});

    	return block;
    }

    // (66:0) {#each TABLE_NAMES as name}
    function create_each_block$1(ctx) {
    	let button;
    	let t0_value = /*name*/ ctx[3].substr(0, 5) + "";
    	let t0;
    	let t1;
    	let button_title_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[2](/*name*/ ctx[3], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "box down svelte-13v8bfn");
    			attr_dev(button, "title", button_title_value = /*name*/ ctx[3]);
    			add_location(button, file$5, 66, 2, 1293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			dispose = listen_dev(button, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*TABLE_NAMES*/ 1 && t0_value !== (t0_value = /*name*/ ctx[3].substr(0, 5) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*TABLE_NAMES*/ 1 && button_title_value !== (button_title_value = /*name*/ ctx[3])) {
    				attr_dev(button, "title", button_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(66:0) {#each TABLE_NAMES as name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let current;

    	const dialog = new Dialog({
    			props: {
    				id: "new-table",
    				button: "New Table",
    				style: "padding: 7px; border-radius: 0px; height: 100px; width: 100px;\n  margin-left: 0px; animation: fadeInDown 0.7s;",
    				title: "Create A New Table",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*TABLE_NAMES*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(dialog.$$.fragment);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			document.title = "Hope";
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(dialog, target, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dialog_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			dialog.$set(dialog_changes);

    			if (dirty & /*TABLE_NAMES, changeTable*/ 1) {
    				each_value = /*TABLE_NAMES*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(dialog, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function changeTable(choosen = "") {
    	window.changePage("tableview");
    	window.choosenTable = choosen;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let TABLE_NAMES = [];
    	window.TableDB = new DB("tableDB");

    	function getUpdates() {
    		window.TableDB.get_clean("tableNames", data => {
    			if (data.names != null) {
    				$$invalidate(0, TABLE_NAMES = data.names);
    			}
    		});
    	}

    	getUpdates();

    	window.socket.on("update table", () => {
    		getUpdates();
    	});

    	window.TableDB.change(() => {
    		getUpdates();
    	});

    	window.changeTable = changeTable;
    	const click_handler = name => changeTable(name);

    	$$self.$capture_state = () => ({
    		Dialog,
    		Box,
    		TableNew,
    		TABLE_NAMES,
    		getUpdates,
    		changeTable,
    		window,
    		DB
    	});

    	$$self.$inject_state = $$props => {
    		if ("TABLE_NAMES" in $$props) $$invalidate(0, TABLE_NAMES = $$props.TABLE_NAMES);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [TABLE_NAMES, getUpdates, click_handler];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/table/TableView.svelte generated by Svelte v3.19.1 */

    const { document: document_1 } = globals;
    const file$6 = "src/table/TableView.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    // (256:6) <Box>
    function create_default_slot_4(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			attr_dev(button, "class", "delete-button unselectable svelte-1teebwu");
    			add_location(button, file$6, 256, 8, 5550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[21], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(256:6) <Box>",
    		ctx
    	});

    	return block;
    }

    // (266:6) {#if LOADED === true}
    function create_if_block_1$1(ctx) {
    	let current;

    	const dialog = new Dialog({
    			props: {
    				title: "Filter The Table Data",
    				button: "Filter",
    				open: "true",
    				style: "width: 100%; margin: 0; border-radius: 0px; border-radius:\n          10px; height: 59px;",
    				id: "" + (window.choosenTable + "-filter"),
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dialog.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dialog_changes = {};

    			if (dirty[0] & /*basicData, FILTER_FIELD*/ 768 | dirty[1] & /*$$scope*/ 8192) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(266:6) {#if LOADED === true}",
    		ctx
    	});

    	return block;
    }

    // (281:18) {#each basicData.columnNames as name, n}
    function create_each_block_5(ctx) {
    	let option;
    	let t_value = /*name*/ ctx[39] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*n*/ ctx[33];
    			option.value = option.__value;
    			add_location(option, file$6, 281, 20, 6260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*basicData*/ 512 && t_value !== (t_value = /*name*/ ctx[39] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(281:18) {#each basicData.columnNames as name, n}",
    		ctx
    	});

    	return block;
    }

    // (267:8) <Dialog           title="Filter The Table Data"           button="Filter"           open="true"           style="width: 100%; margin: 0; border-radius: 0px; border-radius:           10px; height: 59px;"           id="{window.choosenTable}-filter">
    function create_default_slot_3(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let span0;
    	let t1;
    	let td1;
    	let select;
    	let t2;
    	let tr1;
    	let td2;
    	let span1;
    	let t4;
    	let td3;
    	let input;
    	let input_type_value;
    	let dispose;
    	let each_value_5 = /*basicData*/ ctx[9].columnNames;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			span0 = element("span");
    			span0.textContent = "Filter By:";
    			t1 = space();
    			td1 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			span1 = element("span");
    			span1.textContent = "Search:";
    			t4 = space();
    			td3 = element("td");
    			input = element("input");
    			attr_dev(span0, "class", "svelte-1teebwu");
    			add_location(span0, file$6, 276, 16, 6067);
    			add_location(td0, file$6, 275, 14, 6046);
    			if (/*FILTER_FIELD*/ ctx[8] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[22].call(select));
    			add_location(select, file$6, 279, 16, 6146);
    			add_location(td1, file$6, 278, 14, 6125);
    			add_location(tr0, file$6, 274, 12, 6027);
    			attr_dev(span1, "class", "svelte-1teebwu");
    			add_location(span1, file$6, 288, 16, 6436);
    			add_location(td2, file$6, 287, 14, 6415);
    			attr_dev(input, "id", "filterField");
    			attr_dev(input, "type", input_type_value = /*basicData*/ ctx[9].types[/*FILTER_FIELD*/ ctx[8]]);
    			add_location(input, file$6, 291, 16, 6512);
    			add_location(td3, file$6, 290, 14, 6491);
    			add_location(tr1, file$6, 286, 12, 6396);
    			attr_dev(table, "class", "svelte-1teebwu");
    			add_location(table, file$6, 273, 10, 6007);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, span0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*FILTER_FIELD*/ ctx[8]);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(td2, span1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td3);
    			append_dev(td3, input);
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[22]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*basicData*/ 512) {
    				each_value_5 = /*basicData*/ ctx[9].columnNames;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (dirty[0] & /*FILTER_FIELD*/ 256) {
    				select_option(select, /*FILTER_FIELD*/ ctx[8]);
    			}

    			if (dirty[0] & /*basicData, FILTER_FIELD*/ 768 && input_type_value !== (input_type_value = /*basicData*/ ctx[9].types[/*FILTER_FIELD*/ ctx[8]])) {
    				attr_dev(input, "type", input_type_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(267:8) <Dialog           title=\\\"Filter The Table Data\\\"           button=\\\"Filter\\\"           open=\\\"true\\\"           style=\\\"width: 100%; margin: 0; border-radius: 0px; border-radius:           10px; height: 59px;\\\"           id=\\\"{window.choosenTable}-filter\\\">",
    		ctx
    	});

    	return block;
    }

    // (304:4) {#each basicData.columnNames as name, n}
    function create_each_block_4(ctx) {
    	let td;
    	let input;
    	let input_id_value;
    	let input_placeholder_value;
    	let changeType_action;
    	let t;
    	let br;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[23].call(input, /*n*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			input = element("input");
    			t = space();
    			br = element("br");
    			attr_dev(input, "id", input_id_value = /*n*/ ctx[33]);
    			attr_dev(input, "placeholder", input_placeholder_value = /*name*/ ctx[39]);
    			add_location(input, file$6, 305, 8, 6778);
    			add_location(br, file$6, 310, 8, 6906);
    			add_location(td, file$6, 304, 6, 6765);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, input);
    			set_input_value(input, /*newData*/ ctx[5][`${/*n*/ ctx[33]}`]);
    			append_dev(td, t);
    			append_dev(td, br);

    			dispose = [
    				listen_dev(input, "input", input_input_handler),
    				action_destroyer(changeType_action = /*changeType*/ ctx[11].call(null, input))
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*basicData*/ 512 && input_placeholder_value !== (input_placeholder_value = /*name*/ ctx[39])) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*newData*/ 32 && input.value !== /*newData*/ ctx[5][`${/*n*/ ctx[33]}`]) {
    				set_input_value(input, /*newData*/ ctx[5][`${/*n*/ ctx[33]}`]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(304:4) {#each basicData.columnNames as name, n}",
    		ctx
    	});

    	return block;
    }

    // (323:4) {#each basicData.columnNames as name}
    function create_each_block_3(ctx) {
    	let td;
    	let span;
    	let t_value = /*name*/ ctx[39] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-1teebwu");
    			add_location(span, file$6, 324, 8, 7229);
    			attr_dev(td, "class", "display unselectable header svelte-1teebwu");
    			add_location(td, file$6, 323, 6, 7180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*basicData*/ 512 && t_value !== (t_value = /*name*/ ctx[39] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(323:4) {#each basicData.columnNames as name}",
    		ctx
    	});

    	return block;
    }

    // (333:2) {#if EDIT_SHOW == true}
    function create_if_block$1(ctx) {
    	let current;

    	const dialog = new Dialog({
    			props: {
    				id: "" + (window.choosenTable + "-edit-dialog"),
    				title: "EDIT DATA",
    				style: "",
    				open: "true",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dialog.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dialog_changes = {};

    			if (dirty[0] & /*EDIT, EDIT_DATA*/ 10 | dirty[1] & /*$$scope*/ 8192) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(333:2) {#if EDIT_SHOW == true}",
    		ctx
    	});

    	return block;
    }

    // (339:6) {#each EDIT.data as e, n}
    function create_each_block_2(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*EDIT*/ ctx[1].field[/*n*/ ctx[33]] + "";
    	let t1;
    	let t2;
    	let t3;
    	let input;
    	let input_id_value;
    	let input_placeholder_value;
    	let changeTypeEdit_action;
    	let t4;
    	let br;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[25].call(input, /*n*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("Field ");
    			t1 = text(t1_value);
    			t2 = text(":");
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			br = element("br");
    			attr_dev(span, "class", "svelte-1teebwu");
    			add_location(span, file$6, 339, 8, 7550);
    			attr_dev(input, "id", input_id_value = "edit-" + /*n*/ ctx[33]);
    			attr_dev(input, "placeholder", input_placeholder_value = /*e*/ ctx[37]);
    			add_location(input, file$6, 340, 8, 7594);
    			add_location(br, file$6, 345, 8, 7727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*EDIT_DATA*/ ctx[3][/*n*/ ctx[33]]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br, anchor);

    			dispose = [
    				action_destroyer(changeTypeEdit_action = /*changeTypeEdit*/ ctx[12].call(null, input)),
    				listen_dev(input, "input", input_input_handler_1)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*EDIT*/ 2 && t1_value !== (t1_value = /*EDIT*/ ctx[1].field[/*n*/ ctx[33]] + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*EDIT*/ 2 && input_placeholder_value !== (input_placeholder_value = /*e*/ ctx[37])) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*EDIT_DATA*/ 8 && input.value !== /*EDIT_DATA*/ ctx[3][/*n*/ ctx[33]]) {
    				set_input_value(input, /*EDIT_DATA*/ ctx[3][/*n*/ ctx[33]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(339:6) {#each EDIT.data as e, n}",
    		ctx
    	});

    	return block;
    }

    // (334:4) <Dialog       id="{window.choosenTable}-edit-dialog"       title="EDIT DATA"       style=""       open="true">
    function create_default_slot_2(ctx) {
    	let t0;
    	let br;
    	let t1;
    	let button;
    	let dispose;
    	let each_value_2 = /*EDIT*/ ctx[1].data;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			br = element("br");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Update";
    			add_location(br, file$6, 347, 6, 7754);
    			attr_dev(button, "class", "svelte-1teebwu");
    			add_location(button, file$6, 348, 6, 7767);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[26], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*EDIT, EDIT_DATA*/ 10) {
    				each_value_2 = /*EDIT*/ ctx[1].data;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(334:4) <Dialog       id=\\\"{window.choosenTable}-edit-dialog\\\"       title=\\\"EDIT DATA\\\"       style=\\\"\\\"       open=\\\"true\\\">",
    		ctx
    	});

    	return block;
    }

    // (356:6) {#each d as item, m}
    function create_each_block_1(ctx) {
    	let td;
    	let t_value = /*item*/ ctx[34] + "";
    	let t;
    	let td_id_value;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "display right mainContent svelte-1teebwu");
    			attr_dev(td, "id", td_id_value = "row-" + /*n*/ ctx[33] + "-field-" + /*m*/ ctx[36]);
    			add_location(td, file$6, 356, 8, 8012);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*DATA*/ 1 && t_value !== (t_value = /*item*/ ctx[34] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(356:6) {#each d as item, m}",
    		ctx
    	});

    	return block;
    }

    // (353:2) {#each DATA as d, n}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*n*/ ctx[33] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let td1;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let img1;
    	let img1_src_value;
    	let tr_id_value;
    	let dispose;
    	let each_value_1 = /*d*/ ctx[31];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[27](/*n*/ ctx[33], ...args);
    	}

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[28](/*n*/ ctx[33], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			td1 = element("td");
    			img0 = element("img");
    			t3 = space();
    			img1 = element("img");
    			attr_dev(td0, "class", "display left svelte-1teebwu");
    			add_location(td0, file$6, 354, 6, 7939);
    			attr_dev(img0, "class", "display unselectable right svelte-1teebwu");
    			if (img0.src !== (img0_src_value = "/icon-edit.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Edit");
    			add_location(img0, file$6, 359, 8, 8118);
    			attr_dev(img1, "class", "display unselectable right svelte-1teebwu");
    			if (img1.src !== (img1_src_value = "/icon-delete.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Delete");
    			add_location(img1, file$6, 364, 8, 8271);
    			add_location(td1, file$6, 358, 6, 8105);
    			attr_dev(tr, "class", "display svelte-1teebwu");
    			attr_dev(tr, "id", tr_id_value = "row-" + /*n*/ ctx[33] + "-" + window.choosenTable + "-table");
    			add_location(tr, file$6, 353, 4, 7871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, img0);
    			append_dev(td1, t3);
    			append_dev(td1, img1);

    			dispose = [
    				listen_dev(img0, "click", click_handler_3, false, false, false),
    				listen_dev(img1, "click", click_handler_4, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*DATA*/ 1) {
    				each_value_1 = /*d*/ ctx[31];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(353:2) {#each DATA as d, n}",
    		ctx
    	});

    	return block;
    }

    // (376:6) <Box>
    function create_default_slot_1$1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Previous Page";
    			attr_dev(button, "class", "delete-button svelte-1teebwu");
    			add_location(button, file$6, 376, 8, 8517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*click_handler_5*/ ctx[29], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(376:6) <Box>",
    		ctx
    	});

    	return block;
    }

    // (383:6) <Box>
    function create_default_slot$2(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Next Page";
    			attr_dev(button, "class", "delete-button svelte-1teebwu");
    			add_location(button, file$6, 383, 8, 8672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*click_handler_6*/ ctx[30], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(383:6) <Box>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let title_value;
    	let t0;
    	let table;
    	let tr0;
    	let td0;
    	let span0;
    	let td0_colspan_value;
    	let t2;
    	let br0;
    	let t3;
    	let tr1;
    	let td1;
    	let t4;
    	let td2;
    	let t5;
    	let td3;
    	let t6;
    	let tr2;
    	let td4;
    	let t7;
    	let t8;
    	let td5;
    	let button;
    	let t10;
    	let br1;
    	let t11;
    	let tr3;
    	let td6;
    	let span1;
    	let t13;
    	let t14;
    	let td7;
    	let span2;
    	let t16;
    	let t17;
    	let t18;
    	let tr4;
    	let td8;
    	let t19;
    	let td9;
    	let t20;
    	let td10;
    	let t21;
    	let td11;
    	let t22;
    	let t23;
    	let current;
    	let dispose;
    	document_1.title = title_value = "" + (window.choosenTable + " | Hope");

    	const box0 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*LOADED*/ ctx[6] === true && create_if_block_1$1(ctx);
    	let each_value_4 = /*basicData*/ ctx[9].columnNames;
    	validate_each_argument(each_value_4);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*basicData*/ ctx[9].columnNames;
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let if_block1 = /*EDIT_SHOW*/ ctx[2] == true && create_if_block$1(ctx);
    	let each_value = /*DATA*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const box1 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const box2 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			span0 = element("span");
    			span0.textContent = `${window.choosenTable}`;
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			t4 = space();
    			td2 = element("td");
    			create_component(box0.$$.fragment);
    			t5 = space();
    			td3 = element("td");
    			if (if_block0) if_block0.c();
    			t6 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			t7 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t8 = space();
    			td5 = element("td");
    			button = element("button");
    			button.textContent = "Submit";
    			t10 = space();
    			br1 = element("br");
    			t11 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			span1 = element("span");
    			span1.textContent = "No.";
    			t13 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t14 = space();
    			td7 = element("td");
    			span2 = element("span");
    			span2.textContent = "Setting";
    			t16 = space();
    			if (if_block1) if_block1.c();
    			t17 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t18 = space();
    			tr4 = element("tr");
    			td8 = element("td");
    			t19 = space();
    			td9 = element("td");
    			create_component(box1.$$.fragment);
    			t20 = space();
    			td10 = element("td");
    			create_component(box2.$$.fragment);
    			t21 = space();
    			td11 = element("td");
    			t22 = text("Page: ");
    			t23 = text(/*CURRENT_PAGE*/ ctx[7]);
    			attr_dev(span0, "class", "title unselectable down svelte-1teebwu");
    			add_location(span0, file$6, 247, 6, 5395);
    			attr_dev(td0, "colspan", td0_colspan_value = /*colspan*/ ctx[4] + 3);
    			add_location(td0, file$6, 246, 4, 5362);
    			add_location(tr0, file$6, 245, 2, 5353);
    			add_location(br0, file$6, 250, 2, 5482);
    			add_location(td1, file$6, 253, 4, 5514);
    			add_location(td2, file$6, 254, 4, 5525);
    			add_location(td3, file$6, 264, 4, 5708);
    			attr_dev(tr1, "class", "down svelte-1teebwu");
    			add_location(tr1, file$6, 252, 2, 5492);
    			add_location(td4, file$6, 302, 4, 6707);
    			attr_dev(button, "class", "svelte-1teebwu");
    			add_location(button, file$6, 314, 6, 6952);
    			add_location(td5, file$6, 313, 4, 6941);
    			attr_dev(tr2, "class", "down svelte-1teebwu");
    			add_location(tr2, file$6, 301, 2, 6685);
    			add_location(br1, file$6, 317, 2, 7026);
    			attr_dev(span1, "class", "svelte-1teebwu");
    			add_location(span1, file$6, 320, 6, 7105);
    			attr_dev(td6, "class", "display unselectable svelte-1teebwu");
    			add_location(td6, file$6, 319, 4, 7065);
    			attr_dev(span2, "class", "svelte-1teebwu");
    			add_location(span2, file$6, 328, 6, 7329);
    			attr_dev(td7, "colspan", "2");
    			attr_dev(td7, "class", "display unselectable svelte-1teebwu");
    			add_location(td7, file$6, 327, 4, 7277);
    			attr_dev(tr3, "class", "display down svelte-1teebwu");
    			add_location(tr3, file$6, 318, 2, 7035);
    			add_location(td8, file$6, 373, 4, 8481);
    			add_location(td9, file$6, 374, 4, 8492);
    			add_location(td10, file$6, 381, 4, 8647);
    			attr_dev(td11, "colspan", "2");
    			attr_dev(td11, "class", "display unselectable svelte-1teebwu");
    			add_location(td11, file$6, 388, 4, 8796);
    			attr_dev(tr4, "class", "display svelte-1teebwu");
    			add_location(tr4, file$6, 372, 2, 8456);
    			attr_dev(table, "class", "svelte-1teebwu");
    			add_location(table, file$6, 244, 0, 5343);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, span0);
    			append_dev(table, t2);
    			append_dev(table, br0);
    			append_dev(table, t3);
    			append_dev(table, tr1);
    			append_dev(tr1, td1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td2);
    			mount_component(box0, td2, null);
    			append_dev(tr1, t5);
    			append_dev(tr1, td3);
    			if (if_block0) if_block0.m(td3, null);
    			append_dev(table, t6);
    			append_dev(table, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t7);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(tr2, null);
    			}

    			append_dev(tr2, t8);
    			append_dev(tr2, td5);
    			append_dev(td5, button);
    			append_dev(table, t10);
    			append_dev(table, br1);
    			append_dev(table, t11);
    			append_dev(table, tr3);
    			append_dev(tr3, td6);
    			append_dev(td6, span1);
    			append_dev(tr3, t13);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr3, null);
    			}

    			append_dev(tr3, t14);
    			append_dev(tr3, td7);
    			append_dev(td7, span2);
    			append_dev(table, t16);
    			if (if_block1) if_block1.m(table, null);
    			append_dev(table, t17);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(table, t18);
    			append_dev(table, tr4);
    			append_dev(tr4, td8);
    			append_dev(tr4, t19);
    			append_dev(tr4, td9);
    			mount_component(box1, td9, null);
    			append_dev(tr4, t20);
    			append_dev(tr4, td10);
    			mount_component(box2, td10, null);
    			append_dev(tr4, t21);
    			append_dev(tr4, td11);
    			append_dev(td11, t22);
    			append_dev(td11, t23);
    			current = true;
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[24], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*window*/ 0) && title_value !== (title_value = "" + (window.choosenTable + " | Hope"))) {
    				document_1.title = title_value;
    			}

    			if (!current || dirty[0] & /*colspan*/ 16 && td0_colspan_value !== (td0_colspan_value = /*colspan*/ ctx[4] + 3)) {
    				attr_dev(td0, "colspan", td0_colspan_value);
    			}

    			const box0_changes = {};

    			if (dirty[1] & /*$$scope*/ 8192) {
    				box0_changes.$$scope = { dirty, ctx };
    			}

    			box0.$set(box0_changes);

    			if (/*LOADED*/ ctx[6] === true) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(td3, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*basicData, newData*/ 544) {
    				each_value_4 = /*basicData*/ ctx[9].columnNames;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_4(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(tr2, t8);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_4.length;
    			}

    			if (dirty[0] & /*basicData*/ 512) {
    				each_value_3 = /*basicData*/ ctx[9].columnNames;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr3, t14);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (/*EDIT_SHOW*/ ctx[2] == true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(table, t17);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*deleteQuery, editQuery, DATA*/ 98305) {
    				each_value = /*DATA*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, t18);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const box1_changes = {};

    			if (dirty[1] & /*$$scope*/ 8192) {
    				box1_changes.$$scope = { dirty, ctx };
    			}

    			box1.$set(box1_changes);
    			const box2_changes = {};

    			if (dirty[1] & /*$$scope*/ 8192) {
    				box2_changes.$$scope = { dirty, ctx };
    			}

    			box2.$set(box2_changes);
    			if (!current || dirty[0] & /*CURRENT_PAGE*/ 128) set_data_dev(t23, /*CURRENT_PAGE*/ ctx[7]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(box1.$$.fragment, local);
    			transition_in(box2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(box1.$$.fragment, local);
    			transition_out(box2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(table);
    			destroy_component(box0);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(box1);
    			destroy_component(box2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function deleteTable() {
    	const confirmation = confirm("Are You Sure You Want To Delete This Table?");

    	if (confirmation) {
    		window.TableDB.get_clean("tableNames", doc => {
    			const filterNames = [];

    			for (var i = 0; i < doc.names.length; i++) {
    				if (doc.names[i] != window.choosenTable) {
    					filterNames.push(doc.names[i]);
    				}
    			}

    			window.TableDB.delete(window.choosenTable);
    			window.socket.emit("delete table", { name: window.choosenTable });
    			window.TableDB.put("tableNames", { names: filterNames });
    			location.reload();
    		});
    	}
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let DATA = [["N/A"]];
    	let EDIT = {};
    	let EDIT_SHOW = false;
    	let EDIT_DATA = [];
    	let colspan;
    	let newData = [];
    	let LOADED = false;
    	let CURRENT_PAGE = 1;
    	let FILTER_FIELD = 0;
    	let FILTER_VALUE;

    	onMount(() => {
    		$$invalidate(6, LOADED = true);
    	});

    	let basicData = { columnNames: [] };

    	window.TableDB.get_clean(window.choosenTable, doc => {
    		$$invalidate(9, basicData.columnNames = doc.values, basicData);
    		$$invalidate(9, basicData.types = doc.types, basicData);
    		$$invalidate(4, colspan = basicData.columnNames.length);
    	});

    	window.socket.on("update", () => {
    		getQuery();
    	});

    	function submitData() {
    		if (newData.length != 0) {
    			const encFieldValues = [];

    			for (var i = 0; i < basicData.columnNames.length; i++) {
    				encFieldValues.push(encode(basicData.columnNames[i]));
    			}

    			window.socket.emit("new query", {
    				table_name: window.choosenTable,
    				fields: encFieldValues,
    				data: newData
    			});

    			getQuery();
    			const NewData = [];
    			console.log(newData);

    			for (var i = 0; i < newData.length; i++) {
    				NewData.push("");
    			}

    			$$invalidate(5, newData = NewData);
    			console.log(NewData);
    		} else {
    			alert("Please Fill The Fields Before Submitting");
    		}
    	}

    	function changeType(inpt) {
    		const i = parseInt(inpt.id);
    		inpt.setAttribute("type", basicData.types[i]);
    	}

    	function changeTypeEdit(inpt) {
    		const i = parseInt(inpt.id.replace("edit-", ""));
    		inpt.setAttribute("type", basicData.types[i]);
    	}

    	function changeTypeFilter(inpt) {
    		inpt.setAttribute("type", basicData.types[FILTER_FIELD]);
    	}

    	function getQuery(page = 1) {
    		window.socket.emit("get query", { name: window.choosenTable, page });

    		window.socket.on("client get query", data => {
    			const newResult = [];

    			for (var i = 0; i < data.length; i++) {
    				var d = data[i];
    				delete d.id;
    				newResult.push(d);
    			}

    			const finalResult = [];

    			for (var i = 0; i < newResult.length; i++) {
    				const row = [];

    				for (var key in newResult[i]) {
    					row.push(newResult[i][key]);
    				}

    				finalResult.push(row);
    			}

    			$$invalidate(0, DATA = finalResult);
    		});
    	}

    	getQuery();

    	function nextPage() {
    		$$invalidate(7, CURRENT_PAGE += 1);
    		getQuery(CURRENT_PAGE);
    	}

    	function beforePage() {
    		if (CURRENT_PAGE <= 1) {
    			$$invalidate(7, CURRENT_PAGE = 1);
    		} else {
    			$$invalidate(7, CURRENT_PAGE -= 1);
    		}

    		getQuery(CURRENT_PAGE);
    	}

    	function deleteQuery(rowNum) {
    		const rowData = DATA[rowNum];
    		const confirmation = confirm("Are You Sure You Want To Delete This Table?");

    		if (confirmation) {
    			window.socket.emit("delete query", {
    				name: window.choosenTable,
    				columnNames: basicData.columnNames,
    				data: rowData
    			});

    			DATA.splice(rowNum, 1);
    			$$invalidate(0, DATA);
    		}
    	}

    	function editQuery(rowNum) {
    		const noOfFields = basicData.columnNames.length;
    		const inputs = [];

    		for (var i = 0; i < noOfFields; i++) {
    			inputs.push(document.getElementById(`row-${rowNum}-field-${i}`).innerHTML);
    		}

    		$$invalidate(1, EDIT = {
    			field: basicData.columnNames,
    			type: basicData.types,
    			data: inputs
    		});

    		$$invalidate(3, EDIT_DATA = []);

    		for (var i = 0; i < inputs.length; i++) {
    			EDIT_DATA.push(inputs[i]);
    		}

    		$$invalidate(2, EDIT_SHOW = true);
    		window.dialog_show(`${window.choosenTable}-edit-dialog`);
    	}

    	function update(d) {
    		const confirmation = confirm("Are You Sure You Want To Update This Query?");

    		if (confirmation) {
    			window.socket.emit("update query", {
    				name: window.choosenTable,
    				columnNames: basicData.columnNames,
    				default: EDIT.data,
    				data: EDIT_DATA
    			});
    		}
    	}

    	const click_handler = () => deleteTable();

    	function select_change_handler() {
    		FILTER_FIELD = select_value(this);
    		$$invalidate(8, FILTER_FIELD);
    	}

    	function input_input_handler(n) {
    		newData[`${n}`] = this.value;
    		$$invalidate(5, newData);
    	}

    	const click_handler_1 = () => submitData();

    	function input_input_handler_1(n) {
    		EDIT_DATA[n] = this.value;
    		$$invalidate(3, EDIT_DATA);
    	}

    	const click_handler_2 = () => update();
    	const click_handler_3 = n => editQuery(n);
    	const click_handler_4 = n => deleteQuery(n);
    	const click_handler_5 = () => beforePage();
    	const click_handler_6 = () => nextPage();

    	$$self.$capture_state = () => ({
    		onMount,
    		Dialog,
    		Box,
    		encode,
    		DATA,
    		EDIT,
    		EDIT_SHOW,
    		EDIT_DATA,
    		colspan,
    		newData,
    		LOADED,
    		CURRENT_PAGE,
    		FILTER_FIELD,
    		FILTER_VALUE,
    		basicData,
    		submitData,
    		changeType,
    		changeTypeEdit,
    		changeTypeFilter,
    		getQuery,
    		nextPage,
    		beforePage,
    		deleteTable,
    		deleteQuery,
    		editQuery,
    		update,
    		window,
    		console,
    		alert,
    		parseInt,
    		confirm,
    		location,
    		document
    	});

    	$$self.$inject_state = $$props => {
    		if ("DATA" in $$props) $$invalidate(0, DATA = $$props.DATA);
    		if ("EDIT" in $$props) $$invalidate(1, EDIT = $$props.EDIT);
    		if ("EDIT_SHOW" in $$props) $$invalidate(2, EDIT_SHOW = $$props.EDIT_SHOW);
    		if ("EDIT_DATA" in $$props) $$invalidate(3, EDIT_DATA = $$props.EDIT_DATA);
    		if ("colspan" in $$props) $$invalidate(4, colspan = $$props.colspan);
    		if ("newData" in $$props) $$invalidate(5, newData = $$props.newData);
    		if ("LOADED" in $$props) $$invalidate(6, LOADED = $$props.LOADED);
    		if ("CURRENT_PAGE" in $$props) $$invalidate(7, CURRENT_PAGE = $$props.CURRENT_PAGE);
    		if ("FILTER_FIELD" in $$props) $$invalidate(8, FILTER_FIELD = $$props.FILTER_FIELD);
    		if ("FILTER_VALUE" in $$props) FILTER_VALUE = $$props.FILTER_VALUE;
    		if ("basicData" in $$props) $$invalidate(9, basicData = $$props.basicData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		DATA,
    		EDIT,
    		EDIT_SHOW,
    		EDIT_DATA,
    		colspan,
    		newData,
    		LOADED,
    		CURRENT_PAGE,
    		FILTER_FIELD,
    		basicData,
    		submitData,
    		changeType,
    		changeTypeEdit,
    		nextPage,
    		beforePage,
    		deleteQuery,
    		editQuery,
    		update,
    		FILTER_VALUE,
    		changeTypeFilter,
    		getQuery,
    		click_handler,
    		select_change_handler,
    		input_input_handler,
    		click_handler_1,
    		input_input_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6
    	];
    }

    class TableView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableView",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.19.1 */
    const file$7 = "src/App.svelte";

    // (59:42) 
    function create_if_block_2(ctx) {
    	let current;
    	const tableview = new TableView({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tableview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableview, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(59:42) ",
    		ctx
    	});

    	return block;
    }

    // (57:38) 
    function create_if_block_1$2(ctx) {
    	let current;
    	const table = new Table({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(57:38) ",
    		ctx
    	});

    	return block;
    }

    // (55:8) {#if choosen === 'dash'}
    function create_if_block$2(ctx) {
    	let current;
    	const dash = new Dash({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(dash.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dash, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dash.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dash.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dash, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(55:8) {#if choosen === 'dash'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let table1;
    	let tr;
    	let td0;
    	let div0;
    	let table0;
    	let table0_resize_listener;
    	let t;
    	let td1;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const menu = new Menu({ $$inline: true });
    	const if_block_creators = [create_if_block$2, create_if_block_1$2, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*choosen*/ ctx[0] === "dash") return 0;
    		if (/*choosen*/ ctx[0] === "table") return 1;
    		if (/*choosen*/ ctx[0] === "tableview") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			table1 = element("table");
    			tr = element("tr");
    			td0 = element("td");
    			div0 = element("div");
    			table0 = element("table");
    			create_component(menu.$$.fragment);
    			t = space();
    			td1 = element("td");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			add_render_callback(() => /*table0_elementresize_handler*/ ctx[2].call(table0));
    			add_location(table0, file$7, 45, 8, 932);
    			attr_dev(div0, "id", "menu");
    			set_style(div0, "height", window.HEIGHT + "px");
    			set_style(div0, "width", /*width*/ ctx[1] + "px");
    			attr_dev(div0, "class", "svelte-1as0foh");
    			add_location(div0, file$7, 44, 6, 856);
    			set_style(td0, "width", /*width*/ ctx[1] + "px");
    			add_location(td0, file$7, 43, 4, 820);
    			attr_dev(div1, "id", "main");
    			set_style(div1, "max-height", window.HEIGHT - 100 + "px");
    			set_style(div1, "width", window.innerWidth - 120 - /*width*/ ctx[1] + "px");
    			attr_dev(div1, "class", "svelte-1as0foh");
    			add_location(div1, file$7, 51, 6, 1039);
    			add_location(td1, file$7, 50, 4, 1028);
    			add_location(tr, file$7, 42, 2, 811);
    			set_style(table1, "width", "100%");
    			add_location(table1, file$7, 41, 0, 781);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table1, anchor);
    			append_dev(table1, tr);
    			append_dev(tr, td0);
    			append_dev(td0, div0);
    			append_dev(div0, table0);
    			mount_component(menu, table0, null);
    			table0_resize_listener = add_resize_listener(table0, /*table0_elementresize_handler*/ ctx[2].bind(table0));
    			append_dev(tr, t);
    			append_dev(tr, td1);
    			append_dev(td1, div1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*width*/ 2) {
    				set_style(div0, "width", /*width*/ ctx[1] + "px");
    			}

    			if (!current || dirty & /*width*/ 2) {
    				set_style(td0, "width", /*width*/ ctx[1] + "px");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				} else {
    					if_block = null;
    				}
    			}

    			if (!current || dirty & /*width*/ 2) {
    				set_style(div1, "width", window.innerWidth - 120 - /*width*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table1);
    			destroy_component(menu);
    			table0_resize_listener.cancel();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let choosen = window.choosen;

    	if (choosen == null) {
    		choosen = "table";
    	}

    	window.updateChoosen = function () {
    		$$invalidate(0, choosen = window.choosen);
    	};

    	window.HEIGHT = window.innerHeight - 10;
    	let width;

    	window.addEventListener("resize", () => {
    		location.reload();
    	});

    	function table0_elementresize_handler() {
    		width = this.clientWidth;
    		$$invalidate(1, width);
    	}

    	$$self.$capture_state = () => ({
    		Menu,
    		Dash,
    		Table,
    		TableView,
    		choosen,
    		width,
    		window,
    		location
    	});

    	$$self.$inject_state = $$props => {
    		if ("choosen" in $$props) $$invalidate(0, choosen = $$props.choosen);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [choosen, width, table0_elementresize_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var socket = io();
    window.socket = socket;

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
