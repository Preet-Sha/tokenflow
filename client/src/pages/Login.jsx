// client/src/components/auth/Login.jsx
import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, error } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [alert, setAlert] = useState(null);
  
  const { email, password } = formData;
  
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      await login({ email, password });
    } catch (err) {
      setAlert(error || 'Login failed');
    }
  };
  
  // Redirect if logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="row">
      <div className="col-md-6 mx-auto">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4>Login</h4>
          </div>
          <div className="card-body">
            {alert && (
              <div className="alert alert-danger">{alert}</div>
            )}
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={email}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={password}
                  onChange={onChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;