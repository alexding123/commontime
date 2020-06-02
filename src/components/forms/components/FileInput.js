import React from 'react'
import Form from 'react-bootstrap/Form'
import PropTypes from 'prop-types'

/**
 * Helper function to turn a file event into a Redux form value
 * @param {function} delegate Function to call to update the value
 * @param {event} e File event
 */
const adaptFileEventToValue = delegate => e => delegate(e.target.files[0]);

/**
 * Redux-Form component to choose a file from the system
 */
const FileInput = ({ 
  input: { onChange, onBlur }, 
  meta: omitMeta, // skip the meta values completely 
  ...props 
}) => {
  return (
    <Form.Control
      onChange={adaptFileEventToValue(onChange)}
      onBlur={adaptFileEventToValue(onBlur)}
      type="file"
      {...props.input}
      {...props}
    />
  )
}

FileInput.propTypes = {
  /** Redux-Form-supplied values about the field */
  input: PropTypes.object,
}

export default FileInput