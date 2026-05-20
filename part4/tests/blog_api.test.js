const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')

const api = supertest(app)

const initialBlogs = helper.initialBlogs
let authToken

beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', name: 'Superuser', passwordHash })
        await user.save()

        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })
            .expect(200)

        authToken = loginResponse.body.token

        const blogObjects = initialBlogs.map(blog => new Blog(blog))
        const promiseArray = blogObjects.map(blog => blog.save())
        await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('unique identifier property of blog post is named id', async () => {
    const response = await api.get('/api/blogs');
    const blogs = response.body;

    assert.strictEqual(blogs.some(blog => blog.id), true);
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'This blog is added by test',
        author: 'Test User',
        url: 'http://example.com/test',
        likes: 0
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

    const contents = blogsAtEnd.map(b => b.title)

    assert.strictEqual(contents.includes('This blog is added by test'), true)
})

test('if likes property is missing, it defaults to 0', async () => {
    
    const newBlog ={
        title: 'Blog without likes',
        author: 'Test User',
        url: 'http://example.com/test'
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const addedBlog = blogsAtEnd.find(b => b.title === 'Blog without likes')
    assert.strictEqual(addedBlog.likes, 0)
})

test('blog without title or url is not added', async () => {
    
    const newBlog = {
        author: 'Test User',
        likes: 0
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(400)
})

test('a blog can be deleted', async () => {
    const newBlog = {
        title: 'Blog to delete',
        author: 'Test User',
        url: 'http://example.com/delete',
        likes: 1
    }

    const createdBlog = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)

    await api
        .delete(`/api/blogs/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

    const blogsAfterDeletion = await helper.blogsInDb()
    assert.strictEqual(blogsAfterDeletion.length, initialBlogs.length)
})

test('a blog can be updated', async () => {
    const response = await api.get('/api/blogs')
    const blogToUpdate = response.body[0]

    const updatedBlogData = {
        title: 'Updated Title',
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogData)
        .expect(200)
})

after(async () => {
  await mongoose.connection.close()
})