import React, { useState } from 'react';
import { login, register } from '../services/api';

import './Login.css'

interface LoginProps {
  onLoginSuccess: (data: {
    token: string;
    userId: number;
    name: string;
    email: string;
  }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isRegister && password !== confirmPassword) {
  setError('Passwords do not match.');
  return;
}
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await register({ name, email, password });

        if (response.success && response.data?.token) {
          localStorage.setItem('token', response.data.token);
          onLoginSuccess(response.data);
        } else {
          setMessage(
            response.message || 'Registration successful. Please sign in.'
          );
          setIsRegister(false);
        }
      } else {
        const response = await login({ email, password });

        if (response.success && response.data?.token) {
          localStorage.setItem('token', response.data.token);
          onLoginSuccess(response.data);
        } else {
          setError(response.message || 'Login failed.');
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (isRegister
            ? 'Registration failed. Please check your details.'
            : 'Login failed. Check your credentials and try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister((current) => !current);
    setError('');
    setMessage('');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Expense Tracker</h1>
        <h2>{isRegister ? 'Create account' : 'Sign in'}</h2>

        {isRegister && (
          <>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          required
          minLength={isRegister ? 8 : undefined}
        />
        {isRegister && (
  <>
    <label htmlFor="confirmPassword">Confirm password</label>
    <input
      id="confirmPassword"
      type="password"
      value={confirmPassword}
      onChange={(event) => setConfirmPassword(event.target.value)}
      autoComplete="new-password"
      minLength={8}
      required
    />
  </>
)}

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? isRegister
              ? 'Creating account...'
              : 'Signing in...'
            : isRegister
              ? 'Create account'
              : 'Sign in'}
        </button>

        <p>
          {isRegister
            ? 'Already have an account? '
            : "Don't have an account? "}
          <button type="button" onClick={switchMode} disabled={loading}>
            {isRegister ? 'Sign in' : 'Register'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;