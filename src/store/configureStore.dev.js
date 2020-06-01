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

/**
 * Creates a redux Store, for development environment
 * @param {Object} preloadedState The initial state (not needed since we're not persisting locally)
 */
const configureStore = preloadedState => {
  const rootReducer = createRootReducer(history)
  const store = createStore(
    rootReducer,
    preloadedState,
    compose(
      applyMiddleware(
        thunk.withExtraArgument({getFirebase, getFirestore}), // allow actions to fetch Firebase and Firestore objects
        routerMiddleware(history), // allows action-based routing
        createLogger(), // logging actions in console, for developing
      ),
      enhanceStore, // adding support for React-Redux-Firebase
      DevTools.instrument(), // physical DevTools on the bottom of hte screen
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