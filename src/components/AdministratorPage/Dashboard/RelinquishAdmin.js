import React from 'react'
import { Alert, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { notificationSet } from '../../../actions/notificationsActions'

const RelinquishAdmin = ({relinquish}) => {
  return (<div>
    <Alert variant="danger">
      By pressing this button, you will remove all your administrator privilege.  
    </Alert>
    <Button onClick={relinquish}>
      Relinquish Administrator
    </Button>
  </div>)
}

const enhance = compose(
  connect(null, dispatch => ({
    relinquish: () => dispatch(notificationSet('relinquishAdmin'))
  })),
)

export default enhance(RelinquishAdmin)