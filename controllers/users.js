const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

/* GET - return all users (format without passwords...etc.) - */
usersRouter.get('/', async (request, response) => {

  try {
    const allUsers = await User.find({})
    //console.log(allUsers);
    response.json(allUsers.map( user => User.format(user)))

  } catch (err) {
    console.log(err)
    response.status(503)
  }

})

/* POST - add a new user - */
usersRouter.post('/', async (request, response) => {

  try {
    const findUser = await User.find({username: request.body.username})

    //User already exists
    if (findUser.length>0) {
      return response.status(400).json({ error: 'username must be unique' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds)

    const newUser = new User({
      username: request.body.username,
      name: request.body.name,
      isAdult: request.body.isAdult,
      passwordHash
    })

    const savedUser = await newUser.save()

    response.json(User.format(savedUser))

  } catch (err) {
    console.log(err)
    response.status(500).json({ error: 'something went wrong...' })
  }

})


module.exports = usersRouter
