import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import NotFoundPage from '../../NotFoundPage'
import EditCourseForm from '../../forms/EditCourseForm'
import { withRouter } from 'react-router-dom'
import { editCourse } from '../../../actions/administratorActions'
import ErrorBoundary from '../../ErrorBoundary'

const EditCourse = ({course, courses, periods, rooms, users, handleSubmit}) => {
  if (!isLoaded(course) || !isLoaded(courses) || !courses || !isLoaded(periods) || !isLoaded(rooms) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  if (!course) {
    return <NotFoundPage/>
  }
  return (<div>
    <h3>Edit Course</h3>
    <div className="divider"/>
    <div className="mt-1">
    <ErrorBoundary>
    <EditCourseForm course={course} onSubmit={handleSubmit}/>
    </ErrorBoundary>
    </div>
  </div>)
}

const enhance = compose(
  withRouter,
  firestoreConnect(props => [{
    collection: 'courses',
  }, {
    collection: 'periods',
  }, {
    collection: 'rooms',
  }, {
    collection: 'userPreset',
  }, {
    collection: 'courses',
    doc: props.match.params.id,
    storeAs: `course${props.match.params.id}`
  }]),
  connect((state, props) => ({
    courses: state.firestore.data.courses,
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    users: state.firestore.data.userPreset,
    course: state.firestore.data[`course${props.match.params.id}`],
  }), (dispatch, props) => ({
    handleSubmit: (values) => dispatch(editCourse(props.match.params.id, values))
  }))
)

export default enhance(EditCourse)