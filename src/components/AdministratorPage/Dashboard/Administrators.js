import React from 'react'
import { connect } from 'react-redux'
import { compose, lifecycle } from 'recompose'
import { listAdmins } from '../../../actions/administratorActions'
import { ListGroup, Button, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'

/**
 * Component to list all current administrators
 */
const Administrators = ({admins}) => {
  return (<ListGroup variant='flush'>
    {admins.map(admin => 
      <ListGroup.Item key={admin.email}>
        <Row>
        <Col xs={4}>
        {admin.name}
        </Col>
        <Col>
        <Button variant="link" className="inline-link" href={`mailto:${admin.email}`}>
          {admin.email}
        </Button>
        </Col>
        </Row>
      </ListGroup.Item>
    )}
  </ListGroup>)
}

Administrators.propTypes = {
  admins: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
}

const enhance = compose(
  connect((state) => ({
    admins: state.administratorPage.dashboard.admins,
  }), dispatch => ({
    load: () => dispatch(listAdmins()),
  })),
  lifecycle({
    componentDidMount() {
      // retrieve a list of all current admins
      this.props.load()
    }
  })
)

export default enhance(Administrators)