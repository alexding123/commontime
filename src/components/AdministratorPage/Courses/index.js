import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import CourseDisplay from './CourseDisplay'
import { Button, Card } from 'react-bootstrap'
import ErrorBoundary from '../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Subpage to list all the courses in the database
 */
const Courses = ({courses, periods, rooms, users}) => {
  if (!isLoaded(courses) || !isLoaded(periods) || !isLoaded(rooms) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  // needed to filter null values
  const filteredCourses = courses ? Object.entries(courses).filter(([key, course]) => course) : []
  return (<div>
    <h3>Courses</h3>
    <div className="divider"/>
    <Button href="/Administrator/AddCourse">Add Course</Button>
    <div className="mt-1">
      <ErrorBoundary>
      { filteredCourses.length ? 
        filteredCourses.map(([key, course]) => 
          <CourseDisplay key={key} id={key} course={course}/>
        ) :
        <Card>
          <Card.Body>
          <div>
            There is no course in the database. This shouldn't be the case.
          </div>
          <div>
            Try <Button variant="link" className="inline-link" href="/Administrator/Annual">uploading</Button> this year's schedule.
          </div>
          </Card.Body>
        </Card>
        }
      </ErrorBoundary>
    </div>
  </div>)
}

Courses.propTypes = {
  courses: PropTypes.object,
  periods: PropTypes.object,
  rooms: PropTypes.object,
  users: PropTypes.object,
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