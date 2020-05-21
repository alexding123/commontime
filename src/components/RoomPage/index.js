import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { push } from 'connected-react-router'
import React from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { withRouter } from 'react-router-dom'
import { compose, withProps } from 'recompose'
import { cancelBooking } from '../../actions/homeActions'
import { bookRoom, rebookRoom } from '../../actions/roomActions'
import NotFoundPage from '../NotFoundPage'
import SplashScreen from '../SplashScreen'
import { Box, Header } from './Box'
import ErrorBoundary from '../ErrorBoundary'

const date = require('date-and-time')

const RoomPage = ({rooms, periods, instances, exceptions, profile, roomID, users, startDate, endDate, redirect, handleBookInstance, handleRebookInstance, handleCancelInstance}) => {

  if (!isLoaded(profile) || !isLoaded(rooms) || !isLoaded(periods) || !isLoaded(instances) || !isLoaded(users) || !isLoaded(exceptions)) {
    return <SplashScreen/>
  }

  // if roomID doesn't exist
  if (!rooms[roomID]) {
    return <NotFoundPage/>
  }

  const room = rooms[roomID]
  const periodsArray = periods ? Object.values(periods) : []
  const instancesEntries = instances ? Object.entries(instances) : []
  const isTeacher = !isEmpty(profile) && (profile.token.claims.teacher || profile.token.claims.admin)
  
  return (
  <div className="main" style={{overflow: 'auto'}}>
    <div className="m-auto" style={{display: 'block', width: 900}}>
    <h3 style={{textAlign: 'center'}}>{room.name}</h3>
    <div className='d-flex align-items-center justify-content-center h5'>
      <Button variant="link" onClick={() => redirect(`/Room/${roomID}?date=${date.format(date.addDays(startDate, -7), 'MM/DD/YYYY')}`)}>
        <ArrowBackIcon/>
      </Button>
      {`${date.format(startDate, 'MMMM DD, YYYY')} - ${date.format(endDate, 'MMMM DD, YYYY')}`}
      <Button variant="link" onClick={() => redirect(`/Room/${roomID}?date=${date.format(date.addDays(startDate, 7), 'MM/DD/YYYY')}`)}>
        <ArrowForwardIcon/>
      </Button>
    </div>
    <ErrorBoundary>
    <div className="d-flex flex-row">
      { [1,2,3,4,5].map((day) => {
        const periodsOnDay = periodsArray.filter(period => period.day === day)
        periodsOnDay.sort((a, b) => (a.endTime < b.endTime) ? -1 : 1)
        return (<div className="d-flex flex-column" key={day}>
          <Header day={day}/>
          { periodsOnDay.map(period => {
              const periodID = `${period.day}-${period.period}`
              const filteredInstances = instancesEntries.filter(([key, instance]) => instance && instance.period === periodID)
              const instance = filteredInstances.length ? filteredInstances[0] : null
              return (
                <Box 
                  key={periodID} 
                  period={period} 
                  instance={instance ? instance[1] : null}
                  instanceID={instance ? instance[0] : null}
                  room={room} 
                  profile={profile}
                  users={users}
                  isTeacher={isTeacher} 
                  instanceDate={date.addDays(startDate, day-1)}
                  handleSubmit={handleBookInstance}  
                  handleReSubmit={handleRebookInstance}
                  handleCancel={handleCancelInstance}
                />)
            })
          }
        </div>)
      })}
    </div>
    </ErrorBoundary>
    </div>
  </div>
  )
}

const enhance = compose(
  withRouter,
  withProps(props => {
    const query = new URLSearchParams(props.location.search)
    let onDate = null
    if (!query.get('date') || isNaN(date.parse(query.get("date"), 'MM/DD/YYYY'))) {
      onDate = new Date(Date.now())
    } else {
      onDate = date.parse(query.get("date"), 'MM/DD/YYYY')
    }

    if (onDate.getDay() === 0) {
      onDate = date.addDays(onDate, 1)
    } else if (onDate.getDay() === 6) {
      onDate = date.addDays(onDate, 2)
    } else {
      onDate = date.addDays(onDate, -(onDate.getDay()-1))
    }

    onDate = date.parse(date.format(onDate, 'MM/DD/YYYY'), 'MM/DD/YYYY') // only get day
    return {
      startDate: onDate,
      endDate: date.addDays(onDate, 5),
    }
  }),
  firestoreConnect(props => [
    { collection: 'rooms' }, 
    { collection: 'periods' },
    { collection: 'userPreset' },
    { collection: 'exceptions' },
    {
      collectionGroup: 'instances',
      where: [
        ['startDate', '>=', props.startDate],
        ['startDate', '<=', props.endDate],
        ['room', '==', props.match.params.id],
      ],
      storeAs: `room${props.match.params.id}Instances`,
    },
  ]),
  connect((state, props) => ({
    rooms: state.firestore.data.rooms,
    roomID: props.match.params.id,
    instances: state.firestore.data[`room${props.match.params.id}Instances`],
    periods: state.firestore.data.periods,
    exceptions: state.firestore.data.exceptions,
    users: state.firestore.data.userPreset,
    profile: state.firebase.profile,
  }), dispatch => ({
    redirect: (path) => dispatch(push(path)),
    handleBookInstance: (period, d)  => (room) => (values) => dispatch(bookRoom(period, d, room, values)),
    handleRebookInstance: (instanceID) => (roomID, instance) => (values) => dispatch(rebookRoom(instance, instanceID, values)),
    handleCancelInstance: (instanceID) => dispatch(cancelBooking(instanceID))
  }))
)

export default enhance(RoomPage)