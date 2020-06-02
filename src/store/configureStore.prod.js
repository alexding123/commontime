import { routerMiddleware } from 'connected-react-router'
import { getFirebase } from 'react-redux-firebase'
import { applyMiddleware, compose, createStore } from 'redux'
import { getFirestore } from 'redux-firestore'
import thunk from 'redux-thunk'
import { enhanceStore } from '../firebase'
import createRootReducer from '../reducers'
import history from './history'

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
      ),
      enhanceStore, // adding support for React-Redux-Firebase
    )
  )

  return store
}

export default configureStore