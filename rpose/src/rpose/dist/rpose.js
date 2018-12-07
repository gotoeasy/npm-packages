(function(window, document) {
    const IS_IE = window == document && document != window;
    const BOOL_PROPS = [ "autofocus", "hidden", "readonly", "disabled", "checked", "selected", "multiple", "translate", "draggable", "noresize" ];
    const $SLOT = "$SLOT";
    const defer = (fn, ...args) => Promise.resolve(...args).then(fn);
    const log = (...args) => console.log(...args);
    const warn = (...args) => console.warn(...args);
    const error = (...args) => console.error(...args);
    const _toString = obj => Object.prototype.toString.call(obj);
    const isFunction = obj => typeof obj == "function" && obj.constructor == Function;
    const isBoolean = str => typeof str === "boolean";
    const isNumber = str => typeof str === "number";
    const isString = str => typeof str === "string";
    const isObject = obj => obj !== null && typeof str === "object";
    const isArray = obj => Array.isArray(obj) || obj instanceof Array;
    const isPlainObject = obj => _toString(obj) === "[object Object]";
    const isDate = obj => _toString(obj) === "[object Date]";
    const isRegExp = obj => _toString(obj) === "[object RegExp]";
    const isMap = obj => _toString(obj) === "[object Map]";
    const isSet = obj => _toString(obj) === "[object Set]";
    const isTextNode = obj => _toString(obj) === "[object Text]";
    const toLowerCase = str => str.toLowerCase();
    const BUS = (() => {
        let keySetFn = {};
        let on = (key, fn) => (keySetFn[toLowerCase(key)] || (keySetFn[toLowerCase(key)] = new Set())).add(fn);
        let off = (key, fn) => {
            let setFn = keySetFn[toLowerCase(key)];
            setFn && (fn ? setFn.delete(fn) : delete keySetFn[toLowerCase(key)]);
        };
        let once = (key, fn) => {
            fn["ONCE_" + toLowerCase(key)] = 1;
            on(key, fn);
        };
        let at = (key, ...args) => {
            let rs, setFn = keySetFn[toLowerCase(key)];
            if (setFn) {
                setFn.forEach(fn => {
                    fn["ONCE_" + toLowerCase(key)] && setFn.delete(fn) && delete fn["ONCE_" + toLowerCase(key)];
                    rs = fn(...args);
                });
                !setFn.size && off(key);
            }
            return rs;
        };
        window.onload = (e => at("window.onload", e) > (window.onload = null));
        return {
            on: on,
            off: off,
            once: once,
            at: at
        };
    })();
    const DomAttrHandle = function() {
        let callbacks = {};
        let on = (key, fn) => callbacks[toLowerCase(key)] || (callbacks[toLowerCase(key)] = fn);
        let at = (el, prop, val) => (callbacks[toLowerCase(el.tagName + "." + prop)] || callbacks[toLowerCase(prop)] || callbacks["*"]).apply(this, [ el, prop, val ]);
        on("*", (el, prop, val) => isFunction(val) || val == null ? el.getAttribute(prop) : el.setAttribute(prop, val));
        BOOL_PROPS.forEach(k => on(k, (el, prop, val) => val === undefined ? el[k] : el[k] = toBoolean(val)));
        on("value", (el, prop, val) => val === undefined ? el.value : el.value = val == null ? "" : val);
        on("innerHTML", (el, prop, val) => val === undefined ? el.innerHTML : el.innerHTML = val == null ? "" : val);
        on("innerTEXT", (el, prop, val) => val === undefined ? el.textContent : el.textContent = val == null ? "" : val);
        on("textcontent", (el, prop, val) => val === undefined ? el.textContent : el.textContent = val == null ? "" : val);
        on("image.src", (el, prop, val) => val === undefined ? el.src : el.src = val);
        on("class", (el, prop, val) => {
            if (val === undefined) {
                return el.className;
            }
            if (isPlainObject(val)) {
                for (let key in val) {
                    val[key] ? $$(el).addClass(key) : $$(el).removeClass(key);
                }
            } else {
                $$(el).addClass(val);
            }
        });
        on("style", (el, prop, val) => {
            if (val === undefined) {
                return el.getAttribute("style");
            }
            let oStyle = parseStyleToObject(val);
            for (let key in oStyle) {
                el.style[key] = oStyle[key];
            }
        });
        return {
            at: at
        };
    }();
    function parseStyleToObject(style = "") {
        if (isPlainObject(style)) {
            return style;
        }
        let rs = {};
        let ary = style.split(";").filter(v => v.trim() != "");
        ary.forEach(v => {
            let kv = v.split(":").filter(v => v.trim() != ""), key;
            if (kv.length == 2) {
                key = toLowerCase(kv[0]).split("-").filter(v => v.trim() != "").map((v, i) => i ? v.charAt(0).toUpperCase() + v.substring(1) : v).join("");
                rs[key] = kv[1].trim();
            }
        });
        return rs;
    }
    function $$(selector, context) {
        if (typeof selector == "object") {
            return new Dom(selector);
        }
        let doc = context || document;
        let byId = selector.substring(0, 1) == "#";
        let qs;
        if (byId) {
            qs = document.getElementById(selector.substring(1));
            return new Dom(qs ? [ qs ] : []);
        }
        if (doc instanceof Dom) {
            let ary = [], qs;
            if (byId) {
                for (let i = 0; i < doc.length; i++) {
                    qs = doc[i].querySelectorAll(selector);
                    for (let j = 0; j < qs.length; j++) {
                        ary.push(qs[j]);
                    }
                }
            }
            return new Dom(ary);
        }
        return new Dom(doc.querySelectorAll(selector));
    }
    function Dom(queryResult) {
        let els = [];
        if (queryResult) {
            if (queryResult.nodeType) {
                els[0] = queryResult;
            } else if (queryResult.length) {
                for (let i = 0; i < queryResult.length; i++) {
                    queryResult[i] && els.push(queryResult[i]);
                }
            }
        }
        this.length = els.length;
        for (let i = 0; i < els.length; i++) {
            this[i] = els[i];
        }
        this.forEach = function(fn) {
            els.forEach(fn);
            return this;
        };
        this.replaceWith = function(element) {
            let el, parent, theOne;
            while (els.length) {
                el = els.pop();
                parent = el.parentNode;
                parent && (theOne ? parent.removeChild(el) : theOne = el);
            }
            if (theOne) {
                theOne.parentNode.insertBefore(element, theOne);
                theOne.parentNode.removeChild(theOne);
            }
            return this;
        };
        this.on = function(name, fn) {
            els.forEach(el => addDomEventListener(el, name, fn));
            return this;
        };
        this.addClass = function(name) {
            name && (name = name.replace(/\./g, "")) && els.forEach(el => {
                if (!el) {
                    return;
                }
                if (IS_IE) {
                    if (!el.className) {
                        el.className = name;
                    } else {
                        var ary = el.className.split(" ");
                        if (ary.indexOf(name) >= 0) {
                            return;
                        }
                        ary.push(name);
                        el.className = ary.join(" ");
                    }
                } else {
                    name.split(/\s+/).forEach(nm => el.classList.contains(nm) || el.classList.add(nm));
                }
            });
            return this;
        };
        this.removeClass = function(name) {
            name && (name = name.replace(/\./g, "")) && els.forEach(el => {
                if (IS_IE) {
                    var ary = el.className.split(" ");
                    var idx = ary.indexOf(name);
                    if (idx >= 0) {
                        ary.slice(idx, 1);
                        el.className = ary.join(" ");
                    }
                } else {
                    let nms = name.split(/\s+/);
                    nms.forEach(nm => el.classList.remove(nm));
                }
            });
            return this;
        };
        this.attr = function(name, value) {
            if (!els.length) {
                return value == null ? null : this;
            }
            let rs;
            for (let i = 0; i < els.length; i++) {
                if (value == null) {
                    return DomAttrHandle.at(els[0], name);
                }
                DomAttrHandle.at(els[i], name, value);
            }
            return this;
        };
        this.removeChildren = function() {
            els.forEach(el => {
                try {
                    el.innerHTML = "";
                } catch (e) {
                    for (;el.firstChild; ) {
                        el.removeChild(el.firstChild);
                    }
                }
            });
            return this;
        };
        this.remove = function() {
            els.forEach(el => el.parentNode.removeChild(el));
            return this;
        };
        return this;
    }
    function addDomEventListener(el, name, fn) {
        if (window.WeakMap) {
            domEventListener(el, name, fn);
            addDocumentEventListener(name);
        } else {
            el.addEventListener ? el.addEventListener(name, fn, false) : el.attachEvent ? el.attachEvent("on" + name, fn) : el["on" + name] = fn;
        }
    }
    function domEventListener(el, name, fn) {
        let map = domEventListener.m = domEventListener.m || new WeakMap();
        let oFn;
        if (!fn) {
            oFn = map.get(el) || {};
            return oFn[name];
        }
        !map.has(el) && map.set(el, {});
        oFn = map.get(el);
        let set = oFn[name] || (oFn[name] = new Set());
        set.add(fn);
    }
    function fnDocumentEventListener(event) {
        let el = event.target || event.srcElement;
        let fns = domEventListener(el, event.type);
        fns && fns.forEach(fn => fn(event));
    }
    function addDocumentEventListener(name) {
        if (!addDocumentEventListener[name]) {
            addDocumentEventListener[name] = 1;
            document.addEventListener ? document.addEventListener(name, fnDocumentEventListener, false) : document.attachEvent ? document.attachEvent("on" + name, fnDocumentEventListener) : document["on" + name] = fnDocumentEventListener;
        }
    }
    const mapTagComponent = {};
    const mapSingletonComp = {};
    function registerComponents(components = {}) {
        for (let key in components) {
            mapTagComponent[key] = components[key];
        }
    }
    function getComponent(name) {
        return mapTagComponent[name];
    }
    function newComponentProxy(componentKey, opt) {
        let Component = mapTagComponent[componentKey];
        if (!Component) {
            throw new Error("component not found: " + componentKey);
        }
        let comp;
        if (Component.Singleton) {
            comp = mapSingletonComp[componentKey] || (mapSingletonComp[componentKey] = enhance(Component, opt));
        } else {
            comp = enhance(Component, opt);
        }
        return comp;
    }
    function createComponentByVnode(vnode) {
        let opt = assign({}, vnode.a || {}, vnode.c && vnode.c.length ? {
            [$SLOT]: vnode.c
        } : {});
        return newComponentProxy(vnode.t, opt);
    }
    function domVnode(el, vnode) {
        if (!el) {
            return;
        }
        let map = domVnode.m || (domVnode.m = new WeakMap());
        if (!vnode) {
            return map.get(el);
        }
        delete vnode.c;
        let oVal = map.get(el);
        if (!oVal) {
            return map.set(el, vnode);
        }
        if (!oVal.M) {
            let mVal = {
                M: 1
            };
            mVal[oVal.t] = oVal;
            map.set(el, mVal);
            oVal = mVal;
        }
        oVal[vnode.t] = vnode;
        return oVal;
    }
    function createDom(vnode, $thisContext) {
        let el, $$el;
        if (vnode.t) {
            if (vnode.m) {
                let comp = new createComponentByVnode(vnode);
                vnode.o = comp;
                el = comp.render();
                if (el) {
                    $$el = $$(el);
                    $$el.addClass(comp.$COMPONENT_ID);
                    if (vnode.a && vnode.a.ref) {
                        let refs = $thisContext.$refs = $thisContext.$refs || {};
                        let ref = refs.c = refs.c || {};
                        let cls = ref[vnode.a.ref] = ref[vnode.a.ref] || uid("_ref_");
                        $$el.addClass(vnode.r = cls);
                    }
                }
            } else {
                if (/^script$/i.test(vnode.t)) {
                    return loadScript(vnode.a);
                }
                if (/^link$/i.test(vnode.t)) {
                    return loadLink(vnode.a);
                }
                el = vnode.g ? document.createElementNS("http://www.w3.org/2000/svg", vnode.t) : document.createElement(vnode.t);
                $$el = $$(el);
                if (vnode.a) {
                    for (let k in vnode.a) {
                        if (k == "ref") {
                            let refs = $thisContext.$refs = $thisContext.$refs || {};
                            let ref = refs.e = refs.e || {};
                            let cls = ref[vnode.a[k]] = ref[vnode.a[k]] || uid("_ref_");
                            $$el.addClass(vnode.r = cls);
                        }
                        $$el.attr(k, vnode.a[k]);
                    }
                }
                if (vnode.e) {
                    for (let k in vnode.e) {
                        if (isFunction(vnode.e[k])) {
                            $$(el).on(k, vnode.e[k]);
                        } else {
                            console.error("invalid event handle:", k, "=", vnode.e[k]);
                        }
                    }
                }
                if (vnode.c) {
                    for (let i = 0, len = vnode.c.length, vn, dom; i < len; i++) {
                        vn = vnode.c[i];
                        if (vn) {
                            dom = createDom(vn, $thisContext);
                            dom && el.appendChild(dom);
                        }
                    }
                }
            }
        } else {
            el = document.createTextNode(vnode.s);
        }
        el && domVnode(el, vnode);
        return el;
    }
    function assignOptions(...objs) {
        if (objs.length == 1) {
            return objs[0];
        }
        let rs = objs[0];
        for (let i = 1; i < objs.length; i++) {
            for (let k in objs[i]) {
                if (k == "ref") {
                    continue;
                }
                if (k == "class") {
                    if (isString(objs[i][k])) {
                        let ary = objs[i][k].split(/\s/);
                        let objCls = {};
                        ary.forEach(v => v.trim() && (objCls[v] = 1));
                        rs[k] = objCls;
                    } else {
                        rs[k] = objs[i][k];
                    }
                } else {
                    rs[k] = objs[i][k];
                }
            }
        }
        return rs;
    }
    function loadScript(attr) {
        let ary = loadScript.s || (loadScript.s = []);
        if (!attr || !attr.src || ary.includes(attr.src)) {
            return;
        }
        ary.push(attr.src);
        let el = document.createElement("script");
        el.src = attr.src;
        el.type = attr.type || "text/javascript";
        document.head.appendChild(el);
    }
    function loadLink(attr) {
        let ary = loadLink.s || (loadLink.s = []);
        if (!attr || !attr.href || ary.includes(attr.href)) {
            return;
        }
        ary.push(attr.href);
        let el = document.createElement("link");
        el.href = attr.href;
        el.rel = attr.rel || "stylesheet";
        document.head.appendChild(el);
    }
    function enhance(Component, ...args) {
        let oComp = new Component(...args);
        enhanceFields(oComp);
        enhanceRender(oComp);
        enhanceState(oComp);
        enhanceRef(oComp);
        enhanceRoot(oComp);
        return oComp;
    }
    function enhanceFields(component) {
        Object.defineProperty(component, "$COMPONENT_ID", {
            value: uid("_cid_")
        });
        Object.defineProperty(component, "isInitRender", {
            value: true,
            writable: true
        });
    }
    function enhanceRender(component) {
        !component.render && Object.defineProperty(component, "render", {
            get: () => (function(state = {}) {
                let el, $$el, vnode;
                if (this.isInitRender) {
                    extend(this.$state, state, this.$STATE_KEYS);
                    vnode = this.nodeTemplate(this.$state, this.$options, this.$actions);
                    el = createDom(vnode, this);
                    if (el && el.nodeType == 1) {
                        $$(el).addClass(this.$COMPONENT_ID);
                    }
                    this.isInitRender = false;
                    return el;
                }
                extend(this.$state, state, this.$STATE_KEYS);
                $$el = $$("." + this.$COMPONENT_ID);
                if (!$$el.length) {
                    warn("dom node missing");
                    return;
                }
                if (this.$updater) {
                    this.$updater(state);
                } else {
                    let vnode2 = this.nodeTemplate(this.$state, this.$options, this.$actions);
                    diffRender(this, vnode2);
                }
                return el;
            })
        });
    }
    function enhanceState(component) {
        Object.defineProperty(component, "getState", {
            get: () => (function() {
                return extend({}, this.$state);
            })
        });
        Object.defineProperty(component, "setState", {
            get: () => (function(state) {
                state && this.render(state);
            })
        });
    }
    function enhanceRoot(component) {
        Object.defineProperty(component, "getRootElement", {
            get: () => (function() {
                let $$el = $$("." + this.$COMPONENT_ID);
                return $$el.length ? $$el[0] : null;
            })
        });
    }
    function enhanceRef(component) {
        Object.defineProperty(component, "getRefElements", {
            get: () => (function(name) {
                let cls = this.$refs.e[name];
                return cls ? [ ...new Set(document.querySelectorAll("." + cls)) ] : [];
            })
        });
        Object.defineProperty(component, "getRefComponents", {
            get: () => (function(name) {
                let cls = this.$refs.c[name];
                if (!cls) {
                    return [];
                }
                let rs = [];
                let els = [ ...new Set(document.querySelectorAll("." + cls)) ];
                els.forEach(el => {
                    let vnode = domVnode(el);
                    if (vnode && vnode.M) {
                        for (let k in vnode) {
                            if (vnode[k].r == cls) {
                                rs.push(vnode[k].o);
                                break;
                            }
                        }
                    } else {
                        rs.push(vnode.o);
                    }
                });
                return rs;
            })
        });
    }
    function diffRender(component, vnode2) {
        let $$el = $$("." + component.$COMPONENT_ID);
        if (!$$el.length) {
            error("root node not found:", component.$COMPONENT_ID);
            return;
        }
        if (!vnode2) {
            $$el.remove();
            return;
        }
        let vnode1 = domVnode($$el[0]);
        vnode1.M && (vnode1 = vnode1[vnode2.t]);
        if (vnode2.m) {
            vnode1.o.setState({
                [$SLOT]: vnode2.c
            });
            return;
        }
        let attr1 = (vnode1 || {}).a || {};
        let attr2 = vnode2.a || {};
        if (!vnode1 || vnode1.k != vnode2.k || (vnode1.t || vnode1.t) && vnode1.t != vnode2.t || (attr1.id || attr2.id) && attr1.id != attr2.id || (attr1.ref || attr2.ref) && attr1.ref != attr2.ref) {
            let el = createDom(vnode2, component);
            $$el.replaceWith(el);
            return el;
        }
        let diffAttrs = getDiffAttrs(vnode1, vnode2);
        if (diffAttrs) {
            for (let k in diffAttrs) {
                vnode1.a[k] = diffAttrs[k];
                $$el.attr(k, diffAttrs[k]);
            }
        }
        diffRenderChildern(component, $$el[0], vnode2);
        return $$el[0];
    }
    function diffRenderChildern(component, parent, parentVnode2) {
        let childern1 = [ ...parent.childNodes || [] ];
        let childern2 = parentVnode2.c || [];
        if (!childern1.length) {
            return childern2.forEach(vn => parent.appendChild(createDom(vn, component)));
        }
        let ary1 = [], ary2 = [];
        childern1.forEach(v => ary1.push({
            vn: domVnode(v),
            el: v
        }));
        childern2.forEach(v => ary2.push({
            vn: v
        }));
        let matchAll = 1;
        if (ary1.length == ary2.length) {
            for (let i = 0, wv1, wv2; i < ary1.length; i++) {
                wv1 = ary1[i];
                wv2 = ary2[i];
                if (matchWvnode(wv1, wv2)) {
                    wv1.S = 1;
                    wv2.S = 1;
                    wv2.wv1 = wv1;
                } else {
                    matchAll = 0;
                    break;
                }
            }
        } else {
            matchAll = 0;
        }
        if (!matchAll) {
            ary2.forEach(wv => !wv.S && findVnode(ary1, wv));
            ary1.filter(wv => wv.S ? 1 : $$(wv.el).remove() && 0);
            if (!ary1.length) {
                return ary2.forEach(wv => parent.appendChild(createDom(wv.vn, component)));
            }
        }
        let j = 0;
        let wv1 = ary1[j];
        for (let i = 0, idx, wv2; i < ary2.length; i++) {
            wv2 = ary2[i];
            if (!wv2.S) {
                let el = createDom(wv2.vn, component);
                if (el) {
                    if (wv1) {
                        parent.insertBefore(el, wv1.el);
                    } else {
                        parent.appendChild(el);
                    }
                }
            } else {
                if (wv2.wv1 != wv1) {
                    ary1.splice(j, 0, ary1.splice(ary1.indexOf(wv2.wv1), 1)[0]);
                    j++;
                    parent.insertBefore(wv2.wv1.el, wv1.el);
                    if (wv2.vn.m) {
                        wv2.wv1.vn[wv2.vn.t].o.setState({
                            [$SLOT]: wv2.vn.c
                        });
                    } else {
                        let diffAttrs = getDiffAttrs(wv2.wv1.vn, wv2.vn);
                        if (diffAttrs) {
                            for (let k in diffAttrs) {
                                wv2.wv1.vn.a[k] = diffAttrs[k];
                                $$el.attr(k, diffAttrs[k]);
                            }
                        } else if (!wv2.vn.t && wv2.wv1.vn.s != wv2.vn.s) {
                            wv2.wv1.vn.s = wv2.vn.s;
                            el.textContent = wv2.vn.s;
                        }
                    }
                } else {
                    if (wv2.vn.m) {
                        wv1.vn[wv2.vn.t].o.setState({
                            [$SLOT]: wv2.vn.c
                        });
                    } else {
                        let diffAttrs = getDiffAttrs(wv1.vn, wv2.vn);
                        if (diffAttrs) {
                            for (let k in diffAttrs) {
                                wv1.vn.a[k] = diffAttrs[k];
                                $$(wv1.el).attr(k, diffAttrs[k]);
                            }
                        } else if (!wv2.vn.t && wv1.vn.s != wv2.vn.s) {
                            wv1.vn.s = wv2.vn.s;
                            wv1.el.textContent = wv2.vn.s;
                        }
                    }
                    wv1 = ary1[++j];
                }
            }
        }
        ary2.forEach(wv => {
            if (wv.S) {
                if (wv.vn.m) {
                    wv.wv1.vn[wv.vn.t].o.setState({
                        [$SLOT]: wv.vn.c
                    });
                } else {
                    diffRenderChildern(component, wv.wv1.el, wv.vn);
                }
            }
        });
    }
    function findVnode(wvnodes, wv2) {
        let vnode1, vnode2 = wv2.vn;
        for (let i = 0, wv1; wv1 = wvnodes[i++]; ) {
            if (matchWvnode(wv1, wv2)) {
                wv1.S = 1;
                wv2.S = 1;
                return wv2.wv1 = wv1;
            }
        }
    }
    function matchWvnode(wv1, wv2) {
        if (wv1.S) {
            return 0;
        }
        let vnode1 = wv1.vn, vnode2 = wv2.vn;
        if (vnode1.M) {
            vnode1 = vnode1[vnode2.t];
            if (!vnode1) {
                return 0;
            }
        }
        let attr1 = vnode1.a || {};
        let attr2 = vnode2.a || {};
        if (vnode1.k != vnode2.k || (vnode1.t || vnode2.t) && vnode1.t != vnode2.t || (attr1.id || attr2.id) && attr1.id != attr2.id || (attr1.ref || attr2.ref) && attr1.ref != attr2.ref || (vnode1.g || vnode2.g) && vnode1.g != vnode2.g) {
            return 0;
        }
        return 1;
    }
    function getDiffAttrs(vnode1, vnode2) {
        if (vnode1.x) {
            return 0;
        }
        let attr1 = vnode1.a || {};
        let attr2 = vnode2.a || {};
        let keys2 = Object.keys(attr2);
        let rs = {};
        let has = 0;
        keys2.forEach(k => {
            if (attr1[k] != attr2[k]) {
                if (k == "class") {
                    let oDiff = getDiffClass(attr1[k], attr2[k]);
                    if (oDiff) {
                        rs[k] = oDiff;
                        has = 1;
                    }
                } else if (k == $SLOT) {} else if (k == "style") {
                    let oDiff = getDiffStyle(attr1[k], attr2[k]);
                    if (oDiff) {
                        rs[k] = oDiff;
                        has = 1;
                    }
                } else if (BOOL_PROPS.includes(k)) {
                    if (toBoolean(attr1[k]) != toBoolean(attr2[k])) {
                        rs[k] = toBoolean(attr2[k]);
                        has = 1;
                    }
                } else {
                    rs[k] = attr2[k];
                    has = 1;
                }
            }
        });
        return has ? rs : 0;
    }
    function getDiffClass(class1, class2) {
        let obj1 = class1 || {};
        let obj2 = class2 || {};
        let keys2 = Object.keys(obj2);
        let rs = {};
        let has = 0;
        keys2.forEach(k => {
            if (obj1[k] == null) {
                rs[k] = toBoolean(obj2[k]);
                has = 1;
            } else if (toBoolean(obj1[k]) != toBoolean(obj2[k])) {
                rs[k] = toBoolean(obj2[k]);
                has = 1;
            }
        });
        return has ? rs : null;
    }
    function getDiffStyle(style1, style2) {
        let obj1 = parseStyleToObject(style1);
        let obj2 = parseStyleToObject(style2);
        let keys2 = Object.keys(obj2);
        let rs = {};
        let has = 0;
        keys2.forEach(k => {
            if (obj1[k] == null) {
                rs[k] = obj2[k];
                has = 1;
            } else if (obj1[k] != obj2[k]) {
                rs[k] = obj2[k];
                has = 1;
            }
        });
        return has ? rs : null;
    }
    function mount(dom, selector, context) {
        (context || document).querySelector(selector || "body").appendChild(dom);
    }
    function escapeHtml(html) {
        if (typeof html == "string") {
            return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        }
        return html;
    }
    function unescapeHtml(str) {
        if (typeof str == "string") {
            return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        }
        return str;
    }
    function isEmpty(obj) {
        if (!obj) {
            return true;
        }
        if (isPlainObject(obj)) {
            for (let k in obj) {
                return false;
            }
            return true;
        }
        return !!obj;
    }
    function uid(prefix) {
        if (prefix) {
            !uid[prefix] && (uid[prefix] = 1);
            return prefix + uid[prefix]++;
        }
        !uid.n && (uid.n = 1);
        return uid.n++;
    }
    function toBoolean(arg) {
        if (!arg) {
            return false;
        }
        if (!isString(arg)) {
            return true;
        }
        return !/^(0|false|f|no|n)$/i.test((arg + "").trim());
    }
    function extend(...args) {
        if (!args.length || isArray(args[0]) || !args[0]) {
            return null;
        }
        let keys = args[args.length - 1];
        if (!keys) {
            return;
        }
        let oOrig = args[0];
        oOrig.class = classToPlantObject(oOrig.class);
        if (isArray(keys)) {
            for (let i = 0, oCopy; i < args.length - 1; i++) {
                oCopy = args[i];
                if (oOrig !== oCopy && isPlainObject(oCopy)) {
                    keys.forEach(k => {
                        if (oCopy[k] !== undefined) {
                            k == "class" ? Object.assign(oOrig.class, classToPlantObject(oCopy[k])) : oOrig[k] = _copyObjectValue(oCopy[k]);
                        }
                    });
                }
            }
        } else {
            for (let i = 1, oCopy; i < args.length; i++) {
                oCopy = args[i];
                if (oOrig !== oCopy && isPlainObject(oCopy)) {
                    for (let k in oCopy) {
                        k == "class" ? Object.assign(oOrig.class, classToPlantObject(oCopy[k])) : oOrig[k] = _copyObjectValue(oCopy[k]);
                    }
                }
            }
        }
        return oOrig;
    }
    function assign(...args) {
        if (!args.length || isArray(args[0]) || !args[0]) {
            return null;
        }
        let keys = args[args.length - 1];
        if (!keys) {
            return;
        }
        let oOrig = args[0];
        oOrig.class = classToPlantObject(oOrig.class);
        if (isArray(keys)) {
            for (let i = 1, oCopy; i < args.length - 1; i++) {
                oCopy = args[i];
                if (oOrig !== oCopy && isPlainObject(oCopy)) {
                    keys.forEach(k => {
                        if (oCopy[k] !== undefined) {
                            k == "class" ? Object.assign(oOrig.class, classToPlantObject(oCopy[k])) : oOrig[k] = oCopy[k];
                        }
                    });
                }
            }
        } else {
            for (let i = 1, oCopy; i < args.length; i++) {
                oCopy = args[i];
                if (oOrig !== oCopy && isPlainObject(oCopy)) {
                    for (let k in oCopy) {
                        k == "class" ? Object.assign(oOrig.class, classToPlantObject(oCopy[k])) : oOrig[k] = oCopy[k];
                    }
                }
            }
        }
        return oOrig;
    }
    function classToPlantObject(str) {
        if (str == null) {
            return {};
        }
        if (isPlainObject(str)) {
            return str;
        }
        let ary = str.split(/\s/);
        let objCls = {};
        ary.forEach(v => v.trim() && (objCls[v] = 1));
        return objCls;
    }
    function _copyObjectValue(obj) {
        if (!obj) {
            return obj;
        }
        if (isPlainObject(obj)) {
            let rs = {};
            for (var key in obj) {
                rs[key] = _copyObjectValue(obj[key]);
            }
            return rs;
        }
        if (isArray(obj)) {
            let rs = [];
            for (var i = 0; i < obj.length; i++) {
                rs[i] = _copyObjectValue(obj[i]);
            }
            return rs;
        }
        if (isDate(obj)) {
            return new Date(obj.getTime());
        }
        if (isMap(obj)) {
            return new Map(obj);
        }
        if (isSet(obj)) {
            return new Set(obj);
        }
        return obj;
    }
    var api = {};
    api.$$ = $$;
    api.registerComponents = registerComponents;
    api.newComponentProxy = newComponentProxy;
    api.createDom = createDom;
    api.escapeHtml = escapeHtml;
    api.mount = mount;
    api.extend = extend;
    api.assign = assign;
    api.on = BUS.on;
    api.off = BUS.off;
    api.once = BUS.once;
    api.at = BUS.at;
    window.rpose = api;
})(window, document);