import React from 'react'
import Button from 'react-bootstrap/Button'
import { compose } from 'recompose'

const NotFoundPage = () => {
  return (
    <div className="main d-flex flex-column justify-content-center align-items-center" style={{textAlign: 'center', height: '60vh'}}>
      <h2>404!</h2>
      <p><strong>Page not found</strong></p>
      <p>The page you're looking for does not exist or some other error occurred.</p>
      <Button href="/">Take me home!</Button>
    </div>
  )
}

const enhance = compose(
)

export default enhance(NotFoundPage)