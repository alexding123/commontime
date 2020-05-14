import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import AddCourseForm from '../../forms/AddCourseForm'

const AddCourse = ({courses, periods, rooms, users}) => {
  if (!isLoaded(courses) || !courses || !isLoaded(periods) || !isLoaded(rooms) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  return (<div>
    <h3>Add a Course</h3>
    <div className="divider"/>
    <div>
      <AddCourseForm/>
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

export default enhance(AddCourse)