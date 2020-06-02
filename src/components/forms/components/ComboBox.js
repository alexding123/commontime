import React from 'react'
import Combobox from 'react-widgets/lib/Combobox'
import PropTypes from 'prop-types'

/**
 * Redux-Form component for choosing one between multiple options in a dropdown,
 * with a textbox that user can search in
 */
const renderCombobox = ({input, data, valueField, textField, placeholder, onSelect, filter}) => {
  return (
    <Combobox {...input}
              data={data}
              placeholder={placeholder}
              valueField={valueField}
              textField={textField}
              filter={filter}
              onChange={e => input.onChange(typeof(e) === 'string' ? e : e[valueField])}
              onSelect={onSelect}
              onBlur={() => input.onBlur()}
    />
  )
}

renderCombobox.propTypes = {
  /** Redux-Form-supplied values about the field */
  input: PropTypes.object,
  /** All available options */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** Field of data to use to display as text */
  textField: PropTypes.string.isRequired,
  /** Field of data to use as underlying value */
  valueField: PropTypes.string.isRequired,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Hook called when component is selected */
  onSelect: PropTypes.func,
  /** Optional filter function defining what options to present given user input */
  filter: PropTypes.func,
}


export default renderCombobox