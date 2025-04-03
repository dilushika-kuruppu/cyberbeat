import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/Logo.svg';
import { apiService } from '../components/Api';

//const Login = ({ setIsAuthenticated }) => {
  // const [credentials, setCredentials] = useState({ 
  //   email: 'prasanna@cyberbeat.com.sg', 
  //   verifyCode: '1200004986510276' 
  // });
  // const [error, setError] = useState('');
  // const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  
//   const mockUsers = [
//     {
//       email: "admin@example.com",
//       password: "admin123",
//       token: "mock-token-123",
//       name: "Admin User"
//     },
//     {
//       email: "user@example.com",
//       password: "user123",
//       token: "mock-token-456",
//       name: "Regular User"
//     }
//   ];

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setCredentials(prev => ({ ...prev, [name]: value }));
  // };

  // const handleSubmit = async (e) => {  
  //   e.preventDefault();
  //   if (!credentials.email || !credentials.verifyCode) {
  //     setError('Please enter both email and verifyCode');
  //     return;
  //   }

  //   setLoading(true);
  //   setError('');
  //   try {
  //       const response = await apiService.login(credentials.email, credentials.verifyCode);
  //       localStorage.setItem('authToken', response.token);
  //       setIsAuthenticated(true);
  //       navigate('/registration');
  //     }
    // setTimeout(() => {
    //   try {
    //     const user = mockUsers.find(
    //       u => u.email === credentials.email && u.password === credentials.password
    //     );
        
    //     if (user) {
    //       // Mock successful login
    //       localStorage.setItem('authToken', user.token);
    //       localStorage.setItem('userEmail', user.email);
    //       setIsAuthenticated(true);
    //       navigate('/registration');
    //     } else {
    //       throw new Error('Invalid email or password');
    //     }
    //   } 
      // catch (err) {
      //   setError(err.message);
      // } finally {
      //   setLoading(false);
      // }

    //};
    const Login = ({ setIsAuthenticated }) => {
      const [credentials, setCredentials] = useState({ 
        email: 'prasanna@cyberbeat.com.sg', 
        verifyCode: '1200004986510276' 
      });
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
          const verifyResponse = await apiService.verify(
            credentials.email, 
            credentials.verifyCode
          );
          
          localStorage.setItem('authToken', verifyResponse.token);
          localStorage.setItem('userEmail', credentials.email);
          
          await apiService.verifySuccess(
            credentials.email, 
            credentials.verifyCode
          );
          
          setIsAuthenticated(true);
          navigate('/registration');
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
    
  return (
    <div className="login-page-container">
      <div className="login-card-container">
        <div className="login-form-card">
          <h2>Welcome Back</h2>
          {error && <p className="error-message">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Vkencrdence Id</label>
              <input
                type="text"
                name="verifyCode"
                value={credentials.verifyCode}
                onChange={(e) => setCredentials({...credentials, verifyCode: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
             {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
        
        <div className="login-image-card">
          <img src={loginImage} alt="Login Visual" className="login-image" />
        </div>
      </div>
    </div>
  );
};

export default Login;