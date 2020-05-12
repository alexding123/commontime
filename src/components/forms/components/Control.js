import React from 'react'
import Form from 'react-bootstrap/Form'

const Control = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

export default Control