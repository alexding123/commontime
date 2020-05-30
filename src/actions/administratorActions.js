import Papa from 'papaparse'
import date from 'date-and-time'
import { notificationSet, notificationClosed } from './notificationsActions'
import { push } from 'connected-react-router'
import { reset, startSubmit, stopSubmit } from 'redux-form'

// hijack PapaParse to provide a promise for parse
Papa.parsePromise = function(file, {...configs}) {
  return new Promise(function(complete, error) {
    Papa.parse(file, {complete, error, ...configs});
  })
}

export const UPLOAD_USERS_FORM_SUCCESS = 'UPLOAD_USERS_FORM_SUCCESS'
/**
 * Clears any error message for uploading the users file
 */
export const uploadUsersFormSuccess = () => ({
  type: UPLOAD_USERS_FORM_SUCCESS,
})

export const UPLOAD_USERS_FORM_ERROR = 'UPLOAD_USERS_FORM_ERROR'
/**
 * Causes an error to display about uploading the users file
 * @param {string} msg Error message
 */
export const uploadUsersFormError = (msg) => ({
  type: UPLOAD_USERS_FORM_ERROR,
  msg,
})

/**
 * Parse and upload the submitted users file
 * @param {Object} values Submitted form values
 */
export const uploadUsersForm = (values) => {
  return (dispatch, getState, {getFirebase}) => {
    // startSubmit to inform redux form that form is submitting and hence disabled
    // to prevent multiple submissions
    const form = 'uploadUsersForm'
    dispatch(startSubmit(form))
    dispatch(uploadUsersFormError(null))

    /**
     * Displays an error and stops form submission
     * @param {msg} msg Message sent
     */
    const uploadError = (msg) => {
      dispatch(uploadUsersFormError(msg))
      dispatch(stopSubmit(form))
    }

    /**
     * Completes form submission
     */
    const uploadSuccess = () => {
      dispatch(uploadUsersFormSuccess())
      dispatch(stopSubmit(form))
    }
    
    const /** string */ file = values.file
    // ensure the file exists
    if (!file) {
      uploadError('Error: users file not found.')
      return
    }

    // attempt to parse csv
    Papa.parsePromise(file, {
      header: true,
    }).then(r => {
      // check that all expected headers exist
      const expectedFields = ['User ID', 'Email ID', 'Role(s)', 'Grade Level', 'First Name', 'Last Name']
      if (expectedFields.some(field => !r.meta.fields.includes(field))) {
        throw new Error(`Error: users file does not have expected fields ${expectedFields.join(', ')}.`)
      }
      // extract data from parsed results, skipping header
      const data = r.data.slice(1).map(datum => ({
        id: datum['User ID'],
        email: datum['Email ID'].toLowerCase(),
        teacher: datum['Role(s)'] === "Staff",
        grade: datum['Grade Level'],
        firstName: datum['First Name'],
        lastName: datum['Last Name'],
        name: `${datum['First Name']} ${datum['Last Name']}`,
      }))
      const firebase = getFirebase()
      // upload extracted data from users file
      const uploadUsers = firebase.functions().httpsCallable('upload-users')
      return uploadUsers({data}).then(() => {
        uploadSuccess()
      })
    }).catch(e => {
      uploadError(e.message)
    })
  }
}

export const UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS = 'UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS'
/**
 * Success in uploading course files, clearing errors
 */
export const uploadGroupsMeetingsMembersFormSuccess = () => ({
  type: UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS,
})

export const UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR = 'UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR'
/**
 * Error when uploading course files
 * @param {string} msg Error message to display
 */
export const uploadGroupsMeetingsMembersFormError = (msg) => ({
  type: UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR,
  msg,
})

/**
 * Parse the groups file and returns the result 
 * @param {Object[]} data CSV data parsed from the groups file
 */
