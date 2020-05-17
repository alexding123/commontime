
import React from 'react'
import { Button, OverlayTrigger, Tooltip, InputGroup, ButtonGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, formValueSelector, reduxForm, FieldArray } from 'redux-form'
import { compose } from 'redux'
import Control from './components/Control'
import { connect } from 'react-redux'
import Check from './components/Check'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import HybridSelect from './components/HybridSelect'
import { dayMap, getUserByID } from '../../utils'

const renderMeetingTimes = ({ fields, periods, rooms }) => {
  return (<div>
    <div className="d-flex mb-1">
      <Form.Label>Meeting Times</Form.Label>
      <div className="ml-auto">
        <Button onClick={() => fields.push({})} size="sm">Add Time</Button>
      </div>
    </div>
    { fields.map((time, index) => 
      <InputGroup key={index} size="sm" className="d-flex">
        <div className="d-flex flex-grow-1">

        <Field
          className="w-50"
          name={`${time}.period`}
          valueField='id'
          textField='fullName'
          data={periods}
          defaultMode='single'
          component={HybridSelect}
          placeholder='Period'
        />
        <Field
          className="w-50"
          name={`${time}.room`}
          valueField='id'
          textField='name'
          data={rooms}
          defaultMode='single'
          component={HybridSelect}
          placeholder='Room'
        />
        </div>
        <InputGroup.Append className="ml-auto">
          <Button onClick={() => fields.remove(index)}>Remove</Button>
        </InputGroup.Append>
      </InputGroup>
    )}
  </div>)
}

const renderMembers = ({ fields, users }) => {
  return (<div>
    <div className="d-flex mb-1">
      <Form.Label>
        Course Members
        <small className="ml-1">(include the teacher too)</small>
      </Form.Label>
      <div className="ml-auto">
        <Button onClick={() => fields.push({})} size="sm">Add Member</Button>
      </div>
    </div>

    { fields.map((member, index) => 
      <InputGroup key={index} size="sm" className="d-flex">
        <div className="flex-grow-1">
          <Field
            className="w-100"
            name={`${member}`}
            valueField='id'
            textField='name'
            data={users}
            defaultMode='single'
            component={HybridSelect}
            placeholder='Name'
          />
        </div>
        <InputGroup.Append className="ml-auto">
          <Button onClick={() => fields.remove(index)}>Remove</Button>
        </InputGroup.Append>
      </InputGroup>
    )}
  </div>)
}

const EditCourseForm = ({periods, rooms, users, pristine, submitting, validated, handleSubmit}) => {
  users = users ? Object.values(users) : []
  users.sort((a, b) => a.name < b.name ? -1 : (a.name === b.name ? 0 : 1))
  periods = periods ? Object.values(periods) : []
  periods = periods.map(period => ({
    ...period,
    fullName: `${dayMap[period.day]} ${period.name}`,
    id: `${period.day}-${period.period}`,
  }))
  rooms = rooms ? Object.values(rooms) : []
  const teachers = users.filter(user => user && user.teacher)
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label>Course Name</Form.Label>
      <Field name="name" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>
        Course ID
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip>
              This is the unique ID identifying the course (but not the section). For example, English 9's ID is 101. 
            </Tooltip>
          }
        >
          <Button variant="link" className="inline-icon ml-1"><HelpOutlineIcon fontSize="small"/></Button>
        </OverlayTrigger>
      </Form.Label>
      <Field name="course" component={Control} disabled={true}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>
        Section Number
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip>
              This is the unique number identifying the course section. For example, English 9 might have 3 sections, and this might be section 2. 
            </Tooltip>
          }
        >
          <Button variant="link" className="inline-icon ml-1"><HelpOutlineIcon fontSize="small"/></Button>
        </OverlayTrigger>
      </Form.Label>
      <Field name="section" component={Control} disabled={true}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Department (optional)</Form.Label>
      <Field name="department" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Academic quarters during which the course meets:</Form.Label>
      <Field name="fallTerm" component={Check} type="checkbox" label="Fall"/>
      <Field name="winterTerm" component={Check} type="checkbox" label="Winter"/>
      <Field name="springTerm" component={Check} type="checkbox" label="Spring"/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Teacher</Form.Label>
      <Field
        name="teacher"
        valueField='id'
        textField='name'
        data={teachers}
        defaultMode='single'
        component={HybridSelect}
      />
    </Form.Group>
    <Form.Group>
      
      <FieldArray name="times" component={renderMeetingTimes} rooms={rooms} periods={periods}/>
    </Form.Group>
    <Form.Group>
      <FieldArray name="members" component={renderMembers} users={users}/>
    </Form.Group>
    
    <ButtonGroup>
      <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Save</Button>
      <Button variant="primary" href="/Administrator/Courses">Cancel</Button>
    </ButtonGroup>
  </Form>
  )
}

const validate = (selector) => {
  return (selector('name') && 
  selector('course') &&
  selector('section') &&
  selector('teacher') && 
  selector('times') && selector('times').every(time => time.period && time.room) &&
  selector('members') && selector('members').every(member => member.id))
}

const enhance = compose(
  connect((state, props) => {
    const form = `editCourseForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector)
    const users = state.firestore.data.userPreset
    const periods = state.firestore.data.periods
    const rooms = state.firestore.data.rooms
    const times = props.course.times.map(time => {
      const period = periods[`${time.day}-${time.period}`]
      return {
        period: {
          ...period,
          fullName: `${dayMap[period.day]} ${period.name}`,
        },
        room: rooms[time.room],
      }
    })
    const members = props.course.members.map(member => getUserByID(users, member))
    const teacher = getUserByID(users, props.course.teacher)
    return {
      form,
      validated,
      periods,
      rooms,
      users,
      initialValues: {
        ...props.course,
        teacher,
        times,
        members,
      }
    }
  }),
  reduxForm(),
)

export default enhance(EditCourseForm)