import React, { lazy } from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'

const BookOneOffInviteSuccess = lazy(() => import('./BookOneOffInviteSuccess'))
const BookOneOffNotifySuccess = lazy(() => import('./BookOneOffNotifySuccess'))
const BookRecurringInviteSuccess = lazy(() => import('./BookRecurringInviteSuccess'))
const BookRecurringNotifySuccess = lazy(() => import('./BookRecurringNotifySuccess'))
const BookRoomSuccess = lazy(() => import('./BookRoomSuccess'))
const ConfirmAddAdmin = lazy(() => import('./ConfirmAddAdmin'))
const CoursesPopulated = lazy(() => import('./CoursesPopulated'))
const FirstTimeLogin = lazy(() => import('./FirstTimeLogin'))
const InvitationAccepted = lazy(() => import('./InvitationAccepted'))
const InvitationDeclined = lazy(() => import('./InvitationDeclined'))
const RecurringInvitationAccepted = lazy(() => import('./RecurringInvitationAccepted'))
const RecurringInvitationDeclined = lazy(() => import('./RecurringInvitationDeclined'))
const RelinquishAdmin = lazy(() => import('./RelinquishAdmin'))

const Notifications = ({current}) => {
  switch (current) {
    case 'bookOneOffInviteSuccess':
      return <BookOneOffInviteSuccess/>
    case 'bookOneOffNotifySuccess':
      return <BookOneOffNotifySuccess/>
    case 'bookRecurringInviteSuccess':
      return <BookRecurringInviteSuccess/>
    case 'bookRecurringNotifySuccess':
      return <BookRecurringNotifySuccess/>
    case 'bookRoomSuccess':
      return <BookRoomSuccess/>
    case 'confirmAddAdmin':
      return <ConfirmAddAdmin/>
    case 'coursesPopulated':
      return <CoursesPopulated/>
    case 'firstTimeLogin':
      return <FirstTimeLogin/>
    case 'invitationAccepted':
      return <InvitationAccepted/>
    case 'invitationDeclined':
      return <InvitationDeclined/>
    case 'recurringInvitationAccepted':
      return <RecurringInvitationAccepted/>
    case 'recurringInvitationDeclined':
      return <RecurringInvitationDeclined/>
    case 'relinquishAdmin':
      return <RelinquishAdmin/>
    default:
      return null
  }
}

const enhance = compose(
  connect(state => ({
    current: state.notifications.current,
  }))
)

export default enhance(Notifications)