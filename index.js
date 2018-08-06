const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
const config = require('./utils/config')

//Routes
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')

mongoose
  .connect(config.mongoUrl)
  .then( () => {
    console.log('connected to database', config.mongoUrl)
  })
  .catch( err => console.log("DB_ERROR", err))

app.use(cors())
app.use(bodyParser.json())
app.use(middleware.logger)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.error)

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`) //<-- huom! template literal, back-ticks not single quote
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}
