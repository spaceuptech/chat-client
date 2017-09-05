function toUTF8Array(str) {
  var utf8 = []
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i)
    if (charcode < 0x80) utf8.push(charcode)
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6),
        0x80 | (charcode & 0x3f))
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f))
    } else {
      i++
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
        (str.charCodeAt(i) & 0x3ff))
      utf8.push(0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f))
    }
  }
  return utf8
}

var ClientApi = {
  ws: null,
  callbacks: [],
  registerCallback: (engine, func, cb) => {
    var funcName = engine + '---' + func
    ClientApi.callbacks[funcName] = cb
  },
  connect: (host, port, cb) => {
    var url = 'ws://' + host + ':' + port + '/rpc/json'
    this.ws = new WebSocket(url)
    console.log('Trying to connect')
    this.ws.onopen = cb
    this.ws.onmessage = (evt) => {
      var obj = JSON.parse(evt.data)
      var engine = obj.engine
      var func = obj.func
      var args = obj.args
      var funcName = engine + '---' + func
      var cb = ClientApi.callbacks[funcName]
      if (typeof cb != 'undefined') {
        cb(JSON.parse(args))
      }
    }
    this.ws.onclose = () => {
      setTimeout(function() {
        this.connect(host, port, cb)
      }, 2000)
    }
  },
  call: (engine, func, args) => {
    this.ws.send(JSON.stringify({
      Engine: engine,
      Func: func,
      Args: this.toUTF8Array(JSON.stringify(args))
    }))
  }
}
