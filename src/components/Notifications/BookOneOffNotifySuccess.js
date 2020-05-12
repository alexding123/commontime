import dateLib from 'date-and-time'
import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { notificationClosed } from '../../actions/notificationsActions'
import { dayMap } from '../../utils'
import SplashScreen from '../SplashScreen'

const BookOneOffNotifySuccess = ({data: {useCustomRoom, customRoomName, room, period, name, date, people}, periods, rooms, users, closeNotification}) => {
  if (!isLoaded(periods) || !isLoaded(rooms) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  const dateObj = dateLib.parse(date, 'MM/DD/YYYY')
  const usersObj = Object.values(users)
  const periodObj = periods[period]
  const peopleNames = people.map(person => usersObj.filter(user => user.id === person)[0].name)
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>You have successfully booked a meeting</h5>
        <p>You have booked a meeting with&nbsp;
          {
            peopleNames.join(", ")
          }
          {
            useCustomRoom ?
            ( customRoomName ? 
              ` at ${customRoomName}` :
              ''
            ) :
            <React.Fragment>
              &nbsp;at&nbsp;
              <Button className="inline-link" variant="link" href={`Room/${room}`}>
                {rooms[room].name}
              </Button>
            </React.Fragment>
          
          }
          &nbsp;on {`${dayMap[periodObj.day]} ${periodObj.name}, ${dateLib.format(dateObj, 'MMMM DD')}, for ${name}.`}
        </p>
        <p>An event will be created on all participants' Google Calendars to mark this booking. An email has been sent to every other person notifying them of the meeting.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeNotification}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

const enhance = compose(
  firestoreConnect([{
    collection: 'periods',
  }, {
    collection: 'rooms',
  }, {
    collection: 'userPreset'
  }]),
  connect(state => ({
    data: state.notifications.data,
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    users: state.firestore.data.userPreset,
  }), dispatch => ({
    closeNotification: () => dispatch(notificationClosed()),
  }))
)

export default enhance(BookOneOffNotifySuccess)