import React from 'react'
import { Popover } from 'react-bootstrap'
import BookRoomForm from '../../forms/BookRoomForm'
const bookRoomFunc = (room, canBookPrivate, handleSubmit) => {
  return <Popover>
    <Popover.Title>{`Book ${room.name}`}</Popover.Title>
    <Popover.Content>
      <BookRoomForm room={room} onSubmit={handleSubmit(room.id)} canBookPrivate={canBookPrivate} cancelForm={() => document.body.click()}/>
    </Popover.Content>
  </Popover>
}

export default bookRoomFunc