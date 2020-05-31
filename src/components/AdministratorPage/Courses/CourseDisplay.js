import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { notificationSet } from '../../../actions/notificationsActions'
import { getUserByID } from '../../../utils'
import PropTypes from 'prop-types'

/**
 * Component to display a single course
 */
const CourseDisplay = ({id, course, users, deleteCourse}) => {
  const teacher = getUserByID(users, course.teacher)
  return (<Card>
    <Card.Body>
      <Row className="mx-0 p-0">
        <Col xs={9} className="p-0">
          <Row className="mx-0 p-0">
            <Col className="p-0">
              <h5 className="d-inline">{course.name}</h5>
              <div className="d-inline pl-1">
                {id}
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
          <Button onClick={deleteCourse} className="mx-0 p-0" variant="link">
            <DeleteOutlineIcon/>
          </Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>)
}

CourseDisplay.propTypes = {
  /** ID of the displayed course */
  id: PropTypes.string.isRequired,
  course: PropTypes.shape({
    /** ID of the teacher */
    teacher: PropTypes.string.isRequired,
    /** name of the course */
    name: PropTypes.string.isRequired,
  }).isRequired,
  users: PropTypes.object,
  deleteCourse: PropTypes.func.isRequired,
}

const enhance = compose(
  connect((state) => ({
    courses: state.firestore.data.courses,
    users: state.firestore.data.userPreset,
  }), (dispatch, props) => ({
    deleteCourse: () => dispatch(notificationSet('confirmDeleteCourse', {
      id: props.id,
      course: props.course,
    }))
  }))
)

export default enhance(CourseDisplay)