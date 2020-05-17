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

const store = configureStore()
const render = (Component) => {
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

render(App)

if (module.hot && process.env.NODE_ENV !== 'production') 
{
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default;
    render(NextApp)
  })
}

serviceWorker.register()