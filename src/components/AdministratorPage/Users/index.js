import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import UserDisplay from './UserDisplay'
import { Button } from 'react-bootstrap'

const Users = ({users}) => {
  if (!isLoaded(users) || !users) {
    return <SplashScreen/>
  }
  return (<div>
    <h3>Users</h3>
    <div className="divider"/>
    <Button href="/Administrator/AddUser">Add User</Button>
    <div className="mt-1">
      {
        users ?
        Object.entries(users).filter(([key, user]) => user).map(([key, user]) => 
          <UserDisplay key={key} id={key} user={user}/>
        ) :
        "No user found. Upload a users file?"
      }
      
    </div>
  </div>)
}

const enhance = compose(
  firestoreConnect([{
    collection: 'userPreset',
  }]),
  connect((state) => ({
    users: state.firestore.data.userPreset,
  }), dispatch => ({
  }))
)

export default enhance(Users)