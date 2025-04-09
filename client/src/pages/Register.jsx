import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import * as Components from "./Components";
import "./style.css";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login, register, isAuthenticated, error } = useContext(AuthContext);
  const [signIn, toggle] = React.useState(true);
  
  // Sign In state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  
  const [alert, setAlert] = useState(null);
  
  // Destructure for easy access
  const { email: loginEmail, password: loginPassword } = loginData;
  const { name, email, password, password2 } = formData;
  
  // Handle login form changes
  const onLoginChange = e => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };
  
  // Handle signup form changes
  const onSignupChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
  };
  
  // Handle login submission
  const onLoginSubmit = async e => {
    e.preventDefault();
    
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setAlert(error || 'Login failed');
    }
  };
  
  // Handle signup submission
  const onSignupSubmit = async e => {
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
  
  // Redirect if authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Components.CenteredWrapper>
    <Components.Container>
      <Components.SignUpContainer signingIn={signIn}>
        <Components.Form onSubmit={onSignupSubmit}>
          <Components.Title>Create Account</Components.Title>
          {!signIn && alert && <div className="alert alert-danger">{alert}</div>}
          <Components.Input 
            type="text" 
            name="name"
            placeholder="Name" 
            value={name}
            onChange={onSignupChange}
            required
          />
          <Components.Input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={email}
            onChange={onSignupChange}
            required
          />
          <Components.Input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={password}
            onChange={onSignupChange}
            required
            minLength="6"
          />
          <Components.Input 
            type="password" 
            name="password2"
            placeholder="Confirm Password" 
            value={password2}
            onChange={onSignupChange}
            required
            minLength="6"
          />
          <Components.Button type="submit">Sign Up</Components.Button>
        </Components.Form>
      </Components.SignUpContainer>

      <Components.SignInContainer signingIn={signIn}>
        <Components.Form onSubmit={onLoginSubmit}>
          <Components.Title>Sign in</Components.Title>
          {signIn && alert && <div className="alert alert-danger">{alert}</div>}
          <Components.Input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={loginEmail}
            onChange={onLoginChange}
            required
          />
          <Components.Input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={loginPassword}
            onChange={onLoginChange}
            required
          />
          <Components.Anchor href="#">Forgot your password?</Components.Anchor>
          <Components.Button type="submit">Sign In</Components.Button>
        </Components.Form>
      </Components.SignInContainer>

      <Components.OverlayContainer signingIn={signIn}>
        <Components.Overlay signingIn={signIn}>
          <Components.LeftOverlayPanel signingIn={signIn}>
            <Components.Title>Welcome Back!</Components.Title>
            <Components.Paragraph>
              To keep connected with us please login with your personal info
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(true)}>
              Sign In
            </Components.GhostButton>
          </Components.LeftOverlayPanel>
          <Components.RightOverlayPanel signingIn={signIn}>
            <Components.Title>Hello, Friend!</Components.Title>
            <Components.Paragraph>
              Enter your personal details and start journey with us
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(false)}>
              Sign Up
            </Components.GhostButton>
          </Components.RightOverlayPanel>
        </Components.Overlay>
      </Components.OverlayContainer>
    </Components.Container>
    </Components.CenteredWrapper>
  );
}

export default Login;