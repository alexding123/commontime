
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

const form = 'scheduleMeetingSetupForm'

const PeopleForm = ({pristine, submitting, validated, people, profile, handleSubmit, nextPage}) => {
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