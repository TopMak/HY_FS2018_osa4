const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { formatBlog, initBlogs, newBlogPost, getAllBlogs, nonExistingId } = require('./api_helper')


  beforeAll(async () => {
    await Blog.remove({})

    for (let blog of initBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

describe('API tests', () => {

  describe('GET tests', () => {

  //Combined get all and json check
  test('GET all: blogs are returned and format is JSON', async () => {

    const countBeforeTest = await getAllBlogs()

    //NOTE format _id to string (in api_helper.js) since Object id != string NOTE

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(countBeforeTest.length)
    const formattedResponse = (response.body.map(formatBlog))

    // console.log(typeof countBeforeTest);
    // console.log(countBeforeTest);

    countBeforeTest.forEach( blog => {
      //console.log(typeof blog);
      expect(formattedResponse).toContainEqual(blog)
    })

  })

  test('GET individual blog by id: is returned as JSON', async () => {

    const blogsBeforeTest = await getAllBlogs()
    const randIndex = Math.floor(Math.random() * blogsBeforeTest.length-1)
    const testBlog = blogsBeforeTest[randIndex]

    const response = await api
      .get(`/api/blogs/${testBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const formattedResponse = formatBlog(response.body)

    expect(formattedResponse).toEqual(testBlog)
  })


  test('GET individual blog by valid non existing id: returns 404', async () => {
    const validnonexistingId = await nonExistingId()

    const response = await api
      .get(`/api/blogs/${validnonexistingId}`)
      .expect(404)
  })

  test('returns 404 with error msg if wrong url ', async () => {
    const response = await api
      .get('/api/blogsss')
      .expect(404)

      expect(response.body).toEqual(
        {
          "error": "unknown endpoint"
        })
    })

}) //End of describe GET tests

describe('POST tests', () => {

  test('add blog post and check if it is returned ', async () => {

     await api
       .post('/api/blogs')
       .send(newBlogPost)
       .expect(201)
       .expect('Content-Type', /application\/json/)

     //check if the new post is returned

     const response = await api
      .get('/api/blogs')

      const cleanedBlog = response.body.map(blog => {

      //Mongo adds, _id and __v --> remove those
      ({_id, __v, ...cleanBlog} = blog)
      return cleanBlog

      })


      expect(response.body.length).toBe(initBlogs.length + 1)
      //console.log("typeof cleanedblog:", typeof cleanedBlog);
      //console.log(cleanedBlog);
      expect(cleanedBlog).toContainEqual(
        {
          title: "Javascript Fatigue",
          author: "Eric Clemmons",
          url: "https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4",
          likes: 0
        }
      )
  })


  test('missing likes property defaults to 0 likes ', async () => {

    // const zeroLikesTestBlog = {
    //   title: "ZeroLikes Test",
    //   author: "Test God",
    //   url: "127.0.0.1"
    //   //missing likes
    // }

    const zeroLikesTestBlog = {
      title: "ZeroLikes Test",
      author: "Test God",
      url: "127.0.0.1",
      likes: null
    }

    await api
      .post('/api/blogs')
      .send(zeroLikesTestBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api
     .get('/api/blogs')

    const cleanedBlog = response.body.map(blog => {

    //Mongo adds, _id and __v --> remove those
    ({_id, __v, ...cleanBlog} = blog)
    return cleanBlog

     })

    //expect(response.body.length).toBe(initBlogs.length + 1)
    expect(cleanedBlog).toContainEqual(
      {
        title: "ZeroLikes Test",
        author: "Test God",
        url: "127.0.0.1",
        likes: 0  //expected to have likes fixed
      }
    )

  })


  test('returns 400 if url or tittle is missing ', async () => {

    const missingUrlBlog = {
      title: "Missing Url Test",
      author: "Test God",
      likes: 100
    }

    const missingTittleBlog = {
      author: "Test God",
      url: "127.0.0.1",
      likes: 100
      //missing likes
    }

    await api
      .post('/api/blogs')
      .send(missingTittleBlog)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(missingUrlBlog)
      .expect(400)

    })

}) //End of describe POST tests

afterAll(() => {
  server.close()
})

}) //End of describe API tests
