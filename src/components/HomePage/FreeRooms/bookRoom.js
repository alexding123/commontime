import React from 'react'
import { Popover } from 'react-bootstrap'
import BookRoomForm from '../../forms/BookRoomForm'

/**
 * Popover element displaying a form to book a room
 * @param {Object} room The room to book
 * @param {Boolean} canBookPrivate Whether the user can choose to book privately
 * @param {function} handleSubmit Handler for when the form submits
 */
const bookRoomFunc = (room, canBookPrivate, handleSubmit) => {
  return <Popover>
    <Popover.Title>{`Book ${room.name}`}</Popover.Title>
    <Popover.Content>
      <BookRoomForm room={room} onSubmit={handleSubmit(room.id)} canBookPrivate={canBookPrivate} cancelForm={() => document.body.click()}/>
    </Popover.Content>
  </Popover>
}

export default bookRoomFunc