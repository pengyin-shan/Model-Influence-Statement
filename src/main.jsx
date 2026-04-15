import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'
import './styles.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f5c4d'
    },
    secondary: {
      main: '#b45f06'
    },
    background: {
      default: '#f4efe5',
      paper: '#fffdf7'
    }
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    h1: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 700
    },
    h2: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 700
    },
    h3: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 18
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
