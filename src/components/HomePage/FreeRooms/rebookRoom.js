import React from 'react'
import { Popover, Alert } from 'react-bootstrap'
import RebookRoomForm from '../../forms/RebookRoomForm'
const rebookRoomFunc = (room, instance, handleSubmit) => {
  return <Popover>
    <Popover.Title>{`Override booking of ${room.name}`}</Popover.Title>
    <Popover.Content>
      <Alert variant="info">This will notify the original booker of the room.</Alert>
      <RebookRoomForm room={room} onSubmit={handleSubmit(room.id, instance)} cancelForm={() => document.body.click()}/>
    </Popover.Content>
  </Popover>
}

export default rebookRoomFunc