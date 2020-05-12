import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'

const renderToggleInput = ({input, falseText, trueText, ...props}) => (
  <ButtonGroup className="toggle-input">
    <Button
      active={!input.value}
      variant="outline-primary"
      onClick={() => {input.onChange(false)}}
    >
      {falseText}
    </Button>
    <Button
      active={input.value === true}
      variant="outline-primary"
      onClick={() => {input.onChange(true)}}
    >
      {trueText}
    </Button>
  </ButtonGroup>
)

export default renderToggleInput