const Gun = require('gun') 

const server = require('http').createServer().listen(8765);
  new Gun({
    web: server,
  });

console.log('gun websocket server listening on port 8765')
