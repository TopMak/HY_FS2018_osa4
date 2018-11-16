const Blog = require('../models/blog')
const User = require('../models/user')

const initTestBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
    user: "5b69aa87cdbd893f162bb21c",
    comments:["testComment1", "TestComment2"]
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
    user: "5b69aa87cdbd893f162bb21c",
    comments:["testComment1", "TestComment2"]
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
    user: "5b69aa87cdbd893f162bb21c",
    comments:["testComment1", "TestComment2"]
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
    user: "5b69aa88cdbd893f162bb21d",
    comments:["testComment1", "TestComment2"]
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
    user: "5b69aa88cdbd893f162bb21d",
    comments:["testComment1", "TestComment2"]
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
    user: "5b69aa88cdbd893f162bb21d",
    comments:["testComment1", "TestComment2"]
  }
]

// const initTestBlogs = [
//   {
//     _id: "5a422b3a1b54a676234d17f9",
//     title: "Opi kaikki Reactista",
//     author: "Teppo Testaaja",
//     url: "https://opikaikkireactista.com/",
//     likes: 25,
//     user: "5b69aa87cdbd893f162bb21c"
//   },
//   {
//     _id: "5a422b891b54a676234d17fa",
//     title: "Lisää Reactia",
//     author: "Teppo Testaaja",
//     url: "https://lisaareactia.com/",
//     likes: 35,
//     user: "5b69aa87cdbd893f162bb21c"
//   },
//   {
//     _id: "5a422ba71b54a676234d17fb",
//     title: "Parempaa koodia",
//     author: "Roni Ropaaja",
//     url: "https://hyvaakoodia.com/",
//     likes: 66,
//     user:"5b69aa88cdbd893f162bb21d"
//   },
//   {
//     _id: "5a422bc61b54a676234d17fc",
//     title: "Parempaa koodia - osa 2: superhyvää koodia",
//     author: "Roni Ropaaja",
//     url: "https://superkoodia.com/",
//     likes: 66,
//     user:"5b69aa88cdbd893f162bb21d"
//   },
// ]

const initTestUSers = [
  {
    id:"5b69aa87cdbd893f162bb21c",
    username:"TepTest66",
    name: "Teppo Testaaja",
    isAdult: true,
    password: "TepinHuonoSalasana123#",
    blogs: ["5a422a851b54a676234d17f7", "5a422aa71b54a676234d17f8", "5a422b3a1b54a676234d17f9"]

  },
  {
    id:"5b69aa88cdbd893f162bb21d",
    username:"Roro02",
    name: "Roni Ropaaja",
    isAdult: false,
    password: "RoroYoyoHoho02#!",
    blogs: ["5a422b891b54a676234d17fa", "5a422ba71b54a676234d17fb", "5a422bc61b54a676234d17fc"]
  }
]

const newBlogPost = {
  title: "Javascript Fatigue",
  author: "Eric Clemmons",
  url: "https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4",
  likes: 0,
  comments: []
}

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog.id.toString(),   //Otherwise id check fails
    user: blog.user.toString(),
    comments: blog.comments.toObject()
  }
}

const formatUser= (blog) => {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    isAdult: user.isAdult,
    passwordHash: user.passwordHash,
    blogs: user.blogs
  }
}

const nonExistingId = async () => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const getAllBlogs = async () => {
  const blogs = await Blog.find({})
  return blogs.map(formatBlog)
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(User.format)
}

// const logInTestUser = async (testUser) => {
//   response = await api
//     .post('/api/login')
//     .send(testUser)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
//
//   return response
// }

module.exports = {
  initTestBlogs,
  getAllBlogs,
  formatBlog,
  nonExistingId,
  newBlogPost,
  initTestUSers,
  usersInDb
}
