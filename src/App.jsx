import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CourseList from './components/courseCards'

function App({ courses}) {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Courses</h1>
        <div>
          <CourseList courses={courses}/>
        </div>
      </div>
    </>
  )
}

export default App
