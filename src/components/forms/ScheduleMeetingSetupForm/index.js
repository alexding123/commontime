import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PeopleForm from './PeopleForm'
import { isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import FrequencyForm from './FrequencyForm'
import { pageSet } from '../../../actions/meetingPageActions'
import PeriodsForm from './PeriodsForm'
import { filterDuplicate } from '../../../utils'
import PropTypes from 'prop-types'

/**
 * Form to set the filters for finding available slots for a meeting
 */
const ScheduleMeetingSetupForm = ({stage, profile, users, periods, onSubmit, showDisplay}) => {
  if (!isLoaded(profile) || !isLoaded(users) || !isLoaded(periods)) {
    return <SplashScreen/>
  }

  // avoid duplicates
  const usersArray = users ? Object.values(users).filter(user => user) : []
  const defaultExcludePeriods = ['Before School', 'After School', 'Assembly', 'Recess', 'Lunch', 'Class Meetings']
  const allPeriods = periods ? filterDuplicate(Object.values(periods), 'period') : []
  const initPeriods = allPeriods.filter(period => !defaultExcludePeriods.includes(period.period))

  const initialValues = {
    people: [usersArray.filter(user => profile.id === user.id)[0]], 
    frequency: 'oneOff', 
    dateRange: {
      startDate: new Date(),
      endDate: new Date(),
    },
    periods: initPeriods,
    allowRebook: false,
  }

  // route to the appropriate form
  return (<div className="stage-container">
    {stage === 'PEOPLE' && <PeopleForm initialValues={initialValues}/>}
    {stage === 'FREQUENCY' && <FrequencyForm initialValues={initialValues}/>}
    {stage === 'PERIODS' && <PeriodsForm initialValues={initialValues} onSubmit={
      (values) => { 
        onSubmit(values)
        showDisplay()
      }
    }/>}
  </div>)
}

ScheduleMeetingSetupForm.propTypes = {
  /** The subpage of the form to display */
  stage: PropTypes.string.isRequired,
  profile: PropTypes.object,
  users: PropTypes.object,
  periods: PropTypes.object,
  /** Handler for form submission */
  onSubmit: PropTypes.func.isRequired,
  /** Handler to show the subpage that displays the search results */
  showDisplay: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    stage: state.meetingPage.stage,
    profile: state.firebase.profile,
    users: state.firestore.data.userPreset,
    periods: state.firestore.data.periods,
  }), dispatch => ({
    showDisplay: () => dispatch(pageSet('DISPLAY')),
  }))
)

export default enhance(ScheduleMeetingSetupForm)