const parseGroupsFile = (data) => {
  const mappedData = data.map(datum => ({
    id: datum['Group ID'],
    course: datum['Course #'],
    section: datum['Section #'],
    name: datum['Course Name'],
    department: datum['Department'],
    fallTerm: datum['Term'].includes('F'),
    winterTerm: datum['Term'].includes('W'),
    springTerm: datum['Term'].includes('S'),
    members: [],
    teacher: null,
  }))
  let convertedMap = {}
  mappedData.forEach(datum => {
    convertedMap[datum.id] = datum
  })
  return convertedMap
}

/**
 * Parse the meetings file, extracting its information to append to each corresponding course
 * @param {Object[]} data The course data to be added to
 * @param {*} groupsData Parsed CSV data from the groups file
 */
const parseMeetingsFile = (data, groupsData) => {
  data.forEach(datum => {
    const id = datum['CourseSectionNumber']
    // skip if no entry with the same course-section exists in the groups file
    if (!groupsData[id]) {
      return
    }
    const rooms = [datum['Room_D01'], datum['Room_D02'], datum['Room_D03'], datum['Room_D04'], datum['Room_D05']]
    const times = datum['zz_Slots_T1'].split('\n').filter(s => s !== "").map(time => ({
      day: Number(time.slice(2,4)),
      period: Number(time.slice(5,7)),
      room: rooms[Number(time.slice(2,4))-1],
    }))
    groupsData[id].times = times
  })
}

/**
 * Parse the members file, extracting its information to append to each corresponding course
 * @param {*} data CSV data parsed from the members file
 * @param {*} groupsData Parsed CSV data from the groups file
 */
const parseMembersFile = (data, groupsData) => {
  data.forEach(datum => {
    const id = datum['Group ID']
    // skip if no entry with the same course-section exists in the groups file
    if (!groupsData[id]) {
      return
    }
    const isTeacher = datum['Role(s)']
    const userID = datum['User ID']
    if (isTeacher === 'Organizer') {
      groupsData[id].teacher = userID
    }
    groupsData[id].members.push(userID)
  })
}

/**
 * Parse and upload the submitted groups, meetings, and members file
 * to generate a list of courses 
 * @param {Object} values Form values
 */
export const uploadGroupsMeetingsMembersForm = (values) => {
  return (dispatch, getState, {getFirebase}) => {
    const form = 'uploadGroupsMeetingsMembersForm'
    dispatch(startSubmit(form))
    dispatch(uploadGroupsMeetingsMembersFormError(null))
    
    /**
     * Displays an error and stops form submission
     * @param {msg} msg Message sent
     */
    const uploadError = (msg) => {
      dispatch(uploadGroupsMeetingsMembersFormError(msg))
      dispatch(stopSubmit(form))
    }

    /**
     * Completes form submission
     */
    const uploadSuccess = () => {
      dispatch(uploadGroupsMeetingsMembersFormSuccess())
      dispatch(stopSubmit(form))
    }

    // check if files exist
    const { groupsFile, meetingsFile, membersFile } = values
    if (!groupsFile || !meetingsFile || !membersFile) {
      uploadError("Error: or more file is not found.")
      return
    }

    // try to parse the groups file
    Papa.parsePromise(groupsFile, {
      header: true,
    }).then(r => {
      // check if all expected headers exist
      const expectedFields = ['Group ID', 'Course #', 'Section #', 'Course Name', 'Department', 'Term']
      if (expectedFields.some(field => !r.meta.fields.includes(field))) {
        throw new Error(`expected fields ${expectedFields.join(', ')} not found in the groups file.`)
      }

      let groupsData = parseGroupsFile(r.data)
      const parsePromise = Papa.parse(meetingsFile, {
        header: true,
      })
      const dataPromise = Promise.resolve(groupsData)
      return Promise.all([parsePromise, dataPromise])
    }).then(([r, groupsData]) => {
      // check if all expected headers exist
      const expectedFields = ['CourseSectionNumber', 'Room_D01', 'Room_D02', 'Room_D03', 'Room_D04', 'Room_D05', 'zz_Slots_T1']
      if (expectedFields.some(field => !r.meta.fields.includes(field))) {
        throw new Error(`expected fields ${expectedFields.join(', ')} not found in meetings file.`)
      }

      parseMeetingsFile(r.data, groupsData)

      const parsePromise = Papa.parse(membersFile, {
        header: true
      })
      const dataPromise = Promise.resolve(groupsData)
      return Promise.all([parsePromise, dataPromise])
    }).then(([r, groupsData]) => {
      // check if all expected headers exist
      const expectedFields = ['Group ID', 'Role(s)', 'User ID']
      if (expectedFields.some(field => !r.meta.fields.includes(field))) {
        throw new Error(`expected fields ${expectedFields.join(', ')} not found in members file.`)
      }
      parseMembersFile(r.data, groupsData)                    
      
      // upload the generated courses data
      const firebase = getFirebase()
      const uploadCourses = firebase.functions().httpsCallable('upload-courses')

      // also upload the terms given in the form
      // convert to string for transit, will decode back on Firebase functions
      return uploadCourses({
        data: Object.values(groupsData),
        terms: {
          fallStart: values.fallStart.toString(),
          fallEnd: values.fallEnd.toString(),
          winterStart: values.winterStart.toString(),
          winterEnd: values.winterEnd.toString(),
          springStart: values.springStart.toString(),
          springEnd: values.springEnd.toString(),
          daylightStart: values.daylightStart.toString(),
          daylightEnd: values.daylightEnd.toString(),
        },
      })
    }).then(() => {
      uploadSuccess()
    }).catch(e => {
      uploadError(`Error: ${e.message}`)
    })
  }
}

