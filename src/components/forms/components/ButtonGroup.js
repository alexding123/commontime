import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'

const CustomButtonGroup = ({input, meta, options, textField, valueField, ...props}) => {
  return <ButtonGroup>
    { options.map(option => {
      const id = valueField ? option[valueField] : option
      const displayText = textField ? option[textField] : option
      return (
      <Button
        key={id}
        active={id === input.value}
        variant="outline-primary"
        onClick={() => {input.onChange(id)}}
      >
        {displayText}
      </Button>
    )})}
  </ButtonGroup>
}

export default CustomButtonGroup

