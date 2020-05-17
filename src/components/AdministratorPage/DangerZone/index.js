import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Alert } from 'react-bootstrap'

import PeriodsEditor from './PeriodsEditor'
import RoomsEditor from './RoomsEditor'
import ErrorBoundary from '../../ErrorBoundary'

const DangerZone = ({annualBoard}) => {
  return (<div className="main">
    <h3>Danger Zone</h3>
    <div className="divider"/>
    <Alert variant="danger">BE CAREFUL! The editors on this page control the website's underlying representation of the school's periods and rooms. One careless edit can break the system. If you do have to edit them (say, if the school revised its schedule, or if new rooms have been made), DO IT DURING SUMMER BREAK. Never change anything here while the system is under active use.</Alert>
    <hr/>
    <h5>Periods</h5>
    {annualBoard.periods.error ? 
      <Alert variant="danger">{annualBoard.periods.error}</Alert> : null
    }
    {annualBoard.periods.message ?
      <Alert variant="info">
        {annualBoard.periods.message}
      </Alert> : null
    }
    <ErrorBoundary>
    <PeriodsEditor/>
    </ErrorBoundary>
    <hr/>
    <h5>Rooms</h5>
    {annualBoard.rooms.error ? 
      <Alert variant="danger">{annualBoard.rooms.error}</Alert> : null
    }
    {annualBoard.rooms.message ?
      <Alert variant="info">
        {annualBoard.rooms.message}
      </Alert> : null
    }
    <ErrorBoundary>
    <RoomsEditor/>
    </ErrorBoundary>
  </div>)
}

const enhance = compose(
  connect((state) => ({
    annualBoard: state.administratorPage.annualBoard,
  }))
)

export default enhance(DangerZone)