// START
// Everything between START and END is horrible code that is due to be rewritten
// along with the rooms and periods editor
export const PERIODS_RETRIEVED = 'PERIODS_RETRIEVED'
/**
 * Signals that all periods have been retrieved from the database
 * This should be deprecated and rewritten
 * @param {*} data 
 */
export const periodsRetrieved = (data) => ({
  type: PERIODS_RETRIEVED,
  data: data
})

/**
 * Retrieves all periods from the Cloud Firestore
 */
export const retrievePeriods = () => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('periods').get().then(docs => {
      let docsMap = {}
      docs.forEach(doc => {
        docsMap[doc.id] = doc.data()
      })
      dispatch(periodsRetrieved(docsMap))
    })
  }
}

export const PERIODS_UPDATE_FIELD = 'PERIODS_UPDATE_FIELD'
export const periodsUpdateField = (period, field, value) => ({
  type: PERIODS_UPDATE_FIELD,
  period,
  field,
  value,
})

export const PERIODS_DELETE_PERIOD = 'PERIODS_DELETE_PERIOD'
export const periodsDeletePeriod = (period) => ({
  type: PERIODS_DELETE_PERIOD,
  period,
})



export const PERIODS_ADD_PERIOD = 'PERIODS_ADD_PERIOD'
export const periodsAddPeriod = (id, period) => ({
  type: PERIODS_ADD_PERIOD,
  period,
  id,
})

