import ArrowLeftIcon from '@material-ui/icons/ArrowLeft'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'
import GroupIcon from '@material-ui/icons/Group'
import SettingsIcon from '@material-ui/icons/Settings'
import React from 'react'
import { Nav } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { profileCollapseToggled } from '../../actions/profilePageActions'
import PropTypes from 'prop-types'

/**
 * Component to display a collapsible sidebar, allowing users to
 * navigate between subpages of the Profile page
 */
const Sidebar = ({collapsed, location, toggleCollapsed}) => {
  const pathname = location.pathname.replace("/Profile", "")
  return (
    <div className={"sidebar d-flex flex-row " + (collapsed ? "collapsed" : "show")} >
    <Nav activeKey={pathname} className="sidebar-sticky flex-column flex-grow-1">
      <Nav.Item>
        <Nav.Link href="/Profile/Meetings" eventKey="/Meetings">
          <span className="sidebar-link-icon">
            <GroupIcon fontSize="small"/>
            Meetings
          </span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <div className="sidebar-divider"/>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/Profile/Settings" eventKey="/Settings">
          <span className="sidebar-link-icon">
            <SettingsIcon fontSize="small"/>
            Settings
          </span>
        </Nav.Link>
      </Nav.Item>
    </Nav>
    <div className="sidebar-toggle d-sm-none">
      <div className="toggle-wrapper d-flex justify-content-center align-items-center" onClick={toggleCollapsed}>
      { collapsed ? 
        <ArrowRightIcon fontSize="small"/> :
        <ArrowLeftIcon fontSize="small"/>
      }
      </div>
    </div>
    </div>
  )
}

Sidebar.propTypes = {
  /** Whether the sidebar is collapsed or expanded */
  collapsed: PropTypes.bool.isRequired,
  /** Hook to toggle the visibility of the sidebar */
  toggleCollapsed: PropTypes.func.isRequired,
  /** Router-supplied information about the current URL */
  location: PropTypes.object.isRequired,
}

const enhance = compose(
  withRouter,
  connect((state) => ({
    collapsed: state.profilePage.sidebarCollapsed,
  }), (dispatch) => ({
    toggleCollapsed: () => dispatch(profileCollapseToggled()),
  }))
)

export default enhance(Sidebar)