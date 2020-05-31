import date from 'date-and-time'
import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { reset } from 'redux-form'
import { pageSet } from '../../../actions/meetingPageActions'
import { filterDuplicate } from '../../../utils'
import SplashScreen from '../../SplashScreen'
import Display from './Display'
import ErrorBoundary from '../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Subpage to display all available time/place pairs under the search
 * parameters given by the user
 */
const DisplayPage = ({goPeoplePage, goFrequencyPage, goPeriodsPage, restart, data, periods}) => {
  if (!isLoaded(periods)) {
    return <SplashScreen/>
  }
  // get all unique periods
  const allPeriods = periods ? filterDuplicate(Object.values(periods), 'period') : []
  // calculate all the periods excluded by the search parameters
  const excludePeriods = allPeriods.filter(period => !data.periods.map(period => period.period).includes(period.period))
  return (
  <div className="d-flex flex-column">
    <div>
      <p>
        <Button className="inline-link" variant="link" onClick={goFrequencyPage}>
          {data.frequency === 'oneOff' && 'One-off '}
          {data.frequency === 'recurring' && 'Recurring '}
        </Button>
        &nbsp;meeting of&nbsp;
        <Button className="inline-link" variant="link" onClick={goPeoplePage}>
          {data.people.map(person => person.name).join(', ')}
        </Button>
        { data.frequency === 'oneOff' ? 
          <React.Fragment>
            &nbsp;between&nbsp; 
            <Button className="inline-link" variant="link" onClick={goFrequencyPage}>
              {`${date.format(data.dateRange.startDate, 'MMMM DD')} - ${date.format(data.dateRange.endDate, 'MMMM DD')}`}
            </Button>
          </React.Fragment> : null
        }
        { excludePeriods.length ? 
          <React.Fragment>
            &nbsp;(excluding&nbsp;
            {
              excludePeriods.map((period, index) => 
                <React.Fragment key={index}>
                  <Button className="inline-link" variant="link" onClick={goPeriodsPage}> 
                    {period.name}
                  </Button>
                  {index !== (excludePeriods.length - 1) ? <React.Fragment>,&nbsp;</React.Fragment> : null}
                </React.Fragment>
              )
            })
          </React.Fragment> : null
        }
      </p>
    </div>
    <ErrorBoundary>
    <Display/>
    </ErrorBoundary>
    <ButtonGroup>
      <Button onClick={goPeriodsPage}>Previous</Button>
      <Button onClick={restart}>Reset</Button>
    </ButtonGroup>
  </div>)
}

DisplayPage.propTypes = {
  /** Handler to navigate to the people subpage of the form */
  goPeoplePage: PropTypes.func.isRequired,
  /** Handler to navigate to the frequency subpage of the form */
  goFrequencyPage: PropTypes.func.isRequired,
  /** Handler to navigate to the periods subpage of the form */
  goPeriodsPage: PropTypes.func.isRequired,
  /** Handler to reset the search parameters form */
  restart: PropTypes.func.isRequired,
  /** Values the user inputted in the search parameters form */
  data: PropTypes.shape({
    frequency: PropTypes.oneOf(['oneOff', 'recurring']).isRequired,
    periods: PropTypes.array.isRequired,
    people: PropTypes.array.isRequired,
    dateRange: PropTypes.shape({
      startDate: PropTypes.objectOf(Date).isRequired,
      endDate: PropTypes.objectOf(Date).isRequired,
    })
  }).isRequired,
  periods: PropTypes.object,
}

const enhance = compose(
  connect(state => ({
    data: state.meetingPage,
    periods: state.firestore.data.periods,
  }), dispatch => ({
    goPeoplePage: () => dispatch(pageSet('PEOPLE')),
    goFrequencyPage: () => dispatch(pageSet('FREQUENCY')),
    goPeriodsPage: () => dispatch(pageSet('PERIODS')),
    restart: () => {
      dispatch(reset('scheduleMeetingSetupForm'))
      dispatch(pageSet('PEOPLE'))
    }
  })),
)

export default enhance(DisplayPage)