import Octicon, { IssueOpened, MarkGithub } from '@primer/octicons-react'
import React from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

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