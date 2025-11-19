import { useState } from 'react'
import './App.css'

const Button = (props) => {
  return (
    <button onClick={props.onClick}>
      {props.text}
    </button>
  )
}

const StatisticsLine = ({text, value}) => {
  return (
    <>
      <td>{text}</td>
      <td>{value}</td>
    </>
  )
}

const Statistics = ({good, neutral, bad}) => {

  const all = good + neutral + bad
  const average = (good - bad) / all
  const positive = (good / all) * 100

  if (all == 0) {
    return (
      <div>
        <h2>Statistics</h2>
        <div>No feedback given</div>
      </div>
    )
  }
  return (
    <div>
      <h2>Statistics</h2>
      <table>
        <tbody>
          <tr>
            <StatisticsLine text="good" value={good} />
          </tr>
          <tr>
            <StatisticsLine text="neutral" value={neutral} />
          </tr>
          <tr>
            <StatisticsLine text="bad" value={bad} />
          </tr>
          <tr>
            <StatisticsLine text="all" value={all} />
          </tr>
          <tr>
            <StatisticsLine text="average" value={average} />
          </tr>
          <tr>
            <StatisticsLine text="positive" value={positive + " %"} />
          </tr>
        </tbody>
      </table>
    </div>
  )
}


const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h2>give feedback</h2>
      <Button onClick={ () => setGood(good + 1) } text="good" />
      <Button onClick={ () => setNeutral(neutral + 1)} text="neutral" />
      <Button onClick={ () => setBad(bad + 1)} text="bad" />

      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App
