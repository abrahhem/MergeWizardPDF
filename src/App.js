import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Main from "./views/main";

const theme = createTheme({
    palette: {
        primary: {
            main: '#191970',
        },
        secondary: {
            main: '#afafed',
        },
    },
});

function App() {
  return (
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Main />}/>
            <Route path="*" element={<div>not found</div>}/>
          </Routes>
        </Router>
      </ThemeProvider>
  );
}

export default App;
