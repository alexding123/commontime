import React from 'react' 
import { Popover } from 'react-bootstrap'
import RecurringInviteForm from '../../../forms/RecurringInviteForm'

/**
 * Popover to invite other users to attend the meeting
 * @param {Object} recurring The recurring meeting
 * @param {string} recurringID ID of the recurring meting
 * @param {function} handleSubmit Handler for form submission
 */
const inviteFunc = (recurring, recurringID, handleSubmit) => {
  return <Popover>
    <Popover.Title>Invite people to attend</Popover.Title>
    <Popover.Content>
      <RecurringInviteForm onSubmit={handleSubmit} instanceID={recurringID} instance={recurring}/>
    </Popover.Content>
  </Popover>
}

export default inviteFunc