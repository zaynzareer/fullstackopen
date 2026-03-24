import { useState,useEffect } from 'react'
import './App.css'
import axios from 'axios'
import personService from './services/persons.js'
import Notification from './components/Notification.jsx'

const PeopleForm = ({ newName, handleNameChange, newNumber, setNewNumber, addPerson }) => (
  <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={(event) => setNewNumber(event.target.value)} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Filter = ({ searchTerm, setSearchTerm }) => (
  <div>
    Filter shown with: <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
  </div>
)

const Person = ({ person, removePerson }) => (
  <li>
    {person.name} {person.number}
    <button onClick={() => removePerson(person.id)}>delete</button>
  </li>
)

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  useEffect(() => {
    console.log('effect')
    personService.getAll()
      .then(returnedPerson => {
        console.log('promise fulfilled')
        setPersons(returnedPerson)
      })
  }, [])

  console.log('render', persons.length, 'persons')

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()

    if (persons.some(person => person.name === newName)) {
      if (window.confirm(`${newName} is already in the phonebook, replace the old number with the new one ?`)) {
        const person = persons.find(p => p.name === newName)
        const updatedPerson = { ...person, number: newNumber }
        personService.update(person.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== person.id ? p : returnedPerson))
          })
          .catch(error => {
            setNotification(`Information of ${newName} has already been removed from server`)
            setNotificationType('error')
            setTimeout(() => {
              setNotification(null)
            }, 2000)
            setPersons(persons.filter(p => p.id !== person.id))
          })

        setNewName('')
        setNewNumber('')
        setNotification(`Updated ${newName}'s number`)
        setNotificationType('success')
        setTimeout(() => {
          setNotification(null)
        }, 2000)
        return
      }
      
    }

    personService
      .create({ name: newName, number: newNumber })
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
      .then(() => {
        setNotification(`Added ${newName}`)
        setNotificationType('success')
        setTimeout(() => {
          setNotification(null)
        }, 2000)
      })
  }

  const removePerson = (id) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      personService.remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
        })
        .catch(error => {
          setNotification('Person has already been removed from server')
          setNotificationType('error')
          setTimeout(() => {
            setNotification(null)
          }, 2000)
          setPersons(persons.filter(person => person.id !== id))
        })

        setNotification('Person deleted')
        setNotificationType('success')
        setTimeout(() => {
          setNotification(null)
        }, 2000)
    }
  }

  const filteredPersons = persons.filter(person => person.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} type={notificationType} />
      <Filter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <h2>Add a Person</h2>
      <PeopleForm 
        newName={newName} 
        handleNameChange={handleNameChange} 
        newNumber={newNumber} 
        setNewNumber={setNewNumber} 
        addPerson={addPerson} 
      />
      <h2>Numbers</h2>
      <ul>
        {filteredPersons.map(person => <Person key={person.name} person={person} removePerson={removePerson} />)}
      </ul>
    </div>
  )
}

export default App
