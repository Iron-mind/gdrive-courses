import { Link } from 'react-router-dom'

const CourseCard = ({ title, duration, image, videoCount }) => {
    return (
      <div className="course-card">
        <img src={image} alt={title} loading="lazy" />
        <div className="course-info">
          <h2>{title}</h2>
          <p>{videoCount} clases</p>
        </div>
        <p className="course-duration">{duration}</p>
      </div>
  )
}

const CourseList = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return <p>No hay cursos disponibles.</p>
  }
    return (
        <div className="course-list">
        {courses.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id}>
            <CourseCard
              title={course.title}
              duration={course.duration || 'Local'}
              image={course.image}
              videoCount={course.videos ? course.videos.length : 0}
            />
          </Link>
            ))}
        </div>
  )
}

export default CourseList