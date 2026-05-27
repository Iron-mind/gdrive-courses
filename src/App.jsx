import './App.css'
import CourseList from './components/courseCards'

function App({ courses }) {
  return (
    <>
      <div className="content-header">
        <h1>Courses</h1>
        <p className="content-subtitle">
          Selecciona una carpeta con videos para crear un curso local.
        </p>
      </div>
      <CourseList courses={courses} />
    </>
  )
}

export default App
