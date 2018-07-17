const app = require('express')()
let db = require('./db.js')
const port = 1234

app.get('/', function (req, res) {
  res.end('<div>Simple CRUD node.js + express application<br><br> <a href="/flights">flights list</a></div>')
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

app.get('/flights/delete', function (req, res) {
  res.header({
    'access-control-allow-origin': '*'
  })
  let id = req.query.id
  
  db.read(function(data){
    let list = data.data
    list.filter((item)=>{
      return item.id != id
    })
    let newJson = {
      desc: "从北京至深圳航班信息",
      data: list
    }
    db.write(JSON.stringify(newJson), function (data) {
       res.redirect('/flights')
    })
  })
})

app.listen(port, function () {
  console.log(`Server at localhost:${port}`)
})