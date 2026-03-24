const Header = ( {name} ) => {
  return (
    <h1> {name} </h1>
  )
}

const Part = ( {part, exercise} ) => {
  return (
    <p>{part} {exercise}</p>
  )
}

const Content = (props) => {
  return (
    <div>
      {props.parts.map(part => <Part key={part.id} part={part.name} exercise={part.exercises} />)}
    </div>
  )
}

const Total = (props) => {
    const total = props.parts.reduce((previousValue, currentValue) => previousValue + currentValue.exercises, 0)
  return (
    <p>Number of exercises {total}</p>
  )
}

const Course = ({ course }) => {
    return (
        <div>
            {course.map(course =>
                <div key={course.id}>
                    <Header name={course.name} />
                    <Content parts={course.parts} />
                    <Total parts={course.parts} />
                </div>
            )}
        </div>
    )
}

export default Course