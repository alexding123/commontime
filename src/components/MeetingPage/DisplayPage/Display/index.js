import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import OneOff from './OneOff'
import Recurring from './Recurring'
import PropTypes from 'prop-types'

/** 
 * Component to display the appropriate time slots available
 * given the search parameters
 */
const Display = ({frequency}) => {
  if (frequency === 'oneOff') {
    return <OneOff/>
  } else {
    return <Recurring/>
  }
}

Display.propTypes = {
  frequency: PropTypes.oneOf(['oneOff', 'recurring']).isRequired,
}

const enhance = compose(
  connect(state => ({
    frequency: state.meetingPage.frequency,
  })),
)

export default enhance(Display)