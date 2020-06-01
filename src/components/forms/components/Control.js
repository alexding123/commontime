import React from 'react'
import Form from 'react-bootstrap/Form'

/**
 * Redux-Form component for a standard textbar
 */
const Control = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

export default Control