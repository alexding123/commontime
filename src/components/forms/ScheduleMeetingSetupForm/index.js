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

const ScheduleMeetingSetupForm = ({stage, profile, users, periods, onSubmit, showDisplay}) => {
  if (!isLoaded(profile) || !isLoaded(users) || !isLoaded(periods)) {
    return <SplashScreen/>
  }
  const usersArray = users ? Object.values(users) : []
  const defaultExcludePeriods = ['Before School', 'After School', 'Assembly', 'Recess', 'Lunch', 'Class Meetings']
  periods = periods ? filterDuplicate(Object.values(periods), 'period') : []
  const initPeriods = periods.filter(period => !defaultExcludePeriods.includes(period.period))

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