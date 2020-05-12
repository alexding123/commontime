import React from 'react'
import { connect } from 'react-redux'
import { isEmpty, isLoaded, firestoreConnect } from 'react-redux-firebase'
import { compose, withHandlers } from 'recompose'
import { addInstanceAndInvite, addInstanceAndNotify } from '../../actions/meetingPageActions'
import { dayMap } from '../../utils'
import BookOneOffForm from '../forms/BookOneOffForm'
import SplashScreen from '../SplashScreen'

const BookOneOffPage = ({instance, instances, periods, profile, rooms, people, handleSubmit}) => {
  if (!isLoaded(profile) || !isLoaded(rooms) || !isLoaded(periods) || !isLoaded(instances)) {
    return <SplashScreen/>
  }
  const canBookPrivate = !isEmpty(profile) && profile.token.claims.teacher
  const isInvite = isEmpty(profile) || !profile.token.claims.teacher || !people.every(person => person.id === profile.id || !person.teacher)
  return (<div className="stage-container">
    <h5>Adding a meeting for {`${dayMap[periods[instance.period].day]} ${periods[instance.period].name}`}</h5>
    <BookOneOffForm onSubmit={handleSubmit(isInvite)} isInvite={isInvite} canBookPrivate={canBookPrivate} instance={instance}/>
  </div>)
}

const enhance = compose(
  connect(state => ({
    data: state.meetingPage,
    profile: state.firebase.profile,
    instance: state.meetingPage.oneoffInstance,
    people: state.meetingPage.people,
    rooms: state.firestore.data.rooms,
    periods: state.firestore.data.periods,
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