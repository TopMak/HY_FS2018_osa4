const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


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

blogsRouter.post('/', (request, response) => {

  //If likes property is missing, add and set zero
  if(!request.body.hasOwnProperty("likes")){
    console.log("likes is missing");
    request.body.likes = 0
  }


  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

module.exports = blogsRouter
