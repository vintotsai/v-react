let app = require('express')()
let db = require('./db.js')
let bodyParser = require('body-parser')


const port = 1234


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,PATCH,OPTIONS")
  // !post请求必须加上
  res.header("Access-Control-Allow-Headers", " Origin, X-Requested-With, Content-Type, Accept")
  next()
})


app.get('/', function (req, res) {
  res.end('<div> node.js + express web server<br><br> <a href="/flights">flights list</a></div>')
})

// 增
app.post('/flights/add', function (req, res) {
  let newFlight = req.body.values
  if (newFlight) {
    db.read(function (data) {
      let list = data.data
      newFlight.id = Date.now()
      list.push(newFlight)
      let newJson = {
        desc: "当日 北京飞深圳 航班信息",
        data: list
      }
      db.write(JSON.stringify(newJson), function (data) {
        res.json({
          data: newJson
        })
      })
    })
  }
})
// 改
app.post('/flights/edit', function (req, res) {
  let newFlight = req.body.values
  if (newFlight) {
    db.read(function (data) {
      let list = data.data
      list = list.map((item) => {
        if (item.id == newFlight.id) {
          console.log('mapped item>>', item)
          return newFlight
        }
        return item
      })
      let newJson = {
        desc: "当日 北京飞深圳 航班信息",
        data: list
      }
      db.write(JSON.stringify(newJson), function (data) {
        res.json({
          data: newJson
        })
      })
    })
  }
})

// 查
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

// delete
app.get('/flights/delete', function (req, res) {
  res.header({
    'access-control-allow-origin': '*'
  })
  let id = req.query.id
  db.read(function (data) {
    let list = data.data
    list = list.filter((item) => {
      return item.id != id
    })
    let newJson = {
      desc: "当日 北京飞深圳 航班信息",
      data: list
    }
    db.write(JSON.stringify(newJson), function () {
      //  res.redirect('/flights')
    })
  })
})

app.listen(port, function () {
  console.log(`Server at localhost:${port}`)
})