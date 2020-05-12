import React from 'react' 
import { Popover } from 'react-bootstrap'
import OneoffNotifyForm from '../../../forms/OneoffNotifyForm'

const inviteFunc = (instance, instanceID, handleSubmit) => {
  return <Popover>
    <Popover.Title>Invite people to attend</Popover.Title>
    <Popover.Content>
      <OneoffNotifyForm onSubmit={handleSubmit} instanceID={instanceID} instance={instance}/>
    </Popover.Content>
  </Popover>
}

export default inviteFunc