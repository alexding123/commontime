import React, { lazy } from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'recompose'
import { scheduleMeetingSetupSaved } from '../../actions/meetingPageActions'

const DisplayPage = lazy(() => import('./DisplayPage'))
const BookOneOffPage = lazy(() => import('./BookOneOffPage'))
const BookRecurringPage = lazy(() => import('./BookRecurringPage'))
const ScheduleMeetingSetupForm = lazy(() => import('../forms/ScheduleMeetingSetupForm'))

const MeetingPage = ({stage, handleSetupSubmit}) => {
  return (
    <div className="main">
      <h3>Schedule a Meeting</h3>
      { !['DISPLAY', 'BOOK_ONEOFF', 'BOOK_RECURRING'].includes(stage) && <ScheduleMeetingSetupForm onSubmit={handleSetupSubmit}/>}
      { stage === 'DISPLAY' && <DisplayPage/> }
      { stage === 'BOOK_ONEOFF' && <BookOneOffPage/> }
      { stage === 'BOOK_RECURRING' && <BookRecurringPage/>}
    </div>
  )
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
  }]),
  connect(state => ({
    stage: state.meetingPage.stage,
  }), dispatch => ({
    handleSetupSubmit: (values) => dispatch(scheduleMeetingSetupSaved(values)), 
  })), 
)

export default enhance(MeetingPage)