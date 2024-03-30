import React from 'react';
import { COURSES } from '../main';


const CourseCard = ({ title, duration, image }) => {
    return (
			<div className="course-card">
				<img src={image} alt={title} />
				<div className="course-info">
					<h2>{title}</h2>
					
				</div>
                <p>{duration}</p>
			</div>
		);
};

const CourseList = ({courses}) => {
    return (
        <div className="course-list">
            {courses.map((course, index) => (
                <a href={"/courses/"+course.id} key={index}>
                    <CourseCard {...course} />
                </a>
            ))}
        </div>
    );
};

export default CourseList;