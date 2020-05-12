import React from 'react'
import Combobox from 'react-widgets/lib/Combobox'

const renderCombobox = ({input, data, valueField, textField, placeholder, onSelect, filter, meta: {touched, error, warning}}) => {
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

export default renderCombobox