export const addPeriodToDay = (day) => {
  return (dispatch, getState) => {
    const state = getState()
    const currentPeriods = Object.values(state.administratorPage.annualBoard.periods.current)
    const periods = currentPeriods.filter(period => period.day === day)
    const periodNumbers = periods.filter(period => typeof(period.period) === 'number').map(period => period.period)
    let maxPeriodNumber = 1
    if (periodNumbers.length) {
      maxPeriodNumber = Math.max(...periodNumbers) + 1
    }
    const times = periods.map(period => period.endTime)
    let latestTime = '08:25'
    if (times.length) {
      latestTime = times.reduce((acc, curr) => 
        (acc > curr) ? acc : curr
      )
    }
    const startTime = date.addMinutes(date.parse(latestTime, 'HH:mm'), 5)
    const endTime = date.addMinutes(startTime, 40)
    const period = {
      day,
      startTime: date.format(startTime, 'HH:mm'),
      endTime: date.format(endTime, 'HH:mm'),
      period: maxPeriodNumber,
      isClass: true,
      name: `Period ${maxPeriodNumber}`,
    }
    let nextUnusedKey = 1
    const keys = Object.keys(state.administratorPage.annualBoard.periods.current).map(key => key.split('-')[1]).filter(n => !isNaN(n)).map(n => Number(n))
    if (keys.length) {
      nextUnusedKey = Math.max(...keys) + 1
    }
    dispatch(periodsAddPeriod(`${day}-${nextUnusedKey}`, period))
  }
}

export const PERIODS_RESET = 'PERIODS_RESET'
export const periodsReset = () => ({
  type: PERIODS_RESET,
})

export const PERIODS_UPLOAD_SUCCESS = 'PERIODS_UPLOAD_SUCCESS'
export const periodsUploadSuccess = (msg) => ({
  type: PERIODS_UPLOAD_SUCCESS,
  msg,
})

export const PERIODS_UPLOAD_ERROR = 'PERIODS_UPLOAD_ERROR'
export const periodsUploadError = (msg) => ({
  type: PERIODS_UPLOAD_ERROR,
  msg,
})

export const uploadPeriods = () => {
  return (dispatch, getState, {getFirebase}) => {
    const state = getState()
    const firebase = getFirebase()
    const periods = Object.values(state.administratorPage.annualBoard.periods.current)
    const uploadPeriods = firebase.functions().httpsCallable('upload-periods')
    uploadPeriods({data: periods}).then(() => {
      dispatch(periodsUploadSuccess('Successfully uploaded periods.'))
    }).catch(e => {
      dispatch(periodsUploadError(`Error: ${e.message}`))
    })
  }
}


export const ROOMS_RETRIEVED = 'ROOMS_RETRIEVED'
export const roomsRetrieved = (data) => ({
  type: ROOMS_RETRIEVED,
  data: data
})

export const retrieveRooms = () => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('rooms').get().then(docs => {
      let docsMap = {}
      docs.forEach(doc => {
        docsMap[doc.id] = doc.data()
      })
      dispatch(roomsRetrieved(docsMap))
    })
  }
}

export const ROOMS_UPDATE_FIELD = 'ROOMS_UPDATE_FIELD'
export const roomsUpdateField = (room, field, value) => ({
  type: ROOMS_UPDATE_FIELD,
  room,
  field,
  value,
})

export const ROOMS_DELETE_ROOM = 'ROOMS_DELETE_ROOM'
export const roomsDeleteRoom = (room) => ({
  type: ROOMS_DELETE_ROOM,
  room,
})



export const ROOMS_ADD_ROOM = 'ROOMS_ADD_ROOM'
export const roomsAddRoom = (id, room) => ({
  type: ROOMS_ADD_ROOM,
  room,
  id,
})

export const addRoom = () => {
  return (dispatch, getState) => {
    const state = getState()
    let nextID = 1
    const roomKeys = Object.keys(state.administratorPage.annualBoard.rooms.current).filter(key => key.startsWith('New')).map(key => Number(key.split('New')[1]))
    if (roomKeys.length) {
      nextID = Math.max(...roomKeys) + 1
    }
    const id = 'New'+String(nextID)
    
    const room = {
      id,
      name: 'New Room',
      floor: 5,
    }
    dispatch(roomsAddRoom(id, room))
  }
}

export const ROOMS_RESET = 'ROOMS_RESET'
export const roomsReset = () => ({
  type: ROOMS_RESET,
})

export const ROOMS_UPLOAD_SUCCESS = 'ROOMS_UPLOAD_SUCCESS'
export const roomsUploadSuccess = (msg) => ({
  type: ROOMS_UPLOAD_SUCCESS,
  msg,
})

