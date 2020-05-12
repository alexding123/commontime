import React from 'react'
import { connect } from 'react-redux'
import { compose, lifecycle } from 'recompose'
import { listAdmins } from '../../../actions/administratorActions'
import { ListGroup, Button, Row, Col } from 'react-bootstrap'

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

const enhance = compose(
  connect((state) => ({
    admins: state.administratorPage.dashboard.admins,
  }), dispatch => ({
    load: () => dispatch(listAdmins()),
  })),
  lifecycle({
    componentDidMount() {
      this.props.load()
    }
  })
)

export default enhance(Administrators)