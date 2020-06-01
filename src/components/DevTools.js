import React from 'react'
import { createDevTools } from 'redux-devtools'
import DockMonitor from 'redux-devtools-dock-monitor'
import LogMonitor from 'redux-devtools-log-monitor'

/**
 * Create the visible DevTools component (only for development)!
 */
export default createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h"
               changePositionKey="ctrl-i"
               defaultPosition="bottom">
    <LogMonitor />
  </DockMonitor>
)