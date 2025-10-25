import { useEffect } from 'react';
import './App.css';
import logo from "./assets/logo.png";

function App() {
  useEffect(() => {
    // When the landing page loads, this runs once
    fetch('http://localhost:5000/init')
      .then(res => res.text())
      .then(msg => console.log(msg))
      .catch(err => console.error('Error initializing table:', err));
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
      </header>

      {/* Catalogue placeholder */}
      <main className="catalogue">
        <h1>Catalogue</h1>
        <p>**Inset the catalogue here**</p>
      </main>
    </div>
  );
}

export default App;
