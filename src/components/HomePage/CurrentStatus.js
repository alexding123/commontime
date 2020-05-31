import React from 'react'
import { getCurrentStatus } from '../../utils'
import { compose } from 'recompose'
import PropTypes from 'prop-types'

/**
 * Component that shows the current period/time "now" is
 */
const CurrentStatus = ({state, period, currentDate}) => {
  const statement = getCurrentStatus(state, period, currentDate)
  return (
    <div>
      {statement}
    </div>
  )
}

CurrentStatus.propTypes = {
  /** The kind of situation now is (summer? before school? etc.) */
  state: PropTypes.string.isRequired,
  /** Current period (optional) */
  period: PropTypes.object,
  /** Time right now */
  currentDate: PropTypes.objectOf(Date).isRequired,
}

const enhance = compose(
)

export default enhance(CurrentStatus)