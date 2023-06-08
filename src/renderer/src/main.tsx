import { render } from 'solid-js/web'
import './assets/index.scss'
import App from './App'
import { Router, hashIntegration } from '@solidjs/router'

render(
  () => (
    <Router source={hashIntegration()}>
      <App />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
