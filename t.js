let http = require('http')

let server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('okay')
})
server.on('data',function(req,res) {
  console.log(req)
})
 server.listen(8080,()=> {
   console.log('server at localhost:8080')
 })