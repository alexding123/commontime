import { applyMiddleware, compose, createStore } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import DevTools from '../components/DevTools'
import { enhanceStore } from '../firebase'
import createRootReducer from '../reducers'
import { getFirestore } from 'redux-firestore'
import { getFirebase } from 'react-redux-firebase'
import history from './history'
import { routerMiddleware } from 'connected-react-router'

const configureStore = preloadedState => {
  const rootReducer = createRootReducer(history)
  const store = createStore(
    rootReducer,
    preloadedState,
    compose(
      applyMiddleware(
        thunk.withExtraArgument({getFirebase, getFirestore}), 
        routerMiddleware(history),
        createLogger(),
      ),
      enhanceStore,
      DevTools.instrument(),
    )
  )
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return store
}

export default configureStore