const dummy = (blogs) => {
  // ...
  return 1
}

const totalLikes = (blogs) => {

  let initVal = 0 //Must provide init value when summing values in objects!!
  return blogs.reduce( (acc, blog) => acc + blog.likes, initVal )

}

const favoriteBlog = (blogs) => {

  let initVal = {"likes" : 0}

  return blogs.reduce( (blogWithMostLikes, blog) => {
    //console.log(blogWithMostLikes)
    if(blogWithMostLikes.likes < blog.likes){
      //Desctructor to remove some unnecessary values
      ({_id, url, __v, ...cleanBlog} = blog)
      blogWithMostLikes = cleanBlog
    }
    return blogWithMostLikes

  }, {"likes" : 0})

}

const mostBlogs = (blogs) => {

bloggerWithMostBlogs = blogs.reduce( (bloggersAndPosts, blog) =>{

  //Using filter, but doesn't return index...
  //let isBloggerOnList = bloggersAndPosts.filter( blogger => (blogger.author == blog.author) )
  //if(isBloggerOnList.length == 0){

  let bloggerOnList = bloggersAndPosts.findIndex(blogger => blogger.author == blog.author)

  if(bloggerOnList === -1){
    //Index not found, add blogger to array
    bloggersAndPosts.push({
      "author" : blog.author,
      "blogs" : 1
    })
    //console.log("blogger added")
  }
  else {
    //blogger is on the list, add blogs by 1
    bloggersAndPosts[bloggerOnList].blogs += 1
    //console.log("blogger's post count added'")
  }

  return bloggersAndPosts

}, [])

//returns the first blogger and blog count that has the highest blog count
return bloggerWithMostBlogs.reduce( (max, x) => x.blogs > max.blogs ? x : max)

}

const mostLikes = (blogs) => {
  //similar approach as in mostBlogs, now with likes
  bloggerMostLikes = blogs.reduce( (bloggersAndLikes, blog) =>{

    let bloggerOnList = bloggersAndLikes.findIndex(blogger => blogger.author == blog.author)

    if(bloggerOnList === -1){
      //Index not found, add blogger to array
      bloggersAndLikes.push({
        "author" : blog.author,
        "likes" : blog.likes
      })
    }
    else {

      bloggersAndLikes[bloggerOnList].likes += blog.likes

    }

    return bloggersAndLikes

}, [])
  //returns the first blogger and like count that has the highest like count
  return bloggerMostLikes.reduce( (max, x) => x.likes > max.likes ? x : max)

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
