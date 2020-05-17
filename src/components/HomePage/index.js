import React, { lazy } from 'react'
import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { getCurrentPeriod } from '../../utils'
import SplashScreen from '../SplashScreen'
import CurrentStatus from './CurrentStatus'
const FreeRooms = lazy(() => import('./FreeRooms'))
const Meetings = lazy(() => import('./Meetings'))

const HomePage = ({meta, periods}) => {
  if (!isLoaded(meta) || !meta.terms || !isLoaded(periods) || !periods) {
    return <SplashScreen/>
  }
  const currentDate = new Date()
  const currentPeriod = getCurrentPeriod(periods, meta.terms, currentDate)

  return (
    <div className="main">
      <h3>Home</h3>
      <CurrentStatus state={currentPeriod.state} period={currentPeriod.period} currentDate={currentDate}/>
      <Row className='d-flex flex-wrap pt-1'>
        
        <Col xs={12} sm={6}>
          
          { currentPeriod.period ? 
            <FreeRooms date={currentDate} period={currentPeriod.period}/> :
            null
          }
        </Col>
        <Col className="ml-auto" xs={12} sm={6}>
          { currentPeriod.period ?
            <Meetings date={currentDate} period={currentPeriod.period}/> :
            null
          }
        </Col>
      </Row>
    </div>
  )
}

const enhance = compose(
  firestoreConnect([
    {
      collection: 'periods',
    },
    {
      collection: 'meta',
      doc: 'terms',
    },
    {
      collection: 'rooms',
    },
    {
      collection: 'users',
    },
  ]),
  connect(state => ({
    periods: state.firestore.data.periods,
    meta: state.firestore.data.meta,
  })),
)

export default enhance(HomePage)