import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'
import ErrorBoundary from '../../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Sort an array of weekly meetings from earliest to latest
 * @param {Object[]} recurrings Array of recurring meetings to sort
 * @param {Object[]} periods All possible periods
 */
const sortRecurrings = (recurrings, periods) => {
  recurrings.sort((a, b) => {
    const periodA = periods[a.period]
    const periodB = periods[b.period]
    if (periodA.day < periodB.day) {
      return -1
    } else if (periodA.day === periodB.day) {
      if (periodA.startTime < periodB.startTime) {
        return -1
      } else if (periodA.startTime === periodB.startTime) {
        return 0
      } else {
        return 1
      }
    } else {
      return 1
    }
  })
  return recurrings
}

/** 
 * Component to display the recurring meetings the user is in 
 */
const RecurringDisplay = ({recurrings, periods}) => {
  if (!isLoaded(recurrings)) {
    return <SplashScreen/>
  }
  // if not in any meeting, say so
  if (!recurrings) {
    return <div className="mt-2">
      <p>You are not part of any recurring meeting.</p>
    </div>
  }
  const filteredRecurrings = Object.entries(recurrings).filter(([key, recurring]) => recurring).map(([key, recurring]) => ({
    key,
    ...recurring,
  }))

  const sortedRecurrings = sortRecurrings(filteredRecurrings, periods)
  return (<div className="mt-2">
    <ErrorBoundary>
    { sortedRecurrings.map(recurring => 
      <InstanceDisplay recurring={recurring} recurringID={recurring.key} key={recurring.key}/>
    )}
    </ErrorBoundary>
  </div>)
}

RecurringDisplay.propTypes = {
  recurrings: PropTypes.object,
  periods: PropTypes.object,
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'recurrings',
    where: [
      ['members', 'array-contains', props.userId],
    ],
  }]),
  connect(state => ({
    recurrings: state.firestore.data.recurrings,
    periods: state.firestore.data.periods,
  })),
)

export default enhance(RecurringDisplay)