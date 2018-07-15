import React, { Component } from 'react';
import logo from './logo.svg';
import FlightList from './components/flight-list';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <p className="App-intro">
          To get started, edit and save to reload.
        </p>
        <FlightList tot={1}></FlightList>
      </div>
    );
  }
}

export default App;
