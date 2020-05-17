import React from 'react'
import UploadUsersForm from '../../forms/UploadUsersForm'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { uploadUsersForm, uploadGroupsMeetingsMembersForm } from '../../../actions/administratorActions'
import UploadGroupsMeetingsMembersForm from '../../forms/UploadGroupsMeetingsMembersForm'
import { Alert } from 'react-bootstrap'

const AnnualBoard = ({handleUsersSubmit, uploadGroupsMeetingsMembersSubmit, annualBoard}) => {
  return (<div>
    <h3>Upload</h3>
    <div className="divider"/>
    <Alert variant="danger">
      <div>
      It is highly recommended that all of the following operations be done only once a year, before the school year begins. Uploading the users file would check all existing users and update their information according to the file. Uploading the courses files would prompt every user to create new events on their Calendar based on the new files. Therefore, only upload each year's files once, or else there will be duplicate events on user calendars. Instead, you may use the courses and users editor to make minor changes. 
      </div>
      <div>
        Each upload takes at least 20 seconds to finish. Please be patient and wait for the webpage to confirm the upload before closing the window. 
      </div>
      </Alert>
    
    {annualBoard.users.error ? 
      <Alert variant="danger">{annualBoard.users.error}</Alert> : null
    }
    {annualBoard.users.message ?
      <Alert variant="info">
        {annualBoard.users.message}
      </Alert> : null
    }
    <h5>Users</h5>
    <UploadUsersForm onSubmit={handleUsersSubmit}/>
    <hr/>
    <h5>Courses</h5>
    {annualBoard.courses.error ? 
      <Alert variant="danger">{annualBoard.courses.error}</Alert> : null
    }
    {annualBoard.courses.message ?
      <Alert variant="info">
        {annualBoard.courses.message}
      </Alert> : null
    }
    <UploadGroupsMeetingsMembersForm onSubmit={uploadGroupsMeetingsMembersSubmit}/>
  </div>)
}

const enhance = compose(
  connect((state) => ({
    annualBoard: state.administratorPage.annualBoard,
  }), (dispatch) => ({
    handleUsersSubmit: (values) => dispatch(uploadUsersForm(values)),
    uploadGroupsMeetingsMembersSubmit: (values) => dispatch(uploadGroupsMeetingsMembersForm(values))
  }))
)

export default enhance(AnnualBoard)