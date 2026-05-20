const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
} )

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const userId = request.user.id
  const user = await User.findById(userId)

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  blog.user = userId

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = request.user

  const blog = await Blog.findById(request.params.id)

  if (!blog || !blog.user) {
    return response.status(401).json({ error: 'only the creator can delete a blog' })
  }

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)

    // Remove the blog reference from the user's blogs array
    const blogUser = await User.findById(user.id)
    blogUser.blogs = blogUser.blogs.filter(
      blogId => blogId.toString() !== request.params.id.toString()
    )
    await blogUser.save()
  } else {
    return response.status(401).json({ error: 'only the creator can delete a blog' })
  }
  
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter