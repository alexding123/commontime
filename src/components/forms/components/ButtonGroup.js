import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import PropTypes from 'prop-types'

/**
 * Redux-Form component for choosing one between multiple options 
 */
const CustomButtonGroup = ({input, options, textField, valueField}) => {
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

CustomButtonGroup.propTypes = {
  /** Redux-Form-supplied values about the field */
  input: PropTypes.object,
  /** All options available */
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** Field of option to use to display as text */
  textField: PropTypes.string.isRequired,
  /** Field of option to use as underlying value */
  valueField: PropTypes.string.isRequired,
}

export default CustomButtonGroup

