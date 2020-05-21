import React from 'react'
import { Alert, OverlayTrigger, Button, Popover } from 'react-bootstrap'

const popover = (exception) => (
  <Popover>
    <Popover.Title>Special Schedule</Popover.Title>
    <Popover.Content>
      <p className='pre-like m-0'>Summary: {exception.summary}</p>
      <p className='pre-like m-0'>Details: {exception.description}</p>
    </Popover.Content>
  </Popover>
)

const Exception = ({exception}) => {
  return (
    <Alert variant="danger">
    Today runs on a modified schedule. The system might not be accurate.&nbsp;
    <OverlayTrigger trigger='click' placement='top-start' overlay={popover(exception)}>
      <Button variant="link" className="inline-link">Details</Button>
    </OverlayTrigger>
    </Alert>
  )
}

export default Exception