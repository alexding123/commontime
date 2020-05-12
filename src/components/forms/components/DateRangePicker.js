import React from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

class renderDateRangePicker extends React.Component {
  constructor(props) {
    super(props);

    const initValues = (props.input && props.input.value) || {};

    this.state = {
      startDate: initValues.startDate || new Date(),
      endDate: initValues.endDate || new Date(),
      key: 'selection',
      showDatePicker : false
    }
  }

  constructEvent(selection) {
    return {
      startDate: selection.startDate,
      endDate: selection.endDate
    }
  }

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