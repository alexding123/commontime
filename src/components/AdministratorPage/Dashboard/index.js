import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import AddAdminForm from '../../forms/AddAdminForm'
import { Alert } from 'react-bootstrap'
import { initiateAddAdmin } from '../../../actions/administratorActions'
import Administrators from './Administrators'
import RelinquishAdmin from './RelinquishAdmin'
import ErrorBoundary from '../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Subpage to display the administrator dashboard, where
 * admins can add admins or relinquish admin privileges
 */
const Dashboard = ({dashboard, handleSubmit}) => {
  return (<div>
    <h3>Dashboard</h3>
    <div className="divider"/>
    <h5>Current Administrators</h5>
    <ErrorBoundary>
    <Administrators/>
    </ErrorBoundary>
    <hr/>
    {dashboard.admin.error ? <Alert variant="danger">{dashboard.admin.error}</Alert> : null}
    {dashboard.admin.message ?<Alert variant="success">{dashboard.admin.message}</Alert> : null}
    <h5>Add an Administrator</h5>
    <ErrorBoundary>
    <AddAdminForm onSubmit={handleSubmit}/>
    </ErrorBoundary>
    <hr/>
    <h5>Relinquish Administrator Privileges</h5>
    <ErrorBoundary>
    <RelinquishAdmin/>
    </ErrorBoundary>
  </div>)
}

Dashboard.propTypes = {
  dashboard: PropTypes.shape({
    /** Optional error messages */
    admin: PropTypes.object.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  connect((state) => ({
    dashboard: state.administratorPage.dashboard,
  }), dispatch => ({
    handleSubmit: (values) => dispatch(initiateAddAdmin(values))
  }))
)

export default enhance(Dashboard)