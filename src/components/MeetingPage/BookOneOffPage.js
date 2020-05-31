import React from 'react'
import { connect } from 'react-redux'
import { isEmpty, isLoaded, firestoreConnect } from 'react-redux-firebase'
import { compose, withHandlers } from 'recompose'
import { addInstanceAndInvite, addInstanceAndNotify } from '../../actions/meetingPageActions'
import { dayMap } from '../../utils'
import BookOneOffForm from '../forms/BookOneOffForm'
import SplashScreen from '../SplashScreen'
import PropTypes from 'prop-types'

/**
 * Subpage to book an one-off meeting at a selected time/place
 */
const BookOneOffPage = ({instance, instances, periods, profile, rooms, people, exceptions, handleSubmit}) => {
  if (!isLoaded(profile) || !isLoaded(rooms) || !isLoaded(periods) || !isLoaded(instances) || !isLoaded(exceptions)) {
    return <SplashScreen/>
  }
  // only teachers can book private meetings
  const canBookPrivate = !isEmpty(profile) && profile.token.claims.teacher
  // only a teacher booking a meeting with students can simply notify
  // instead of invite the other memebers
  const isInvite = isEmpty(profile) || !profile.token.claims.teacher || !people.every(person => person.id === profile.id || !person.teacher)
  return (<div className="stage-container">
    <h5>Adding a meeting for {`${dayMap[periods[instance.period].day]} ${periods[instance.period].name}`}</h5>
    <BookOneOffForm onSubmit={handleSubmit(isInvite)} isInvite={isInvite} canBookPrivate={canBookPrivate} instance={instance}/>
  </div>)
}

BookOneOffPage.propTypes = {
  /** The selected time/place for the meeting */
  instance: PropTypes.shape({
    period: PropTypes.string.isRequired,
  }).isRequired,
  instances: PropTypes.object,
  periods: PropTypes.object,
  profile: PropTypes.object,
  rooms: PropTypes.object,
  /** The selected particpants for the meeting */
  people: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  exceptions: PropTypes.object,
  /** Handler for submitting the form to book this meeting */
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    data: state.meetingPage,
    profile: state.firebase.profile,
    instance: state.meetingPage.oneoffInstance,
    people: state.meetingPage.people,
    rooms: state.firestore.data.rooms,
    periods: state.firestore.data.periods,
    exceptions: state.firestore.data.exceptions,
    instances: state.firestore.data[`bookOneOff${state.meetingPage.oneoffInstance.period}${state.meetingPage.oneoffInstance.date}Instances`],
  }), {
    addInstanceAndInvite,
    addInstanceAndNotify,
  }),
  firestoreConnect(props => [{
    collectionGroup: 'instances',
    where: [
      ['date', '==', props.instance.date],
      ['period', '==', props.instance.period]
    ],
    storeAs: `bookOneOff${props.instance.period}${props.instance.date}Instances`
  }]), 
  withHandlers({
    handleSubmit: props => isInvite => values => {
      if (isInvite) {
        props.addInstanceAndInvite(props.instance, values)
      } else {
        props.addInstanceAndNotify(props.instance, props.people, values)
      }
  
    }
  })
)

export default enhance(BookOneOffPage)