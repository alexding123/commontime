import React, { lazy } from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Suspense } from 'react'

const BookOneOffInviteSuccess = lazy(() => import('./BookOneOffInviteSuccess'))
const BookOneOffNotifySuccess = lazy(() => import('./BookOneOffNotifySuccess'))
const BookRecurringInviteSuccess = lazy(() => import('./BookRecurringInviteSuccess'))
const BookRecurringNotifySuccess = lazy(() => import('./BookRecurringNotifySuccess'))
const BookRoomSuccess = lazy(() => import('./BookRoomSuccess'))
const ConfirmAddAdmin = lazy(() => import('./ConfirmAddAdmin'))
const ConfirmDeleteCourse = lazy(() => import('./ConfirmDeleteCourse'))
const ConfirmDeleteUser = lazy(() => import('./ConfirmDeleteUser'))
const CoursesPopulated = lazy(() => import('./CoursesPopulated'))
const FirstTimeLogin = lazy(() => import('./FirstTimeLogin'))
const InvitationAccepted = lazy(() => import('./InvitationAccepted'))
const InvitationDeclined = lazy(() => import('./InvitationDeclined'))
const RecurringInvitationAccepted = lazy(() => import('./RecurringInvitationAccepted'))
const RecurringInvitationDeclined = lazy(() => import('./RecurringInvitationDeclined'))
const RelinquishAdmin = lazy(() => import('./RelinquishAdmin'))

const Notifications = ({current}) => {
  return (
    <Suspense fallback={<div/>}>
    <div id="notifications">
    {current === 'bookOneOffInviteSuccess' && <BookOneOffInviteSuccess/>}
    {current === 'bookOneOffNotifySuccess' && <BookOneOffNotifySuccess/>}
    {current === 'bookRecurringInviteSuccess' && <BookRecurringInviteSuccess/>}
    {current === 'bookRecurringNotifySuccess' && <BookRecurringNotifySuccess/>}
    {current === 'bookRoomSuccess' && <BookRoomSuccess/>}
    {current === 'confirmAddAdmin' && <ConfirmAddAdmin/>}
    {current === 'confirmDeleteCourse' && <ConfirmDeleteCourse/>}
    {current === 'confirmDeleteUser' && <ConfirmDeleteUser/>}
    {current === 'coursesPopulated' && <CoursesPopulated/>}
    {current === 'firstTimeLogin' && <FirstTimeLogin/>}
    {current === 'invitationAccepted' && <InvitationAccepted/>}
    {current === 'invitationDeclined' && <InvitationDeclined/>}
    {current === 'recurringInvitationAccepted' && <RecurringInvitationAccepted/>}
    {current === 'recurringInvitationDeclined' && <RecurringInvitationDeclined/>}
    {current === 'relinquishAdmin' && <RelinquishAdmin/>}
    </div>
    </Suspense>
  )
}

const enhance = compose(
  connect(state => ({
    current: state.notifications.current,
  }))
)

export default enhance(Notifications)