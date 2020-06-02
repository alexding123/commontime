import './wdyr'
import 'react-hot-loader'
import 'react-widgets/dist/css/react-widgets.css'
import "./stylesheets/main.scss"
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import App from './components/App'
import { setupFB } from "./firebase"
import configureStore from './store/configureStore'
import { ConnectedRouter } from 'connected-react-router'
import { LastLocationProvider } from 'react-router-last-location'
import { Router } from 'react-router-dom'
import history from './store/history'
import * as serviceWorker from './serviceWorker'
import * as Sentry from '@sentry/browser'

// initialize Sentry in production only
const dsn = process.env.NODE_ENV === 'development' ? null : "https://4157fd3daadc4f778f480e05f1e1c33e@o394172.ingest.sentry.io/5243982" 
Sentry.init({dsn})

const store = configureStore()
/**
 * Wraps the component in a bunch of providers and renders
 * @param {Object} Component The component to render
 */
const render = (Component) => {
  // provides a bunch of objects:
  // router, redux store, firebase/firestore, and last location
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
      <Router history={history}>
        <ReactReduxFirebaseProvider {...setupFB(store)}>
          <LastLocationProvider>
            <Component/>
          </LastLocationProvider>
        </ReactReduxFirebaseProvider>
      </Router>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
  )
}

// render the main app
render(App)

// enables hot module replacement in development
if (module.hot && process.env.NODE_ENV !== 'production') 
{
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default;
    render(NextApp)
  })
}

// enables PWA
serviceWorker.register()