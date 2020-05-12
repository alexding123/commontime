import React from 'react';
import { useSelector } from "react-redux";
import { isLoaded } from "react-redux-firebase";
import SplashScreen from "../components/SplashScreen";

export default function AuthIsLoaded({ children }) {
  const auth = useSelector(state => state.firebase.auth)
  const profile = useSelector(state => state.firebase.profile)
  if (!isLoaded(auth) || !isLoaded(profile)) return <SplashScreen/>
  return children
}