export const ROOMS_UPLOAD_ERROR = 'ROOMS_UPLOAD_ERROR'
export const roomsUploadError = (msg) => ({
  type: ROOMS_UPLOAD_ERROR,
  msg,
})

export const uploadRooms = () => {
  return (dispatch, getState, {getFirebase}) => {
    const state = getState()
    const firebase = getFirebase()
    const rooms = Object.values(state.administratorPage.annualBoard.rooms.current)
    const ids = rooms.map(room => room.id)
    if ((new Set(ids)).size !== ids.length) {
      dispatch(roomsUploadError('Error: room ids must be unique.'))
      return
    }
    const uploadRooms = firebase.functions().httpsCallable('upload-rooms')
    uploadRooms({data: rooms}).then(() => {
      dispatch(roomsUploadSuccess('Successfully uploaded rooms.'))
    }).catch(e => {
      dispatch(roomsUploadError(`Error: ${e.message}`))
    })
  }
}

// END

export const ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED = 'ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED'
/**
 * Toggles the sidebar visibility
 */
export const administratorSidebarCollapsedToggled = () => ({
  type: ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED
})

export const ADD_ADMIN_FORM_SUCCESS = 'ADD_ADMIN_FORM_SUCCESS'
/**
 * Signals the successful adding of an administrator
 * @param {string} msg The message to display as a success
 */
export const addAdminFormSuccess = (msg) => ({
  type: ADD_ADMIN_FORM_SUCCESS,
  data: msg,
})

export const ADD_ADMIN_FORM_ERROR = 'ADD_ADMIN_FORM_ERROR'
/**
 * Signals that adding administrator has failed
 * @param {string} msg The error message to display
 */
export const addAdminFormError = (msg) => ({
  type: ADD_ADMIN_FORM_ERROR,
  data: msg,
})

/**
 * Triggered when the user presses the button to add admin,
 * prompting confirmation
 * @param {Object} values Form values
 */
export const initiateAddAdmin = (values) => {
  return (dispatch, getState) => {
    // startSubmit to avoid multiple submissions to be made
    dispatch(startSubmit('addAdminForm'))
    // raises the notification to confirm this decision
    dispatch(notificationSet('confirmAddAdmin', {
      email: values.email
    }))
    dispatch(stopSubmit('addAdminForm'))
  }
}

/**
 * Confirms and executes the adding of an administrator
 * @param {string} email Email of the new admin
 */
export const confirmAddAdmin = (email) => {
  return (dispatch, getState, {getFirebase}) => {
    // calls the firebase function to add Admin
    const firebase = getFirebase()
    const addAdmin = firebase.functions().httpsCallable('auth-addAdmin')
    const state = getState()
    dispatch(notificationClosed())
    // disallow adding oneself
    if (email === state.firebase.profile.email) {
      dispatch(addAdminFormError("You cannot add yourself as a new admin."))
      return
    } 
    addAdmin({
      email: email
    }).then(() => {
      dispatch(addAdminFormSuccess(`You have successfully added ${email} as an administrator.`))
      // update the list of admins to reflect the latest addition
      dispatch(listAdmins())
    }).catch(err => {
      dispatch(addAdminFormError(err.message))
    })
  }
}

export const LIST_ADMINS_SUCCESS = 'LIST_ADMINS_SUCCESS'
/**
 * Signals that listAdmins has been called successfully,
 * setting the data of the list of admins
 * @param {Object[]} data List of admins
 */
export const listAdminsSuccess = (data) => ({
  type: LIST_ADMINS_SUCCESS,
  data: data,
})

/**
 * Calls Firebase function to list all current admins
 */
export const listAdmins = () => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase()
    const listAdmins = firebase.functions().httpsCallable('auth-listAdmins')
    listAdmins().then(res => {
      dispatch(listAdminsSuccess(res.data))
    })
  }
}

