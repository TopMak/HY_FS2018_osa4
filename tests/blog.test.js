const listHelper = require('../utils/list_helper')
const { initBlogs } = require('./api_helper')


describe.skip('Individual blog tests', () => {

  test('dummy is called', () => {
    //const blogs = []

    const result = listHelper.dummy(initBlogs)
    expect(result).toBe(1)
  })

  describe('total likes check', () => {

    test('total like sum is correct', () => {
      expect(listHelper.totalLikes(initBlogs)).toBe(36)
    })

  })

  describe('favourite blog check', () => {

    test('favourite blog', () => {
      expect(listHelper.favoriteBlog(initBlogs)).toEqual(
        {
          title: "Canonical string reduction",
          author: "Edsger W. Dijkstra",
          likes: 12
        }
      )
    })

  })

  describe('blogger with most blogs', () => {

    test('blogger with most blogs ok', () => {
      expect(listHelper.mostBlogs(initBlogs)).toEqual(
        {
          author: "Robert C. Martin",
          blogs: 3
        }
      )
    })

  })


  describe('blogger with most likes', () => {

    test('blogger with most likes ok', () => {
      expect(listHelper.mostLikes(initBlogs)).toEqual(
        {
          author: "Edsger W. Dijkstra",
          likes: 17
        }
      )
    })
  })
})
