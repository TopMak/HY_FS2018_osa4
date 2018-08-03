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