/**
 * Relinquishes current user's admin privileges
 */
export const relinquishAdmin = () => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase()
    const relinquishAdmin = firebase.functions().httpsCallable('auth-relinquishAdmin')
    relinquishAdmin().then(() => {
      dispatch(push('/'))
    })
  }
}

export const SET_ADD_COURSE_ERROR = 'SET_ADD_COURSE_ERROR'
/**
 * Sets an error message to be displayed when adding a new course
 * @param {string} value Error message
 */
export const setAddCourseError = (value) => ({
  type: SET_ADD_COURSE_ERROR,
  data: value,
})

/**
 * Adds a new course to the Cloud Firestore
 * @param {Object[]} courses List of current courses
 * @param {Object} values Form values describing the new course
 */
export const addCourse = (courses, values) => {
  return (dispatch, getState, {getFirestore}) => {
    // startSubmit to inform Redux form that form is submitting and hence disabled
    // to prevent multiple submissions
    dispatch(startSubmit('addCourseForm'))
    const db = getFirestore()
    const id = `${values.course}-${values.section.padStart(2, '0')}`
    // if another course with the same ID exists
    if (courses.filter(course => course.id === id).length > 0) {
      dispatch(setAddCourseError(`Course with ID ${values.course} and section ${values.section} already exists. Please edit that course instead.`))
      dispatch(stopSubmit('addCourseForm'))
      return
    }
    dispatch(setAddCourseError(null))
    const members = values.members.map(member => member.id)
    const times = values.times.map(time => ({
      day: time.period.day,
      period: time.period.period,
      room: time.room.id,
    }))
    // set Cloud Firestore
    db.collection('courses').doc(id).set({
      course: values.course,
      department: values.department,
      fallTerm: values.fallTerm,
      id,
      members,
      name: values.name,
      section: values.section,
      springTerm: values.springTerm,
      teacher: values.teacher.id,
      times,
      winterTerm: values.winterTerm,
    }).then(() => {
      dispatch(push('/Administrator/Courses'))
      dispatch(reset('addCourseForm'))
      dispatch(stopSubmit('addCourseForm'))
    })
  }
}

/**
 * Deletes a course by ID
 * @param {string} id ID of course to be deleted
 */
export const deleteCourse = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('courses').doc(id).delete()
  }
}

/**
 * Edits an existing course's properties
 * @param {string} id ID of course to be editted
 * @param {Object} values Form values describing the course edit
 */
export const editCourse = (id, values) => {
  return (dispatch, getState, {getFirestore}) => {
    dispatch(startSubmit('editCourseForm'))
    const db = getFirestore()
    // can only update the members and times fields of the database instance
    const members = values.members.map(member => member.id)
    const times = values.times.map(time => ({
      day: time.period.day,
      period: time.period.period,
      room: time.room.id,
    }))
    // Cloud Firestore operation
    db.collection('courses').doc(id).update({
      department: values.department,
      fallTerm: values.fallTerm,
      members,
      name: values.name,
      springTerm: values.springTerm,
      teacher: values.teacher.id,
      times,
      winterTerm: values.winterTerm,
    }).then(() => {
      dispatch(push("/Administrator/Courses"))
      dispatch(startSubmit('editCourseForm'))
    })
  }
}

export const SET_ADD_USER_ERROR = 'SET_ADD_USER_ERROR'
/**
 * Sets an error when adding an user
 * @param {string} value Error message to be displayed
 */
export const setAddUserError = (value) => ({
  type: SET_ADD_USER_ERROR,
  data: value,
})

/**
 * Adds a new userPreset to the Cloud Firestore
 * @param {Object[]} users List of current users
 * @param {Object} values Form values describing the new user
 */
