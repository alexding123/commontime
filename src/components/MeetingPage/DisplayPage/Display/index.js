import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import OneOff from './OneOff'
import Recurring from './Recurring'

const Display = ({frequency}) => {
  if (frequency === 'oneOff') {
    return <OneOff/>
  } else {
    return <Recurring/>
  }
}

const enhance = compose(
  connect(state => ({
    frequency: state.meetingPage.frequency,
  })),
)

export default enhance(Display)