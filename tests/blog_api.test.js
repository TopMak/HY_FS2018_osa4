const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const { formatBlog, initBlogs, newBlogPost, getAllBlogs, nonExistingId, initTestUSers, usersInDb } = require('./api_helper')


  beforeAll(async () => {
    await Blog.remove({})

    for (let blog of initBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

describe.skip('/api/blogs tests', async () => {

  describe('GET tests', async () => {

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
    const testBlog = blogsBeforeTest[0]

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

describe('POST tests', async () => {

  test('add blog post and check for 201 ', async () => {

    const countBeforePost = await getAllBlogs()

     response = await api
       .post('/api/blogs')
       .send(newBlogPost)
       .expect(201)
       .expect('Content-Type', /application\/json/)

     // const response = await api
     //  .get('/api/blogs')

     const countAfterPost = await getAllBlogs()
     expect(countAfterPost.length).toBe(countBeforePost.length + 1)

     //expect(countAfterPost).toContainEqual( formatBlog(response.body) )
     expect(countAfterPost).toContainEqual(
       {
         title: "Javascript Fatigue",
         author: "Eric Clemmons",
         url: "https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4",
         likes: 0,
         id: response.body._id
       }
     )

  })


  test('missing likes property defaults to 0 likes ', async () => {

    const countBeforePost = await getAllBlogs()

    const zeroLikesTestBlog = {
      title: "ZeroLikes Test",
      author: "Test God",
      url: "127.0.0.1",
      likes: null
    }

    response = await api
      .post('/api/blogs')
      .send(zeroLikesTestBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const countAfterPost = await getAllBlogs()

    expect(countAfterPost.length).toBe(countBeforePost.length + 1)

    //expect(countAfterPost).toContainEqual( formatBlog(response.body) )
    expect(countAfterPost).toContainEqual(
      {
        title: "ZeroLikes Test",
        author: "Test God",
        url: "127.0.0.1",
        likes: 0,
        id: response.body._id
      })

  })


  test('returns 400 if url or tittle is missing ', async () => {

    const countBeforePost = await getAllBlogs()

    const missingUrlBlog = {
      title: "Missing Url Test",
      author: "Test God",
      likes: 100
    }

    const missingTittleBlog = {
      author: "Test God",
      url: "127.0.0.1",
      likes: 100
    }

    await api
      .post('/api/blogs')
      .send(missingTittleBlog)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(missingUrlBlog)
      .expect(400)

    const countAfterPost = await getAllBlogs()

    //Make sure nothing was added to db
    expect(countAfterPost.length).toBe(countBeforePost.length)

    })

}) //End of describe POST tests

describe('DELETE tests', async () => {

  beforeAll(async () => {
    deletedTestPost = new Blog({
      title: "RemoveByID test",
      author: "Test God",
      url: "127.0.0.1",
      likes: 100
    })
    await deletedTestPost.save()
  })

  test('DELETE by id and returns 204', async () => {
    const countBeforeDelete = await getAllBlogs()

    //Check that deletedTestPost is actually added in first place
    expect(countBeforeDelete).toContainEqual(formatBlog(deletedTestPost))

    await api
      .delete(`/api/blogs/${deletedTestPost._id}`)
      .expect(204)

    const countAfterDelete = await getAllBlogs()

    expect(countAfterDelete).not.toContainEqual(deletedTestPost)
    expect(countAfterDelete.length).toBe(countBeforeDelete.length - 1)
  })

}) //End of describe DELETE tests

describe('UPDATE tests', async () => {

  test('UPDATE by id, check for status 200 and compare update', async () => {

    const countBeforeUpdate = await getAllBlogs()

    //spread syntax for deep copy (so we don't modify original data)
    let modifiedPost = { ... countBeforeUpdate[0] }

    modifiedPost.likes += 50

    const response = await api
      .put(`/api/blogs/${modifiedPost.id}`)
      .send(modifiedPost)
      .expect(200)

    const countAfterUpdate = await getAllBlogs()

    console.log(countAfterUpdate[0]);

    expect(countAfterUpdate[0].likes).toBe(countBeforeUpdate[0].likes + 50)
    //Object comparison, not sure if necessary
    expect(countAfterUpdate[0]).toEqual(modifiedPost)

  })

}) //End of describe UPDATE tests

}) //End of describe API tests

describe('/api/users tests', async () => {

  describe('init test users', async () => {

    beforeAll(async () => {
      await User.remove({})

      for (let user of initTestUSers) {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(user.password, saltRounds)
        let userObj = new User(
          {
            username: user.username,
            name: user.name,
            isAdult: user.isAdult,
            passwordHash: passwordHash
          }
        )
        await userObj.save()
      }
    })


    test('POST /api/users - new user can be created', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainensalainen',
        isAdult: false
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      //expect(result.body).toContainEqual( )

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
    })

    test('POST /api/users - creating existing users returns error', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'TepTest66',
        name: 'Teppo Testaaja',
        password: 'salainensalainen',
        isAdult: false
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual( { error: 'username must be unique' } )

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })

    test('POST /api/users - require password of 3 or more characters', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'PassTest00',
        name: 'Password Test',
        password: 'sa',
        isAdult: false
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual( { error: 'password is too short' } )

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })

  })

})

afterAll(() => {
  server.close()
})
