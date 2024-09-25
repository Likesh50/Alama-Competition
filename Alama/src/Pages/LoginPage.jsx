import React from 'react';
import './LoginPage.css';


function LoginPage() {

  return (
    <div className='loginpage'>
      <div className="login-form">
        <div className="flower-logo">
        </div>
        <form >
          <div className="form-group">
            <input
              type="text"
              id="username"
              placeholder="USERNAME"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="PASSWORD"
              
            />
          </div>
          <button type="submit">Sign in</button>
        </form>
      </div>

    </div>
  );
}

export default LoginPage;