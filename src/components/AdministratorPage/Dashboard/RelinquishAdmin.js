import React from 'react'
import { Alert, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { notificationSet } from '../../../actions/notificationsActions'
import PropTypes from 'prop-types'

/**
 * Component to allow an admin to relinquish their admin privileges
 */
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

RelinquishAdmin.propTypes = {
  relinquish: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(null, dispatch => ({
    relinquish: () => dispatch(notificationSet('relinquishAdmin'))
  })),
)

export default enhance(RelinquishAdmin)