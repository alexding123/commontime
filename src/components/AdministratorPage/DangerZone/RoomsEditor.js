import React from 'react'
import { connect } from 'react-redux'
import { compose, lifecycle } from 'recompose'
import { retrieveRooms, roomsUpdateField, roomsDeleteRoom, addRoom, roomsReset, uploadRooms } from '../../../actions/administratorActions'
import SplashScreen from '../../SplashScreen'
import { Button, ButtonGroup, Table } from 'react-bootstrap'
import AddIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'
import ContentEditable from 'react-contenteditable'

class Row extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: props.id,
      name: props.name,
      floor: props.floor,
    }
    this.props = props
  }

  handleIDOnChange = e => {
    this.setState({
      id: e.target.value
    })
  }

  handleIDOnBlur = () => {
    this.props.updateField('id', this.state.id)
  }

  handleNameOnChange = e => {
    this.setState({
      name: e.target.value,
    })
  }

  handleNameOnBlur = () => {
    this.props.updateField('name', this.state.name)
  }

  handleFloorOnChange = e => {
    if (isNaN(e.target.value)) {
      this.setState({
        floor: this.props.floor,
      })
      return
    }
    this.setState({
      floor: Number(e.target.value),
    })
  }

  handleFloorOnBlur = () => {
    this.props.updateField('floor', this.state.floor)
  }

  render() {
    return (
      <tr>
        <td><ContentEditable tagName="span" html={this.state.id} onChange={this.handleIDOnChange} onBlur={this.handleIDOnBlur}/></td>
        <td><ContentEditable tagName="span" html={this.state.name} onChange={this.handleNameOnChange} onBlur={this.handleNameOnBlur}/></td>
        <td><ContentEditable tagName="span" html={`${this.state.floor}`} onChange={this.handleFloorOnChange} onBlur={this.handleFloorOnBlur}/></td>
        <td><Button variant="link" className='mx-0 p-0 d-flex justify-content-center align-items-center' style={{lineHeight: '0 !important'}} onClick={this.props.delete}><CloseIcon/></Button></td>
      </tr>
    )
  }
}


const RoomsEditor = ({annualBoard, updateField, deleteRoom, addRoom, resetRooms, uploadRooms}) => {
  if (!annualBoard.rooms.default) {
    return <SplashScreen/>
  }

  const rooms = Object.entries(annualBoard.rooms.current).sort(
    ([aKey, aVal], [bKey, bVal]) => (aVal.floor < bVal.floor) ? -1 : 1)

  return (
  <div className="d-flex flex-column">
    <ButtonGroup className="align-self-start">
      <Button variant="primary" onClick={uploadRooms}>Upload</Button>
      <Button variant="info" onClick={resetRooms}>Reset</Button>
    </ButtonGroup>

    <Table style={{maxWidth: '900px'}} responsive striped bordered hover size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Floor</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        { rooms.map(([key, room]) => 
          <Row {...room} key={key} updateField={updateField(key)} delete={deleteRoom(key)}/>
          )
        }
        <tr>
          <td colSpan="4">
          <div className="d-flex justify-content-center">
          <Button variant="link" onClick={addRoom}><AddIcon/></Button>
          </div>
          </td>
        </tr>
      </tbody>

    </Table>
  </div>)
}

const enhance = compose(
  connect((state) => ({
    annualBoard: state.administratorPage.annualBoard,
  }), (dispatch) => ({
    retrieveRooms: () => dispatch(retrieveRooms()),
    updateField: (room) => (field, value) => dispatch(roomsUpdateField(room, field, value)),
    deleteRoom: (room) => () => dispatch(roomsDeleteRoom(room)),
    addRoom: () => dispatch(addRoom()),
    resetRooms: () => dispatch(roomsReset()),
    uploadRooms: () => dispatch(uploadRooms()),
  })),
  lifecycle({
    componentDidMount() {
      this.props.retrieveRooms()
    }
  }),
)
export default enhance(RoomsEditor)