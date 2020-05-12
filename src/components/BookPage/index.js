import React from 'react'
import { compose } from 'recompose'
import BookRoom from './BookRoom'

const BookPage = () => {

  return (
    <div className="main" >
      <h3>Book a Room</h3>
      <BookRoom/>
    </div>
  )
}

const enhance = compose(
)

export default enhance(BookPage)