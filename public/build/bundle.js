
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

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
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

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
    const file$b = "src/Text.svelte";

    function create_fragment$b(ctx) {
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
    			attr_dev(textarea_1, "class", "svelte-166p9k7");
    			add_location(textarea_1, file$b, 30, 0, 634);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text', slots, []);
    	let { value } = $$props;
    	let { placeholder = '' } = $$props;
    	let { nowrap = false } = $$props;
    	let whiteSpaceCss;
    	let textarea;

    	function autoHeight() {
    		$$invalidate(3, textarea.value = textarea.value.replace(/\r?\n|\r/g, ''), textarea);
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

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			value: 0,
    			placeholder: 1,
    			nowrap: 5,
    			focus: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$b.name
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

    /* src/Icon.svelte generated by Svelte v3.46.2 */

    const file$a = "src/Icon.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let raw_value = /*displayIcon*/ ctx[1].svg + "";
    	let svg_style_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			attr_dev(svg, "style", svg_style_value = `width:${/*size*/ ctx[0]};height:${/*size*/ ctx[0]};display:block;margin:auto;`);
    			attr_dev(svg, "viewBox", "0 0 " + 100 + " " + 100);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "var(--color)");
    			add_location(svg, file$a, 64, 0, 2910);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { name } = $$props;
    	let { size = '1rem' } = $$props;

    	let icons = [
    		{
    			name: 'arrowRight',
    			svg: `<path d="M27 7L74 50L27 93" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		},
    		{
    			name: 'arrowLeft',
    			svg: `<path d="M74 93L27 50L74 7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		},
    		{
    			name: 'arrowUp',
    			svg: `<path d="M7.5 73.5L50.5 26.5L93.5 73.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		},
    		{
    			name: 'arrowDown',
    			svg: `<path d="M93.5 26.5L50.5 73.5L7.5 26.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    		},
    		{
    			name: 'delete',
    			svg: `<path d="M78.5685 22L22 78.5685" stroke-width="10" stroke-linecap="round"/>
<path d="M22 22L78.5685 78.5685" stroke-width="10" stroke-linecap="round"/>`
    		},
    		{
    			name: 'add',
    			svg: `<path d="M50 10L50 90" stroke-width="10" stroke-linecap="round"/>
<path d="M10 50H90" stroke-width="10" stroke-linecap="round"/>`
    		},
    		{
    			name: 'download',
    			svg: `<path d="M71 45L50 68L29 45" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 85L80 85" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 66L50 14" stroke-width="10" stroke-linecap="round"/>`
    		},
    		{
    			name: 'upload',
    			svg: `<path d="M29 37L50 14L71 37" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 85L80 85" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 16L50 68" stroke-width="10" stroke-linecap="round"/>`
    		},
    		{
    			name: 'addUp',
    			svg: `<path d="M85 25V25C87.7614 25 90 27.2386 90 30V70C90 75.5228 85.5228 80 80 80H20C14.4772 80 10 75.5228 10 70L10 30C10 27.2386 12.2386 25 15 25V25" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M35 25H65" stroke-width="10" stroke-linecap="round"/>
<path d="M50 40V10" stroke-width="10" stroke-linecap="round"/>`
    		},
    		{
    			name: 'addDown',
    			svg: `<path d="M15 75V75C12.2386 75 10 72.7614 10 70L10 30C10 24.4772 14.4772 20 20 20L80 20C85.5228 20 90 24.4772 90 30L90 70C90 72.7614 87.7614 75 85 75V75" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M65 75H35" stroke-width="10" stroke-linecap="round"/>
<path d="M50 60L50 90" stroke-width="10" stroke-linecap="round"/>`
    		},
    		{
    			name: 'addRight',
    			svg: `<path d="M75 85V85C75 87.7614 72.7614 90 70 90H30C24.4772 90 20 85.5228 20 80V20C20 14.4772 24.4772 10 30 10H70C72.7614 10 75 12.2386 75 15V15" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M75 35V65" stroke-width="10" stroke-linecap="round"/>
<path d="M60 50H90" stroke-width="10" stroke-linecap="round"/>`
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { name: 2, size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$a.name
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

    /* src/Overlay.svelte generated by Svelte v3.46.2 */

    const file$9 = "src/Overlay.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "top svelte-11u8azr");
    			attr_dev(div, "style", div_style_value = `--this-background-color:${/*background*/ ctx[0]}`);
    			add_location(div, file$9, 4, 0, 45);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*background*/ 1 && div_style_value !== (div_style_value = `--this-background-color:${/*background*/ ctx[0]}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots('Overlay', slots, []);
    	let { background } = $$props;
    	const writable_props = ['background'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('background' in $$props) $$invalidate(0, background = $$props.background);
    	};

    	$$self.$capture_state = () => ({ background });

    	$$self.$inject_state = $$props => {
    		if ('background' in $$props) $$invalidate(0, background = $$props.background);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [background];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { background: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*background*/ ctx[0] === undefined && !('background' in props)) {
    			console.warn("<Overlay> was created without expected prop 'background'");
    		}
    	}

    	get background() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function quadIn(t) {
        return t * t;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    const speed = 300;

    function boxIn(node, { duration = speed }) {
      const h = node.clientHeight;
      return {
        duration,
        css: (t) => {
          const eased = quadOut(t);

          return `
        height: ${eased * h}px;
        overflow: visible;
        clip-path: inset(${(1 - eased) * h - 2}px 0 -${h}px 0);
        transform: translateY(${(1 - eased) * -h}px);
        `;
        },
      };
    }
    function boxOut(node, { duration = speed }) {
      const h = node.clientHeight;
      return {
        duration,
        css: (t) => {
          const eased = quadOut(t);
          return `
        height: ${eased * h}px;
        overflow: visible;
        clip-path: inset(${(1 - eased) * h}px 0 0 0);
        transform: translateY(${(1 - eased) * -h}px);
        `;
        },
      };
    }
    function boxButtonIn(node, { delay = 0, duration = speed }) {
      return {
        delay,
        duration,
        css: (t) => {
          return `
        opacity:${t};
      `;
        },
      };
    }
    function brIn(node, { delay = 0, duration = speed }) {
      return {
        delay,
        duration,
        css: (t) => {
          const eased = quadOut(t);

          return `
        clip-path:inset(0% ${(1 - eased) * 100}% 0% 0%);
        transform: translateX(${(1 - eased) * 50}%);
      `;
        },
      };
    }

    function brOut(node, { delay = 0, duration = speed }) {
      return {
        delay,
        duration,
        css: (t) => {
          const eased = quadIn(t);

          return `
      clip-path:inset(0% ${(1 - eased) * 100}% 0% 0%);
      transform: translateX(${(1 - eased) * 50}%)`;
        },
      };
    }

    function tabIn(node, { duration = speed }) {
      const h = node.clientHeight;
      return {
        duration,
        css: (t) => {
          const eased = quadOut(t);
          return `
        height: ${h * eased}px;
        overflow: hidden;
        transform: translateX(${-100 * (1 - eased)}%);
      `;
        },
      };
    }

    /* src/Box.svelte generated by Svelte v3.46.2 */
    const file$8 = "src/Box.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[34] = list;
    	child_ctx[35] = i;
    	return child_ctx;
    }

    // (276:4) {#if data.children.length == 0 && data.level < columnCount}
    function create_if_block$2(ctx) {
    	let button;
    	let icon;
    	let button_intro;
    	let current;
    	let mounted;
    	let dispose;
    	icon = new Icon({ props: { name: "add" }, $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(icon.$$.fragment);
    			attr_dev(button, "class", "add svelte-6ndbzr");
    			add_location(button, file$8, 276, 6, 6952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(icon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[26], false, false, false),
    					listen_dev(button, "mousedown", preventBlur$1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			if (local) {
    				if (!button_intro) {
    					add_render_callback(() => {
    						button_intro = create_in_transition(button, boxButtonIn, {});
    						button_intro.start();
    					});
    				}
    			}

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
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(276:4) {#if data.children.length == 0 && data.level < columnCount}",
    		ctx
    	});

    	return block;
    }

    // (289:4) {#each data.children as child, index (child)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let box;
    	let updating_data;
    	let current;

    	function box_data_binding(value) {
    		/*box_data_binding*/ ctx[27](value, /*child*/ ctx[33], /*each_value*/ ctx[34], /*index*/ ctx[35]);
    	}

    	let box_props = {
    		addSibling: /*addChild*/ ctx[14],
    		deleteSelf: /*deleteChild*/ ctx[15],
    		focusSibling: /*focusChild*/ ctx[16],
    		focusParent: /*focusSelf*/ ctx[17],
    		parentPath: /*path*/ ctx[6]
    	};

    	if (/*child*/ ctx[33] !== void 0) {
    		box_props.data = /*child*/ ctx[33];
    	}

    	box = new Box({ props: box_props, $$inline: true });
    	binding_callbacks.push(() => bind(box, 'data', box_data_binding));
    	box.$on("saveFocus", /*saveFocus*/ ctx[8]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(box.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const box_changes = {};
    			if (dirty[0] & /*path*/ 64) box_changes.parentPath = /*path*/ ctx[6];

    			if (!updating_data && dirty[0] & /*data*/ 1) {
    				updating_data = true;
    				box_changes.data = /*child*/ ctx[33];
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
    			if (detaching) detach_dev(first);
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(289:4) {#each data.children as child, index (child)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let overlay0;
    	let div0_intro;
    	let div0_outro;
    	let t0;
    	let text_1;
    	let updating_value;
    	let t1;
    	let div1;
    	let overlay1;
    	let div1_intro;
    	let div1_outro;
    	let t2;
    	let div3_style_value;
    	let t3;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div4_intro;
    	let div4_outro;
    	let current;

    	overlay0 = new Overlay({
    			props: { background: /*lineColor*/ ctx[2] },
    			$$inline: true
    		});

    	function text_1_value_binding(value) {
    		/*text_1_value_binding*/ ctx[24](value);
    	}

    	let text_1_props = { placeholder: /*placeholder*/ ctx[5] };

    	if (/*data*/ ctx[0].content !== void 0) {
    		text_1_props.value = /*data*/ ctx[0].content;
    	}

    	text_1 = new Text({ props: text_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text_1, 'value', text_1_value_binding));
    	/*text_1_binding*/ ctx[25](text_1);
    	text_1.$on("keydown", /*handleKeydown*/ ctx[13]);
    	text_1.$on("blur", /*handleBlur*/ ctx[12]);
    	text_1.$on("focus", /*handleFocus*/ ctx[11]);

    	overlay1 = new Overlay({
    			props: { background: /*lineColor*/ ctx[2] },
    			$$inline: true
    		});

    	let if_block = /*data*/ ctx[0].children.length == 0 && /*data*/ ctx[0].level < /*columnCount*/ ctx[10] && create_if_block$2(ctx);
    	let each_value = /*data*/ ctx[0].children;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*child*/ ctx[33];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(overlay0.$$.fragment);
    			t0 = space();
    			create_component(text_1.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(overlay1.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "line above svelte-6ndbzr");
    			toggle_class(div0, "left", /*data*/ ctx[0].children.length > 0);
    			toggle_class(div0, "right", /*data*/ ctx[0].index == 0 && /*data*/ ctx[0].level > 1);
    			add_location(div0, file$8, 253, 6, 6308);
    			attr_dev(div1, "class", "line below svelte-6ndbzr");
    			add_location(div1, file$8, 271, 6, 6760);
    			attr_dev(div2, "class", "barcontainer svelte-6ndbzr");
    			add_location(div2, file$8, 252, 4, 6275);
    			attr_dev(div3, "class", "content svelte-6ndbzr");
    			attr_dev(div3, "style", div3_style_value = `--this-background: ${/*backgroundColor*/ ctx[3]}`);
    			toggle_class(div3, "root", /*root*/ ctx[1]);
    			toggle_class(div3, "left", /*data*/ ctx[0].children.length > 0);
    			toggle_class(div3, "right", /*data*/ ctx[0].index == 0 && /*data*/ ctx[0].level > 1);
    			add_location(div3, file$8, 245, 2, 6081);
    			attr_dev(ul, "class", "children svelte-6ndbzr");
    			add_location(ul, file$8, 287, 2, 7158);
    			attr_dev(div4, "class", "top svelte-6ndbzr");
    			toggle_class(div4, "empty", /*data*/ ctx[0].children.length == 0);
    			toggle_class(div4, "two", /*data*/ ctx[0].level % 2 == 0 && !/*neg*/ ctx[9] || /*data*/ ctx[0].level % 2 == 1 && /*neg*/ ctx[9]);
    			toggle_class(div4, "focus", /*data*/ ctx[0].focus);
    			toggle_class(div4, "highlight", /*highlight*/ ctx[7]);
    			add_location(div4, file$8, 236, 0, 5859);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			mount_component(overlay0, div0, null);
    			append_dev(div2, t0);
    			mount_component(text_1, div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(overlay1, div1, null);
    			append_dev(div3, t2);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div4, t3);
    			append_dev(div4, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const overlay0_changes = {};
    			if (dirty[0] & /*lineColor*/ 4) overlay0_changes.background = /*lineColor*/ ctx[2];
    			overlay0.$set(overlay0_changes);

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(div0, "left", /*data*/ ctx[0].children.length > 0);
    			}

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(div0, "right", /*data*/ ctx[0].index == 0 && /*data*/ ctx[0].level > 1);
    			}

    			const text_1_changes = {};
    			if (dirty[0] & /*placeholder*/ 32) text_1_changes.placeholder = /*placeholder*/ ctx[5];

    			if (!updating_value && dirty[0] & /*data*/ 1) {
    				updating_value = true;
    				text_1_changes.value = /*data*/ ctx[0].content;
    				add_flush_callback(() => updating_value = false);
    			}

    			text_1.$set(text_1_changes);
    			const overlay1_changes = {};
    			if (dirty[0] & /*lineColor*/ 4) overlay1_changes.background = /*lineColor*/ ctx[2];
    			overlay1.$set(overlay1_changes);

    			if (/*data*/ ctx[0].children.length == 0 && /*data*/ ctx[0].level < /*columnCount*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*backgroundColor*/ 8 && div3_style_value !== (div3_style_value = `--this-background: ${/*backgroundColor*/ ctx[3]}`)) {
    				attr_dev(div3, "style", div3_style_value);
    			}

    			if (dirty[0] & /*root*/ 2) {
    				toggle_class(div3, "root", /*root*/ ctx[1]);
    			}

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(div3, "left", /*data*/ ctx[0].children.length > 0);
    			}

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(div3, "right", /*data*/ ctx[0].index == 0 && /*data*/ ctx[0].level > 1);
    			}

    			if (dirty[0] & /*addChild, deleteChild, focusChild, focusSelf, path, data, saveFocus*/ 246081) {
    				each_value = /*data*/ ctx[0].children;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(div4, "empty", /*data*/ ctx[0].children.length == 0);
    			}

    			if (dirty[0] & /*data, neg*/ 513) {
    				toggle_class(div4, "two", /*data*/ ctx[0].level % 2 == 0 && !/*neg*/ ctx[9] || /*data*/ ctx[0].level % 2 == 1 && /*neg*/ ctx[9]);
    			}

    			if (dirty[0] & /*data*/ 1) {
    				toggle_class(div4, "focus", /*data*/ ctx[0].focus);
    			}

    			if (dirty[0] & /*highlight*/ 128) {
    				toggle_class(div4, "highlight", /*highlight*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overlay0.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (div0_outro) div0_outro.end(1);
    					div0_intro = create_in_transition(div0, brIn, {});
    					div0_intro.start();
    				});
    			}

    			transition_in(text_1.$$.fragment, local);
    			transition_in(overlay1.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (div1_outro) div1_outro.end(1);
    					div1_intro = create_in_transition(div1, brIn, {});
    					div1_intro.start();
    				});
    			}

    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (div4_outro) div4_outro.end(1);
    					div4_intro = create_in_transition(div4, boxIn, {});
    					div4_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overlay0.$$.fragment, local);
    			if (div0_intro) div0_intro.invalidate();

    			if (local) {
    				div0_outro = create_out_transition(div0, brOut, {});
    			}

    			transition_out(text_1.$$.fragment, local);
    			transition_out(overlay1.$$.fragment, local);
    			if (div1_intro) div1_intro.invalidate();

    			if (local) {
    				div1_outro = create_out_transition(div1, brOut, {});
    			}

    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (div4_intro) div4_intro.invalidate();

    			if (local) {
    				div4_outro = create_out_transition(div4, boxOut, {});
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(overlay0);
    			if (detaching && div0_outro) div0_outro.end();
    			/*text_1_binding*/ ctx[25](null);
    			destroy_component(text_1);
    			destroy_component(overlay1);
    			if (detaching && div1_outro) div1_outro.end();
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div4_outro) div4_outro.end();
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

    function preventBlur$1(e) {
    	e.preventDefault();
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let path;
    	let highlight;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Box', slots, []);
    	const dispatch = createEventDispatcher();
    	let { root = false } = $$props;
    	let { data } = $$props;
    	let { parentPath = [] } = $$props;

    	let { addSibling = () => {
    		
    	} } = $$props;

    	let { deleteSelf = () => {
    		
    	} } = $$props;

    	let { focusSibling = () => {
    		
    	} } = $$props;

    	let { focusParent = () => {
    		
    	} } = $$props;

    	let lineColor;
    	let backgroundColor;
    	let childFocus = false;

    	function saveFocus(e) {
    		if (e.detail.length - path.length == 1) {
    			$$invalidate(23, childFocus = true);
    		}

    		dispatch('saveFocus', e.detail);
    	}

    	const { getNeg } = getContext('neg');
    	let neg = getNeg();
    	const { getColumnCount } = getContext('columnCount');
    	let columnCount = getColumnCount();
    	let textarea;

    	beforeUpdate(function () {
    		$$invalidate(23, childFocus = false);
    	});

    	afterUpdate(function () {
    		if (data.focus && data.level >= 1) {
    			textarea.focus();
    			dispatch('saveFocus', path);
    		}
    	});

    	let placeholder = '';

    	function handleFocus() {
    		if (!data.focus) {
    			focusSelf();
    		}
    	}

    	function handleBlur() {
    		if (data.focus) {
    			$$invalidate(0, data.focus = false, data);
    			$$invalidate(0, data);
    		}
    	}

    	class keyDown {
    		constructor(handle, require = () => true, stopRepeat = true, preventDefault = true, keepFocus = false) {
    			this.require = require;
    			this.preventDefault = preventDefault;
    			this.keepFocus = keepFocus;
    			this.stopRepeat = stopRepeat;

    			this.handle = function (e) {
    				if (!this.require()) {
    					return false;
    				}

    				if (this.preventDefault) {
    					e.preventDefault();
    				}

    				if (this.stopRepeat && e.repeat == true) {
    					return false;
    				}

    				if (this.keepFocus) {
    					focusSelf();
    				}

    				handle();
    				return true;
    			};
    		}
    	}

    	const keyDowns = {
    		shiftKey: { Enter: new keyDown(() => addChild(0, 0)) },
    		other: {
    			Enter: new keyDown(() => addSibling(data.index, 1)),
    			Backspace: new keyDown(() => deleteSelf(data.index), () => data.content.length == 0),
    			ArrowUp: new keyDown(() => focusSibling(data.index, -1)),
    			ArrowDown: new keyDown(() => focusSibling(data.index, 1)),
    			ArrowLeft: new keyDown(() => focusParent()),
    			ArrowRight: new keyDown(() => {
    					if (data.children.length > 0) {
    						focusChild(0, 0);
    					} else {
    						focusSibling(data.index, 1);
    					}
    				})
    		}
    	};

    	function handleKeydown(e) {
    		if (e.shiftKey && keyDowns.shiftKey[e.key]) {
    			keyDowns.shiftKey[e.key].handle(e);
    		} else if (keyDowns.other[e.key]) {
    			keyDowns.other[e.key].handle(e);
    		}
    	}

    	function addChild(index, direction) {
    		let newIndex = index + direction;

    		// if not at end of column
    		if (data.level < columnCount) {
    			let children = [...data.children];

    			children.splice(newIndex, 0, {
    				content: '',
    				children: [],
    				index: newIndex,
    				level: data.level + 1,
    				focus: true
    			});

    			for (let i = newIndex; i < children.length; i++) {
    				children[i].index = i;
    			}

    			$$invalidate(0, data.children = [...children], data);
    			$$invalidate(0, data);
    		} else {
    			// stay focused
    			focusSelf();
    		}
    	}

    	function deleteChild(index) {
    		// if target isn't only child of first level
    		if (data.children.length > 1 || data.level >= 1) {
    			let children = [...data.children];
    			children[index].focus = false;
    			children.splice(index, 1);

    			// fix index
    			for (let i = index; i < children.length; i++) {
    				children[i].index = i;
    			}

    			// focus on previous child of deleted
    			if (children[index - 1]) {
    				children[index - 1].focus = true;
    			} else if (children.length == 0) {
    				focusSelf(); // focus on parent when empty
    			} else if (index - 1 < 0) {
    				children[0].focus = true; // focus on first child if deleted first child
    			}

    			$$invalidate(0, data.children = [...children], data);
    		} else {
    			// stay focused
    			$$invalidate(0, data.children[index].focus = true, data);
    		}

    		$$invalidate(0, data);
    	}

    	function focusChild(index, direction) {
    		let newIndex = index + direction;

    		// focus on parent when index is before children
    		if (newIndex < 0) {
    			focusSelf();
    			return;
    		}

    		// direct pointer
    		let children = data.children;

    		// if index is beyond children
    		if (newIndex >= children.length) {
    			// if has grandchild
    			if (children[children.length - 1].children.length > 0) {
    				// focus on first grandchild
    				children[children.length - 1].children[0].focus = true;
    			} else {
    				// stay focused
    				children[index].focus = true;
    			}
    		} else {
    			// focus on new
    			children[newIndex].focus = true;
    		}

    		$$invalidate(0, data.children = children, data);
    		$$invalidate(0, data);
    	}

    	function focusSelf() {
    		$$invalidate(0, data.focus = true, data);
    		$$invalidate(0, data);
    	}

    	const writable_props = [
    		'root',
    		'data',
    		'parentPath',
    		'addSibling',
    		'deleteSelf',
    		'focusSibling',
    		'focusParent'
    	];

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
    			$$invalidate(4, textarea);
    		});
    	}

    	const click_handler = () => addChild(0, 0);

    	function box_data_binding(value, child, each_value, index) {
    		each_value[index] = value;
    		$$invalidate(0, data);
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(1, root = $$props.root);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('parentPath' in $$props) $$invalidate(18, parentPath = $$props.parentPath);
    		if ('addSibling' in $$props) $$invalidate(19, addSibling = $$props.addSibling);
    		if ('deleteSelf' in $$props) $$invalidate(20, deleteSelf = $$props.deleteSelf);
    		if ('focusSibling' in $$props) $$invalidate(21, focusSibling = $$props.focusSibling);
    		if ('focusParent' in $$props) $$invalidate(22, focusParent = $$props.focusParent);
    	};

    	$$self.$capture_state = () => ({
    		Text,
    		Icon,
    		Overlay,
    		getContext,
    		onMount,
    		afterUpdate,
    		beforeUpdate,
    		createEventDispatcher,
    		boxIn,
    		boxOut,
    		boxButtonIn,
    		brIn,
    		brOut,
    		dispatch,
    		root,
    		data,
    		parentPath,
    		addSibling,
    		deleteSelf,
    		focusSibling,
    		focusParent,
    		lineColor,
    		backgroundColor,
    		childFocus,
    		saveFocus,
    		getNeg,
    		neg,
    		getColumnCount,
    		columnCount,
    		textarea,
    		placeholder,
    		preventBlur: preventBlur$1,
    		handleFocus,
    		handleBlur,
    		keyDown,
    		keyDowns,
    		handleKeydown,
    		addChild,
    		deleteChild,
    		focusChild,
    		focusSelf,
    		path,
    		highlight
    	});

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(1, root = $$props.root);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('parentPath' in $$props) $$invalidate(18, parentPath = $$props.parentPath);
    		if ('addSibling' in $$props) $$invalidate(19, addSibling = $$props.addSibling);
    		if ('deleteSelf' in $$props) $$invalidate(20, deleteSelf = $$props.deleteSelf);
    		if ('focusSibling' in $$props) $$invalidate(21, focusSibling = $$props.focusSibling);
    		if ('focusParent' in $$props) $$invalidate(22, focusParent = $$props.focusParent);
    		if ('lineColor' in $$props) $$invalidate(2, lineColor = $$props.lineColor);
    		if ('backgroundColor' in $$props) $$invalidate(3, backgroundColor = $$props.backgroundColor);
    		if ('childFocus' in $$props) $$invalidate(23, childFocus = $$props.childFocus);
    		if ('neg' in $$props) $$invalidate(9, neg = $$props.neg);
    		if ('columnCount' in $$props) $$invalidate(10, columnCount = $$props.columnCount);
    		if ('textarea' in $$props) $$invalidate(4, textarea = $$props.textarea);
    		if ('placeholder' in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ('path' in $$props) $$invalidate(6, path = $$props.path);
    		if ('highlight' in $$props) $$invalidate(7, highlight = $$props.highlight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*parentPath, data*/ 262145) {
    			$$invalidate(6, path = [...parentPath, data.index]);
    		}

    		if ($$self.$$.dirty[0] & /*data, childFocus*/ 8388609) {
    			{
    				if (data.focus) {
    					$$invalidate(2, lineColor = 'var(--accent)');
    					$$invalidate(3, backgroundColor = 'var(--background-accent)');
    				} else if (childFocus) {
    					$$invalidate(2, lineColor = 'var(--accent-fade)');
    					$$invalidate(3, backgroundColor = 'var(--background-accent-fade)');
    				} else {
    					$$invalidate(2, lineColor = 'none');
    					$$invalidate(3, backgroundColor = 'none');
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*childFocus, data*/ 8388609) {
    			$$invalidate(7, highlight = childFocus || data.focus);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 1) {
    			{
    				if (data.level == 1 && data.index == 0) {
    					$$invalidate(5, placeholder = 'type here');
    				} else {
    					$$invalidate(5, placeholder = '');
    				}
    			}
    		}
    	};

    	return [
    		data,
    		root,
    		lineColor,
    		backgroundColor,
    		textarea,
    		placeholder,
    		path,
    		highlight,
    		saveFocus,
    		neg,
    		columnCount,
    		handleFocus,
    		handleBlur,
    		handleKeydown,
    		addChild,
    		deleteChild,
    		focusChild,
    		focusSelf,
    		parentPath,
    		addSibling,
    		deleteSelf,
    		focusSibling,
    		focusParent,
    		childFocus,
    		text_1_value_binding,
    		text_1_binding,
    		click_handler,
    		box_data_binding
    	];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				root: 1,
    				data: 0,
    				parentPath: 18,
    				addSibling: 19,
    				deleteSelf: 20,
    				focusSibling: 21,
    				focusParent: 22
    			},
    			null,
    			[-1, -1]
    		);

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

    	get parentPath() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parentPath(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addSibling() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addSibling(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deleteSelf() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deleteSelf(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusSibling() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusSibling(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusParent() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusParent(value) {
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

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (35:6) {#each root.columns as column}
    function create_each_block_1(ctx) {
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
    			attr_dev(div, "class", "header svelte-3cz0xb");
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
    		id: create_each_block_1.name,
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
    			attr_dev(div, "class", "column svelte-3cz0xb");
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
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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

    			attr_dev(div0, "class", "content svelte-3cz0xb");
    			toggle_class(div0, "neg", /*root*/ ctx[0].neg);
    			add_location(div0, file$6, 30, 4, 539);
    			attr_dev(div1, "class", "headers svelte-3cz0xb");
    			add_location(div1, file$6, 33, 4, 658);
    			attr_dev(div2, "class", "columns svelte-3cz0xb");
    			add_location(div2, file$6, 40, 4, 836);
    			attr_dev(div3, "class", "viewer svelte-3cz0xb");
    			add_location(div3, file$6, 29, 2, 514);
    			attr_dev(div4, "class", "top svelte-3cz0xb");
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
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
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

    /* src/Button.svelte generated by Svelte v3.46.2 */
    const file$5 = "src/Button.svelte";

    function create_fragment$5(ctx) {
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
    			attr_dev(button, "class", "top svelte-1s5al5b");
    			toggle_class(button, "disabled", /*disabled*/ ctx[1]);
    			add_location(button, file$5, 9, 0, 162);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(icon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button, "mousedown", preventBlur, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const icon_changes = {};
    			if (dirty & /*name*/ 1) icon_changes.name = /*name*/ ctx[0];
    			icon.$set(icon_changes);

    			if (dirty & /*disabled*/ 2) {
    				toggle_class(button, "disabled", /*disabled*/ ctx[1]);
    			}
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
    			run_all(dispose);
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

    function preventBlur(e) {
    	e.preventDefault();
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { name } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ['name', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ Icon, name, disabled, preventBlur });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, disabled, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$5.name
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

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ButtonBar.svelte generated by Svelte v3.46.2 */

    const file$4 = "src/ButtonBar.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "top svelte-p5tbxi");
    			add_location(div, file$4, 0, 0, 0);
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
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonBar', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ButtonBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class ButtonBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonBar",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Title.svelte generated by Svelte v3.46.2 */
    const file$3 = "src/Title.svelte";

    // (162:4) <ButtonBar>
    function create_default_slot$1(ctx) {
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let t2;
    	let button3;
    	let current;

    	button0 = new Button({
    			props: {
    				name: "addRight",
    				disabled: !/*validFocus*/ ctx[2]
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*addChild*/ ctx[8]);

    	button1 = new Button({
    			props: {
    				name: "addUp",
    				disabled: !/*validFocus*/ ctx[2]
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler*/ ctx[12]);

    	button2 = new Button({
    			props: {
    				name: "addDown",
    				disabled: !/*validFocus*/ ctx[2]
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_1*/ ctx[13]);

    	button3 = new Button({
    			props: {
    				name: "delete",
    				disabled: !/*validFocus*/ ctx[2]
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*deleteChild*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			create_component(button2.$$.fragment);
    			t2 = space();
    			create_component(button3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(button3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*validFocus*/ 4) button0_changes.disabled = !/*validFocus*/ ctx[2];
    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*validFocus*/ 4) button1_changes.disabled = !/*validFocus*/ ctx[2];
    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*validFocus*/ 4) button2_changes.disabled = !/*validFocus*/ ctx[2];
    			button2.$set(button2_changes);
    			const button3_changes = {};
    			if (dirty & /*validFocus*/ 4) button3_changes.disabled = !/*validFocus*/ ctx[2];
    			button3.$set(button3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(button3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(162:4) <ButtonBar>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div1;
    	let text_1;
    	let updating_value;
    	let t0;
    	let div0;
    	let overlay;
    	let t1;
    	let div2;
    	let buttonbar;
    	let current;

    	function text_1_value_binding(value) {
    		/*text_1_value_binding*/ ctx[10](value);
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
    	/*text_1_binding*/ ctx[11](text_1);
    	text_1.$on("blur", /*handleBlur*/ ctx[4]);
    	text_1.$on("focus", /*handleFocus*/ ctx[5]);
    	text_1.$on("keydown", /*handleKeydown*/ ctx[6]);

    	overlay = new Overlay({
    			props: { background: /*lineColor*/ ctx[3] },
    			$$inline: true
    		});

    	buttonbar = new ButtonBar({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			create_component(text_1.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(overlay.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(buttonbar.$$.fragment);
    			attr_dev(div0, "class", "line svelte-ggwbrt");
    			add_location(div0, file$3, 156, 4, 3859);
    			attr_dev(div1, "class", "content svelte-ggwbrt");
    			toggle_class(div1, "focus", /*flow*/ ctx[0].focus);
    			add_location(div1, file$3, 146, 2, 3595);
    			attr_dev(div2, "class", "buttons-wrapper svelte-ggwbrt");
    			add_location(div2, file$3, 160, 2, 3941);
    			attr_dev(div3, "class", "top svelte-ggwbrt");
    			add_location(div3, file$3, 145, 0, 3575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			mount_component(text_1, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(overlay, div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(buttonbar, div2, null);
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
    			const overlay_changes = {};
    			if (dirty & /*lineColor*/ 8) overlay_changes.background = /*lineColor*/ ctx[3];
    			overlay.$set(overlay_changes);

    			if (dirty & /*flow*/ 1) {
    				toggle_class(div1, "focus", /*flow*/ ctx[0].focus);
    			}

    			const buttonbar_changes = {};

    			if (dirty & /*$$scope, validFocus*/ 65540) {
    				buttonbar_changes.$$scope = { dirty, ctx };
    			}

    			buttonbar.$set(buttonbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			transition_in(overlay.$$.fragment, local);
    			transition_in(buttonbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			transition_out(overlay.$$.fragment, local);
    			transition_out(buttonbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*text_1_binding*/ ctx[11](null);
    			destroy_component(text_1);
    			destroy_component(overlay);
    			destroy_component(buttonbar);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let { flow } = $$props;
    	let textarea;

    	afterUpdate(function () {
    		if (flow.focus) {
    			textarea.focus();
    		}
    	});

    	function boxFromPath(path, scope) {
    		if (!scope) {
    			scope = 0;
    		}

    		let ret = flow;

    		if (path.length > 1) {
    			for (let i = 1; i < path.length - scope; i++) {
    				ret = ret.children[path[i]];
    			}
    		}

    		return ret;
    	}

    	let validFocus = false;

    	function setValidFocus() {
    		// wait until its actually done updating
    		setTimeout(
    			() => {
    				if (flow.lastFocus && flow.lastFocus.length > 1) {
    					let box = boxFromPath(flow.lastFocus);
    					$$invalidate(2, validFocus = box?.focus);
    				}
    			},
    			0
    		);
    	}

    	function handleBlur() {
    		if (flow.focus) {
    			$$invalidate(0, flow.focus = false, flow);
    			$$invalidate(0, flow);
    		}
    	}

    	function handleFocus() {
    		if (!flow.focus) {
    			$$invalidate(0, flow.focus = true, flow);
    			$$invalidate(0, flow);
    		}
    	}

    	let lineColor;

    	function handleKeydown(e) {
    		if (e.key == 'Enter' || e.key == 'ArrowDown') {
    			e.preventDefault();

    			if (flow.children.length > 0) {
    				$$invalidate(0, flow.children[0].focus = true, flow);
    			}
    		}
    	}

    	function deleteChild() {
    		// cancel if disabled
    		if (!validFocus) return;

    		let parent = boxFromPath(flow.lastFocus, 1);
    		let target = boxFromPath(flow.lastFocus);
    		let children = [...parent.children];

    		// if target isn't only child of first level
    		if (children.length > 1 || parent.level >= 1) {
    			children.splice(target.index, 1);

    			// fix index
    			for (let i = target.index; i < children.length; i++) {
    				children[i].index = i;
    			}

    			// focus parent when empty
    			if (children.length <= 0) {
    				parent.focus = true;
    			} else if (target.index >= children.length) {
    				children[children.length - 1].focus = true; // focus last child when last child deleted
    			} else {
    				children[target.index].focus = true; // focus next child of deleted
    			}

    			parent.children = [...children];
    			$$invalidate(0, flow);
    		}
    	}

    	function addChild() {
    		// cancel if disabled
    		if (!validFocus) return;

    		// if not at end of column
    		let target = boxFromPath(flow.lastFocus);

    		let children = [...target.children];

    		if (target.level < flow.columns.length) {
    			children.splice(0, 0, {
    				content: '',
    				children: [],
    				index: 0,
    				level: target.level + 1,
    				focus: false
    			});

    			// fix index
    			for (let i = 0; i < children.length; i++) {
    				children[i].index = i;
    			}

    			target.children = [...children];
    			$$invalidate(0, flow);
    		}
    	}

    	function addSibling(direction) {
    		// cancel if disabled
    		if (!validFocus) return;

    		let parent = boxFromPath(flow.lastFocus, 1);
    		let target = boxFromPath(flow.lastFocus);
    		let children = [...parent.children];

    		children.splice(target.index + direction, 0, {
    			content: '',
    			children: [],
    			index: target.index + direction,
    			level: target.level,
    			focus: false
    		});

    		// fix index
    		for (let i = target.index; i < children.length; i++) {
    			children[i].index = i;
    		}

    		parent.children = [...children];
    		$$invalidate(0, flow);
    	}

    	const writable_props = ['flow'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
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

    	const click_handler = () => addSibling(0);
    	const click_handler_1 = () => addSibling(1);

    	$$self.$$set = $$props => {
    		if ('flow' in $$props) $$invalidate(0, flow = $$props.flow);
    	};

    	$$self.$capture_state = () => ({
    		Text,
    		Button,
    		ButtonBar,
    		Overlay,
    		afterUpdate,
    		createEventDispatcher,
    		flow,
    		textarea,
    		boxFromPath,
    		validFocus,
    		setValidFocus,
    		handleBlur,
    		handleFocus,
    		lineColor,
    		handleKeydown,
    		deleteChild,
    		addChild,
    		addSibling
    	});

    	$$self.$inject_state = $$props => {
    		if ('flow' in $$props) $$invalidate(0, flow = $$props.flow);
    		if ('textarea' in $$props) $$invalidate(1, textarea = $$props.textarea);
    		if ('validFocus' in $$props) $$invalidate(2, validFocus = $$props.validFocus);
    		if ('lineColor' in $$props) $$invalidate(3, lineColor = $$props.lineColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*flow*/ 1) {
    			(flow.lastFocus, setValidFocus());
    		}

    		if ($$self.$$.dirty & /*flow*/ 1) {
    			{
    				if (flow.focus) {
    					$$invalidate(3, lineColor = 'var(--accent)');
    				} else {
    					$$invalidate(3, lineColor = 'none');
    				}
    			}
    		}
    	};

    	return [
    		flow,
    		textarea,
    		validFocus,
    		lineColor,
    		handleBlur,
    		handleFocus,
    		handleKeydown,
    		deleteChild,
    		addChild,
    		addSibling,
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
    			console.warn("<Title> was created without expected prop 'flow'");
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

    // (22:4) {:else}
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
    		source: "(22:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if content}
    function create_if_block_1(ctx) {
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:4) {#if content}",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if selected}
    function create_if_block$1(ctx) {
    	let div;
    	let overlay;
    	let div_intro;
    	let current;

    	overlay = new Overlay({
    			props: { background: /*lineColor*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(overlay.$$.fragment);
    			attr_dev(div, "class", "line svelte-1jqg6t1");
    			add_location(div, file$2, 26, 4, 485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(overlay, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const overlay_changes = {};
    			if (dirty & /*lineColor*/ 4) overlay_changes.background = /*lineColor*/ ctx[2];
    			overlay.$set(overlay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overlay.$$.fragment, local);

    			if (local) {
    				if (!div_intro) {
    					add_render_callback(() => {
    						div_intro = create_in_transition(div, brIn, {});
    						div_intro.start();
    					});
    				}
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(overlay);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(26:2) {#if selected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let button;
    	let t;
    	let div_intro;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*content*/ ctx[0]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*selected*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(button, "class", "svelte-1jqg6t1");
    			toggle_class(button, "selected", /*selected*/ ctx[1]);
    			toggle_class(button, "empty", /*content*/ ctx[0].length == 0);
    			add_location(button, file$2, 18, 2, 315);
    			attr_dev(div, "class", "top svelte-1jqg6t1");
    			add_location(div, file$2, 17, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if_block0.m(button, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button, null);
    				}
    			}

    			if (dirty & /*selected*/ 2) {
    				toggle_class(button, "selected", /*selected*/ ctx[1]);
    			}

    			if (dirty & /*content*/ 1) {
    				toggle_class(button, "empty", /*content*/ ctx[0].length == 0);
    			}

    			if (/*selected*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*selected*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, tabIn, {});
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
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
    	let lineColor;
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

    	$$self.$capture_state = () => ({
    		tabIn,
    		brIn,
    		Overlay,
    		content,
    		selected,
    		lineColor
    	});

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('lineColor' in $$props) $$invalidate(2, lineColor = $$props.lineColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 2) {
    			{
    				if (selected) {
    					$$invalidate(2, lineColor = 'var(--accent)');
    				} else {
    					$$invalidate(2, lineColor = 'none');
    				}
    			}
    		}
    	};

    	return [content, selected, lineColor, click_handler];
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
    	let icon;
    	let t0;
    	let div;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: { name: "add", size: "1em" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t0 = space();
    			div = element("div");
    			t1 = text(/*content*/ ctx[0]);
    			attr_dev(div, "class", "content svelte-nofrie");
    			add_location(div, file$1, 7, 2, 143);
    			attr_dev(button, "class", "top svelte-nofrie");
    			add_location(button, file$1, 5, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(icon, button, null);
    			append_dev(button, t0);
    			append_dev(button, div);
    			append_dev(div, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*content*/ 1) set_data_dev(t1, /*content*/ ctx[0]);
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

    	$$self.$capture_state = () => ({ Icon, content });

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

    const { document: document_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[19] = list;
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (146:6) <ButtonBar>
    function create_default_slot(ctx) {
    	let button0;
    	let t0;
    	let input;
    	let t1;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new Button({
    			props: { name: "download" },
    			$$inline: true
    		});

    	button0.$on("click", /*download*/ ctx[7]);

    	button1 = new Button({
    			props: { name: "upload" },
    			$$inline: true
    		});

    	button1.$on("click", openUploadDialog);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(input, "id", "uploadId");
    			attr_dev(input, "type", "file");
    			input.hidden = true;
    			add_location(input, file, 147, 8, 3540);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, input, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*readUpload*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t1);
    			destroy_component(button1, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(146:6) <ButtonBar>",
    		ctx
    	});

    	return block;
    }

    // (154:8) {#each flows as flow, index}
    function create_each_block(ctx) {
    	let tab;
    	let updating_content;
    	let current;

    	function tab_content_binding(value) {
    		/*tab_content_binding*/ ctx[10](value, /*flow*/ ctx[18]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*index*/ ctx[20]);
    	}

    	let tab_props = {
    		selected: /*index*/ ctx[20] == /*selected*/ ctx[0]
    	};

    	if (/*flow*/ ctx[18].content !== void 0) {
    		tab_props.content = /*flow*/ ctx[18].content;
    	}

    	tab = new Tab({ props: tab_props, $$inline: true });
    	binding_callbacks.push(() => bind(tab, 'content', tab_content_binding));
    	tab.$on("click", click_handler);

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
    			if (dirty & /*selected*/ 1) tab_changes.selected = /*index*/ ctx[20] == /*selected*/ ctx[0];

    			if (!updating_content && dirty & /*flows*/ 2) {
    				updating_content = true;
    				tab_changes.content = /*flow*/ ctx[18].content;
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(154:8) {#each flows as flow, index}",
    		ctx
    	});

    	return block;
    }

    // (169:4) {#if flows.length > 0}
    function create_if_block(ctx) {
    	let title;
    	let updating_flow;
    	let current;

    	function title_flow_binding(value) {
    		/*title_flow_binding*/ ctx[14](value);
    	}

    	let title_props = {};

    	if (/*flows*/ ctx[1][/*selected*/ ctx[0]] !== void 0) {
    		title_props.flow = /*flows*/ ctx[1][/*selected*/ ctx[0]];
    	}

    	title = new Title({ props: title_props, $$inline: true });
    	binding_callbacks.push(() => bind(title, 'flow', title_flow_binding));

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
    		id: create_if_block.name,
    		type: "if",
    		source: "(169:4) {#if flows.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (173:2) {#key selected}
    function create_key_block(ctx) {
    	let div;
    	let flow;
    	let updating_root;
    	let current;

    	function flow_root_binding(value) {
    		/*flow_root_binding*/ ctx[15](value);
    	}

    	let flow_props = {};

    	if (/*flows*/ ctx[1][/*selected*/ ctx[0]] !== void 0) {
    		flow_props.root = /*flows*/ ctx[1][/*selected*/ ctx[0]];
    	}

    	flow = new Flow({ props: flow_props, $$inline: true });
    	binding_callbacks.push(() => bind(flow, 'root', flow_root_binding));
    	flow.$on("focusFlow", /*focusFlow*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(flow.$$.fragment);
    			attr_dev(div, "class", "flow svelte-1aj0oty");
    			add_location(div, file, 173, 4, 4291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(flow, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flow_changes = {};

    			if (!updating_root && dirty & /*flows, selected*/ 3) {
    				updating_root = true;
    				flow_changes.root = /*flows*/ ctx[1][/*selected*/ ctx[0]];
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
    			if (detaching) detach_dev(div);
    			destroy_component(flow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(173:2) {#key selected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let main;
    	let div3;
    	let div0;
    	let buttonbar;
    	let t1;
    	let div2;
    	let ul;
    	let t2;
    	let div1;
    	let addtab0;
    	let t3;
    	let addtab1;
    	let t4;
    	let div4;
    	let t5;
    	let previous_key = /*selected*/ ctx[0];
    	let current;
    	let mounted;
    	let dispose;

    	buttonbar = new ButtonBar({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*flows*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	addtab0 = new AddTab({
    			props: { content: "on case" },
    			$$inline: true
    		});

    	addtab0.$on("click", /*click_handler_1*/ ctx[12]);

    	addtab1 = new AddTab({
    			props: { content: "off case" },
    			$$inline: true
    		});

    	addtab1.$on("click", /*click_handler_2*/ ctx[13]);
    	let if_block = /*flows*/ ctx[1].length > 0 && create_if_block(ctx);
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			div3 = element("div");
    			div0 = element("div");
    			create_component(buttonbar.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			create_component(addtab0.$$.fragment);
    			t3 = space();
    			create_component(addtab1.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			if (if_block) if_block.c();
    			t5 = space();
    			key_block.c();
    			attr_dev(div0, "class", "header svelte-1aj0oty");
    			add_location(div0, file, 144, 4, 3438);
    			attr_dev(div1, "class", "add-tab svelte-1aj0oty");
    			add_location(div1, file, 160, 8, 3946);
    			attr_dev(ul, "class", "svelte-1aj0oty");
    			add_location(ul, file, 152, 6, 3726);
    			attr_dev(div2, "class", "tabs svelte-1aj0oty");
    			add_location(div2, file, 151, 4, 3701);
    			attr_dev(div3, "class", "sidebar svelte-1aj0oty");
    			add_location(div3, file, 143, 2, 3412);
    			attr_dev(div4, "class", "title svelte-1aj0oty");
    			add_location(div4, file, 167, 2, 4159);
    			attr_dev(main, "style", `--transition-speed: ${speed}ms;`);
    			attr_dev(main, "class", "svelte-1aj0oty");
    			toggle_class(main, "dark", /*dark*/ ctx[2]);
    			add_location(main, file, 142, 0, 3350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div0);
    			mount_component(buttonbar, div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t2);
    			append_dev(ul, div1);
    			mount_component(addtab0, div1, null);
    			append_dev(div1, t3);
    			mount_component(addtab1, div1, null);
    			append_dev(main, t4);
    			append_dev(main, div4);
    			if (if_block) if_block.m(div4, null);
    			append_dev(main, t5);
    			key_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document_1.body, "keydown", /*handleKeydown*/ ctx[6], false, false, false),
    					listen_dev(document_1.body, "dragenter", preventDefault, false, false, false),
    					listen_dev(document_1.body, "drop", /*readUploadDragged*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const buttonbar_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				buttonbar_changes.$$scope = { dirty, ctx };
    			}

    			buttonbar.$set(buttonbar_changes);

    			if (dirty & /*selected, flows, clickTab*/ 11) {
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
    						each_blocks[i].m(ul, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
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
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*selected*/ 1 && safe_not_equal(previous_key, previous_key = /*selected*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(main, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonbar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(addtab0.$$.fragment, local);
    			transition_in(addtab1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(addtab0.$$.fragment, local);
    			transition_out(addtab1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(buttonbar);
    			destroy_each(each_blocks, detaching);
    			destroy_component(addtab0);
    			destroy_component(addtab1);
    			if (if_block) if_block.d();
    			key_block.d(detaching);
    			mounted = false;
    			run_all(dispose);
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

    function preventDefault(e) {
    	e.preventDefault();
    }

    function openUploadDialog() {
    	document.getElementById('uploadId').click();
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let dark = 1;

    	if (dark) {
    		window.document.body.classList.toggle('dark');
    	}

    	let selected = 0;

    	function clickTab(index) {
    		$$invalidate(0, selected = index);
    		focusFlow();
    	}

    	let flows = [];

    	function boxFromPath(path, scope) {
    		if (!scope) {
    			scope = 0;
    		}

    		let ret = flows[selected];

    		if (path.length > 1) {
    			for (let i = 1; i < path.length - scope; i++) {
    				ret = ret.children[path[i]];
    			}
    		}

    		return ret;
    	}

    	function focusFlow() {
    		let lastFocus = boxFromPath(flows[selected]?.lastFocus);

    		if (lastFocus) {
    			lastFocus.focus = true;
    		} else {
    			$$invalidate(1, flows[selected].children[0].focus = true, flows);
    		}

    		$$invalidate(1, flows);
    	}

    	function addFlow(neg) {
    		// function addFlow(neg) {
    		let columns;

    		if (neg) {
    			columns = ['1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'];
    		} else {
    			columns = ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'];
    		}

    		flows.push({
    			content: '',
    			level: 0,
    			columns,
    			neg,
    			focus: true,
    			index: flows.length,
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

    	function handleKeydown(e) {
    		if (e.ctrlKey && e.shiftKey && e.key == 'N') {
    			e.preventDefault();
    			addFlow(false);
    		} else if (e.ctrlKey && e.key == 'n') {
    			e.preventDefault();
    			addFlow(true);
    		}
    	}

    	addFlow(false);

    	function download() {
    		let data = JSON.stringify(flows);
    		let element = document.createElement('a');
    		element.setAttribute('href', 'data:text/json;charset=utf-8, ' + encodeURIComponent(data));
    		element.setAttribute('download', 'flow.json');
    		document.body.appendChild(element);
    		element.click();
    		document.body.removeChild(element);
    	}

    	function readUploadDragged(e) {
    		e.preventDefault();
    		let file = e.dataTransfer.files[0];
    		let reader = new FileReader();

    		reader.onload = function (fileLoadedEvent) {
    			handleUpload(fileLoadedEvent.target.result);
    		};

    		reader.readAsText(file, 'UTF-8');
    	}

    	function readUpload() {
    		let file = document.getElementById('uploadId').files[0];
    		let reader = new FileReader();

    		reader.onload = function (fileLoadedEvent) {
    			handleUpload(fileLoadedEvent.target.result);
    		};

    		reader.readAsText(file, 'UTF-8');
    	}

    	function handleUpload(data) {
    		$$invalidate(1, flows = JSON.parse(data));
    	}

    	window.addEventListener(
    		'dragover',
    		function (e) {
    			e = e || event;
    			e.preventDefault();
    		},
    		false
    	);

    	window.addEventListener(
    		'drop',
    		function (e) {
    			e = e || event;
    			e.preventDefault();
    		},
    		false
    	);

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

    	function flow_root_binding(value) {
    		if ($$self.$$.not_equal(flows[selected], value)) {
    			flows[selected] = value;
    			$$invalidate(1, flows);
    		}
    	}

    	$$self.$capture_state = () => ({
    		Flow,
    		Title,
    		Button,
    		ButtonBar,
    		Tab,
    		AddTab,
    		speed,
    		dark,
    		selected,
    		clickTab,
    		flows,
    		boxFromPath,
    		focusFlow,
    		addFlow,
    		handleKeydown,
    		download,
    		readUploadDragged,
    		readUpload,
    		preventDefault,
    		openUploadDialog,
    		handleUpload
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
    		handleKeydown,
    		download,
    		readUploadDragged,
    		readUpload,
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
