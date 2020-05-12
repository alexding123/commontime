export const NOTIFICATION_SET = 'NOTIFICATION_SET'
export const notificationSet = (kind, data={}) => ({
  type: NOTIFICATION_SET,
  data: {
    data,
    kind,
  },
})

export const NOTIFICATION_CLOSED = 'NOTIFICATION_CLOSED'
export const notificationClosed = () => ({
  type: NOTIFICATION_CLOSED,
})