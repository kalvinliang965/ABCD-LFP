import React, { useEffect, useState } from 'react';
import './Login.css';
import axios, { AxiosError } from 'axios';
import { FaGoogle, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; 
import { appConfig } from '../config/appConfig';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { checkAuthStatus, loginAsGuest } = useAuth();

  useEffect(() => {
    // get the DOM elements, querySelector gets the first element, querySelectorAll gets all elements
    // we reassign the elements we get, so we can use them
    const switchCtn = document.querySelector('#switch-cnt') as HTMLElement;
    const switchC1 = document.querySelector('#switch-c1') as HTMLElement;
    const switchC2 = document.querySelector('#switch-c2') as HTMLElement;
    const switchCircle = document.querySelectorAll('.switch_circle');
    const switchBtn = document.querySelectorAll('.switch-btn');
    const aContainer = document.querySelector('#a-container') as HTMLElement;
    const bContainer = document.querySelector('#b-container') as HTMLElement;
    const allButtons = document.querySelectorAll('.submit'); //as all buttons with submit class will trigger this function

    // modify this function, only prevent the default behavior of the switch button
    const getButtons = (e: Event) => {
      const target = e.target as HTMLElement;
      // only prevent the default behavior when the button is clicked
      if (target.classList.contains('switch-btn')) {
        e.preventDefault();
      }
    };

    // switch form animation, when the user clicks the login or register button, this function will be triggered
    // this function will switch some css classes, thus achieving an animation effect
    const changeForm = (e: Event) => {
      // add the fade in animation
      switchCtn.classList.add('is-gx'); //add the is-gx class to all switch-cnt elements, is-gx will make the component have an expanding-shrinking animation effect when switching
      setTimeout(() => {
        switchCtn.classList.remove('is-gx'); //1.5秒后，移除is-gx类，从而实现动画效果
      }, 1500);

      // switch form display
      switchCtn.classList.toggle('is_txr'); //add the is_txr class to all switch-cnt elements, is_txr will make the component have an animation effect when switching
      switchCircle[0].classList.toggle('is_txr'); //switchCircle[0] is the first switch_circle element, depending on your html structure, who is the first
      switchCircle[1].classList.toggle('is_txr');

      // switch content display
      switchC1.classList.toggle('is-hidden'); //add the is-hidden class to all switch-c1 elements, is-hidden will make the component hidden when switching
      switchC2.classList.toggle('is-hidden'); //add the is-hidden class to all switch-c2 elements, is-hidden will make the component hidden when switching
      aContainer.classList.toggle('is_txl'); //when the element has is_txl, it will move to the left, aContainer is the login container, it will move to the left
      bContainer.classList.toggle('is_txl'); //when the element has is_txl, it will move to the left, bContainer is the register container, it will move to the left
      bContainer.classList.toggle('is-z'); //when the element has is-z, it will increase the z-index, thus making the element above the slide container
    };

    // add event listeners
    const addEventListeners = () => {
      for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].addEventListener('click', getButtons);
      }
      for (let i = 0; i < switchBtn.length; i++) {
        switchBtn[i].addEventListener('click', changeForm);
      }
    };

    addEventListeners();

    // remove the event listeners when the component is unmounted, if not removed, the event listeners will be triggered every time the form is switched, causing memory leaks
    return () => {
      for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].removeEventListener('click', getButtons);
      }
      for (let i = 0; i < switchBtn.length; i++) {
        switchBtn[i].removeEventListener('click', changeForm);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log('Attempting login with:', { email }); // Log the attempt

      const response = await axios.post(
        `${appConfig.api.baseURL}/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // Add this line
        }
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        await checkAuthStatus();
        navigate(response.data.redirectUrl || '/scenarios');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Login failed.';
        alert(message);
      } else {
        // fallback for unexpected errors
        alert('An unexpected error occurred.');
      }
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = (e.currentTarget.elements.namedItem('register-username') as HTMLInputElement)
      .value;
    const email = (e.currentTarget.elements.namedItem('register-email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('register-password') as HTMLInputElement)
      .value;

    try {
      const response = await axios.post(`${appConfig.api.baseURL}/auth/signup`, {
        name: username,
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);

        navigate(response.data.redirectUrl || '/scenarios');
      } else {
        console.error('Signup failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle Google sign in - this is the only function we need to change
  const handleGoogleSignIn = () => {
    // Redirect to backend auth route
    console.log(appConfig.dev.port);
    window.location.href = `${appConfig.api.baseURL}/auth/google`;
  };

  // Handle guest login
  const handleGuestLogin = () => {
    // Generate a temporary guest ID
    const guestId = uuidv4();
    const guestUser = {
      _id: guestId,
      name: 'Guest User',
      email: `guest-${guestId.slice(0, 8)}@example.com`,
      isGuest: true
    };

    // Store guest information in localStorage
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    
    // Update auth context with guest user (assuming you'll add this method)
    if (loginAsGuest) {
      loginAsGuest(guestUser);
    }
    
    // Navigate to dashboard
    navigate('/scenarios');
  };

  return (
    <div className="shell">
      <div className="container a-container" id="a-container">
        <form className="form" id="a-form" onSubmit={handleSubmit} autoComplete="off">
          <h2 className="form_title title">Sign In</h2>

          <span className="form_span">Use your email account</span>

          <div className="form_input-group">
            <input
              type="text"
              className="form_input"
              placeholder=" "
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="new-email"
              name="user-email"
            />
            <label className="form_input-label">Email</label>
          </div>

          <div className="form_input-group">
            <input
              type="password"
              className="form_input"
              placeholder=" "
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              name="user-password"
            />
            <label className="form_input-label">Password</label>
          </div>

          {/* google login button */}
          <div className="google-sign-in">
            <button type="button" className="google-button" onClick={handleGoogleSignIn}>
              <FaGoogle className="google-icon" />
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* guest login button */}
          <div className="guest-sign-in">
            <button type="button" className="guest-button" onClick={handleGuestLogin}>
              <FaUser className="guest-icon" />
              <span>Continue as Guest</span>
            </button>
          </div>

          <button type="submit" className="form_button button">
            SIGN IN
          </button>
        </form>
      </div>

      <div className="container b-container" id="b-container">
        <form className="form" id="b-form" onSubmit={handleSignup} autoComplete="off">
          <h2 className="form_title title">Create Account</h2>

          <span className="form_span">Use email for registration</span>

          <div className="form_input-group">
            <input
              type="text"
              className="form_input"
              placeholder=" "
              required
              autoComplete="off"
              name="register-username"
            />
            <label className="form_input-label">Username</label>
          </div>

          <div className="form_input-group">
            <input
              type="text"
              className="form_input"
              placeholder=" "
              required
              autoComplete="off"
              name="register-email"
            />
            <label className="form_input-label">Email</label>
          </div>

          <div className="form_input-group">
            <input
              type="password"
              className="form_input"
              placeholder=" "
              required
              autoComplete="new-password"
              name="register-password"
            />
            <label className="form_input-label">Password</label>
          </div>

          {/* google sign up button */}
          <div className="google-sign-in">
            <button type="button" className="google-button" onClick={handleGoogleSignIn}>
              <FaGoogle className="google-icon" />
              <span>Sign up with Google</span>
            </button>
          </div>

          <button className="form_button button submit">SIGN UP</button>
        </form>
      </div>

      <div className="switch" id="switch-cnt">
        {/* this is the whole sliding component */}
        <div className="switch_circle"></div>
        <div className="switch_circle switch_circle-t"></div>
        <div className="switch_container" id="switch-c1">
          {/* this is the welcome sliding component */}
          <h2 className="switch_title title">Welcome Back!</h2>
          <p className="switch_description description">
            Enter your personal details and start journey with us
          </p>
          <button className="switch_button button switch-btn">SIGN UP</button>
        </div>
        <div className="switch_container is-hidden" id="switch-c2">
          {/* this is the register sliding component */}
          <h2 className="switch_title title">Hello Friend!</h2>
          <p className="switch_description description">
            Already have an account? Sign in with your personal info
          </p>
          <button className="switch_button button switch-btn">SIGN IN</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
