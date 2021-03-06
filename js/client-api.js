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
function binaryToString(str) {
    // Removes the spaces from the binary string
    str = str.replace(/\s+/g, '');
    // Pretty (correct) print binary (add a space every 8 characters)
    str = str.match(/.{1,8}/g).join(" ");

    var newBinary = str.split(" ");
    var binaryCode = [];

    for (i = 0; i < newBinary.length; i++) {
        binaryCode.push(String.fromCharCode(parseInt(newBinary[i], 2)));
    }
    
    return binaryCode.join("");
}
var ClientApi = {
  ws: null,
  callbacks: [],
  registerCallback: (engine, func, cb) => {
    var funcName = engine + '---' + func
    ClientApi.callbacks[funcName] = cb
  },
  connect: (host, port, cb) => {
    var url = 'ws://' + host + ':' + port + '/api/json/websocket'
    this.ws = new WebSocket(url)
    console.log('Trying to connect')
    this.ws.onopen = cb
    this.ws.onmessage = (evt) => {
      var obj = JSON.parse(evt.data).faas
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
    this.ws.send(JSON.stringify({type: 3, faas: {
      engine: engine,
      func: func,
      args: this.toUTF8Array(JSON.stringify(args))
    }}))
  }
}
