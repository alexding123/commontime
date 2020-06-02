import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import date from 'date-and-time'
import React from 'react'
import { Badge, Button, OverlayTrigger } from 'react-bootstrap'
import { isEmpty } from 'react-redux-firebase'
import { shortenCourseName } from '../../utils'
import bookRoom from '../HomePage/FreeRooms/bookRoom'
import rebookRoom from '../HomePage/FreeRooms/rebookRoom'
import PropTypes from 'prop-types'

/**
 * Component to display a single period (box) on a schedule
 */
const Box = ({users, profile, period, instance, instanceID, room, isTeacher, handleSubmit, handleReSubmit, handleCancel, instanceDate}) => {
  // if the period is a normal Period or a special period 
  // (assembly, recess, etc.)
  const isClass = period.name.startsWith('Period ')
  const className = 'd-flex flex-column align-items-center justify-content-center box ' +
    (isClass ? 'box-normal' : 'box-special')
  const startTime = date.parse(period.startTime, 'HH:mm')
  const endTime = date.parse(period.endTime, 'HH:mm')
  // +5 to account for the associated 5 minute break after
  const duration = date.subtract(endTime, startTime).toMinutes() + 5
  // height of block scales with period duration
  const height = duration * 1.5
  let creator = instance && users ? Object.values(users).filter(user => user && user.id === instance.creator)[0] : null
  creator = creator ? creator : { name: 'Loading' }
  return (
  <div className={className} style={{height: `${height}px`}}>
    <div>
    <div className='box-bottom left'>
      <span>{period.name}</span>
    </div>
    <div className='box-bottom right'>
      <span>{date.format(startTime, 'HH:mm')}</span> - <span>{date.format(endTime, 'HH:mm')}</span>
    </div>
    <div>
      <span>
      { instance ? 
        ( instance.type === 'event' ? 
          ( instance.creator && instance.creator === profile.id ?
            <div className='d-flex justify-content-center'>
              {/** Only the creator of the event can delete */}
              {`${instance.name} - ${creator.name}`}
              <Button variant="link" className="p-0 d-flex-inline justify-content-center align-items-center" onClick={() => handleCancel(instanceID)}>     
                <DeleteOutlineIcon/>
              </Button>
            </div> :
            ( isTeacher ?
              <div className='d-flex justify-content-center'>
                {/** A teacher may override the booking */}
                <OverlayTrigger
                  rootClose={true}
                  overlay={rebookRoom(room, instance, handleReSubmit(instanceID))}
                  trigger='click'
                >
                  <Button variant='link' className='p-0 d-flex-inline justify-content-center align-items-center'>
                    { instance.private ? 
                      <div>
                      <Badge variant="info">Private</Badge>{` - ${creator.name}`}
                      </div> :
                      `${instance.name} - ${creator.name}`}
                  </Button>
                </OverlayTrigger>
                <Button variant="link" className="p-0 d-flex-inline justify-content-center align-items-center" onClick={() => handleCancel(instanceID)}>     
                  <DeleteOutlineIcon/>
                </Button>
              </div> :
              <div className='d-flex justify-content-center'>
                { 
                  instance.private ? 
                  <div>
                  <Badge variant="info">Private</Badge>{` - ${creator.name}`}
                  </div> :
                  `${instance.name} - ${creator.name}`
                }
              </div>
            )
          ) :
          shortenCourseName(instance.name)
        ) : 
        ( !isEmpty(profile) ?
          <OverlayTrigger
            rootClose={true}
            overlay={bookRoom(room, isTeacher, handleSubmit(period, instanceDate))}
            trigger='click'
          >
            <Button variant='link' className='center-button'>
              Free
            </Button>
          </OverlayTrigger> :
          <div className='center-button'>Free</div>
        )
      }
      </span>
    </div>
    </div>
  </div>
  )
}

Box.propTypes = {
  users: PropTypes.object,
  profile: PropTypes.object,
  /** The displayed period */
  period: PropTypes.shape({
    name: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
  }).isRequired,
  /** Optional meeting/class in the period */
  instance: PropTypes.shape({
    creator: PropTypes.string,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    private: PropTypes.bool,
  }),
  /** ID of the optional meeting/class */
  instanceID: PropTypes.string,
  /** The room this schedule is for */
  room: PropTypes.object.isRequired,
  /** Whether the current user is a teacher */
  isTeacher: PropTypes.bool.isRequired,
  /** Handler of adding a new meeting in this room */
  handleSubmit: PropTypes.func.isRequired,
  /** Handler of overriding a current booking in this room */
  handleReSubmit: PropTypes.func.isRequired,
  /** Handler of deleting a current meeting */
  handleCancel: PropTypes.func.isRequired,
  /** Date of this period */
  instanceDate: PropTypes.objectOf(Date).isRequired,
}

/**
 * Component that shows a header to a column on the schedule
 */
const Header = ({day}) => {
  const daysMap = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return (<div className='d-flex flex-column align-items-center justify-content-center box box-special' style={{height: `30px`}}>
    <div>
      <span>{daysMap[day]}</span>
    </div>
  </div>)
}

Header.propTypes = {
  day: PropTypes.number.isRequired,
}

export { Box, Header }
