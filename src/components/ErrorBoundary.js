import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'
import { Button, Alert } from 'react-bootstrap'

/**
 * Implementation of the error boundary, only active
 * in production. Allows user to report to Sentry.io
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { eventId: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'development') {
      Sentry.withScope((scope) => {
        scope.setExtras(errorInfo)
        const eventId = Sentry.captureException(error)
        this.setState({eventId})
      })
    }   
  }

  render() {
    if (this.state.hasError) {
      // render fallback component
      if (process.env.NODE_ENV === 'development') {
        return (<Alert variant="danger">
          <p>Something went wrong!</p>
        </Alert>)
      } else {
        return (<Alert variant="danger">
          <p>Something went wrong!</p>
          <Button onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId })}>
            Report feedback
          </Button>
        </Alert>)
      }
    }

    // when there's not an error, render children untouched
    return this.props.children;
  }
}

export default ErrorBoundary