import React from 'react' 
import { Popover } from 'react-bootstrap'
import RecurringNotifyForm from '../../../forms/RecurringNotifyForm'

const notifyFunc = (instance, instanceID, handleSubmit) => {
  return <Popover>
    <Popover.Title>Add people to the meeting</Popover.Title>
    <Popover.Content>
      <RecurringNotifyForm onSubmit={handleSubmit} instanceID={instanceID} instance={instance}/>
    </Popover.Content>
  </Popover>
}

export default notifyFunc