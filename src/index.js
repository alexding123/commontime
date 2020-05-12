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
import { Router  } from 'react-router-dom'
import history from './store/history'
import * as serviceWorker from './serviceWorker'

const store = configureStore()
const render = (Component) => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
      <Router history={history}>
        <ReactReduxFirebaseProvider {...setupFB(store)}>
          <Component/>
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
  console.log(module.hot)
  console.log("HOT")
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default;
    render(NextApp)
  })
}

serviceWorker.register()