import React from 'react' 
import { Popover } from 'react-bootstrap'
import OneoffNotifyForm from '../../../forms/OneoffNotifyForm'

/**
 * Popover to notify other users who have been added to the meeting
 * @param {Object} instance The meeting
 * @param {string} instanceID ID of the meeting
 * @param {function} handleSubmit Handler for form submission
 */
const notifyFunc = (instance, instanceID, handleSubmit) => {
  return <Popover>
    <Popover.Title>Add people to the meeting</Popover.Title>
    <Popover.Content>
      <OneoffNotifyForm onSubmit={handleSubmit} instanceID={instanceID} instance={instance}/>
    </Popover.Content>
  </Popover>
}

export default notifyFunc