export const addUser = (users, values) => {
  return (dispatch, getState, {getFirestore}) => {
    dispatch(startSubmit('addUserForm'))
    const db = getFirestore()
    // if another user with the same ID exists
    if (users.filter(user => user.id === values.id).length > 0) {
      dispatch(setAddUserError(`User with ID ${values.id} already exists. Please edit that user instead.`))
      dispatch(stopSubmit('addUserForm'))
      return
    }
    dispatch(setAddUserError(null))
    const name = `${values.firstName} ${values.lastName}`
    // Cloud Firestore operation
    db.collection('userPreset').doc(values.id).set({
      ...values,
      name,
    }).then(() => {
      dispatch(push('/Administrator/Users'))
      dispatch(reset('addUserForm'))
      dispatch(stopSubmit('addUserForm'))
    })
  }
}

/**
 * Deletes an existing user by ID
 * @param {string} id ID of the user to be deleted
 */
export const deleteUser = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('userPreset').doc(id).delete()
  }
}

/**
 * Edits an existing userPreset by ID
 * @param {string} id ID of the user to be editted
 * @param {Object} values Form values describing the edit
 */
export const editUser = (id, values) => {
  return (dispatch, getState, {getFirestore}) => {
    dispatch(startSubmit('editUserForm'))
    const db = getFirestore()
    const name = `${values.firstName} ${values.lastName}`
    // Cloud Firestore operation
    db.collection('userPreset').doc(id).update({
      email: values.email,
      firstName: values.firstName,
      grade: values.grade,
      lastName: values.lastName,
      name,
      teacher: values.teacher,
    }).then(() => {
      dispatch(push("/Administrator/Users"))
      dispatch(stopSubmit('editUserForm'))
    })
  }
}

export const SET_ADD_EXCEPTION_ERROR = 'SET_ADD_EXCEPTION_ERROR'
/**
 * Sets an error message when adding an exception
 * @param {string} value Error message
 */
export const setAddExceptionError = (value) => ({
  type: SET_ADD_EXCEPTION_ERROR,
  data: value,
})

/**
 * Adds a new exception to Cloud Firestore
 * @param {Object[]} exceptions List of current exceptions
 * @param {Object} values Form values describing the new exception
 */
export const addException = (exceptions, values) => {
  return (dispatch, getState, {getFirestore}) => {
    dispatch(startSubmit('addExceptionForm'))
    const db = getFirestore()
    // if there is another exception on the same day
    if (exceptions.filter(user => user.date === values.date).length > 0) {
      dispatch(setAddUserError(`An exception on ${date.format(values.date, 'MMMM DD, YYYY')} already exists. Please edit that exception instead.`))
      dispatch(stopSubmit('addExceptionForm'))
      return
    }
    dispatch(setAddExceptionError(null))
    const formattedDate = date.format(values.date, 'MM/DD/YYYY')
    // cannot use / for id, so we use -
    const formattedID = date.format(values.date, 'MM-DD-YYYY')
    // Cloud Firestore operation
    db.collection('exceptions').doc(formattedID).set({
      ...values,
      date: formattedDate,
    }).then(() => {
      dispatch(push('/Administrator/Exceptions'))
      dispatch(reset('addExceptionForm'))
      dispatch(stopSubmit('addExceptionForm'))
    })
  }
}

/**
 * Deletes an exception by ID
 * @param {string} id ID of the exception to be deleted
 */
export const deleteException = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('exceptions').doc(id).delete()
  }
}

/**
 * Edits an exception by ID
 * @param {string} id ID of the exception to be editted
 * @param {Object} values Form values describing the edit
 */
export const editException = (id, values) => {
  return (dispatch, getState, {getFirestore}) => {
    dispatch(startSubmit('editExceptionForm'))
    const db = getFirestore()
    // Cloud Firestore operation
    db.collection('exceptions').doc(id).update({
      description: values.description,
      summary: values.summary,
    }).then(() => {
      dispatch(push("/Administrator/Exceptions"))
      dispatch(stopSubmit('editExceptionForm'))
    })
  }
}