import React from 'react';
import { useSelector } from "react-redux";
import { isLoaded } from "react-redux-firebase";
import SplashScreen from "../components/SplashScreen";
import PropTypes from 'prop-types'

/**
 * Helper component to only render once auth and profile are loaded
 * Before that, display a splash screen
 */
export default function AuthIsLoaded({ children }) {
  const auth = useSelector(state => state.firebase.auth)
  const profile = useSelector(state => state.firebase.profile)
  if (!isLoaded(auth) || !isLoaded(profile)) return <SplashScreen/>
  return children
}

AuthIsLoaded.propTypes = {
  children: PropTypes.object,
}