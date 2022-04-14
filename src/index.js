import React from 'react';
import ReactDOM from 'react-dom';
import buffer from 'buffer';
import App from './app';

window.Buffer = buffer.Buffer;
ReactDOM.render(<App />, document.getElementById('root'));
