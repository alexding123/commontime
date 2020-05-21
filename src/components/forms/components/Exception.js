import React from 'react'
import { Alert, OverlayTrigger, Button, Popover } from 'react-bootstrap'
import date from 'date-and-time'

const popover = (exception) => (
  <Popover>
    <Popover.Title>Special Schedule on {date.format(date.parse(exception.date, 'MM/DD/YYYY'), 'MMMM DD, YYYY')}</Popover.Title>
    <Popover.Content>
      <p className='pre-like m-0'>Summary: {exception.summary}</p>
      <p className='pre-like m-0'>Details: {exception.description}</p>
    </Popover.Content>
  </Popover>
)

const Exception = ({exception}) => {
  return (
    <Alert variant="danger">
    This day runs on a modified schedule. The booking might not be accurate.&nbsp;
    <OverlayTrigger trigger='click' placement='top-start' overlay={popover(exception)}>
      <Button variant="link" className="inline-link">Details</Button>
    </OverlayTrigger>
    </Alert>
  )
}

export default Exception