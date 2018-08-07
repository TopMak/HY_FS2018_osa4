const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


// const getTokenFrom = (request) => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
//     return authorization.substring(7)
//   }
//   return null
// }

/* - GET all -*/

blogsRouter.get('/', async (request, response) => {

  try {
    const blogs = await Blog
    .find({})
    .populate('user', { username: true, name: true } )
    response.json( blogs.map( blog => Blog.format(blog)) )

  } catch (err) {
    console.log(err)
    response.status(503)
  }

})

/* - GET by id -*/

blogsRouter.get('/:id', async (request, response) => {
  try {

    const blog = await Blog
      .findById(request.params.id)
      .populate('user', { username: true, name: true } )

    if (blog) {
      response.json(Blog.format(blog))
    } else {
      response.status(404).end()
    }

  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

/* - POST - submit a new blog -*/

blogsRouter.post('/', async (request, response) => {

  //Token verifying will throw an error if unvalid
  try {

    //const token = getTokenFrom(request)
    const validToken = jwt.verify(request.token, process.env.SECRET)

    console.log(validToken);

    if (request.body.likes === null) {
        //console.log(request.body.likes);
        request.body.likes = 0
    }

    //When url or tittle property is missing, return status 404
    if( !request.body.hasOwnProperty("url") || !request.body.hasOwnProperty("title") ){
      //console.log("missing url and/or title");
      return response.status(400).end()
    }

    //const user = await User.findById(request.body.user)

    //Necessary to query user? (since the id is already known, if token is valid?)
    //Handle if user is deleted, but token is valid?
    const user = await User.findById(validToken.id)

    const blog = new Blog({
      title: request.body.title,
      author: user.name,  //Changed request.author to user.name (from db)
      url: request.body.url,
      likes: request.body.likes,
      user: user._id
    })

    const newBlog = await blog.save()

    //Save the blog to user's blog array!
    user.blogs = user.blogs.concat(newBlog._id)
    await user.save()

    response.status(201).json(newBlog)

  } catch (err) {

    if(err.name === 'JsonWebTokenError'){
      //More about : https://www.npmjs.com/package/jsonwebtoken
      response.status(401).json({ error: err.message })
    } else {
      console.log(err)
      return response.status(500).send({ error: 'Yup, codemonkeys failed to evaluate this...' })
    }

  }
})

/* - DELETE - a blog by id -*/

blogsRouter.delete('/:id', async (request, response) => {

  try {

    //Check if token is correct, not necessarily correct user!!
    const validToken = jwt.verify(request.token, process.env.SECRET)
    console.log(validToken);

    //Fetch the blog...
    const checkBlog = await Blog.findById(request.params.id)
    console.log(checkBlog);
    // ...and check if token id does NOT match with user's
    if( checkBlog.user.toString() !== validToken.id){
      console.log("not the same user!");
      console.log(checkBlog.user.toString(), " >>>>> ", validToken.id);
      return response.status(401).json({ error: "not authorized!" })
    }

    //Remove the blog
    await Blog.findByIdAndRemove(request.params.id)

    //Find user whose the blog is...
    const user = await User.findById(validToken.id)

    //Update blogs array
    const updatedBlogs = user.blogs.filter(blog => blog.id.toString() !== request.params.id)
    //console.log(updatedBlogs)

    //Update user with one blog removed
    const updatedUser = {
      username: user.username,
      name: user.name,
      isAdult: user.isAdult,
      blogs: updatedBlogs
    }

    await User.findByIdAndUpdate(validToken.id, updatedUser, { new: true })

    // const user = await User.findById(validToken.id)
    //
    // const blogExists = user.blogs.filter( blog => blog.id.toString === request.params.id)
    //
    // if(blogExists.length < 1){
    //
    // }

    //await Blog.findByIdAndRemove(request.params.id)

    // if(validToken.id === Blog.user.toString()){
    //   return response.status(401).json({ error: "not authorized" })
    // }

    response.status(204).end()

  } catch (err) {

      if(err.name === 'JsonWebTokenError'){
        //More about : https://www.npmjs.com/package/jsonwebtoken
        console.log("JWT error")
        response.status(401).json({ error: err.message })
      } else {
        // console.log(exception)
        // response.status(400).send({ error: 'malformatted id' })
        console.log(err)
        return response.status(500).send({ error: 'Yup, codemonkeys failed to evaluate this...' })
      }

    }

})

/* - PUT - modify a blog by id -*/

blogsRouter.put('/:id', async (request, response) => {

  //Current implementation allows to modify everything (except id)
  const updateToBlog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
  }

  try {
    // "new":true parameter makes api to returns the modified object
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, updateToBlog, { new: true })
    response.status(200).json(updatedBlog)

  } catch (err) {
    console.log(err)
    response.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter
