import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { getCommonRecurringPeriods } from '../../../../../utils'
import SplashScreen from '../../../../SplashScreen'
import PeriodDisplay from './PeriodDisplay'


const Recurring = ({profile, courses, periods, recurrings, data}) => {
  if (!isLoaded(courses) || !isLoaded(periods) || !isLoaded(recurrings) | !isLoaded(profile) || !data) {
    return <SplashScreen/>
  }
  const freePeriods = getCommonRecurringPeriods(courses, recurrings, periods, data)
  const canRebook = !isEmpty(profile) && profile.token.claims.teacher ? data.allowRebook : false
  const filteredPeriods = canRebook ? freePeriods : freePeriods.filter(period => !period.conflicts.length)
  return filteredPeriods.length ? 
    <ListGroup>
      {
        filteredPeriods.map((period, index) => <PeriodDisplay key={index} period={period}/>)
      }
    </ListGroup> :
    <ListGroup>
      <ListGroup.Item className="d-flex flex-column justify-content-center align-items-center p-3">
        <div>
          No match
        </div>
        <div>
          <small>Try changing your filter settings</small>
        </div>
      </ListGroup.Item>
    </ListGroup>
}

const enhance = compose(
  connect(state => ({
    data: state.meetingPage,
    courses: state.firestore.data.courses,
    periods: state.firestore.data.periods,
    recurrings: state.firestore.data.recurrings,
    profile: state.firebase.profile,
  })),
)

export default enhance(Recurring)