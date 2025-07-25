import { useState } from 'react';
import { useRouter } from 'next/router';
import { login, register } from '../lib/auth';
import { withNetworkSimulation } from '../lib/network';
import styles from './Login.module.css';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const operation = async () => {
        if (isLogin) {
          return await login(formData.email, formData.password);
        } else {
          return await register(formData);
        }
      };

      const result = await withNetworkSimulation(operation, {
        errorMessage: isLogin ? 'Login failed' : 'Registration failed'
      });

      // Redirect based on user type
      if (result && result.membershipType === 'admin') {
        router.push('/admin');
      } else {
        router.push('/schedule');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div 
      id="login-page" 
      className={styles.loginContainer}
      data-form-mode={isLogin ? 'login' : 'register'}
      data-form-submitting={loading}
    >
      <h1 className={styles.pageTitle}>{isLogin ? 'Login' : 'Register'}</h1>
      
      {isLogin && (
        <div id="test-credentials" className={styles.testCredentials}>
          <h3>Test Credentials</h3>
          <div className={styles.credentialGroup}>
            <strong>Student Account:</strong>
            <p className={styles.credentialDetail}>Email: student@test.com</p>
            <p className={styles.credentialDetail}>Password: password123</p>
          </div>
          <div className={styles.credentialGroup}>
            <strong>Admin Account:</strong>
            <p className={styles.credentialDetail}>Email: admin@test.com</p>
            <p className={styles.credentialDetail}>Password: admin123</p>
          </div>
        </div>
      )}
      
      <form id="login-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className={styles.formGroup}>
            <label htmlFor="name-input" className={styles.label}>
              Name
            </label>
            <input
              id="name-input"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required={!isLogin}
              className={styles.input}
            />
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="email-input" className={styles.label}>
            Email
          </label>
          <input
            id="email-input"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password-input" className={styles.label}>
            Password
          </label>
          <input
            id="password-input"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className={styles.input}
          />
        </div>
        
        {error && (
          <div id="error-message" className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <button
          id="submit-button"
          type="submit"
          disabled={loading}
          className={`${styles.submitButton} ${loading ? 'loading' : ''}`}
          aria-busy={loading}
        >
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      <div className={styles.toggleContainer}>
        <button
          id="toggle-login-register"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className={styles.toggleButton}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}