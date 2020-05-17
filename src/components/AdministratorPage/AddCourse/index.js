import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import AddCourseForm from '../../forms/AddCourseForm'
import { Alert } from 'react-bootstrap'
import { addCourse } from '../../../actions/administratorActions'
import ErrorBoundary from '../../ErrorBoundary'

const AddCourse = ({courses, periods, rooms, users, error, handleSubmit}) => {
  if (!isLoaded(courses) || !courses || !isLoaded(periods) || !isLoaded(rooms) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  courses = courses ? Object.values(courses).filter(course => course) : []
  return (<div>
    <h3>Add a Course</h3>
    <div className="divider"/>
    {error ? <Alert variant="danger">{error}</Alert> : null}
    <div>
      <ErrorBoundary>
      <AddCourseForm onSubmit={handleSubmit(courses)}/>
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
    error: state.administratorPage.addCourse,
  }), dispatch => ({
    handleSubmit: (courses) => (values) => dispatch(addCourse(courses, values))
  }))
)

export default enhance(AddCourse)