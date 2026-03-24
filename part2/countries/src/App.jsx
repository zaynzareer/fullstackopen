import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const api_key = import.meta.env.VITE_Weather_key

const Countries = ({ countries, count, showView, weather }) => {
  if (count > 10) {
    return <p>Too many matches, specify another filter</p>
  }
  if (count === 1) {
    const tempCelsius = weather.temp !== null ? (weather.temp - 273.15).toFixed(1) : null
    return (
      <div>
        <h1>{countries[0].name.common}</h1>
        <p>Capital: {countries[0].capital ? countries[0].capital[0] : 'N/A'}</p>
        <p>Area: {countries[0].area}</p>
        <h2>Languages: </h2>
        <ul>
          {Object.values(countries[0].languages).map(language => (
            <li key={language}>{language}</li>
          ))}
        </ul>
        <img src={countries[0].flags.png} alt={`Flag of ${countries[0].name.common}`} />
        <h2>Weather in {countries[0].name.common}</h2>
        {weather.loading && <p>Loading weather...</p>}
        {!weather.loading && weather.temp !== null && (
          <>
            <p>Temperature: {tempCelsius} °C</p>
            <p>Wind speed: {weather.windSpeed} m/s</p>
          </>
        )}
        {!weather.loading && weather.temp === null && <p>Weather data unavailable</p>}
      </div>
    )
  }

  return (
    <div>
      {countries.map(country => (
        <div key={country.name.common}>
          <h2>{country.name.common}</h2>
          <button onClick={() => showView(country.name.common)}>Show</button>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [countries, setCountries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [count, setCount] = useState(0)
  const [weather, setWeather] = useState({ temp: null, windSpeed: null, loading: false })

  useEffect(() => {
    console.log('effect')
    axios
      .get(`https://restcountries.com/v3.1/name/${searchTerm}`)
      .then(response => {
        console.log('promise fulfilled', response.data)
        if (response.data.length > 10) {
          setCount(response.data.length)
          setCountries([])
          return
        }
        setCountries(response.data)
        console.log('countries: ', countries)
        console.log('count: ', response.data.length)
        setCount(response.data.length)
      })
      .catch (error => {
        console.log('Error fetching countries:', error)
      })
  }, [searchTerm])

  const showView = (countryName) => {
    setSearchTerm(countryName)
  }

  useEffect(() => {
    if (countries.length !== 1 || !countries[0].capital || !api_key) {
      setWeather({ temp: null, windSpeed: null, loading: false })
      return
    }

    const capital = countries[0].capital[0]
    setWeather(prev => ({ ...prev, loading: true }))

    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${api_key}`)
      .then(response => {
        setWeather({
          temp: response.data.main.temp,
          windSpeed: response.data.wind.speed,
          loading: false,
        })
      })
      .catch(error => {
        console.log('Error fetching weather:', error)
        setWeather({ temp: null, windSpeed: null, loading: false })
      })
  }, [countries])

  return (
    <>
      <span>Find Countries: </span>
      <input 
        value={searchTerm}
        onChange ={ (event) => setSearchTerm(event.target.value) }
      />
      <Countries countries={countries} count={count} showView={showView} weather={weather} /> 
    </>
  )
}

// Set the environment variable for the OpenWeather API key before running the development server.
// PowerShell:
// $env:VITE_Weather_key="your_openweather_api_key"; npm run dev
// cmd.exe:
// set "VITE_Weather_key=your_openweather_api_key" && npm run dev

export default App
