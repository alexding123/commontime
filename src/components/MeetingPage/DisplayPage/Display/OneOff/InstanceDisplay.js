import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import React from 'react'
import { Badge, Button, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { oneoffInstanceSelected, pageSet } from '../../../../../actions/meetingPageActions'
import { dayMap } from '../../../../../utils'
import PropTypes from 'prop-types'

/**
 * Component to display an instance found under the search parameters,
 * allowing the user to potentially book a meeting on it
 */
const InstanceDisplay = ({instance, periods, goBookRoom}) => {
  return <ListGroup.Item>
  <Row>
    <Col xs={7}>
      {`${dayMap[periods[instance.period].day]} ${periods[instance.period].name}`}&nbsp;
      {
        instance.instances ?
        <OverlayTrigger trigger={['hover', 'click']} placement='top-start' overlay={
          <Tooltip>
            { instance.instances.map((instance, index) => {
              const personName = instance.person.name
              return (
                instance.private ? 
                <div key={index}>{`${personName}: `}<Badge variant='info'>Private</Badge></div> : 
                <div key={index}>{`${personName}: ${instance.name}`}</div>
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

InstanceDisplay.propTypes = {
  /** The time slot to display, with any preexisting meeting during it */
  instance: PropTypes.shape({
    period: PropTypes.string.isRequired,
    instances: PropTypes.arrayOf(PropTypes.shape({
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
      dispatch(oneoffInstanceSelected(props.instance))
      dispatch(pageSet('BOOK_ONEOFF'))
    }
  })),
)

export default enhance(InstanceDisplay)