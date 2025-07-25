import { useState } from 'react';
import { useRouter } from 'next/router';
import { login, register } from '../lib/auth';
import { withNetworkSimulation } from '../lib/network';

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
    <div id="login-page" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      
      {isLogin && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ marginTop: 0 }}>Test Credentials</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Student Account:</strong>
            <p style={{ margin: '0.25rem 0' }}>Email: student@test.com</p>
            <p style={{ margin: '0.25rem 0' }}>Password: password123</p>
          </div>
          <div>
            <strong>Admin Account:</strong>
            <p style={{ margin: '0.25rem 0' }}>Email: admin@test.com</p>
            <p style={{ margin: '0.25rem 0' }}>Password: admin123</p>
          </div>
        </div>
      )}
      
      <form id="login-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Name
            </label>
            <input
              id="name-input"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required={!isLogin}
              style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email
          </label>
          <input
            id="email-input"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
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
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
        
        {error && (
          <div id="error-message" style={{ 
            color: 'red', 
            marginBottom: '1rem',
            padding: '0.5rem',
            border: '1px solid red',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        <button
          id="submit-button"
          type="submit"
          disabled={loading}
          className={loading ? 'loading' : ''}
          aria-busy={loading}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#3B82F6',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}