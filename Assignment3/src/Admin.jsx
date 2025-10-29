//Admin Home Page - Will complete when we have the stats backend completed

import './App.css';

function Admin({ currentUserId }) {
  return (
    <div className="admin-home">
      <h2>Admin Home Page</h2>
      <p>User ID: {currentUserId}</p>
    </div>
  );
}

export default Admin;

