import React from 'react'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'
import moment from 'moment'
import momentLocalizer from "react-widgets-moment"
import PropTypes from 'prop-types'

// set locale
momentLocalizer(moment)

/**
 * Redux-Form component for choosing one between multiple options in a dropdown,
 * with a textbox that user can search in
 */
const renderDateTimePicker = ({ input: { onChange, value }, showTime }) =>
  <DateTimePicker
    onChange={onChange}
    format="MMMM DD, YYYY"
    time={showTime}
    value={!value ? null : new Date(value)}
  />

renderDateTimePicker.propTypes = {
  /** Redux-Form-supplied values about the field */
  input: PropTypes.object,
  /** Whether to show the time (vs. the date) */
  showTime: PropTypes.bool,
}

export default renderDateTimePicker