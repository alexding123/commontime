import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import AddAdminForm from '../../forms/AddAdminForm'
import { Alert } from 'react-bootstrap'
import { initiateAddAdmin } from '../../../actions/administratorActions'
import Administrators from './Administrators'
import RelinquishAdmin from './RelinquishAdmin'

const Dashboard = ({dashboard, handleSubmit}) => {
  return (<div>
    <h3>Dashboard</h3>
    <div className="divider"/>
    <h5>Current Administrators</h5>
    <Administrators/>
    <hr/>
    {dashboard.admin.error ? <Alert variant="danger">{dashboard.admin.error}</Alert> : null}
    {dashboard.admin.message ?<Alert variant="success">{dashboard.admin.message}</Alert> : null}
    <h5>Add an Administrator</h5>
    <AddAdminForm onSubmit={handleSubmit}/>
    <hr/>
    <h5>Relinquish Administrator Privileges</h5>
    <RelinquishAdmin/>
  </div>)
}

const enhance = compose(
  connect((state) => ({
    dashboard: state.administratorPage.dashboard,
  }), dispatch => ({
    handleSubmit: (values) => dispatch(initiateAddAdmin(values))
  }))
)

export default enhance(Dashboard)