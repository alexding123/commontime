import React from 'react'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'
import moment from 'moment'
import momentLocalizer from "react-widgets-moment"

momentLocalizer(moment)

const renderDateTimePicker = ({ input: { onChange, value }, showTime }) =>
  <DateTimePicker
    onChange={onChange}
    format="MMMM DD, YYYY"
    time={showTime}
    value={!value ? null : new Date(value)}
  />

export default renderDateTimePicker