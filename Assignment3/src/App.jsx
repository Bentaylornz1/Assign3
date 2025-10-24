import { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    // When the landing page loads, this runs once
    fetch('http://localhost:5000/init')
      .then(res => res.text())
      .then(msg => console.log(msg))
      .catch(err => console.error('Error initializing table:', err));
  }, []);

  return (
    <div className="App">
      <h1>Welcome to Assignment 3</h1>
      <p>The Orders table will be created automatically if it doesnt exist.</p>
    </div>
  );    
}

export default App;
