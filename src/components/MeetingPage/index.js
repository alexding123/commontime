import React, { lazy } from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'recompose'
import { scheduleMeetingSetupSaved } from '../../actions/meetingPageActions'
import ErrorBoundary from '../ErrorBoundary'
import PropTypes from 'prop-types'

const DisplayPage = lazy(() => import('./DisplayPage'))
const BookOneOffPage = lazy(() => import('./BookOneOffPage'))
const BookRecurringPage = lazy(() => import('./BookRecurringPage'))
const ScheduleMeetingSetupForm = lazy(() => import('../forms/ScheduleMeetingSetupForm'))

/**
 * Page to allow the user to book meetings and
 * find common periods shared by a group of people
 */
const MeetingPage = ({stage, handleSetupSubmit}) => {
  return (
    <div className="main">
      <h3>Schedule a Meeting</h3>
      <ErrorBoundary>
      {/** Decide what component to display based on the current stage */}

      {/** The form routes the user based on stage internally */}
      { !['DISPLAY', 'BOOK_ONEOFF', 'BOOK_RECURRING'].includes(stage) && <ScheduleMeetingSetupForm onSubmit={handleSetupSubmit}/>}
      { stage === 'DISPLAY' && <DisplayPage/> }
      { stage === 'BOOK_ONEOFF' && <BookOneOffPage/> }
      { stage === 'BOOK_RECURRING' && <BookRecurringPage/>}
      </ErrorBoundary>
    </div>
  )
}

MeetingPage.propTypes = {
  /** Current subpage to display */
  stage: PropTypes.string.isRequired,
  /** Handler of submitting the form defining the search parameters */
  handleSetupSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  firestoreConnect(() => [{
    collection: 'userPreset',
  }, {
    collection: 'periods',
  }, {
    collection: 'rooms',
  }, {
    collection: 'courses',
  }, {
    collection: 'recurrings',
  }, {
    collection: 'exceptions',
  }]),
  connect(state => ({
    stage: state.meetingPage.stage,
  }), dispatch => ({
    handleSetupSubmit: (values) => dispatch(scheduleMeetingSetupSaved(values)), 
  })), 
)

export default enhance(MeetingPage)