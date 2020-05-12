import React from 'react'
import ContentEditable from 'react-contenteditable'
import { Button } from 'react-bootstrap'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'

import date from 'date-and-time'

class Box extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      startTime: props.startTime,
      endTime: props.endTime,
      name: props.name,
      isClass: props.isClass,
    }
    this.props = props
  }

  handleNameOnChange = e => {
    this.setState({
      name: e.target.value
    })
  }

  handleNameOnBlur = () => {
    const tempIsClass = this.state.name.startsWith('Period ')
    const tempPeriod = tempIsClass ? Number(this.state.name.split('Period ')[1]) : this.state.name
    this.setState({
      isClass: tempIsClass
    })
    
    this.props.updateField('name', this.state.name)
    this.props.updateField('period', tempPeriod)
    this.props.updateField('isClass', tempIsClass)
  }

  handleStartTimeOnChange = e => {
    this.setState({
      startTime: e.target.value
    })
  }

  checkTimesSane = (startTime, endTime) => {
    const start = date.parse(startTime, 'HH:mm')
    const end = date.parse(endTime, 'HH:mm')
    const result = date.subtract(end, start)
    return result.toMinutes() > 0
  } 

  handleStartTimeOnBlur = () => {
    // reset if values don't make sense
    if (!date.isValid(this.state.startTime, 'HH:mm') || !this.checkTimesSane(this.state.startTime, this.state.endTime)) {
      this.setState({
        startTime: this.props.startTime,
      })
    }
    this.props.updateField('startTime', this.state.startTime)
  }

  handleEndTimeOnChange = (e) => {
    this.setState({
      endTime: e.target.value
    })
  }

  handleEndTimeOnBlur = () => {
    // reset if values don't make sense
    if (!date.isValid(this.state.endTime, 'HH:mm') || !this.checkTimesSane(this.state.startTime, this.state.endTime)) {
      this.setState({
        endTime: this.props.endTime
      })
    }
    this.props.updateField('endTime', this.state.endTime)
  }

  render() {
    const className = 'd-flex flex-column align-items-center justify-content-center box ' +
    (this.state.isClass ? 'box-normal' : 'box-special')
    const buttonClassName = this.state.isClass ? 'color-theme' : 'color-two'
    const startTime = date.parse(this.props.startTime, 'HH:mm')
    const endTime = date.parse(this.props.endTime, 'HH:mm')
    const duration = date.subtract(endTime, startTime).toMinutes() + 5
    const height = duration * 1.5
    return (<div className={className} style={{height: `${height}px`}}>
    <div>
      <div className='box-bottom left'>
        <ContentEditable tagName="span" html={this.state.name} onChange={this.handleNameOnChange} onBlur={this.handleNameOnBlur}/>
      </div>
      <div className='box-bottom right'>
        { <ContentEditable tagName="span" html={this.state.startTime} onChange={this.handleStartTimeOnChange} onBlur={this.handleStartTimeOnBlur}/>} - { <ContentEditable tagName="span" html={this.state.endTime} onChange={this.handleEndTimeOnChange} onBlur={this.handleEndTimeOnBlur}/>
        }
      </div>
      <div className='box-top right'>
        <Button variant="link" className="mx-0 p-0" onClick={this.props.delete}><CloseIcon className={buttonClassName}/></Button>
      </div>
    </div>
  </div>)
  }
}

const Header = ({day}) => {
  const daysMap = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return (<div className='d-flex flex-column align-items-center justify-content-center box box-special' style={{height: `30px`}}>
    <div>
      <span>{daysMap[day]}</span>
    </div>
  </div>)
}

const AddBox = ({day, addPeriod}) => {
  return <div className='d-flex flex-column align-items-center justify-content-center'>
    <Button variant='link' onClick={() => addPeriod(day)}>
      <AddIcon/>
    </Button>
  </div>
}

export {
  Box,
  Header,
  AddBox
}