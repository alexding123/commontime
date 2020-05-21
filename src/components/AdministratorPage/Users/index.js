import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import UserDisplay from './UserDisplay'
import { Button, Card } from 'react-bootstrap'
import ErrorBoundary from '../../ErrorBoundary'

const Users = ({users}) => {
  if (!isLoaded(users)) {
    return <SplashScreen/>
  }
  const filteredUsers = users ? Object.entries(users).filter(([key, user]) => user) : []
  return (<div>
    <h3>Users</h3>
    <div className="divider"/>
    <Button href="/Administrator/AddUser">Add User</Button>
    <div className="mt-1">
      <ErrorBoundary>
      {
        !filteredUsers.length ?
        Object.entries(users).filter(([key, user]) => user).map(([key, user]) => 
          <UserDisplay key={key} id={key} user={user}/>
        ) :
        <Card>
          <Card.Body>
          <div>
            There is no user in the database. This shouldn't be the case.
          </div>
          <div>
            Try <Button variant="link" className="inline-link" href="/Administrator/Annual">uploading</Button> this year's users file.
          </div>
          </Card.Body>
        </Card>
      }
      </ErrorBoundary>
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