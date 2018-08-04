const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id
  }
}

/* - GET all -*/

blogsRouter.get('/', async (request, response) => {

  try {
    const blogs = await Blog.find({})
    response.json(blogs)

  } catch (err) {
    console.log(err)
    response.status(503)
  }

})

/* - GET by id -*/

blogsRouter.get('/:id', async (request, response) => {
  try {

    const blog = await Blog.findById(request.params.id)

    if (blog) {
      response.json(blog)
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

  if (request.body.likes === null) {
      //console.log(request.body.likes);
      request.body.likes = 0
  }

  //When url or tittle property is missing, return status 404
  if( !request.body.hasOwnProperty("url") || !request.body.hasOwnProperty("title") ){
    //console.log("missing url and/or title");
    return response.status(400).end()
  }

  const blog = new Blog(request.body)

  //TODO  Try-catch perhaps below?

  const newBlog = await blog.save()
  response.status(201).json(newBlog)
})

/* - DELETE - a blog by id -*/

blogsRouter.delete('/:id', async (request, response) => {

  try {
      await Blog.findByIdAndRemove(request.params.id)

      response.status(204).end()
    } catch (exception) {
      console.log(exception)
      response.status(400).send({ error: 'malformatted id' })
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
