const app = require('express')()
let db = require('./db.js')
const port = 1234

app.get('/', function (req, res) {
  res.end('<div>Simple CRUD node.js + express application<br><br> <a href="/users">User list</a></div>');
})

app.get('/flights', function (req, res) {
  res.header({
    'access-control-allow-origin': '*'
  })
  db.read(function (data) {
    res.json({
      data
    })
  })
})

app.listen(port, function () {
  console.log(`Server at localhost:${port}`)
})