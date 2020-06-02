import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import PropTypes from 'prop-types'

/**
 * Redux-Form component to select one of two options, giving a Boolean value
 */
const renderToggleInput = ({input, falseText, trueText}) => (
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

renderToggleInput.propTypes = {
  /** Redux-Form-supplied values about the field */
  input: PropTypes.object,
  /** Text to display for the False option */
  falseText: PropTypes.string.isRequired,
  /** Text to display for the True option */
  trueText: PropTypes.string.isRequired,
}

export default renderToggleInput