import React from 'react'
import { NavDropdown } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { withRouter } from 'react-router-dom'
import { logout } from '../actions/authActions'
import { compose } from 'recompose'
import { push } from 'connected-react-router'
import HomeIcon from '@material-ui/icons/Home'
import EventIcon from '@material-ui/icons/Event'
import GroupIcon from '@material-ui/icons/Group'

const OurNavbar = ({profile, location, redirect, logout}) => {
  const isLoggedIn = !isEmpty(profile)
  const pathname = location.pathname
  let admin = isLoggedIn ? profile.token.claims.admin : null
  return (
  <Navbar className="main-navbar" expand="sm" variant="dark">
  <Navbar.Brand href="/">
    Commontime
  </Navbar.Brand>
  <Navbar.Toggle aria-controls="navbar"/>
  <Navbar.Collapse id="navbar">
    <Nav className="mr-auto" activeKey={pathname}>
      <Nav.Item>
        <Nav.Link href="/" eventKey="/">
          <HomeIcon fontSize="small"/> 
          Home
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/Book" eventKey="/Book">
          <EventIcon fontSize="small"/>
          Book
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/Meet" eventKey="/Meet">
          <GroupIcon fontSize="small"/>
          Meet
        </Nav.Link>
      </Nav.Item>
    </Nav>
    <Nav className="ml-auto">
      {isLoggedIn ? 
        <NavDropdown title={profile.name ? profile.name : "Loading name..."}>
          <NavDropdown.Item href="/Profile">
            Profile
          </NavDropdown.Item>
          <NavDropdown.Divider/>
          { admin ?
            <React.Fragment>
              <NavDropdown.Item href="/Administrator">Administrator</NavDropdown.Item>
              <NavDropdown.Divider/>
            </React.Fragment> :
            null
          }
          <NavDropdown.Item onClick={() => {
            logout()
            redirect("/")
          }}>Log Out</NavDropdown.Item>
        </NavDropdown> :
        <Nav.Item>
        <Nav.Link className="p-0" href={"/Login"}>
          <Button variant="outline-light">
            Login
          </Button>
        </Nav.Link>
        </Nav.Item>
      }
    </Nav>
  </Navbar.Collapse>
  </Navbar>
)}


const enhance = compose(
  withRouter,
  connect(
    (state) => ({
      profile: state.firebase.profile,
    }),
    (dispatch) => ({
      logout: () => dispatch(logout()),
      redirect: (path) => dispatch(push(path)),
    })
  ),
)

export default enhance(OurNavbar)