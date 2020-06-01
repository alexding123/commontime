import React, { useState } from 'react'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import PropTypes from 'prop-types'

/**
 * Component to display either single select or multi select
 */
const HybridSelect = ({defaultMode, onBlur, onChange, value, ...props }) => {
  // don't need to set
  const [modeSingle, ] = useState(defaultMode === 'single')

  if (modeSingle) {
    return <DropdownList
      className="text-align-left"
      onChange={onChange}
      value={(Object.keys(value).length === 0 && value.constructor === Object) ? null : value}
      {...props}
    />
  } else {
    return <Multiselect
      className="text-align-left"
      onBlur={() => onBlur()}
      onChange={onChange}
      defaultValue={[]}
      value={value || []}
      filter="contains"
      {...props}
    />
  }
}
HybridSelect.propTypes = {
  /** Default choice of single or multi select */
  defaultMode: PropTypes.string,
  /** Callback triggered whenever component is blurred */
  onBlur: PropTypes.func,
  /** Callback triggered whenever component value is changed */
  onChange: PropTypes.func,
  /** Field value */
  value: PropTypes.object,
}

/**
 * Redux-Form component for a dropdown select (either single select or multi select) 
 */
const renderHybridSelect = ({ input: { onChange, onBlur, value }, defaultMode, ...props }) => {
  return <HybridSelect
    defaultMode={defaultMode}
    onBlur={onBlur}
    onChange={onChange}
    value={value}
    {...props}
  />
}
renderHybridSelect.propTypes = {
  /** Default choice of single or multi select */
  defaultMode: PropTypes.string,
}

export default renderHybridSelect