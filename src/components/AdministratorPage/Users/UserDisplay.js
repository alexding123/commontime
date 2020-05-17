import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { notificationSet } from '../../../actions/notificationsActions'

const UserDisplay = ({id, user, deleteUser}) => {
  return (<Card>
    <Card.Body>
      <Row className="mx-0 p-0">
        <Col xs={9} className="p-0">
          <Row className="mx-0 p-0">
            <Col className="p-0">
              <h5 className="d-inline">{user.name}</h5>
              <div className="d-inline pl-1">
                {user.id}
              </div>
            </Col>
          </Row>
          <Row className="mx-0 p-0">
            <Button variant="link" href={`mailto:${user.email}`} className="inline-link">{user.email}</Button>
          </Row>
        </Col>
        <Col xs={3} className="p-0 d-flex justify-content-end align-items-center">
          <Button className="mx-0 p-0" variant="link" href={`/Administrator/Users/${id}`}>
            <EditIcon/>
          </Button>
          <Button onClick={deleteUser} className="mx-0 p-0" variant="link">
            <DeleteOutlineIcon/>
          </Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>)
}

const enhance = compose(
  connect((state) => ({
    users: state.firestore.data.userPreset,
  }), (dispatch, props) => ({
    deleteUser: () => dispatch(notificationSet('confirmDeleteUser', {
      id: props.id,
      user: props.user,
    }))
  }))
)

export default enhance(UserDisplay)