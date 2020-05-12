import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { getUserByID } from '../../../utils'

const CourseDisplay = ({id, course, users}) => {
  const teacher = getUserByID(users, course.teacher)
  return (<Card>
    <Card.Body>
      <Row className="mx-0 p-0">
        <Col xs={9} className="p-0">
          <Row className="mx-0 p-0">
            <Col className="p-0">
              <h5 className="d-inline">{course.name}</h5>
              <div className="d-inline pl-1">
                {course.id}
              </div>
            </Col>
          </Row>
          <Row className="mx-0 p-0">
            { teacher ? 
              teacher.name :
              'No teacher found for this class'
            }
          </Row>
        </Col>
        <Col xs={3} className="p-0 d-flex justify-content-end align-items-center">
          <Button className="mx-0 p-0" variant="link" href={`/Administrator/Courses/${id}`}>
            <EditIcon/>
          </Button>
          <Button className="mx-0 p-0"  variant="link">
            <DeleteOutlineIcon/>
          </Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>)
}

const enhance = compose(
  connect((state) => ({
    courses: state.firestore.data.courses,
    users: state.firestore.data.userPreset,
  }), dispatch => ({
  }))
)

export default enhance(CourseDisplay)