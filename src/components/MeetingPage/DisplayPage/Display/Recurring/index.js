import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { getCommonRecurringPeriods } from '../../../../../utils'
import SplashScreen from '../../../../SplashScreen'
import PeriodDisplay from './PeriodDisplay'
import PropTypes from 'prop-types'

/**
 * Component to display the search results for potential times of 
 * recurring meetings
 */
const Recurring = ({profile, courses, periods, recurrings, data}) => {
  if (!isLoaded(courses) || !isLoaded(periods) || !isLoaded(recurrings) | !isLoaded(profile) || !data) {
    return <SplashScreen/>
  }
  // get all periods with no class shared by all members
  const searchResults = getCommonRecurringPeriods(courses, recurrings, periods, data)
  // only teachers can have the option to override others' bookings
  const canRebook = !isEmpty(profile) && profile.token.claims.teacher ? data.allowRebook : false
  // get all free periods shared by members
  const freePeriods = canRebook ? searchResults : searchResults.filter(period => !period.conflicts.length)
  return freePeriods.length ? 
    <ListGroup>
      {
        freePeriods.map((period, index) => <PeriodDisplay key={index} period={period}/>)
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

Recurring.propTypes = {
  profile: PropTypes.object,
  courses: PropTypes.object,
  periods: PropTypes.object,
  recurrings: PropTypes.object,
  /** Values the user inputted in the search parameters form */
  data: PropTypes.shape({
    allowRebook: PropTypes.bool,
  }).isRequired
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