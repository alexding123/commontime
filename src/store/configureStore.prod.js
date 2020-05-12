import { routerMiddleware } from 'connected-react-router'
import { getFirebase } from 'react-redux-firebase'
import { applyMiddleware, compose, createStore } from 'redux'
import { getFirestore } from 'redux-firestore'
import thunk from 'redux-thunk'
import { enhanceStore } from '../firebase'
import createRootReducer from '../reducers'
import history from './history'

const configureStore = preloadedState => {
  const rootReducer = createRootReducer(history)
  const store = createStore(
    rootReducer,
    preloadedState,
    compose(
      applyMiddleware(
        thunk.withExtraArgument({getFirebase, getFirestore}),
        routerMiddleware(history),
      ),
      enhanceStore,
    )
  )

  return store
}

export default configureStore