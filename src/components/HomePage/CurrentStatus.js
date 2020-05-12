import React from 'react'
import { getCurrentStatus } from '../../utils'
import { compose } from 'recompose'

const CurrentStatus = ({state, period, currentDate}) => {
  const statement = getCurrentStatus(state, period, currentDate)
 
  return (
    <div>
      {statement}
    </div>
  )
}

const enhance = compose(
)

export default enhance(CurrentStatus)