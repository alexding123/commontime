import React from 'react'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Octicon, {MarkGithub, IssueOpened} from '@primer/octicons-react'

const Footer = () => {

  return (<footer>
      <Row className="align-items-center mt-auto mb-auto h-100">
        <Col>
          Got a feature request or noticed a bug? Open an&nbsp;
          <Button variant="link" className="inline-link" href="https://github.com/alexding123/commontime/issues">
            <span>Issue</span>
            <Octicon icon={IssueOpened} size={10}/>
          </Button>&nbsp;
          on&nbsp;
          <Button variant="link" className="inline-link" href="https://github.com/alexding123/commontime">
            <span>GitHub</span>
            <Octicon icon={MarkGithub} size={10}/>
          </Button>
          .
        </Col>
      </Row>
  </footer>)
}

export default Footer