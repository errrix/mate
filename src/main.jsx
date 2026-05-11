import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ExerciseStoreProvider } from './store/exerciseStore'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExerciseStoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ExerciseStoreProvider>
  </React.StrictMode>,
)
