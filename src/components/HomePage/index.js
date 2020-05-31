import React, { lazy } from 'react'
import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import date from 'date-and-time'
import { getCurrentPeriod } from '../../utils'
import SplashScreen from '../SplashScreen'
import CurrentStatus from './CurrentStatus'
import ErrorBoundary from '../ErrorBoundary'
import Footer from './Footer'
import PropTypes from 'prop-types'
const FreeRooms = lazy(() => import('./FreeRooms'))
const Meetings = lazy(() => import('./Meetings'))
const Exception = lazy(() => import('./Exception'))

/**
 * Page to show the current period, lunch and after school meetings
 * of the day, and free rooms this period
 */
const HomePage = ({meta, periods, rooms, users, exception}) => {
  if (!isLoaded(meta) || !meta.terms || !isLoaded(periods) || !periods || !isLoaded(rooms) || !rooms || !isLoaded(users) || !isLoaded(exception)) {
    return <SplashScreen/>
  }
  // find out what period "now" is
  const currentDate = new Date(2020, 4, 12, 8, 30)
  const currentDateStr = date.format(currentDate, 'MM/DD/YYYY')
  const currentPeriod = getCurrentPeriod(periods, meta.terms, currentDate)

  return (
    <div className="main home-main">
      <div>
      <h3>Home</h3>
      <ErrorBoundary>
        { isEmpty(exception) ? null : <Exception exception={exception}/>}
      </ErrorBoundary>
      <ErrorBoundary>
      <CurrentStatus state={currentPeriod.state} period={currentPeriod.period} currentDate={currentDate}/>
      </ErrorBoundary>
      <Row className='d-flex flex-wrap pt-1'>
        
        <Col xs={12} sm={6}>
          <ErrorBoundary>
          { currentPeriod.period ? 
            <FreeRooms date={currentDateStr} period={currentPeriod.period}/> :
            null
          }
          </ErrorBoundary>
        </Col>
        <Col className="ml-auto" xs={12} sm={6}>
          <ErrorBoundary>
          { currentPeriod.period ?
            <Meetings date={currentDateStr} period={currentPeriod.period}/> :
            null
          }
          </ErrorBoundary>
        </Col>
      </Row>
      </div>
      <Footer/>
    </div>
  )
}

HomePage.propTypes = {
  meta: PropTypes.object,
  periods: PropTypes.object,
  rooms: PropTypes.object,
  users: PropTypes.object,
  exception: PropTypes.object,
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
      collection: 'userPreset',
    },
    {
      collection: 'exceptions',
    },
    {
      collection: 'exceptions',
      doc: date.format(new Date(), 'MM-DD-YYYY'),
      storeAs: 'exceptionToday',
    }
  ]),
  connect(state => ({
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    meta: state.firestore.data.meta,
    users: state.firestore.data.userPreset,
    exception: state.firestore.data.exceptionToday,
  })),
)

export default enhance(HomePage)