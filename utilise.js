(function () {
  'use strict';

  var to = { 
    arr: toArray
  , obj: toObject
  }

  function toArray(d){
    return Array.prototype.slice.call(d, 0)
  }

  function toObject(d) {
    var by = 'id'
      , o = {}

    return arguments.length == 1 
      ? (by = d, reduce)
      : reduce.apply(this, arguments)

    function reduce(p,v,i){
      if (i === 0) p = {}
      p[v[by]] = v
      return p
    }
  }

  function all(selector, doc){
    var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
    return to.arr((doc || document).querySelectorAll(prefix+selector))
  }

  function append(v) {
    return function(d){
      return d+v
    }
  }

  is.fn      = isFunction
  is.str     = isString
  is.num     = isNumber
  is.obj     = isObject
  is.lit     = isLiteral
  is.bol     = isBoolean
  is.truthy  = isTruthy
  is.falsy   = isFalsy
  is.arr     = isArray
  is.null    = isNull
  is.def     = isDef
  is.in      = isIn
  is.promise = isPromise

  function is(v){
    return function(d){
      return d == v
    }
  }

  function isFunction(d) {
    return typeof d == 'function'
  }

  function isBoolean(d) {
    return typeof d == 'boolean'
  }

  function isString(d) {
    return typeof d == 'string'
  }

  function isNumber(d) {
    return typeof d == 'number'
  }

  function isObject(d) {
    return typeof d == 'object'
  }

  function isLiteral(d) {
    return typeof d == 'object' 
        && !(d instanceof Array)
  }

  function isTruthy(d) {
    return !!d == true
  }

  function isFalsy(d) {
    return !!d == false
  }

  function isArray(d) {
    return d instanceof Array
  }

  function isNull(d) {
    return d === null
  }

  function isDef(d) {
    return typeof d !== 'undefined'
  }

  function isPromise(d) {
    return d instanceof Promise
  }

  function isIn(set) {
    return function(d){
      return !set ? false  
           : set.indexOf ? ~set.indexOf(d)
           : d in set
    }
  }

  function args(indices) {
    return function (fn, ctx) {
      return function(){
        var i = is.arr(indices) ? indices : [indices]
          , a = to.arr(arguments)
                  .filter(function(d,x){ return is.in(i)(x) })

        return fn.apply(ctx || this, a)
      }
    }
  }

  function attr(name, value) {
    var args = arguments.length
    
    return !is.str(name) && args == 2 ? attr(arguments[1]).call(this, arguments[0])
         : !is.str(name) && args == 3 ? attr(arguments[1], arguments[2]).call(this, arguments[0])
         :  function(el){
              var ctx = this || {}
              el = ctx.nodeName || is.fn(ctx.node) ? ctx : el
              el = el.node ? el.node() : el
              el = el.host || el

              return args > 1 && value === false ? el.removeAttribute(name)
                   : args > 1                    ? (el.setAttribute(name, value), value)
                   : el.attributes.getNamedItem(name) 
                  && el.attributes.getNamedItem(name).value
            } 
  }

  function str(d){
    return d === 0 ? '0'
         : !d ? ''
         : is.fn(d) ? '' + d
         : is.obj(d) ? JSON.stringify(d)
         : String(d)
  }

  function key(k, v){ 
    var set = arguments.length > 1
      , keys = is.fn(k) ? [] : str(k).split('.')
      , root = keys.shift()

    return function deep(o, i){
      var masked = {}
      
      return !o ? undefined 
           : !is.num(k) && !k ? o
           : is.arr(k) ? (k.map(copy), masked)
           : o[k] || !keys.length ? (set ? ((o[k] = is.fn(v) ? v(o[k], i) : v), o)
                                         :  (is.fn(k) ? k(o) : o[k]))
                                  : (set ? (key(keys.join('.'), v)(o[root] ? o[root] : (o[root] = {})), o)
                                         :  key(keys.join('.'))(o[root]))

      function copy(k){
        var val = key(k)(o)
        ;(val != undefined) && key(k, val)(masked)
      }
    }
  }

  function az(k) {
    return function(a, b){
      var ka = key(k)(a) || ''
        , kb = key(k)(b) || ''

      return ka > kb ?  1 
           : ka < kb ? -1 
                     :  0
    }
  }

  function by(k, v){
    var exists = arguments.length == 1
    return function(o){
      var d = is.fn(k) ? k(o) : key(k)(o)
      
      return d && v && d.toLowerCase && v.toLowerCase ? d.toLowerCase() === v.toLowerCase()
           : exists ? Boolean(d)
           : is.fn(v) ? v(d)
           : d == v
    }
  }

  var client = typeof window != 'undefined'

  function parse(d){
    return d && JSON.parse(d)
  }

  function clone(d) {
    return !is.fn(d) && !is.str(d)
         ? parse(str(d))
         : d
  }

  function has(o, k) {
    return k in o
  }

  var colorfill = colorfill$1()

  function colorfill$1(){
    /* istanbul ignore next */
    ['red', 'green', 'bold', 'grey', 'strip'].forEach(function(color) {
      !is.str(String.prototype[color]) && Object.defineProperty(String.prototype, color, {
        get: function() {
          return String(this)
        } 
      })
    })
  }

  function copy(from, to){ 
    return function(d){ 
      return to[d] = from[d], d
    }
  }

  function datum(node){
    return node.__data__
  }

  function debounce(d){
    var pending, wait = is.num(d) ? d : 100

    return is.fn(d) 
         ? next(d)
         : next

    function next(fn){
      return function(){
        var ctx = this, args = arguments
        pending && clearTimeout(pending)
        pending = setTimeout(function(){ fn.apply(ctx, args) }, wait)
      }
    }
    
  }

  function def(o, p, v, w){
    if (o.host && o.host.nodeName) o = o.host
    if (p.name) v = p, p = p.name
    !has(o, p) && Object.defineProperty(o, p, { value: v, writable: w })
    return o[p]
  }

  function keys(o) { 
    return Object.keys(is.obj(o) || is.fn(o) ? o : {})
  }

  function defaults(o, k, v){
    if (o.host) o = o.host
    return is.obj(k) 
         ? (keys(k).map(function(i) { set(i, k[i]) }), o)
         : (set(k, v), o[k])

    function set(k, v) {
      if (!is.def(o[k])) o[k] = v
    }
  }

  function done(o) {
    return function(then){
      o.once('response._' + (o.log.length - 1), then)
    }
  }

  function split(delimiter){
    return function(d){
      return d.split(delimiter)
    }
  }

  function replace(from, to){
    return function(d){
      return d.replace(from, to)
    }
  }

  function prepend(v) {
    return function(d){
      return v+d
    }
  }

  function el(selector){
    var attrs = []
      , css = selector.replace(/\[(.+?)=(.*?)\]/g, function($1, $2, $3){ attrs.push([$2, $3]); return '' }).split('.')
      , tag  = css.shift()
      , elem = document.createElement(tag)

    attrs.forEach(function(d){ attr(elem, d[0], d[1]) })
    css.forEach(function(d){ elem.classList.add(d)})
    elem.toString = function(){ return tag + css.map(prepend('.')).join('') }

    return elem
  }

  var owner = client ? /* istanbul ignore next */ window : global

  function err$1(prefix){
    return function(d){
      if (!owner.console || !console.error.apply) return d;
      var args = to.arr(arguments)
      args.unshift(prefix.red ? prefix.red : prefix)
      return console.error.apply(console, args), d
    }
  }

  function not(fn){
    return function(){
      return !fn.apply(this, arguments)
    }
  }

  var err = err$1('[emitterify]')
  function emitterify(body, dparam) {
    return def(body, 'emit', emit, 1)
         , def(body, 'once', once, 1)
         , def(body, 'on', on, 1)
         , body

    function emit(type, param, filter) {
      var ns = type.split('.')[1]
        , id = type.split('.')[0]
        , li = body.on[id] || []
        , tt = li.length - 1
        , tp = is.def(param)  ? param 
             : is.def(dparam) ? dparam
             : [body]
        , pm = tp.length && !is.str(tp) ? tp : [tp]

      if (ns) return invoke(li, ns, pm), body

      for (var i = li.length; i >=0; i--)
        invoke(li, i, pm)

      keys(li)
        .filter(not(isFinite))
        .filter(filter || Boolean)
        .map(function(n){ return invoke(li, n, pm) })

      return body
    }

    function invoke(o, k, p){
      if (!o[k]) return
      var fn = o[k]
      o[k].once && (isFinite(k) ? o.splice(k, 1) : delete o[k])
      try { fn.apply(body, p) } catch(e) { err(e, e.stack)  }
     }

    function on(type, callback) {
      var ns = type.split('.')[1]
        , id = type.split('.')[0]

      body.on[id] = body.on[id] || []
      return !callback && !ns ? (body.on[id])
           : !callback &&  ns ? (body.on[id][ns])
           :  ns              ? (body.on[id][ns] = callback, body)
                              : (body.on[id].push(callback), body)
    }

    function once(type, callback){
      return callback.once = true, body.on(type, callback), body
    }
  }

  function escape(str) {
    return str.replace(/[&<>'"]/g, function(char){
      return safe[char]
    })
  }

  var safe = { 
    "&": "&amp;"
  , "<": "&lt;"
  , ">": "&gt;"
  , '"': "&quot;"
  , "'": "&#39;"
  }

  function extend(to){ 
    return function(from){
      keys(from)
        .filter(not(is.in(to)))
        .map(copy(from, to))

      return to
    }
  }

  function falsy(){
    return false
  }

  function first(d){
    return d && d[0]
  }

  function flatten(p,v){ 
    is.arr(v) && (v = v.reduce(flatten, []))
    return (p = p || []), p.concat(v) 
  }

  function fn(candid){
    return is.fn(candid) ? candid
         : (new Function("return " + candid))()
  }

  function includes(pattern){
    return function(d){
      return d && d.indexOf && ~d.indexOf(pattern)
    }
  }

  function form(root) {
    var name = attr('name')
      , values = {}
      , invalid = []

    all('[name]', root)
      .map(function(el){ 
        var n = name(el)
          , v = values[n] = 
              el.state              ? el.state.value 
            : el.files              ? el.files
            : el.type == 'checkbox' ? (values[n] || []).concat(el.checked ? el.value : [])
            : el.type == 'radio'    ? (el.checked ? el.value : values[n])
                                    : el.value

        if (includes('is-invalid')(el.className)) invalid.push(el)
      })

    return { values: values, invalid: invalid }
  }

  from.parent = fromParent

  function from(o){
    return function(k){
      return key(k)(o)
    }
  }

  function fromParent(k){
    return datum(this.parentNode)[k]
  }

  function grep(o, k, regex){
    var original = o[k] 
    o[k] = function(){ 
      var d = to.arr(arguments).filter(is.str).join(' ')
      return d.match(regex) && original.apply(this, arguments) 
    }
    return original
  }

  function noop(){}

  function group(prefix, fn){
    if (!owner.console) return fn()
    if (!console.groupCollapsed) polyfill()
    console.groupCollapsed(prefix)
    var ret = fn()
    console.groupEnd(prefix)
    return ret
  }

  function polyfill() {
    console.groupCollapsed = console.groupEnd = function(d){
      (console.log || noop)('*****', d, '*****')
    }
  }

  function hashcode(str) {
    var hash = 0
    if (!str) return hash
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i)
      hash = ((hash<<5)-hash)+char
      hash = hash & hash
    }
    return hash
  }

  function header(header, value) {
    var getter = arguments.length == 1
    return function(d){ 
      return !d || !d.headers ? null
           : getter ? key(header)(d.headers)
                    : key(header)(d.headers) == value
    }
  }

  function identity(d) {
    return d
  }

  function iff(condition){
    return function(handler){
      return function(){
        if (condition.apply(this, arguments))
          return handler.apply(this, arguments)
      }
    }
  }

  function join(left, right){
    if (arguments.length == 1) {
      right = left
      left = null
    }

    return function(d, uid){
      if (d === null || d === undefined) return undefined
      var table = right || [], field = null
      if (!uid || is.num(uid)) uid = 'id'
      if (is.str(right)) {
        var array = right.split('.')
        table = ripple(array.shift())
        field = array.join('.')
      }
      
      var id  = key(left)(d)
        , val = table
                  .filter(by(uid, id))
                  .map(key(field))
                  .pop() || {}

      return left 
        ? key(left, val)(d) 
        : val
    }
  }

  function last(d) {
    return d && d[d.length-1]
  }

  function lo(d){
    return (d || '').toLowerCase()
  }

  function log(prefix){
    return function(d){
      if (!owner.console || !console.log.apply) return d;
      is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
      var args = to.arr(arguments)
      args.unshift(prefix.grey ? prefix.grey : prefix)
      return console.log.apply(console, args), d
    }
  }

  mo.format = moFormat
  mo.iso = moIso

  function mo(d){
    return owner.moment(d)
  }

  function moFormat(format) {
    return function(d){
      return mo(d).format(format)
    }
  }

  function moIso(d) {
    return mo(d).format('YYYY-MM-DD')
  }

  function nullify(fn){
    return is.fn(fn) ? function(){
        return fn.apply(this, arguments) ? true : null
      } 
    : fn ? true
    : null
  }

  var rsplit = /([^\.\[]*)/
  var deep = key

  function once(nodes, enter, exit) {
    var n = c.nodes = Array === nodes.constructor ? nodes
          : 'string' === typeof nodes ? document.querySelectorAll(nodes)
          : [nodes]

    var p = n.length
    while (p-- > 0) if (!n[p].evented) event(n[p], p)

    c.node  = function() { return n[0] }
    c.enter = function() { return once(enter) }
    c.exit  = function() { return once(exit) }
    c.size  = function() { return n.length }

    c.text  = function(value){ 
      var fn = 'function' === typeof value
      return arguments.length === 0 ? n[0].textContent : (this.each(function(d, i){
        var r = '' + (fn ? value.call(this, d, i) : value), t
        if (this.textContent !== r) 
          !(t = this.firstChild) ? this.appendChild(document.createTextNode(r))
          : t.nodeName === '#text' ? t.nodeValue = r
          : this.textContent = r
      }), this)
    }
    c.html = function(value){
      var fn = 'function' === typeof value
      return arguments.length === 0 ? n[0].innerHTML : (this.each(function(d, i){
        var r = '' + (fn ? value.call(this, d, i) : value), t
        if (this.innerHTML !== r) this.innerHTML = r
      }), this)
    }
    c.attr = function(key, value){
      var fn = 'function' === typeof value
      return arguments.length === 1 ? n[0].getAttribute(key) : (this.each(function(d, i){
        var r = fn ? value.call(this, d, i) : value
             if (!r && this.hasAttribute(key)) this.removeAttribute(key)
        else if ( r && this.getAttribute(key) !== r) this.setAttribute(key, r)
      }), this) 
    }
    c.classed = function(key, value){
      var fn = 'function' === typeof value
      return arguments.length === 1 ? n[0].classList.contains(key) : (this.each(function(d, i){
        var r = fn ? value.call(this, d, i) : value
             if ( r && !this.classList.contains(key)) this.classList.add(key)
        else if (!r &&  this.classList.contains(key)) this.classList.remove(key)
      }), this) 
    }
    c.property = function(key, value){
      var fn = 'function' === typeof value
      return arguments.length === 1 ? deep(key)(n[0]) : (this.each(function(d, i){
        var r = fn ? value.call(this, d, i) : value
        if (r !== undefined && deep(key)(this) !== r) deep(key, function(){ return r })(this)
      }), this) 
    }
    c.each = function(fn){
      p = -1; while(n[++p])
        fn.call(n[p], n[p].__data__, p)
      return this
    }
    c.remove = function(){
      this.each(function(d){
        var el = this.host || this
        el.parentNode.removeChild(el)
      }) 
      return this
    }
    c.draw = proxy('draw', c)
    c.once = proxy('once', c)
    c.emit = proxy('emit', c)
    c.on   = proxy('on', c)

    return c
    
    function c(s, d, k, b) {
      var selector
        , data
        , tnodes = []
        , tenter = []
        , texit  = []
        , j = -1
        , p = -1
        , l = -1
        , t = -1

      // reselect
      if (arguments.length === 1) {
        if ('string' !== typeof s) return once(s)

        while (n[++p]) 
          tnodes = tnodes.concat(Array.prototype.slice.call(n[p].querySelectorAll(s), 0))

        return once(tnodes)
      }

      // shortcut
      if (d === 1 && arguments.length == 2) {
        while (n[++p]) { 
          j = n[p].children.length
          selector = s.call ? s(n[p].__data__ || 1, 0) : s
          while (n[p].children[--j])  {
            if (n[p].children[j].matches(selector)) {
              (tnodes[++t] = n[p].children[j]).__data__ = n[p].__data__ || 1
              break
            }
          }

          if (j < 0) n[p].appendChild(tnodes[++t] = tenter[tenter.length] = create(selector, [n[p].__data__ || 1], 0))
          if ('function' === typeof tnodes[t].draw) tnodes[t].draw()
        }

        return once(tnodes, tenter, texit)
      }

      // main loop
      while (n[++p]) {
        selector = 'function' === typeof s ? s(n[p].__data__) : s
        data     = 'function' === typeof d ? d(n[p].__data__) : d
        
        if (d === 1)                    data = n[p].__data__ || [1]
        if ('string' === typeof data)   data = [data]
        if (!data)                      data = []
        if (data.constructor !== Array) data = [data]
        
        if (k) {
          byKey(selector, data, k, b, n[p], tnodes, tenter, texit)
          continue
        }

        l = -1
        j = -1

        while (n[p].children[++j]) { 
          if (!n[p].children[j].matches(selector)) continue
          if (++l >= data.length) { // exit
            n[p].removeChild(texit[texit.length] = n[p].children[j]), --j
            continue 
          }

          (tnodes[++t] = n[p].children[j]).__data__ = data[l] // update
          if ('function' === typeof n[p].children[j].draw) n[p].children[j].draw()
        }

        // enter
        if (typeof selector === 'string') { 
          n[p].templates = n[p].templates || {}
          n[p].templates[selector] = n[p].templates[selector] || create(selector, [], 0)
          while (++l < data.length) { 
            (b ? n[p].insertBefore(tnodes[++t] = tenter[tenter.length] = n[p].templates[selector].cloneNode(false), n[p].querySelector(b)) 
               : n[p].appendChild( tnodes[++t] = tenter[tenter.length] = n[p].templates[selector].cloneNode(false)))
               .__data__ = data[l]
            if ('function' === typeof tnodes[t].draw) tnodes[t].draw()
          }
        } else {
          while (++l < data.length) { 
            (b ? n[p].insertBefore(tnodes[++t] = tenter[tenter.length] = create(selector, data, l), n[p].querySelector(b)) 
               : n[p].appendChild( tnodes[++t] = tenter[tenter.length] = create(selector, data, l)))
            if ('function' === typeof tnodes[t].draw) tnodes[t].draw()
          }
        }
      }
    
      return once(tnodes, tenter, texit)
    }

  }

  function event(node, index) {
    node = node.host && node.host.nodeName ? node.host : node
    if (node.evented) return
    if (!node.on) emitterify(node)
    var on = node.on
      , emit = node.emit
      , old = keys(node.on)

    node.evented = true

    node.on = function(type) {
      node.addEventListener(type.split('.').shift(), reemit)
      on.apply(node, arguments)
      return node
    }

    node.emit = function(event, detail) {
      node.dispatchEvent(event instanceof window.Event 
        ? event
        : new window.CustomEvent(event, { detail: detail, bubbles: false, cancelable: true }))
      return node
    }

    old.map(function(event){
      node.on[event] = on[event]
      node.on(event)
    })

    function reemit(event){
      if ('object' === typeof window.d3) window.d3.event = event
      emit(event.type, [this.__data__, index, this, event])
    }
  }

  function proxy(fn, c) {
    return function(){
      var args = arguments
      c.each(function(){
        var node = this.host || this
        node[fn] && node[fn].apply(node, args)
      }) 
      return c 
    }
  }

  function create(s, d, j) {
    var i     = 0
      , attrs = []
      , css   = []
      , sel   = s.call ? s(d[j], j) : s
      , tag   = rsplit.exec(sel)[1] || 'div'
      , node  = document.createElement(tag)

    ;(s.call ? s.toString() : s)
      .replace(/\[(.+?)="(.*?)"\]/g, function($1, $2, $3){ return attrs[attrs.length] = [$2, $3], '' })
      .replace(/\.([^.]+)/g, function($1, $2){ return css[css.length] = $2, ''})

    for (i = 0; i < attrs.length; i++) 
      node.setAttribute(attrs[i][0], attrs[i][1])

    for (i = 0; i < css.length; i++) 
      node.classList.add(css[i])

    node.__data__ = d[j] || 1
    return node
  }

  function byKey(selector, data, key, b, parent, tnodes, tenter, texit) {
    var c = -1
      , d = data.length
      , k
      , indexNodes = {}
      , child
      , next

    while (parent.children[++c]) 
      if (!parent.children[c].matches(selector)) continue
      else indexNodes[key(parent.children[c].__data__)] = parent.children[c]

    next = b ? parent.querySelector(b) : null

    while (d--) {
      if (child = indexNodes[k = key(data[d])])
        if (child === true) continue
        else child.__data__ = data[d]
      else
        tenter.unshift(child = create(selector, data, d))
      
      indexNodes[k] = true

      if (d == data.length - 1 || next !== child.nextSibling)
        parent.insertBefore(child, next)

      tnodes.unshift(next = child)
      if ('function' === typeof child.draw) child.draw()
    }

    for (c in indexNodes)
      if (indexNodes[c] !== true)
        texit.unshift(parent.removeChild(indexNodes[c]))
  }

  function overwrite(to){ 
    return function(from){
      keys(from)
        .map(copy(from, to))
          
      return to
    }
  }

  var act = { add: add, update: update, remove: remove }
  var str$1 = JSON.stringify
  var parse$1 = JSON.parse

  function set(d) {
    return function(o, existing, max) {
      if (!is.obj(o))
        return o

      if (!is.obj(d)) { 
        var log = existing || o.log || []
          , root = o

        if (!is.def(max)) max = log.max || 0
        if (!max)    log = []
        if (max < 0) log = log.concat(null)
        if (max > 0) {
          var s = str$1(o)
          root = parse$1(s) 
          log = log.concat({ type: 'update', value: parse$1(s), time: log.length })
        } 

        def(log, 'max', max)
        
        root.log 
          ? (root.log = log)
          : def(emitterify(root, null), 'log', log, 1)

        return root
      }

      if (is.def(d.key))
        apply(o, d.type, (d.key = '' + d.key).split('.'), d.value)

      if (o.log && o.log.max) 
        o.log.push((d.time = o.log.length, o.log.max > 0 ? d : null))

      if (o.emit)
        o.emit('change', d)

      return o
    }
  }

  function apply(body, type, path, value) {
    var next = path.shift()

    if (path.length) { 
      if (!(next in body)) 
        if (type == 'remove') return
        else body[next] = {}
      apply(body[next], type, path, value)
    }
    else 
      act[type](body, next, value)
  }

  function add(o, k, v) {
    is.arr(o) 
      ? o.splice(k, 0, v) 
      : (o[k] = v)
  }

  function update(o, k, v) { 
    o[k] = v 
  }

  function remove(o, k, v) { 
    is.arr(o) 
      ? o.splice(k, 1)
      : delete o[k]
  }

  function patch(key, values){
    return function(o){
      return keys(values)
        .map(function(k){
          return set({ key: key + '.' + k, value: values[k], type: 'update' })(o)
        }), o
    }
  }

  var log$1 = log('[perf]')
  function perf(fn, msg) {
    return function(){
      /* istanbul ignore next */
      var start  = client ? performance.now() : process.hrtime()
        , retval = fn.apply(this, arguments)
        , diff   = client ? performance.now() - start : process.hrtime(start)

      !client && (diff = (diff[0]*1e3 + diff[1]/1e6))
      diff = Math.round(diff*100)/100
      log$1(msg || fn.name, diff, 'ms'), diff
      return retval
    }
  }

  function pop(o){
    return is.arr(o) 
         ? set({ key: o.length - 1, value: last(o), type: 'remove' })(o)
         : o 
  }

  promise.sync = promiseSync
  promise.null = promiseNull
  promise.noop = promiseNoop
  promise.args = promiseArgs
  function promise() {
    var resolve
      , reject
      , p = new Promise(function(res, rej){ 
          resolve = res, reject = rej
        })

    arguments.length && resolve(arguments[0])
    p.resolve = resolve
    p.reject  = reject
    return p
  }

  function promiseArgs(i){
    return function(){
      return promise(arguments[i])
    }
  }

  function promiseSync(arg){
    return function() {
      var a = arguments
        , o = { then: function(cb){ cb(a[arg]); return o } }
      return o
    }
  }

  function promiseNoop(){
    return promise()
  }

  function promiseNull(){
    return promise(null)
  }

  function proxy$1(fn, ret, ctx){ 
    return function(){
      var result = (fn || identity).apply(ctx || this, arguments)
      return is.fn(ret) ? ret.call(ctx || this, result) : ret || result
    }
  }

  function push(value){
    return function(o){
      return is.arr(o) 
           ? set({ key: o.length, value: value, type: 'add' })(o)
           : o 
    }
  }

  function raw(selector, doc){
    var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
    return (doc ? doc : document).querySelector(prefix+selector)
  }

  function ready(fn){
    return document.body ? fn() : document.addEventListener('DOMContentLoaded', fn.bind(this))
  }

  function remove$1(k){
    return function(o){
      return set({ key: k, value: key(k)(o), type: 'remove' })(o)
    }
  }

  function slice(from, to){
    return function(d){
      return d.slice(from, to)
    }
  }

  function sort(fn){
    return function(arr){
      return arr.sort(fn)
    }
  }

  function stripws(d){
    return (is.arr(d) ? d[0] : d)
      .replace(/([\s]{2,}|[\n])/gim, '')
  }

  function draw(host, fn, state) {
    var el = host.node ? host.node() : host
    el.state = state || {}
    el.draw = function(d){ return fn && fn.call(el, el.state) }
    el.draw()
    return host
  }

  function th(fn) {
    return function(){
      return fn(this).apply(this, arguments)
    }
  }

  function time(ms, fn) {
    return arguments.length === 1 
         ? setTimeout(ms)
         : setTimeout(fn, ms)
  }

  function unique(d, i){
    if (!i) unique.matched = []
    return !is.in(unique.matched)(d) 
         ? unique.matched.push(d)
         : false 
  }

  function update$1(key, value){
    return function(o){
      return set({ key: key, value: value, type: 'update' })(o)
    }
  }

  function values(o) {
    return !o ? [] : keys(o).map(from(o))
  }

  function wait(condition){
    return function(handler){
      return function(){
        var result = condition.apply(this, arguments)
        result
          ? handler.apply(this, arguments)
          : this.once('change', wait(condition)(handler))
      }
    }
  }

  function wrap(d){
    return function(){
      return d
    }
  }

  function za(k) {
    return function(a, b){
      var ka = key(k)(a) || ''
        , kb = key(k)(b) || ''

      return ka > kb ? -1 
           : ka < kb ?  1 
                     :  0
    }
  }

  owner.all = all
  owner.append = append
  owner.args = args
  owner.attr = attr
  owner.az = az
  owner.by = by
  owner.client = client
  owner.clone = clone
  owner.colorfill = colorfill
  owner.copy = copy
  owner.datum = datum
  owner.debounce = debounce
  owner.def = def
  owner.defaults = defaults
  owner.done = done
  owner.el = el
  owner.emitterify = emitterify
  owner.err = err$1
  owner.escape = escape
  owner.extend = extend
  owner.falsy = falsy
  owner.first = first
  owner.flatten = flatten
  owner.fn = fn
  owner.form = form
  owner.from = from
  owner.grep = grep
  owner.group = group
  owner.has = has
  owner.hashcode = hashcode
  owner.header = header
  owner.identity = identity
  owner.iff = iff
  owner.includes = includes
  owner.is = is
  owner.join = join
  owner.key = key
  owner.keys = keys
  owner.last = last
  owner.lo = lo
  owner.log = log
  owner.mo = mo
  owner.noop = noop
  owner.not = not
  owner.nullify = nullify
  owner.once = once
  owner.overwrite = overwrite
  owner.owner = owner
  owner.parse = parse
  owner.patch = patch
  owner.perf = perf
  owner.pop = pop
  owner.prepend = prepend
  owner.promise = promise
  owner.proxy = proxy$1
  owner.push = push
  owner.raw = raw
  owner.ready = ready
  owner.remove = remove$1
  owner.replace = replace
  owner.set = set
  owner.slice = slice
  owner.sort = sort
  owner.split = split
  owner.str = str
  owner.stripws = stripws
  owner.tdraw = draw
  owner.th = th
  owner.time = time
  owner.to = to
  owner.unique = unique
  owner.update = update$1
  owner.values = values
  owner.wait = wait
  owner.wrap = wrap
  owner.za = za
  ;(client ? window : global).owner = owner

}());