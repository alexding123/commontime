import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import date from 'date-and-time'
import React from 'react'
import { Badge, Button, OverlayTrigger } from 'react-bootstrap'
import { isEmpty } from 'react-redux-firebase'
import { shortenCourseName } from '../../utils'
import bookRoom from '../HomePage/FreeRooms/bookRoom'
import rebookRoom from '../HomePage/FreeRooms/rebookRoom'


const Box = ({users, profile, period, instance, instanceID, room, isTeacher, handleSubmit, handleReSubmit, handleCancel, instanceDate}) => {
  const isClass = period.name.startsWith('Period ')
  const className = 'd-flex flex-column align-items-center justify-content-center box ' +
    (isClass ? 'box-normal' : 'box-special')
  const startTime = date.parse(period.startTime, 'HH:mm')
  const endTime = date.parse(period.endTime, 'HH:mm')
  const duration = date.subtract(endTime, startTime).toMinutes() + 5
  const height = duration * 1.5
  let creator = instance ? Object.values(users).filter(user => user && user.id === instance.creator)[0] : null
  creator = creator ? creator : { displayName: 'Loading' }
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
              {`${instance.name} - ${creator.displayName}`}
              <Button variant="link" className="p-0 d-flex-inline justify-content-center align-items-center" onClick={() => handleCancel(instanceID)}>     
                <DeleteOutlineIcon/>
              </Button>
            </div> :
            ( isTeacher ?
              <div className='d-flex justify-content-center'>
                <OverlayTrigger
                  rootClose={true}
                  overlay={rebookRoom(room, instance, handleReSubmit(instanceID))}
                  trigger='click'
                >
                  <Button variant='link' className='p-0 d-flex-inline justify-content-center align-items-center'>
                    { instance.private ? 
                      <div>
                      <Badge variant="info">Private</Badge>{` - ${creator.displayName}`}
                      </div> :
                      `${instance.name} - ${creator.displayName}`}
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
                  <Badge variant="info">Private</Badge>{` - ${creator.displayName}`}
                  </div> :
                  `${instance.name} - ${creator.displayName}`
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
            <Button variant='link' className='p-0 d-flex justify-content-center align-items-center'>
              Free
            </Button>
          </OverlayTrigger> :
          <div className='p-0 d-flex justify-content-center align-items-center'>Free</div>
        )
      }
      </span>
    </div>
    </div>
  </div>
  )
}

const Header = ({day}) => {
  const daysMap = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return (<div className='d-flex flex-column align-items-center justify-content-center box box-special' style={{height: `30px`}}>
    <div>
      <span>{daysMap[day]}</span>
    </div>
  </div>)
}

export { Box, Header }
