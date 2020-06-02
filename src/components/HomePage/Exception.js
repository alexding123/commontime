import React from 'react'
import { Alert, OverlayTrigger, Button, Popover } from 'react-bootstrap'
import PropTypes from 'prop-types'

/**
 * Component that pops up to show the details of an exception
 * @param {Object} exception The exception to show
 */
const popover = (exception) => (
  <Popover>
    <Popover.Title>Special Schedule</Popover.Title>
    <Popover.Content>
      <p className='pre-like m-0'>Summary: {exception.summary}</p>
      <p className='pre-like m-0'>Details: {exception.description}</p>
    </Popover.Content>
  </Popover>
)

/**
 * Component that alerts the user that today has an exception
 */
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

Exception.propTypes = {
  exception: PropTypes.shape({
    summary: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
}

export default Exception