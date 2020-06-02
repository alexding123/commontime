import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { notificationSet } from '../../../actions/notificationsActions'
import date from 'date-and-time'
import PropTypes from 'prop-types'

/**
 * Component to display a single exception
 */
const ExceptionDisplay = ({id, exception, deleteException}) => {
  return (<Card>
    <Card.Body>
      <Row className="mx-0 p-0">
        <Col xs={9} className="p-0">
          <Row className="mx-0 p-0">
            <Col className="p-0">
              <h5 className="d-inline">{date.format(date.parse(exception.date, 'MM/DD/YYYY'), 'MMMM DD, YYYY')}</h5>
            </Col>
          </Row>
          <Row className="mx-0 p-0">
            <p>
            { exception.summary }
            </p>
          </Row>
        </Col>
        <Col xs={3} className="p-0 d-flex justify-content-end align-items-center">
          <Button href={`/Administrator/Exceptions/${id}`} className="mx-0 p-0" variant="link">
            <EditIcon/>
          </Button>
          <Button onClick={deleteException} className="mx-0 p-0" variant="link">
            <DeleteOutlineIcon/>
          </Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>)
}

ExceptionDisplay.propTypes = {
  /** ID of the exception */
  id: PropTypes.string.isRequired,
  /** Exception object */
  exception: PropTypes.shape({
    date: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
  }).isRequired,
  /** Function to delete the displayed exception */
  deleteException: PropTypes.func.isRequired,
}
const enhance = compose(
  connect(null, (dispatch, props) => ({
    deleteException: () => dispatch(notificationSet('confirmDeleteException', {
      id: props.id,
      exception: props.exception,
    }))
  }))
)

export default enhance(ExceptionDisplay)