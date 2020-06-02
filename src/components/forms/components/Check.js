import React from 'react'
import Form from 'react-bootstrap/Form'

/**
 * Redux-Form component for choosing a boolean value
 */
const Check = ({input, meta, ...props}) => {
  return <Form.Check {...props} {...input} />
}

export default Check