import Papa from 'papaparse'
import date from 'date-and-time'
import { notificationSet, notificationClosed } from './notificationsActions'
import { push } from 'connected-react-router'

export const UPLOAD_USERS_FORM_SUCCESS = 'UPLOAD_USERS_FORM_SUCCESS'
export const uploadUsersFormSuccess = () => ({
  type: UPLOAD_USERS_FORM_SUCCESS,
})
export const UPLOAD_USERS_FORM_ERROR = 'UPLOAD_USERS_FORM_ERROR'
export const uploadUsersFormError = (msg) => ({
  type: UPLOAD_USERS_FORM_ERROR,
  msg,
})

export const uploadUsersForm = (values) => {
  return (dispatch, getState, {getFirebase}) => {
    const file = values.file
    if (!file) {
      dispatch(uploadUsersFormError("No file is found."))
    }
    try {
    Papa.parse(file, {
      header: true,
      complete: (r) => {
        try {
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
          const uploadUsers = firebase.functions().httpsCallable('upload-users')
          uploadUsers({data}).then(() => {
            dispatch(uploadUsersFormSuccess())
          }).catch(e => {
            dispatch(uploadUsersFormError(`Error: ${e.message}`))
          })
        } catch (e) {
          console.error(e)
          dispatch(uploadUsersFormError("Error while parsing the uploaded file. Please check that its format is correct."))
        }  
      }
    })
    return true
    } catch (e) {
      console.error(e)
      dispatch(uploadUsersFormError("Error while parsing the uploaded file. Please check that its format is correct."))
    }
  }
}

export const UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS = 'UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS'
export const uploadGroupsMeetingsMembersFormSuccess = () => ({
  type: UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS,
})
export const UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR = 'UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR'
export const uploadGroupsMeetingsMembersFormError = (msg) => ({
  type: UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR,
  msg,
})

const parseGroupsFile = (data, dispatch) => {
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

const parseMeetingsFile = (data, groupsData, dispatch) => {
  data.forEach(datum => {
    const id = datum['CourseSectionNumber']
    // skip if course-section not found in groupsData
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

const parseMembersFile = (data, groupsData, dispatch) => {
  data.forEach(datum => {
    const id = datum['Group ID']
    // skip if course-section not found in groupsData
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

export const uploadGroupsMeetingsMembersForm = (values) => {
  return (dispatch, getState, {getFirebase}) => {
    dispatch(uploadGroupsMeetingsMembersFormError(null))
    const { groupsFile, meetingsFile, membersFile } = values
    if (!groupsFile || !meetingsFile || !membersFile) {
      dispatch(uploadGroupsMeetingsMembersFormError("One or more file is not found."))
    }
    try {
    Papa.parse(groupsFile, {
      header: true,
      complete: (r) => {
        try {
        let groupsData = parseGroupsFile(r.data, dispatch)
        Papa.parse(meetingsFile, {
          header: true,
          complete: (r) => {
            try {
              parseMeetingsFile(r.data, groupsData, dispatch)
              Papa.parse(membersFile, {
                header: true,
                complete: (r) => {
                  try {
                  parseMembersFile(r.data, groupsData, dispatch)                    
                  } catch (e) {
                    console.error(e)
                    dispatch(uploadGroupsMeetingsMembersFormError("Error while parsing the uploaded members file. Please check that its formatting is correct"))
                    return false
                  }
                  const firebase = getFirebase()
                  const uploadCourses = firebase.functions().httpsCallable('upload-courses')
                  uploadCourses({
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
                  }).then(() => {
                    dispatch(uploadGroupsMeetingsMembersFormSuccess())
                  }).catch(e => {
                    dispatch(uploadGroupsMeetingsMembersFormError(`Error: ${e.message}`))
                    return false
                  })
                }
              })
            } catch (e) {
              console.error(e)
              dispatch(uploadGroupsMeetingsMembersFormError("Error while parsing the uploaded meetings file. Please check that its formatting is correct"))
              return false
            }
          }
        })
        } catch (e) {
          console.error(e)
          dispatch(uploadGroupsMeetingsMembersFormError("Error while parsing the uploaded meetings file. Please check that its formatting is correct"))
          return false
        }
      }
    })
    return true
    } catch (e) {
      console.error(e)
      dispatch(uploadGroupsMeetingsMembersFormError("Error while parsing the uploaded groups file. Please check that its formatting is correct"))
    }
  }
}

export const PERIODS_RETRIEVED = 'PERIODS_RETRIEVED'
export const periodsRetrieved = (data) => ({
  type: PERIODS_RETRIEVED,
  data: data
})

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

export const ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED = 'ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED'

export const administratorSidebarCollapsedToggled = () => ({
  type: ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED
})

export const ADD_ADMIN_FORM_SUCCESS = 'ADD_ADMIN_FORM_SUCCESS'
export const addAdminFormSuccess = (msg) => ({
  type: ADD_ADMIN_FORM_SUCCESS,
  data: msg,
})

export const ADD_ADMIN_FORM_ERROR = 'ADD_ADMIN_FORM_ERROR'
export const addAdminFormError = (msg) => ({
  type: ADD_ADMIN_FORM_ERROR,
  data: msg,
})


export const initiateAddAdmin = (values) => {
  return (dispatch, getState) => {
    dispatch(notificationSet('confirmAddAdmin', {
      email: values.email
    }))
  }
}

export const confirmAddAdmin = (email) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase()
    const addAdmin = firebase.functions().httpsCallable('auth-addAdmin')
    const state = getState()
    dispatch(notificationClosed())
    if (email === state.firebase.profile.email) {
      dispatch(addAdminFormError("You cannot add yourself as a new admin."))
      return
    } 
    addAdmin({
      email: email
    }).then(() => {
      dispatch(addAdminFormSuccess(`You have successfully added ${email} as an administrator.`))
      dispatch(listAdmins())
    }).catch(err => {
      dispatch(addAdminFormError(err.message))
    })
  }
}

export const LIST_ADMINS_SUCCESS = 'LIST_ADMINS_SUCCESS'
export const listAdminsSuccess = (data) => ({
  type: LIST_ADMINS_SUCCESS,
  data: data,
})

export const listAdmins = () => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase()
    const listAdmins = firebase.functions().httpsCallable('auth-listAdmins')
    listAdmins().then(res => {
      dispatch(listAdminsSuccess(res.data))
    })
  }
}

export const relinquishAdmin = () => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase()
    const relinquishAdmin = firebase.functions().httpsCallable('auth-relinquishAdmin')
    relinquishAdmin().then(() => {
      dispatch(push('/'))
    })
  }
}