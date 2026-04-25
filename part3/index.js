const express = require('express')
const morgan = require('morgan')
const app = express()

require('dotenv').config()

app.use(express.static('dist'))

morgan.token('body', function (req, res) { return req.body ? JSON.stringify(req.body) : '' })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Person = require('./models/person')

app.use(express.json())


app.get('/', (request, response) => {
  response.send('<h1>Welcome to the Phonebook API</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    }
    else {
      response.status(404).end()
    }
  })
    .catch(error => next(error) )
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  })
    .catch(error => next(error) )
})


app.post('/api/persons', (request, response, next) => {

  const body = request.body

  if ( !body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error) )
})

app.put('/api/persons/:id', (request, response, next) => {

  const id = request.params.id
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(id, person, { new:true, runValidators: true })

    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error) )

})

app.get('/info', (request, response) => {
  const date = new Date()
  Person.countDocuments({}).then(count => {
    response.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
  })
})

//
// Middleware for handling unknown endpoints
//

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


//
// Middleware for handling errors
//

const errorhandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// This has to be the last loaded middleware.
// All the routes should be defined before this, otherwise it will not work as expected.
app.use(errorhandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})