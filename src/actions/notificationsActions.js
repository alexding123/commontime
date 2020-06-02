export const NOTIFICATION_SET = 'NOTIFICATION_SET'
/**
 * Sets the current notification
 * @param {string} kind Unique identifier of the notification, if null, then closes current notificaiton
 * @param {Object} data Optional data to supply to the appropriate notification component
 */
export const notificationSet = (kind, data={}) => ({
  type: NOTIFICATION_SET,
  data: {
    data,
    kind,
  },
})

export const NOTIFICATION_CLOSED = 'NOTIFICATION_CLOSED'
/**
 * Closes the current notification
 */
export const notificationClosed = () => ({
  type: NOTIFICATION_CLOSED,
})