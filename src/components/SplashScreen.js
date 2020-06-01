import React from 'react'
import { Spinner } from 'react-bootstrap'

/**
 * Spinner to display when data is loading
 */
const SplashScreen = () => (
  <div className="main">
    <div className="splash-screen">
      <Spinner animation="border" />
    </div>
  </div>
)

export default SplashScreen