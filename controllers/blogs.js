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

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
    .catch( err => {
      console.log(err)
      response.status(503)
    })
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

blogsRouter.post('/', (request, response) => {

  //When likes property is missing, add and set zero ---> Not the purpose of task?
  // if(!request.body.hasOwnProperty("likes")){
  //   console.log("likes is missing");
  //   request.body.likes = 0
  // }


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

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

module.exports = blogsRouter
