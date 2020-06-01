import React from 'react' 
import { Popover } from 'react-bootstrap'
import OneoffInviteForm from '../../../forms/OneoffInviteForm'

/**
 * Popover to invite other users to attend the meeting
 * @param {Object} instance The instance to invite others to
 * @param {string} instanceID ID of the instance
 * @param {function} handleSubmit Handler of form submission
 */
const inviteFunc = (instance, instanceID, handleSubmit) => {
  return <Popover>
    <Popover.Title>Invite people to attend</Popover.Title>
    <Popover.Content>
      <OneoffInviteForm onSubmit={handleSubmit} instanceID={instanceID} instance={instance}/>
    </Popover.Content>
  </Popover>
}

export default inviteFunc