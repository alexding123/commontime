import React from 'react'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

/**
 * Redux-Form component for choosing a range of dates
 */
class renderDateRangePicker extends React.Component {
  constructor(props) {
    super(props);

    const initValues = (props.input && props.input.value) || {};

    // default values
    this.state = {
      startDate: initValues.startDate || new Date(), // default to "now" if not given
      endDate: initValues.endDate || new Date(),
      key: 'selection',
      showDatePicker : false
    }
  }

  // build a Redux-Form onChange event to update its internal value
  constructEvent(selection) {
    return {
      startDate: selection.startDate,
      endDate: selection.endDate
    }
  }

  // triggered when user interacts with the component
  handleChange(payload) {
    this.setState({
      ...this.state,
      ...payload.selection
    });

    this.props.input.onChange(this.constructEvent(payload.selection));
  }

  render() {
    const {input} = this.props;

    return (
      <div>
        <DateRange
          {...input}
          onChange={this.handleChange.bind(this)}
          ranges={[this.state]}
          editableDateInputs={false}
          moveRangeOnFirstSelection={false}
          showSelectionPreview={false}
          showMonthAndYearPickers={false}
        />
      </div>
    );
  }
}
export default renderDateRangePicker