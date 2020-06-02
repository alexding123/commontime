import React from 'react'
import { compose } from 'recompose'
import BookRoom from './BookRoom'

/**
 * Page to book a meeting for the current user
 */
const BookPage = () => {

  return (
    <div className="main" >
      <h3>Book a Room</h3>
      <BookRoom/>
    </div>
  )
}

BookPage.propTypes = {

}

const enhance = compose(
)

export default enhance(BookPage)