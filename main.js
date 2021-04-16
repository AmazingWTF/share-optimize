const express = require('express')

const app = express()

app.get('/api', function (req, res) {
  res.send('hellow world')
})

app.use(express.static('./client'))

app.listen(3000, function () {
  console.log('server is running http://localhost:3000')
})
