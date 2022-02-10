
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Text.svelte generated by Svelte v3.46.2 */
    const file$9 = "src/Text.svelte";

    function create_fragment$9(ctx) {
    	let textarea_1;
    	let textarea_1_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			attr_dev(textarea_1, "spellcheck", "false");
    			attr_dev(textarea_1, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(textarea_1, "style", textarea_1_style_value = `--white-space:${/*whiteSpaceCss*/ ctx[2]};`);
    			attr_dev(textarea_1, "class", "svelte-oek2ek");
    			add_location(textarea_1, file$9, 29, 0, 572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    			set_input_value(textarea_1, /*value*/ ctx[0]);
    			/*textarea_1_binding*/ ctx[11](textarea_1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[10]),
    					listen_dev(textarea_1, "load", /*autoHeight*/ ctx[4], false, false, false),
    					listen_dev(textarea_1, "input", /*autoHeight*/ ctx[4], false, false, false),
    					listen_dev(textarea_1, "keydown", /*keydown_handler*/ ctx[7], false, false, false),
    					listen_dev(textarea_1, "focus", /*focus_handler*/ ctx[8], false, false, false),
    					listen_dev(textarea_1, "blur", /*blur_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(textarea_1, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*whiteSpaceCss*/ 4 && textarea_1_style_value !== (textarea_1_style_value = `--white-space:${/*whiteSpaceCss*/ ctx[2]};`)) {
    				attr_dev(textarea_1, "style", textarea_1_style_value);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    			/*textarea_1_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text', slots, []);
    	let { value } = $$props;
    	let { placeholder = '' } = $$props;
    	let { nowrap = false } = $$props;
    	let whiteSpaceCss;
    	let textarea;

    	function autoHeight() {
    		$$invalidate(3, textarea.style.height = '0px', textarea);
    		$$invalidate(3, textarea.style.height = textarea.scrollHeight + 'px', textarea);
    	}

    	afterUpdate(function () {
    		autoHeight();
    	});

    	const focus = () => {
    		textarea.focus();
    	};

    	const writable_props = ['value', 'placeholder', 'nowrap'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function textarea_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			textarea = $$value;
    			$$invalidate(3, textarea);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ('nowrap' in $$props) $$invalidate(5, nowrap = $$props.nowrap);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		createEventDispatcher,
    		value,
    		placeholder,
    		nowrap,
    		whiteSpaceCss,
    		textarea,
    		autoHeight,
    		focus
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ('nowrap' in $$props) $$invalidate(5, nowrap = $$props.nowrap);
    		if ('whiteSpaceCss' in $$props) $$invalidate(2, whiteSpaceCss = $$props.whiteSpaceCss);
    		if ('textarea' in $$props) $$invalidate(3, textarea = $$props.textarea);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*nowrap*/ 32) {
    			{
    				if (nowrap) {
    					$$invalidate(2, whiteSpaceCss = 'nowrap');
    				} else {
    					$$invalidate(2, whiteSpaceCss = 'auto');
    				}
    			}
    		}
    	};

    	return [
    		value,
    		placeholder,
    		whiteSpaceCss,
    		textarea,
    		autoHeight,
    		nowrap,
    		focus,
    		keydown_handler,
    		focus_handler,
    		blur_handler,
    		textarea_1_input_handler,
    		textarea_1_binding
    	];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			value: 0,
    			placeholder: 1,
    			nowrap: 5,
    			focus: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Text> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nowrap() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nowrap(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		return this.$$.ctx[6];
    	}

    	set focus(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Box.svelte generated by Svelte v3.46.2 */
    const file$8 = "src/Box.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[24] = list;
    	child_ctx[25] = i;
    	return child_ctx;
    }

    // (145:4) {#if data.children.length == 0 && data.level < columnCount}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "+";
    			attr_dev(button, "class", "add svelte-1624lro");
    			add_location(button, file$8, 145, 6, 3592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(145:4) {#if data.children.length == 0 && data.level < columnCount}",
    		ctx
    	});

    	return block;
    }

    // (151:4) {#each data.children as child}
    function create_each_block$2(ctx) {
    	let box;
    	let updating_data;
    	let current;

    	function box_data_binding(value) {
    		/*box_data_binding*/ ctx[15](value, /*child*/ ctx[23], /*each_value*/ ctx[24], /*child_index*/ ctx[25]);
    	}

    	let box_props = {};

    	if (/*child*/ ctx[23] !== void 0) {
    		box_props.data = /*child*/ ctx[23];
    	}

    	box = new Box({ props: box_props, $$inline: true });
    	binding_callbacks.push(() => bind(box, 'data', box_data_binding));
    	box.$on("addSibling", /*addSibling_handler*/ ctx[16]);
    	box.$on("deleteSelf", /*deleteSelf_handler*/ ctx[17]);
    	box.$on("focusSibling", /*focusSibling_handler*/ ctx[18]);
    	box.$on("focusParent", /*focusSelf*/ ctx[11]);
    	box.$on("saveFocus", /*saveFocus_handler*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const box_changes = {};

    			if (!updating_data && dirty & /*data*/ 1) {
    				updating_data = true;
    				box_changes.data = /*child*/ ctx[23];
    				add_flush_callback(() => updating_data = false);
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(151:4) {#each data.children as child}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let br0;
    	let t0;
    	let text_1;
    	let updating_value;
    	let t1;
    	let br1;
    	let t2;
    	let t3;
    	let ul;
    	let current;

    	function text_1_value_binding(value) {
    		/*text_1_value_binding*/ ctx[12](value);
    	}

    	let text_1_props = { placeholder: "type content here" };

    	if (/*data*/ ctx[0].content !== void 0) {
    		text_1_props.value = /*data*/ ctx[0].content;
    	}

    	text_1 = new Text({ props: text_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text_1, 'value', text_1_value_binding));
    	/*text_1_binding*/ ctx[13](text_1);
    	text_1.$on("keydown", /*handleKeydown*/ ctx[7]);
    	text_1.$on("blur", /*handleBlur*/ ctx[6]);
    	text_1.$on("focus", /*handleFocus*/ ctx[5]);
    	let if_block = /*data*/ ctx[0].children.length == 0 && /*data*/ ctx[0].level < /*columnCount*/ ctx[4] && create_if_block$2(ctx);
    	let each_value = /*data*/ ctx[0].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			br0 = element("br");
    			t0 = space();
    			create_component(text_1.$$.fragment);
    			t1 = space();
    			br1 = element("br");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(br0, "class", "svelte-1624lro");
    			add_location(br0, file$8, 133, 6, 3257);
    			attr_dev(br1, "class", "bottom svelte-1624lro");
    			add_location(br1, file$8, 142, 6, 3489);
    			attr_dev(div0, "class", "barcontainer svelte-1624lro");
    			add_location(div0, file$8, 132, 4, 3224);
    			attr_dev(div1, "class", "content svelte-1624lro");
    			toggle_class(div1, "root", /*root*/ ctx[1]);
    			add_location(div1, file$8, 131, 2, 3187);
    			attr_dev(ul, "class", "children svelte-1624lro");
    			add_location(ul, file$8, 149, 2, 3674);
    			attr_dev(div2, "class", "top svelte-1624lro");
    			toggle_class(div2, "empty", /*data*/ ctx[0].children.length == 0);
    			toggle_class(div2, "two", /*data*/ ctx[0].level % 2 == 0 && !/*neg*/ ctx[3] || /*data*/ ctx[0].level % 2 == 1 && /*neg*/ ctx[3]);
    			toggle_class(div2, "focus", /*data*/ ctx[0].focus);
    			add_location(div2, file$8, 125, 0, 3019);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, br0);
    			append_dev(div0, t0);
    			mount_component(text_1, div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, br1);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div2, t3);
    			append_dev(div2, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const text_1_changes = {};

    			if (!updating_value && dirty & /*data*/ 1) {
    				updating_value = true;
    				text_1_changes.value = /*data*/ ctx[0].content;
    				add_flush_callback(() => updating_value = false);
    			}

    			text_1.$set(text_1_changes);

    			if (/*data*/ ctx[0].children.length == 0 && /*data*/ ctx[0].level < /*columnCount*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*root*/ 2) {
    				toggle_class(div1, "root", /*root*/ ctx[1]);
    			}

    			if (dirty & /*data, addChild, deleteChild, focusChild, focusSelf*/ 3841) {
    				each_value = /*data*/ ctx[0].children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*data*/ 1) {
    				toggle_class(div2, "empty", /*data*/ ctx[0].children.length == 0);
    			}

    			if (dirty & /*data, neg*/ 9) {
    				toggle_class(div2, "two", /*data*/ ctx[0].level % 2 == 0 && !/*neg*/ ctx[3] || /*data*/ ctx[0].level % 2 == 1 && /*neg*/ ctx[3]);
    			}

    			if (dirty & /*data*/ 1) {
    				toggle_class(div2, "focus", /*data*/ ctx[0].focus);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*text_1_binding*/ ctx[13](null);
    			destroy_component(text_1);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Box', slots, []);
    	const dispatch = createEventDispatcher();
    	let { root = false } = $$props;
    	let { data } = $$props;
    	const { getNeg } = getContext('neg');
    	let neg = getNeg();
    	const { getColumnCount } = getContext('columnCount');
    	let columnCount = getColumnCount();
    	let textarea;

    	afterUpdate(function () {
    		if (data.focus) {
    			textarea.focus();
    			dispatch('saveFocus', data);
    		}
    	});

    	function handleFocus() {
    		if (!data.focus) {
    			$$invalidate(0, data.focus = true, data);
    			$$invalidate(0, data);
    		}
    	}

    	function handleBlur() {
    		if (data.focus) {
    			$$invalidate(0, data.focus = false, data);
    			$$invalidate(0, data);
    		}
    	}

    	function handleKeydown(e) {
    		if (e.key == 'Enter') {
    			e.preventDefault();

    			if (e.shiftKey) {
    				$$invalidate(0, data.focus = false, data);
    				addChild(0);
    			} else {
    				$$invalidate(0, data.focus = false, data);
    				dispatch('addSibling', data.index + 1);
    			}
    		} else if (e.key == 'Backspace') {
    			$$invalidate(0, data.focus = false, data);
    			dispatch('deleteSelf', data.index);
    		} else if (e.key == 'ArrowDown') {
    			$$invalidate(0, data.focus = false, data);
    			dispatch('focusSibling', data.index + 1);
    		} else if (e.key == 'ArrowUp') {
    			$$invalidate(0, data.focus = false, data);
    			dispatch('focusSibling', data.index - 1);
    		} else if (e.key == 'ArrowLeft') {
    			$$invalidate(0, data.focus = false, data);
    			dispatch('focusParent');
    		} else if (e.key == 'ArrowRight') {
    			$$invalidate(0, data.focus = false, data);

    			if (data.children.length > 0) {
    				$$invalidate(0, data.children[0].focus = true, data);
    			} else {
    				dispatch('focusSibling', data.index + 1);
    			}
    		}
    	}

    	function addChild(index) {
    		let children = [...data.children];

    		children.splice(index, 0, {
    			content: '',
    			children: [],
    			index,
    			level: data.level + 1,
    			focus: true
    		});

    		for (let i = index; i < children.length; i++) {
    			children[i].index = i;
    		}

    		$$invalidate(0, data.children = children, data);
    	}

    	function deleteChild(index) {
    		if (data.children.length > 1 || data.level >= 1) {
    			let children = [...data.children];
    			children.splice(index, 1);

    			for (let i = index; i < children.length; i++) {
    				children[i].index = i;
    			}

    			if (children[index - 1]) {
    				children[index - 1].focus = true;
    			}

    			$$invalidate(0, data.children = children, data);

    			if (data.children.length == 0) {
    				$$invalidate(0, data.focus = true, data);
    				$$invalidate(0, data);
    			}
    		} else {
    			$$invalidate(0, data.children[index].focus = true, data);
    		}
    	}

    	function focusChild(index) {
    		if (index < 0) {
    			$$invalidate(0, data.focus = true, data);
    			return;
    		}

    		if (index >= data.children.length) {
    			if (data.children[data.children.length - 1].children.length > 0) {
    				$$invalidate(0, data.children[data.children.length - 1].children[0].focus = true, data);
    			}

    			return;
    		}

    		$$invalidate(0, data.children[index].focus = true, data);
    		$$invalidate(0, data);
    	}

    	function focusSelf() {
    		$$invalidate(0, data.focus = true, data);
    	}

    	const writable_props = ['root', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	function text_1_value_binding(value) {
    		if ($$self.$$.not_equal(data.content, value)) {
    			data.content = value;
    			$$invalidate(0, data);
    		}
    	}

    	function text_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			textarea = $$value;
    			$$invalidate(2, textarea);
    		});
    	}

    	const click_handler = () => addChild(0);

    	function box_data_binding(value, child, each_value, child_index) {
    		each_value[child_index] = value;
    		$$invalidate(0, data);
    	}

    	const addSibling_handler = e => addChild(e.detail);
    	const deleteSelf_handler = e => deleteChild(e.detail);
    	const focusSibling_handler = e => focusChild(e.detail);

    	function saveFocus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(1, root = $$props.root);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		Text,
    		getContext,
    		onMount,
    		afterUpdate,
    		createEventDispatcher,
    		dispatch,
    		root,
    		data,
    		getNeg,
    		neg,
    		getColumnCount,
    		columnCount,
    		textarea,
    		handleFocus,
    		handleBlur,
    		handleKeydown,
    		addChild,
    		deleteChild,
    		focusChild,
    		focusSelf
    	});

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(1, root = $$props.root);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('neg' in $$props) $$invalidate(3, neg = $$props.neg);
    		if ('columnCount' in $$props) $$invalidate(4, columnCount = $$props.columnCount);
    		if ('textarea' in $$props) $$invalidate(2, textarea = $$props.textarea);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		data,
    		root,
    		textarea,
    		neg,
    		columnCount,
    		handleFocus,
    		handleBlur,
    		handleKeydown,
    		addChild,
    		deleteChild,
    		focusChild,
    		focusSelf,
    		text_1_value_binding,
    		text_1_binding,
    		click_handler,
    		box_data_binding,
    		addSibling_handler,
    		deleteSelf_handler,
    		focusSibling_handler,
    		saveFocus_handler
    	];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { root: 1, data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Box> was created without expected prop 'data'");
    		}
    	}

    	get root() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Header.svelte generated by Svelte v3.46.2 */
    const file$7 = "src/Header.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let text_1;
    	let updating_value;
    	let current;

    	function text_1_value_binding(value) {
    		/*text_1_value_binding*/ ctx[2](value);
    	}

    	let text_1_props = { nowrap: true };

    	if (/*column*/ ctx[0] !== void 0) {
    		text_1_props.value = /*column*/ ctx[0];
    	}

    	text_1 = new Text({ props: text_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text_1, 'value', text_1_value_binding));
    	text_1.$on("keydown", /*handleKeydown*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(text_1.$$.fragment);
    			attr_dev(div, "class", "top svelte-c159xa");
    			add_location(div, file$7, 16, 0, 321);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(text_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const text_1_changes = {};

    			if (!updating_value && dirty & /*column*/ 1) {
    				updating_value = true;
    				text_1_changes.value = /*column*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(text_1);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const dispatch = createEventDispatcher();
    	let { column } = $$props;

    	function handleKeydown(e) {
    		if (e.key == 'Enter' || e.key == 'ArrowDown') {
    			e.preventDefault();
    			dispatch('focusFlow');
    		}
    	}

    	const writable_props = ['column'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function text_1_value_binding(value) {
    		column = value;
    		$$invalidate(0, column);
    	}

    	$$self.$$set = $$props => {
    		if ('column' in $$props) $$invalidate(0, column = $$props.column);
    	};

    	$$self.$capture_state = () => ({
    		Text,
    		createEventDispatcher,
    		dispatch,
    		column,
    		handleKeydown
    	});

    	$$self.$inject_state = $$props => {
    		if ('column' in $$props) $$invalidate(0, column = $$props.column);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [column, handleKeydown, text_1_value_binding];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { column: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*column*/ ctx[0] === undefined && !('column' in props)) {
    			console.warn("<Header> was created without expected prop 'column'");
    		}
    	}

    	get column() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set column(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Flow.svelte generated by Svelte v3.46.2 */
    const file$6 = "src/Flow.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (35:6) {#each root.columns as column}
    function create_each_block_1$1(ctx) {
    	let div;
    	let header;
    	let updating_column;
    	let t;
    	let current;

    	function header_column_binding(value) {
    		/*header_column_binding*/ ctx[3](value, /*column*/ ctx[8], /*each_value_1*/ ctx[9], /*column_index*/ ctx[10]);
    	}

    	let header_props = {};

    	if (/*column*/ ctx[8] !== void 0) {
    		header_props.column = /*column*/ ctx[8];
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, 'column', header_column_binding));
    	header.$on("focusFlow", /*focusFlow_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(header.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "header svelte-1rbd9pw");
    			add_location(div, file$6, 35, 8, 725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(header, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const header_changes = {};

    			if (!updating_column && dirty & /*root*/ 1) {
    				updating_column = true;
    				header_changes.column = /*column*/ ctx[8];
    				add_flush_callback(() => updating_column = false);
    			}

    			header.$set(header_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(35:6) {#each root.columns as column}",
    		ctx
    	});

    	return block;
    }

    // (42:6) {#each root.columns as col}
    function create_each_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column svelte-1rbd9pw");
    			add_location(div, file$6, 42, 8, 900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(42:6) {#each root.columns as col}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let box;
    	let updating_data;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let div4_style_value;
    	let current;

    	function box_data_binding(value) {
    		/*box_data_binding*/ ctx[2](value);
    	}

    	let box_props = { root: true };

    	if (/*root*/ ctx[0] !== void 0) {
    		box_props.data = /*root*/ ctx[0];
    	}

    	box = new Box({ props: box_props, $$inline: true });
    	binding_callbacks.push(() => bind(box, 'data', box_data_binding));
    	box.$on("saveFocus", /*saveFocus*/ ctx[1]);
    	let each_value_1 = /*root*/ ctx[0].columns;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*root*/ ctx[0].columns;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			create_component(box.$$.fragment);
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "content svelte-1rbd9pw");
    			toggle_class(div0, "neg", /*root*/ ctx[0].neg);
    			add_location(div0, file$6, 30, 4, 539);
    			attr_dev(div1, "class", "headers svelte-1rbd9pw");
    			add_location(div1, file$6, 33, 4, 658);
    			attr_dev(div2, "class", "columns svelte-1rbd9pw");
    			add_location(div2, file$6, 40, 4, 836);
    			attr_dev(div3, "class", "viewer svelte-1rbd9pw");
    			add_location(div3, file$6, 29, 2, 514);
    			attr_dev(div4, "class", "top svelte-1rbd9pw");
    			attr_dev(div4, "style", div4_style_value = `--column-count: ${/*root*/ ctx[0].columns.length};`);
    			toggle_class(div4, "neg", /*root*/ ctx[0].neg);
    			add_location(div4, file$6, 24, 0, 416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			mount_component(box, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (!updating_data && dirty & /*root*/ 1) {
    				updating_data = true;
    				box_changes.data = /*root*/ ctx[0];
    				add_flush_callback(() => updating_data = false);
    			}

    			box.$set(box_changes);

    			if (dirty & /*root*/ 1) {
    				toggle_class(div0, "neg", /*root*/ ctx[0].neg);
    			}

    			if (dirty & /*root*/ 1) {
    				each_value_1 = /*root*/ ctx[0].columns;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*root*/ 1) {
    				const old_length = each_value.length;
    				each_value = /*root*/ ctx[0].columns;
    				validate_each_argument(each_value);
    				let i;

    				for (i = old_length; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (!each_blocks[i]) {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (i = each_value.length; i < old_length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*root*/ 1 && div4_style_value !== (div4_style_value = `--column-count: ${/*root*/ ctx[0].columns.length};`)) {
    				attr_dev(div4, "style", div4_style_value);
    			}

    			if (dirty & /*root*/ 1) {
    				toggle_class(div4, "neg", /*root*/ ctx[0].neg);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(box);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Flow', slots, []);
    	let { root } = $$props;

    	setContext('neg', {
    		getNeg: () => {
    			return root.neg;
    		}
    	});

    	setContext('columnCount', {
    		getColumnCount: () => {
    			return root.columns.length;
    		}
    	});

    	function saveFocus(e) {
    		$$invalidate(0, root.lastFocus = e.detail, root);
    		$$invalidate(0, root);
    	}

    	const writable_props = ['root'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Flow> was created with unknown prop '${key}'`);
    	});

    	function box_data_binding(value) {
    		root = value;
    		$$invalidate(0, root);
    	}

    	function header_column_binding(value, column, each_value_1, column_index) {
    		each_value_1[column_index] = value;
    		$$invalidate(0, root);
    	}

    	function focusFlow_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    	};

    	$$self.$capture_state = () => ({ Box, Header, setContext, root, saveFocus });

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [root, saveFocus, box_data_binding, header_column_binding, focusFlow_handler];
    }

    class Flow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { root: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Flow",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*root*/ ctx[0] === undefined && !('root' in props)) {
    			console.warn("<Flow> was created without expected prop 'root'");
    		}
    	}

    	get root() {
    		throw new Error("<Flow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Flow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Icon.svelte generated by Svelte v3.46.2 */

    const file$5 = "src/Icon.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let raw_value = /*displayIcon*/ ctx[1].svg + "";
    	let svg_style_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			attr_dev(svg, "style", svg_style_value = `width:${/*size*/ ctx[0]};height:${/*size*/ ctx[0]};display:block;margin:auto;`);
    			attr_dev(svg, "viewBox", "0 0 " + /*displayIcon*/ ctx[1].box + " " + /*displayIcon*/ ctx[1].box);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "var(--color)");
    			add_location(svg, file$5, 28, 0, 819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			svg.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1 && svg_style_value !== (svg_style_value = `width:${/*size*/ ctx[0]};height:${/*size*/ ctx[0]};display:block;margin:auto;`)) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { name } = $$props;
    	let { size = '1rem' } = $$props;

    	let icons = [
    		{
    			box: 100,
    			name: 'arrowRight',
    			svg: `<path d="M27 7L74 50L27 93" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		},
    		{
    			box: 100,
    			name: 'arrowLeft',
    			svg: `<path d="M74 93L27 50L74 7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		},
    		{
    			box: 100,
    			name: 'arrowUp',
    			svg: `<path d="M7.5 73.5L50.5 26.5L93.5 73.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		},
    		{
    			box: 100,
    			name: 'arrowDown',
    			svg: `<path d="M93.5 26.5L50.5 73.5L7.5 26.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		}
    	];

    	let displayIcon = icons.find(e => e.name === name);
    	const writable_props = ['name', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ name, size, icons, displayIcon });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('icons' in $$props) icons = $$props.icons;
    		if ('displayIcon' in $$props) $$invalidate(1, displayIcon = $$props.displayIcon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, displayIcon, name];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 2, size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !('name' in props)) {
    			console.warn("<Icon> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Button.svelte generated by Svelte v3.46.2 */
    const file$4 = "src/Button.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let icon;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: { name: /*name*/ ctx[0], size: "20px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(icon.$$.fragment);
    			attr_dev(button, "class", "top svelte-1afbhw5");
    			add_location(button, file$4, 5, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(icon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const icon_changes = {};
    			if (dirty & /*name*/ 1) icon_changes.name = /*name*/ ctx[0];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { name } = $$props;
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ Icon, name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Button> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Title.svelte generated by Svelte v3.46.2 */

    const { console: console_1 } = globals;
    const file$3 = "src/Title.svelte";

    function create_fragment$3(ctx) {
    	let div3;
    	let div0;
    	let text_1;
    	let updating_value;
    	let t0;
    	let div2;
    	let div1;
    	let button0;
    	let t1;
    	let button1;
    	let t2;
    	let button2;
    	let current;

    	function text_1_value_binding(value) {
    		/*text_1_value_binding*/ ctx[4](value);
    	}

    	let text_1_props = {
    		nowrap: true,
    		placeholder: "type name here"
    	};

    	if (/*flow*/ ctx[0].content !== void 0) {
    		text_1_props.value = /*flow*/ ctx[0].content;
    	}

    	text_1 = new Text({ props: text_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text_1, 'value', text_1_value_binding));
    	/*text_1_binding*/ ctx[5](text_1);
    	text_1.$on("blur", /*handleBlur*/ ctx[2]);
    	text_1.$on("keydown", /*handleKeydown*/ ctx[3]);

    	button0 = new Button({
    			props: { name: "arrowRight" },
    			$$inline: true
    		});

    	button0.$on("click", addChild);

    	button1 = new Button({
    			props: { name: "arrowUp" },
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler*/ ctx[6]);

    	button2 = new Button({
    			props: { name: "arrowDown" },
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_1*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(text_1.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(button0.$$.fragment);
    			t1 = space();
    			create_component(button1.$$.fragment);
    			t2 = space();
    			create_component(button2.$$.fragment);
    			attr_dev(div0, "class", "content svelte-1l9pqnq");
    			add_location(div0, file$3, 37, 2, 703);
    			attr_dev(div1, "class", "buttons svelte-1l9pqnq");
    			add_location(div1, file$3, 48, 4, 954);
    			attr_dev(div2, "class", "buttons-wrapper svelte-1l9pqnq");
    			add_location(div2, file$3, 47, 2, 920);
    			attr_dev(div3, "class", "top svelte-1l9pqnq");
    			add_location(div3, file$3, 36, 0, 683);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(text_1, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(button0, div1, null);
    			append_dev(div1, t1);
    			mount_component(button1, div1, null);
    			append_dev(div1, t2);
    			mount_component(button2, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const text_1_changes = {};

    			if (!updating_value && dirty & /*flow*/ 1) {
    				updating_value = true;
    				text_1_changes.value = /*flow*/ ctx[0].content;
    				add_flush_callback(() => updating_value = false);
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*text_1_binding*/ ctx[5](null);
    			destroy_component(text_1);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
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

    function addChild() {
    	console.log('yo');
    }

    function addSibling() {
    	
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	const dispatch = createEventDispatcher();
    	let { flow } = $$props;
    	let textarea;

    	afterUpdate(function () {
    		if (flow.focus) {
    			textarea.focus();
    		}
    	});

    	function handleBlur() {
    		if (flow.focus) {
    			delete flow.focus;
    			$$invalidate(0, flow);
    		}
    	}

    	function handleKeydown(e) {
    		if (e.key == 'Enter' || e.key == 'ArrowDown') {
    			e.preventDefault();
    			dispatch('focusFlow');
    		}
    	}

    	const writable_props = ['flow'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	function text_1_value_binding(value) {
    		if ($$self.$$.not_equal(flow.content, value)) {
    			flow.content = value;
    			$$invalidate(0, flow);
    		}
    	}

    	function text_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			textarea = $$value;
    			$$invalidate(1, textarea);
    		});
    	}

    	const click_handler = () => addSibling();
    	const click_handler_1 = () => addSibling();

    	$$self.$$set = $$props => {
    		if ('flow' in $$props) $$invalidate(0, flow = $$props.flow);
    	};

    	$$self.$capture_state = () => ({
    		Text,
    		Button,
    		afterUpdate,
    		createEventDispatcher,
    		dispatch,
    		flow,
    		textarea,
    		handleBlur,
    		handleKeydown,
    		addChild,
    		addSibling
    	});

    	$$self.$inject_state = $$props => {
    		if ('flow' in $$props) $$invalidate(0, flow = $$props.flow);
    		if ('textarea' in $$props) $$invalidate(1, textarea = $$props.textarea);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		flow,
    		textarea,
    		handleBlur,
    		handleKeydown,
    		text_1_value_binding,
    		text_1_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { flow: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*flow*/ ctx[0] === undefined && !('flow' in props)) {
    			console_1.warn("<Title> was created without expected prop 'flow'");
    		}
    	}

    	get flow() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flow(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Tab.svelte generated by Svelte v3.46.2 */

    const file$2 = "src/Tab.svelte";

    // (9:2) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("no name");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(9:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:2) {#if content}
    function create_if_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*content*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 1) set_data_dev(t, /*content*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(7:2) {#if content}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*content*/ ctx[0]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			attr_dev(button, "class", "top svelte-uh3prp");
    			toggle_class(button, "selected", /*selected*/ ctx[1]);
    			toggle_class(button, "empty", /*content*/ ctx[0].length == 0);
    			add_location(button, file$2, 5, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty & /*selected*/ 2) {
    				toggle_class(button, "selected", /*selected*/ ctx[1]);
    			}

    			if (dirty & /*content*/ 1) {
    				toggle_class(button, "empty", /*content*/ ctx[0].length == 0);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, []);
    	let { content } = $$props;
    	let { selected } = $$props;
    	const writable_props = ['content', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ content, selected });

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, selected, click_handler];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { content: 0, selected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !('content' in props)) {
    			console.warn("<Tab> was created without expected prop 'content'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !('selected' in props)) {
    			console.warn("<Tab> was created without expected prop 'selected'");
    		}
    	}

    	get content() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/AddTab.svelte generated by Svelte v3.46.2 */

    const file$1 = "src/AddTab.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*content*/ ctx[0]);
    			attr_dev(button, "class", "top svelte-89so7z");
    			add_location(button, file$1, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1) set_data_dev(t, /*content*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddTab', slots, []);
    	let { content } = $$props;
    	const writable_props = ['content'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddTab> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    	};

    	$$self.$capture_state = () => ({ content });

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, click_handler];
    }

    class AddTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { content: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddTab",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !('content' in props)) {
    			console.warn("<AddTab> was created without expected prop 'content'");
    		}
    	}

    	get content() {
    		throw new Error("<AddTab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<AddTab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.2 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[15] = list;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (57:6) {#each flows as flow, index}
    function create_each_block_1(ctx) {
    	let tab;
    	let updating_content;
    	let current;

    	function tab_content_binding(value) {
    		/*tab_content_binding*/ ctx[6](value, /*flow*/ ctx[12]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*index*/ ctx[16]);
    	}

    	let tab_props = {
    		selected: /*index*/ ctx[16] == /*selected*/ ctx[0]
    	};

    	if (/*flow*/ ctx[12].content !== void 0) {
    		tab_props.content = /*flow*/ ctx[12].content;
    	}

    	tab = new Tab({ props: tab_props, $$inline: true });
    	binding_callbacks.push(() => bind(tab, 'content', tab_content_binding));
    	tab.$on("click", click_handler);
    	tab.$on("focusFlow", /*focusFlow*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tab_changes = {};
    			if (dirty & /*selected*/ 1) tab_changes.selected = /*index*/ ctx[16] == /*selected*/ ctx[0];

    			if (!updating_content && dirty & /*flows*/ 2) {
    				updating_content = true;
    				tab_changes.content = /*flow*/ ctx[12].content;
    				add_flush_callback(() => updating_content = false);
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(57:6) {#each flows as flow, index}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if flows.length > 0}
    function create_if_block_1(ctx) {
    	let title;
    	let updating_flow;
    	let current;

    	function title_flow_binding(value) {
    		/*title_flow_binding*/ ctx[10](value);
    	}

    	let title_props = {};

    	if (/*flows*/ ctx[1][/*selected*/ ctx[0]] !== void 0) {
    		title_props.flow = /*flows*/ ctx[1][/*selected*/ ctx[0]];
    	}

    	title = new Title({ props: title_props, $$inline: true });
    	binding_callbacks.push(() => bind(title, 'flow', title_flow_binding));
    	title.$on("focusFlow", /*focusFlow*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const title_changes = {};

    			if (!updating_flow && dirty & /*flows, selected*/ 3) {
    				updating_flow = true;
    				title_changes.flow = /*flows*/ ctx[1][/*selected*/ ctx[0]];
    				add_flush_callback(() => updating_flow = false);
    			}

    			title.$set(title_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:4) {#if flows.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (78:6) {#if i == selected}
    function create_if_block(ctx) {
    	let flow;
    	let updating_root;
    	let current;

    	function flow_root_binding(value) {
    		/*flow_root_binding*/ ctx[11](value, /*flow*/ ctx[12], /*each_value*/ ctx[13], /*i*/ ctx[14]);
    	}

    	let flow_props = {};

    	if (/*flow*/ ctx[12] !== void 0) {
    		flow_props.root = /*flow*/ ctx[12];
    	}

    	flow = new Flow({ props: flow_props, $$inline: true });
    	binding_callbacks.push(() => bind(flow, 'root', flow_root_binding));
    	flow.$on("focusFlow", /*focusFlow*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(flow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flow, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const flow_changes = {};

    			if (!updating_root && dirty & /*flows*/ 2) {
    				updating_root = true;
    				flow_changes.root = /*flow*/ ctx[12];
    				add_flush_callback(() => updating_root = false);
    			}

    			flow.$set(flow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(78:6) {#if i == selected}",
    		ctx
    	});

    	return block;
    }

    // (77:4) {#each flows as flow, i}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*i*/ ctx[14] == /*selected*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[14] == /*selected*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*selected*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(77:4) {#each flows as flow, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let ul;
    	let t0;
    	let div0;
    	let addtab0;
    	let t1;
    	let addtab1;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let current;
    	let each_value_1 = /*flows*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	addtab0 = new AddTab({
    			props: { content: "+ on case" },
    			$$inline: true
    		});

    	addtab0.$on("click", /*click_handler_1*/ ctx[8]);

    	addtab1 = new AddTab({
    			props: { content: "+ off case" },
    			$$inline: true
    		});

    	addtab1.$on("click", /*click_handler_2*/ ctx[9]);
    	let if_block = /*flows*/ ctx[1].length > 0 && create_if_block_1(ctx);
    	let each_value = /*flows*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			create_component(addtab0.$$.fragment);
    			t1 = space();
    			create_component(addtab1.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t3 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "add-tab svelte-s6cfcy");
    			add_location(div0, file, 64, 6, 1433);
    			attr_dev(ul, "class", "svelte-s6cfcy");
    			add_location(ul, file, 55, 4, 1194);
    			attr_dev(div1, "class", "tabs svelte-s6cfcy");
    			add_location(div1, file, 54, 2, 1171);
    			attr_dev(div2, "class", "title svelte-s6cfcy");
    			add_location(div2, file, 70, 2, 1631);
    			attr_dev(div3, "class", "flow svelte-s6cfcy");
    			add_location(div3, file, 75, 2, 1768);
    			attr_dev(main, "class", "svelte-s6cfcy");
    			toggle_class(main, "dark", /*dark*/ ctx[2]);
    			add_location(main, file, 53, 0, 1151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(ul, t0);
    			append_dev(ul, div0);
    			mount_component(addtab0, div0, null);
    			append_dev(div0, t1);
    			mount_component(addtab1, div0, null);
    			append_dev(main, t2);
    			append_dev(main, div2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(main, t3);
    			append_dev(main, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected, flows, clickTab, focusFlow*/ 27) {
    				each_value_1 = /*flows*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(ul, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*flows*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*flows*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*flows, focusFlow, selected*/ 19) {
    				each_value = /*flows*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(addtab0.$$.fragment, local);
    			transition_in(addtab1.$$.fragment, local);
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(addtab0.$$.fragment, local);
    			transition_out(addtab1.$$.fragment, local);
    			transition_out(if_block);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(addtab0);
    			destroy_component(addtab1);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let dark = 0;

    	if (dark) {
    		window.document.body.classList.toggle('dark');
    	}

    	let selected = 0;

    	function clickTab(index) {
    		$$invalidate(0, selected = index);
    		focusFlow();
    	}

    	let flows = [];

    	function focusFlow() {
    		if (flows[selected]?.lastFocus != flows[selected]) {
    			$$invalidate(1, flows[selected].lastFocus.focus = true, flows);
    		} else {
    			$$invalidate(1, flows[selected].children[0].focus = true, flows);
    		}
    	}

    	function addFlow(neg) {
    		// function addFlow(neg) {
    		let columns;

    		if (neg) {
    			columns = ['1NC', '2AC', '2NC', '1NR', '1AR', '2NR', '2AR'];
    		} else {
    			columns = ['1AC', '1NC', '2AC', '2NC', '1NR', '1AR', '2NR', '2AR'];
    		}

    		flows.push({
    			content: '',
    			level: 0,
    			columns,
    			neg,
    			focus: true,
    			lastFocus: undefined,
    			children: [
    				{
    					content: '',
    					level: 1,
    					index: 0,
    					children: []
    				}
    			]
    		});

    		$$invalidate(0, selected = flows.length - 1);
    		$$invalidate(1, flows);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function tab_content_binding(value, flow) {
    		if ($$self.$$.not_equal(flow.content, value)) {
    			flow.content = value;
    			$$invalidate(1, flows);
    		}
    	}

    	const click_handler = index => clickTab(index);
    	const click_handler_1 = () => addFlow(false);
    	const click_handler_2 = () => addFlow(true);

    	function title_flow_binding(value) {
    		if ($$self.$$.not_equal(flows[selected], value)) {
    			flows[selected] = value;
    			$$invalidate(1, flows);
    		}
    	}

    	function flow_root_binding(value, flow, each_value, i) {
    		each_value[i] = value;
    		$$invalidate(1, flows);
    	}

    	$$self.$capture_state = () => ({
    		Flow,
    		Title,
    		Tab,
    		AddTab,
    		dark,
    		selected,
    		clickTab,
    		flows,
    		focusFlow,
    		addFlow
    	});

    	$$self.$inject_state = $$props => {
    		if ('dark' in $$props) $$invalidate(2, dark = $$props.dark);
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('flows' in $$props) $$invalidate(1, flows = $$props.flows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		flows,
    		dark,
    		clickTab,
    		focusFlow,
    		addFlow,
    		tab_content_binding,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		title_flow_binding,
    		flow_root_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
