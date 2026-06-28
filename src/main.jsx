import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ExerciseStoreProvider } from './store/exerciseStore'
import './index.css'

const routerBasename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExerciseStoreProvider>
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </ExerciseStoreProvider>
  </React.StrictMode>,
)
