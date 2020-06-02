import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import React from 'react'
import { Badge, Button, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { pageSet, periodSelected } from '../../../../../actions/meetingPageActions'
import { dayMap } from '../../../../../utils'
import PropTypes from 'prop-types'

/**
 * Component to display a common period found under the search parameters,
 * allowing the user to potentially book a meeting on it
 */
const PeriodDisplay = ({period, periods, goBookRoom}) => {
  return <ListGroup.Item>
  <Row>
    <Col xs={7}>
      {`${dayMap[periods[period.period].day]} ${periods[period.period].name}`}&nbsp;
      {
        period.conflicts.length ?
        <OverlayTrigger trigger={['hover', 'click']} placement='top-start' overlay={
          <Tooltip>
            { period.conflicts.map((conflict, index) => {
              const personName = conflict.person.name
              return (
                conflict.private ? 
                <div key={index}>{`${personName}: `}<Badge variant='info'>Private</Badge></div> : 
                <div key={index}>{`${personName}: ${conflict.name}`}</div>
              )
            })}
          </Tooltip>
        }>
          <Badge variant='info'>Booked</Badge>
        </OverlayTrigger>:
        null
      }
    </Col>
    <Col xs={2} className="d-flex flex-row justify-content-end pr-0 ml-auto">
      <Button onClick={goBookRoom} variant='link' className='center-button'>
        <LibraryBooksIcon/>
      </Button>    
    </Col>
  </Row>
  
</ListGroup.Item>
}

PeriodDisplay.propTypes = {
  /** The period to display, with any preexisting meeting during it */
  period: PropTypes.shape({
    period: PropTypes.string.isRequired,
    conflicts: PropTypes.arrayOf(PropTypes.shape({
      person: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      private: PropTypes.bool.isRequired,
      name: PropTypes.string.isRequired,
    })),
  }).isRequired,
  periods: PropTypes.object,
  /** Handler to navigate to the subpage to book the room */
  goBookRoom: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    periods: state.firestore.data.periods,
  }), (dispatch, props) => ({
    goBookRoom: () => {
      dispatch(periodSelected(props.period))
      dispatch(pageSet('BOOK_RECURRING'))
    }
  })),
)

export default enhance(PeriodDisplay)