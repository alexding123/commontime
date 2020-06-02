
import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { Field, reduxForm } from 'redux-form'
import { pageSet } from '../../../actions/meetingPageActions'
import SplashScreen from '../../SplashScreen'
import HybridSelect from '../components/HybridSelect'
import PropTypes from 'prop-types'

/**
 * Form to set the people who are meeting in order to find available time slots
 */
const PeopleForm = ({people, profile, handleSubmit, nextPage}) => {
  if (!isLoaded(people) || !isLoaded(profile)) {
    return <SplashScreen/>
  }
  const peopleList = people ? Object.values(people) : []
  return (
  <Form onSubmit={handleSubmit}>
    <h5>Who is meeting?</h5>
    <Form.Group>
      <Field
        name="people"
        textField="name"
        valueField="id"
        defaultMode='multi'
        disabled={[profile.id]}
        data={peopleList}
        component={HybridSelect}
        filter="contains"
      />
    </Form.Group>
    <ButtonGroup>
      <Button onClick={nextPage}>Next</Button>
    </ButtonGroup>
  </Form>
  )
}


PeopleForm.propTypes = {
  people: PropTypes.object,
  profile: PropTypes.object,
  /** Handler for form submission */
  handleSubmit: PropTypes.func.isRequired,
  /** Handler to navigate to the next page of the form */
  nextPage: PropTypes.func.isRequired,
}

const form = 'scheduleMeetingSetupForm'
const enhance = compose(
  connect((state, props) => ({
    people: state.firestore.data.userPreset,
    profile: state.firebase.profile,
  }), (dispatch) => ({
    nextPage: () => dispatch(pageSet('FREQUENCY')),
  })),
  reduxForm({
    form,
    destroyOnUnmount: false,
  }), 
  
)

export default enhance(PeopleForm)