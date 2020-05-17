import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import CourseDisplay from './CourseDisplay'
import { Button } from 'react-bootstrap'
import ErrorBoundary from '../../ErrorBoundary'

const Courses = ({courses, periods, rooms, users}) => {
  if (!isLoaded(courses) || !courses || !isLoaded(periods) || !isLoaded(rooms) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  return (<div>
    <h3>Courses</h3>
    <div className="divider"/>
    <Button href="/Administrator/AddCourse">Add Course</Button>
    <div className="mt-1">
      <ErrorBoundary>
      { Object.entries(courses).filter(([key, course]) => course).map(([key, course]) => 
        <CourseDisplay key={key} id={key} course={course}/>
      )}
      </ErrorBoundary>
    </div>
  </div>)
}

const enhance = compose(
  firestoreConnect([{
    collection: 'courses',
  }, {
    collection: 'periods',
  }, {
    collection: 'rooms',
  }, {
    collection: 'userPreset',
  }]),
  connect((state) => ({
    courses: state.firestore.data.courses,
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    users: state.firestore.data.userPreset,
  }), dispatch => ({
  }))
)

export default enhance(Courses)