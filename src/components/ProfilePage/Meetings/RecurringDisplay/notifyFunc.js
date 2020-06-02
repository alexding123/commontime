import React from 'react' 
import { Popover } from 'react-bootstrap'
import RecurringNotifyForm from '../../../forms/RecurringNotifyForm'

/**
 * Popover to notify other users who have been added to the meeting
 * @param {Object} recurring The recurring meeting
 * @param {string} recurringID ID of the meeting
 * @param {function} handleSubmit Handler for form submission
 */
const notifyFunc = (recurring, recurringID, handleSubmit) => {
  return <Popover>
    <Popover.Title>Add people to the meeting</Popover.Title>
    <Popover.Content>
      <RecurringNotifyForm onSubmit={handleSubmit} instanceID={recurringID} instance={recurring}/>
    </Popover.Content>
  </Popover>
}

export default notifyFunc