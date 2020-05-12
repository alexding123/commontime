import React from 'react'
import Form from 'react-bootstrap/Form'

const Check = ({input, meta, ...props}) => {
  return <Form.Check {...props} {...input} />
}

export default Check