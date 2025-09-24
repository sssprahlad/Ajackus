import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { api, LOGIN_API } from '../../../utils/Constants';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { username, password } = formData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            // console.log('Sending login request to:', LOGIN_API);
            // const response = await axios.post("https://ajackus-abuh.onrender.com/login", {
            //     username,
            //     password
            // });
            const response = await axios.post(
                "https://ajackus-abuh.onrender.com/login",
                { username, password },   // request body
                {
                  headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                  }
                }
              );
              
            
            const data = response.data;
            console.log('Login response:', data);
            
            if (response.status !== 200) {
                throw new Error(data.message || 'Login failed');
            }
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                throw new Error('No token received');
            }
            
        } catch (err) {
            console.error('Login error:', err);
            
            let errorMessage = err.message || 'Login failed. Please check your credentials and try again.';
            
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Sign in to your account</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="form-input"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;