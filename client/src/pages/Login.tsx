import React, { useEffect, useState } from "react";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa"; // 导入Google图标

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 获取DOM元素，querySelector获取的是第一个元素，querySelectorAll获取的是所有元素
    //我们为获取到的元素重新赋值，这样我们就可以使用这些元素了
    const switchCtn = document.querySelector("#switch-cnt") as HTMLElement;
    const switchC1 = document.querySelector("#switch-c1") as HTMLElement;
    const switchC2 = document.querySelector("#switch-c2") as HTMLElement;
    const switchCircle = document.querySelectorAll(".switch_circle");
    const switchBtn = document.querySelectorAll(".switch-btn");
    const aContainer = document.querySelector("#a-container") as HTMLElement;
    const bContainer = document.querySelector("#b-container") as HTMLElement;
    const allButtons = document.querySelectorAll(".submit"); //只要带有submit类的按钮，都会触发这个函数

    // 修改这个函数，只阻止切换按钮的默认行为
    const getButtons = (e: Event) => {
      const target = e.target as HTMLElement;
      // 只有当点击的是切换按钮时才阻止默认行为
      if (target.classList.contains("switch-btn")) {
        e.preventDefault();
      }
    };

    // 切换表单动画，当用户点击登录或者注册按钮时，会触发这个函数
    //这个函数会切换一些css类，从而实现动画效果
    const changeForm = (e: Event) => {
      // 添加渐入动画
      switchCtn.classList.add("is-gx"); //给所有switch-cnt的元素添加is-gx类，is-gx会让组件在切换时有一个膨胀-缩回的动画效果
      setTimeout(() => {
        switchCtn.classList.remove("is-gx"); //1.5秒后，移除is-gx类，从而实现动画效果
      }, 1500);

      // 切换表单显示
      switchCtn.classList.toggle("is_txr"); //给所有switch-cnt的元素添加is_txr类，is_txr会让组件在切换时有一个向右移动的动画效果
      switchCircle[0].classList.toggle("is_txr"); //switchCircle[0]是第一个switch_circle元素，取决于你的html结构谁时第一个
      switchCircle[1].classList.toggle("is_txr");

      // 切换内容显示
      switchC1.classList.toggle("is-hidden"); //给所有switch-c1的元素添加is-hidden类，is-hidden会让组件在切换时隐藏
      switchC2.classList.toggle("is-hidden"); //给所有switch-c2的元素添加is-hidden类，is-hidden会让组件在切换时隐藏
      aContainer.classList.toggle("is_txl"); //当元素带有is_txl时，会向左移动，aContainer是登录的容器,会向左移动
      bContainer.classList.toggle("is_txl"); //当元素带有is_txl时，会向左移动，bContainer是注册的容器，会向左移动
      bContainer.classList.toggle("is-z"); //当元素带有is-z时，会增加z-index，从而让元素在滑动容器之上
    };

    // 添加事件监听
    const addEventListeners = () => {
      for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].addEventListener("click", getButtons);
      }
      for (let i = 0; i < switchBtn.length; i++) {
        switchBtn[i].addEventListener("click", changeForm);
      }
    };

    addEventListeners();

    // 卸载时移除监听，如果不卸载，每次切换表单时，都会触发这个函数，造成内存泄漏
    return () => {
      for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].removeEventListener("click", getButtons);
      }
      for (let i = 0; i < switchBtn.length; i++) {
        switchBtn[i].removeEventListener("click", changeForm);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        username: email,
        password,
      });

      if (response.data.success) {
        // 使用 React Router 的导航方法
        navigate("/dashboard");
      } else {
        console.error("登录失败");
      }
    } catch (error) {
      console.error("发生错误:", error);
    }
  };

  // handle google sign in //todo: need to implement google sign in
  const handleGoogleSignIn = () => {
    // here should be OAuth login API
    // for example: window.location.href = 'http://localhost:3000/api/auth/google';
    console.log("use google login");
    // simulate successful login, should be implemented through OAuth process
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  return (
    <div className="shell">
      <div className="container a-container" id="a-container">
        <form
          className="form"
          id="a-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <h2 className="form_title title">Sign In</h2>

          <span className="form_span">Use your email account</span>

          <div className="form_input-group">
            <input
              type="text"
              className="form_input"
              placeholder=" "
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              name="user-password"
            />
            <label className="form_input-label">Password</label>
          </div>

          {/* google login button */}
          <div className="google-sign-in">
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleSignIn}
            >
              <FaGoogle className="google-icon" />
              <span>Sign in with Google</span>
            </button>
          </div>

          <button type="submit" className="form_button button">
            SIGN IN
          </button>
        </form>
      </div>

      <div className="container b-container" id="b-container">
        <form className="form" id="b-form" autoComplete="off">
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
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleSignIn}
            >
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
