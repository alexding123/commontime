import React from 'react'
import { compose } from 'recompose'
import OneoffDisplay from './OneoffDisplay'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import { profileMeetingsTabSet } from '../../../actions/profilePageActions'
import { isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import RecurringDisplay from './RecurringDisplay'
import Invitations from './Invitations'
import PropTypes from 'prop-types'

/**
 * Component to display meetings and invitations the user has
 */
const Meetings = ({profile, periods, rooms, tab, setTab}) => {
  if (!isLoaded(profile) || !isLoaded(periods) || !isLoaded(rooms)) {
    return <SplashScreen/>
  }
  return (<div>
  <h3 className="tabs-heading">Meetings</h3>
  <div className="divider"/>
  <Tabs
    activeKey={tab}
    onSelect={setTab}
  >
    <Tab eventKey="oneOff" title="One Off">
      <OneoffDisplay userId={profile.id}/>
    </Tab>
    <Tab eventKey="recurring" title="Recurring">
      <RecurringDisplay userId={profile.id}/>
    </Tab>
    <Tab eventKey="invitations" title="Invitations">
      <Invitations userId={profile.id}/>
    </Tab>
  </Tabs>
  </div>)
}

Meetings.propTypes ={
  profile: PropTypes.object,
  periods: PropTypes.object,
  rooms: PropTypes.object,
  /** The currently active tab */
  tab: PropTypes.string.isRequired,
  /** Hook to set the value of tab */
  setTab: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    tab: state.profilePage.meetingsTab,
    profile: state.firebase.profile,
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
  }), dispatch => ({
    setTab: tab => dispatch(profileMeetingsTabSet(tab)),
  }))
)

export default enhance(Meetings)