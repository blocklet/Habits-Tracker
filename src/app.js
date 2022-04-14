import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './app.css';
import get from 'lodash/get';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from 'styled-components';
import Home from './pages/home';
import About from './pages/about';
import theme from './libs/theme';
import { SessionProvider } from './contexts/session';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <SessionProvider serviceHost={get(window, 'blocklet.prefix', '/')}>
          <CssBaseline />
          <div className="app">
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/home" element={<Home />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </SessionProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

const WrappedApp = App;

export default () => {
  // While the blocklet is deploy to a sub path, this will be work properly.
  const basename = window?.blocklet?.prefix || '/';

  return (
    <Router basename={basename}>
      <WrappedApp />
    </Router>
  );
};
