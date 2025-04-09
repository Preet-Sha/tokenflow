// client/src/components/auth/Register.jsx
import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register, isAuthenticated, error } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [alert, setAlert] = useState(null);
  
  const { name, email, password, password2 } = formData;
  
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (password !== password2) {
      setAlert('Passwords do not match');
      return;
    }
    
    try {
      await register({ name, email, password });
    } catch (err) {
      setAlert(error || 'Registration failed');
    }
  };
  
  // Redirect if registered
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="row">
      <div className="col-md-6 mx-auto">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4>Register</h4>
          </div>
          <div className="card-body">
            {alert && (
              <div className="alert alert-danger">{alert}</div>
            )}
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
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
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password2">Confirm Password</label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  className="form-control"
                  value={password2}
                  onChange={onChange}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;