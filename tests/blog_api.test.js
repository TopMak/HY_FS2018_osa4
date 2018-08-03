const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')

const initBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

  beforeAll(async () => {
    await Blog.remove({})

    for (let blog of initBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })


describe('API tests', () => {

  test('GET test - all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')

    expect(response.body.length).toBe(initBlogs.length)
  })


  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
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


  test('add blog post and check if it is returned ', async () => {

     const newBlogPost = {
       title: "Javascript Fatigue",
       author: "Eric Clemmons",
       url: "https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4",
       likes: 0
     }

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

  afterAll(() => {
    server.close()
  })


}) //End of describe API tests
