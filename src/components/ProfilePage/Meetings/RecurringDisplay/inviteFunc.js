import React from 'react' 
import { Popover } from 'react-bootstrap'
import RecurringNotifyForm from '../../../forms/RecurringNotifyForm'

const inviteFunc = (instance, instanceID, handleSubmit) => {
  return <Popover>
    <Popover.Title>Invite people to attend</Popover.Title>
    <Popover.Content>
      <RecurringNotifyForm onSubmit={handleSubmit} instanceID={instanceID} instance={instance}/>
    </Popover.Content>
  </Popover>
}

export default inviteFunc