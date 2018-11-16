const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const mongoose = require('mongoose')
const { formatBlog, initTestBlogs, newBlogPost, getAllBlogs,
   nonExistingId, initTestUSers, usersInDb } = require('./api_helper')

  //Init some posts
  beforeAll(async () => {
    await Blog.remove({})
    await User.remove({})

    for (let user of initTestUSers) {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(user.password, saltRounds)
      let userObj = new User(
        {
          _id: mongoose.Types.ObjectId(user.id),
          username: user.username,
          name: user.name,
          isAdult: user.isAdult,
          passwordHash: passwordHash,
          blogs: user.blogs     //user.blogs.map(blog => mongoose.Types.ObjectId(blog))
        }
      )
      await userObj.save()
    }

    for (let blog of initTestBlogs) {
      let blogObject = new Blog(
        {
          _id: mongoose.Types.ObjectId(blog._id),
          title: blog.title,
          author: blog.author,
          url: blog.url,
          likes: blog.likes,
          user: blog.user,     //mongoose.Types.ObjectId(blog.user)
          comments: blog.comments
        }
      )
      await blogObject.save()
    }

  })

  //Init some users
  // beforeAll(async () => {
  //
  //
  //
  // })

describe('/api/blogs tests', async () => {

//  -- ** DEBUG TEST ** --

  // Test for verifying some object properties
  // Mongoose/Mongo adds some properties that leads to fail when using
  // toContainEqual method on object
  // Solution was to call blog.comments.toObject()
  test.skip('DEBUG TEST', async () => {

    const countBeforeTest = await getAllBlogs()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

      expect(response.body.length).toBe(countBeforeTest.length)


      const formattedResponse = response.body.map(blog =>  {
        return {...blog, user: blog.user._id.toString()}
       })

      // console.log(typeof response.body[0].user);
      //console.log(formattedResponse);
      // console.log(typeof countBeforeTest);
      //console.log(countBeforeTest);

      const testArr = []
      const olio1 = { test1:'String tässä', numero: 23094, arrProps: ['testString', 'teststring2'] }
      const olio2 = { test1:'String tässä myös', numero: 2525, arrProps: ['testString', 'teststring2'] }
      const olio1Str = JSON.stringify(olio1)
      const olio3 = JSON.parse(olio1Str)
      testArr.push(olio1)
      testArr.push(olio2)
      // console.log(response.body);
      // console.log(olio1);
      // console.log(olio2);
      // console.log(olio3);
      expect(testArr).toContainEqual(olio3)

      // console.log(Object.keys(countBeforeTest[0]));
      // console.log(Object.keys(formattedResponse[0]));

      // console.log(typeof testArr);
      // console.log(typeof countBeforeTest[0].comments);
      //   console.dir(countBeforeTest[0].comments)
      // console.log(typeof formattedResponse[0].comments);
      //   console.dir(formattedResponse[0].comments)
      // console.log(Object.getOwnPropertyNames(countBeforeTest[0].comments))
      console.log(Object.getOwnPropertyNames(formattedResponse[0].comments))

      // expect(JSON.stringify(countBeforeTest[0].comments)).toEqual(formattedResponse[0].comments)


      // const stringifiedRes = JSON.stringify(formattedResponse)
      countBeforeTest.forEach( blog => {
        expect(formattedResponse).toContainEqual(blog)
      })

  })

  //  -- ** DEBUG TEST ENDS ** --

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

    const formattedResponse = response.body.map(blog =>  {
      //spread syntax
      return {...blog, user: blog.user._id.toString() }

     })

    console.log(typeof response.body[0].user);
    //console.log(formattedResponse);
    // console.log(typeof countBeforeTest);
    //console.log(countBeforeTest);

    countBeforeTest.forEach( blog => {
      expect(formattedResponse).toContainEqual(blog)
    })

  })

  test('GET individual blog by id: is returned as JSON', async () => {

    const blogsBeforeTest = await getAllBlogs()
    //console.log(blogsBeforeTest)
    const testBlog = blogsBeforeTest[0]
    //console.log(testBlog)
    const response = await api
      .get(`/api/blogs/${testBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    //console.log(response.body.user);

    const formattedResponse = {...response.body, user: response.body.user._id.toString() }


    expect(formattedResponse).toEqual( testBlog )
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

    //Login part BEGINS
    //Yeah, kinda ugly right?
    const {isAdult, name, ...userToTest} = initTestUSers[0]

    //response format {token: xxx, username: xxx, name: xxx}
    tokenResponse = await api
      .post('/api/login')
      .send(userToTest)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(tokenResponse.body.token).not.toBe(null)

    //Login part ENDS

     response = await api
       .post('/api/blogs')
       .set('Authorization', `Bearer ${tokenResponse.body.token}`)
       .send(newBlogPost)   //Defined in api_helper.js
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
         id: response.body.id,
         user: initTestUSers[0].id,
         comments: []
       }
     )

  })


  test('missing likes property defaults to 0 likes ', async () => {

    const countBeforePost = await getAllBlogs()

    //Login part BEGINS
    //Yeah, kinda ugly right?
    const {isAdult, name, ...userToTest} = initTestUSers[0]

    //response format {token: xxx, username: xxx, name: xxx}
    tokenResponse = await api
      .post('/api/login')
      .send(userToTest)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(tokenResponse.body.token).not.toBe(null)

    //Login part ENDS

    const zeroLikesTestBlog = {
      title: "ZeroLikes Test",
      author: "Test God",
      url: "127.0.0.1",
      likes: null,
      comments: []
    }

    response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)
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
        id: response.body.id,
        user: initTestUSers[0].id,
        comments: []
      })

  })


  test('returns 400 if url or tittle is missing ', async () => {

    const countBeforePost = await getAllBlogs()

    //Login part BEGINS
    //Yeah, kinda ugly right?
    const {isAdult, name, ...userToTest} = initTestUSers[0]

    //response format {token: xxx, username: xxx, name: xxx}
    tokenResponse = await api
      .post('/api/login')
      .send(userToTest)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(tokenResponse.body.token).not.toBe(null)

    //Login part ENDS

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
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)
      .send(missingTittleBlog)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)
      .send(missingUrlBlog)
      .expect(400)

    const countAfterPost = await getAllBlogs()

    //Make sure nothing was added to db
    expect(countAfterPost.length).toBe(countBeforePost.length)

    })

}) //End of describe POST tests

describe('DELETE tests -- IMPERFECT: not checking blog count at user object', async () => {

  beforeAll(async () => {
    //Get users in db...

    //const testUsers = await usersInDb()

    // and set first one as author(owner) of the post
    deletedTestPost = new Blog({
      title: "RemoveByID test",
      author: "Remove Testuser",
      url: "127.0.0.1",
      likes: 100,
      user: initTestUSers[0].id,
      comments:["testComment1, TestComment2"] //Can directly save comments to DB
    })
    // console.log(deletedTestPost);
    await deletedTestPost.save()
  })



  test('DELETE by id, without auth headers, expect 401', async () => {
    const countBeforeDelete = await getAllBlogs()

    //Check that deletedTestPost is actually added in first place
    expect(countBeforeDelete).toContainEqual(formatBlog(deletedTestPost))

    response = await api
      .delete(`/api/blogs/${deletedTestPost._id}`)
      .expect(401)

    const countAfterDelete = await getAllBlogs()

    expect(countAfterDelete).toContainEqual(formatBlog(deletedTestPost))
    expect(countAfterDelete.length).toBe(countBeforeDelete.length)
    expect(response.body).toEqual({"error": "jwt must be provided"})  //Error occurs when provided token is null
  })


  test('DELETE by id, valid token but wrong user, expect 401', async () => {
    const countBeforeDelete = await getAllBlogs()

    //Check that deletedTestPost is actually added in first place
    expect(countBeforeDelete).toContainEqual(formatBlog(deletedTestPost))
    // responseGet = await api.get(`/api/blogs/${deletedTestPost._id}`)
    // console.log(responseGet);
    response = await api
      .delete(`/api/blogs/${deletedTestPost._id}`)
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkRldkRlbGw4NiIsImlkIjoiNWI2ODYyYWVhNDFmZjIyNjk2ZTc1ODRiIiwiaWF0IjoxNTMzNjI4NjA0fQ.nn3zGMPBA-KQiky3koQpmhdiGhw0qO_oVZl0kAtJ81A')
      .expect(401)

    const countAfterDelete = await getAllBlogs()

    expect(countAfterDelete).toContainEqual(formatBlog(deletedTestPost))
    expect(countAfterDelete.length).toBe(countBeforeDelete.length)
    expect(response.body).toEqual({ error: "not authorized!" })
  })


  test('DELETE by id, valid token and right user, and returns 204', async () => {
    const countBeforeDelete = await getAllBlogs()

    //const testUsers = await usersInDb()
    //console.log(testUsers);
    //Login part BEGINS
    //Yeah, kinda ugly right?
    const {isAdult, name, blogs, ...userToTest} = initTestUSers[0]
    // console.log(initTestUSers);
    // console.log(userToTest);
    //response format {token: xxx, username: xxx, name: xxx}
    tokenResponse = await api
      .post('/api/login')
      .send(userToTest)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(tokenResponse.body.token).not.toBe(null)
    console.log(tokenResponse.body.token);
    //Login part ENDS

    //Check that deletedTestPost is actually added in first place
    expect(countBeforeDelete).toContainEqual(formatBlog(deletedTestPost))

    await api
      .delete(`/api/blogs/${deletedTestPost._id}`)
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)
      .expect(204)

    const countAfterDelete = await getAllBlogs()

    expect(countAfterDelete).not.toContainEqual(deletedTestPost)
    expect(countAfterDelete.length).toBe(countBeforeDelete.length - 1)
  })

}) //End of describe DELETE tests

describe('UPDATE tests', async () => {

  // NOTE Deprecated test, doesn't work with current put implementation
  test.skip('UPDATE by id, check for status 200 and compare update', async () => {

    const countBeforeUpdate = await getAllBlogs()

    //spread syntax for copy (so we don't modify original data)
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

  test('UPDATE by id, check for status 200 and compare update', async () => {

    const countBeforeUpdate = await getAllBlogs()

    const response = await api
      .put(`/api/blogs/${countBeforeUpdate[0].id}`)
      // .send(likedPost)
      .expect(200)

    const countAfterUpdate = await getAllBlogs()

    expect(countAfterUpdate[0].likes).toBe(countBeforeUpdate[0].likes + 1)

  })

}) //End of describe UPDATE tests

}) //End of describe API tests

describe('/api/users tests', async () => {

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

afterAll(() => {
  server.close()
})
