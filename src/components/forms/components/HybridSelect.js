import React, { useState } from 'react'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
const HybridSelect = ({defaultMode, onBlur, onChange, value, ...props }) => {
  const [modeSingle, ] = useState(defaultMode === 'single')

  if (modeSingle) {
    return <DropdownList
      onChange={onChange}
      {...props}
    />
  } else {
    return <Multiselect
      onBlur={() => onBlur()}
      onChange={onChange}
      defaultValue={[]}
      value={value || []}
      {...props}
    />
  }
}

const renderHybridSelect = ({ input: { onChange, onBlur, value }, defaultMode, ...props }) => {
  return <HybridSelect
    defaultMode={defaultMode}
    onBlur={onBlur}
    onChange={onChange}
    value={value}
    {...props}
  />
}

export default renderHybridSelect