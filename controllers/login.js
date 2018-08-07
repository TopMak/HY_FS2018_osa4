const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const loginRouter = require('express').Router()

loginRouter.post('/', async (request, response) =>{

const user = await User.findOne( { username: request.body.username } )

const checkPwd = user === null ?
  false : await bcrypt.compare(request.body.password, user.passwordHash)

if (!user || !checkPwd){
  return response.status(401).send({ error: 'invalid username or password' })
}

const tokenInfo = {
  username: user.username,
  id: user._id
}

const token = jwt.sign(tokenInfo, process.env.SECRET)

response.status(200).send({ token, username: user.username, name: user.name })

})


module.exports = loginRouter
