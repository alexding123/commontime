import HelpOutline from '@material-ui/icons/HelpOutline'
import React from 'react'
import { Button, ButtonGroup, OverlayTrigger, Popover } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose, lifecycle } from 'recompose'
import { addPeriodToDay, periodsDeletePeriod, periodsReset, periodsUpdateField, retrievePeriods, uploadPeriods } from '../../../actions/administratorActions'
import SplashScreen from '../../SplashScreen'
import { AddBox, Box, Header } from './BoxEdit'

const PeriodsEditor = ({annualBoard, updateField, deletePeriod, addPeriod, resetPeriods, uploadPeriods}) => {
  if (!annualBoard.periods.default) {
    return <SplashScreen/>
  }

  return (
  <div className="d-flex flex-column">
    <ButtonGroup className="align-self-start">
      <Button variant="primary" onClick={uploadPeriods}>Upload</Button>
      <Button variant="info" onClick={resetPeriods}>Reset</Button>
      <OverlayTrigger trigger='click' placement='right' overlay={
        <Popover>
          <Popover.Title as='h3'>Requirements</Popover.Title>
          <Popover.Content>
            Normal academic periods are called "Period #", where the number is required to start from 1 and increment as it goes later in the day. Any period not named in this pattern is considered to not be an academic period and labelled red. Periods may not overlap. As of now, no code has been implemented to enforce these rules, so please double-check before uploading. 
          </Popover.Content>
        </Popover>
      }>
        <Button variant="link"><HelpOutline/></Button>
      </OverlayTrigger>
    </ButtonGroup>

  <div className="d-flex flex-row">
    
    { [1,2,3,4,5].map((day) => {
      const kvs = Object.entries(annualBoard.periods.current).filter(([key, period]) => period.day === day)
      kvs.sort(([aKey, aVal], [bKey, bVal]) => (aVal.endTime < bVal.endTime) ? -1 : 1)
      return (<div className="d-flex flex-column" key={day}>
        <Header day={day}/>
        { kvs.map(([key, period]) => 
            <Box {...period} key={key} updateField={updateField(key)} delete={deletePeriod(key)}/>
          )
        }
        <AddBox day={day} addPeriod={addPeriod}/>
      </div>)
    })}
  </div>
  </div>)
}

const enhance = compose(
  connect((state) => ({
    annualBoard: state.administratorPage.annualBoard,
  }), (dispatch) => ({
    retrievePeriods: () => dispatch(retrievePeriods()),
    updateField: (period) => (field, value) => dispatch(periodsUpdateField(period, field, value)),
    deletePeriod: (period) => () => dispatch(periodsDeletePeriod(period)),
    addPeriod: (day) => dispatch(addPeriodToDay(day)),
    resetPeriods: () => dispatch(periodsReset()),
    uploadPeriods: () => dispatch(uploadPeriods()),
  })),
  lifecycle({
    componentDidMount() {
      this.props.retrievePeriods()
    }
  }),
)
export default enhance(PeriodsEditor)