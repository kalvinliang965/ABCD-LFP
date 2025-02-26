import React, { useEffect } from "react";
import "./Login.css";

const Login: React.FC = () => {
  useEffect(() => {
    // 获取DOM元素
    const switchCtn = document.querySelector("#switch-cnt") as HTMLElement;
    const switchC1 = document.querySelector("#switch-c1") as HTMLElement;
    const switchC2 = document.querySelector("#switch-c2") as HTMLElement;
    const switchCircle = document.querySelectorAll(".switch_circle");
    const switchBtn = document.querySelectorAll(".switch-btn");
    const aContainer = document.querySelector("#a-container") as HTMLElement;
    const bContainer = document.querySelector("#b-container") as HTMLElement;
    const allButtons = document.querySelectorAll(".submit");

    // 阻止表单默认提交行为
    const getButtons = (e: Event) => {
      e.preventDefault();
    };

    // 切换表单动画
    const changeForm = (e: Event) => {
      // 添加渐入动画
      switchCtn.classList.add("is-gx");
      setTimeout(() => {
        switchCtn.classList.remove("is-gx");
      }, 1500);

      // 切换表单显示
      switchCtn.classList.toggle("is_txr"); // ← 改成下划线
      switchCircle[0].classList.toggle("is_txr"); // ← 改成下划线
      switchCircle[1].classList.toggle("is_txr"); // ← 改成下划线

      // 切换内容显示
      switchC1.classList.toggle("is-hidden");
      switchC2.classList.toggle("is-hidden");
      aContainer.classList.toggle("is_txl"); // ← 改成下划线
      bContainer.classList.toggle("is_txl"); // ← 改成下划线
      bContainer.classList.toggle("is-z");
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

    // 卸载时移除监听
    return () => {
      for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].removeEventListener("click", getButtons);
      }
      for (let i = 0; i < switchBtn.length; i++) {
        switchBtn[i].removeEventListener("click", changeForm);
      }
    };
  }, []);

  return (
    <div className="shell">
      <div className="container a-container" id="a-container">
        <form className="form" id="a-form">
          <h2 className="form_title title">Sign In</h2>
          <div className="form_icons">
            <i className="iconfont icon-QQ"></i>
            <i className="iconfont icon-weixin"></i>
            <i className="iconfont icon-bilibili-line"></i>
          </div>
          <span className="form_span">select the way to sign in</span>
          <input type="text" className="form_input" placeholder="Email" />
          <input
            type="password"
            className="form_input"
            placeholder="Password"
          />
          <button className="form_button button submit">SIGN IN</button>
        </form>
      </div>

      <div className="container b-container" id="b-container">
        <form className="form" id="b-form">
          <h2 className="form_title title">Create Account</h2>
          <div className="form_icons">
            <i className="iconfont icon-QQ"></i>
            <i className="iconfont icon-weixin"></i>
            <i className="iconfont icon-bilibili-line"></i>
          </div>
          <span className="form_span">select the way to register</span>
          <input type="text" className="form_input" placeholder="Username" />
          <input type="text" className="form_input" placeholder="Email" />
          <input
            type="password"
            className="form_input"
            placeholder="Password"
          />
          <button className="form_button button submit">SIGN UP</button>
        </form>
      </div>

      <div className="switch" id="switch-cnt">
        <div className="switch_circle"></div>
        <div className="switch_circle switch_circle-t"></div>

        <div className="switch_container" id="switch-c1">
          <h2 className="switch_title title">Welcome Back!</h2>
          <p className="switch_description description">
            Already have an account? Sign in with your personal info
          </p>
          <button className="switch_button button switch-btn">SIGN IN</button>
        </div>

        <div className="switch_container is-hidden" id="switch-c2">
          <h2 className="switch_title title">Hello Friend!</h2>
          <p className="switch_description description">
            Enter your personal details and start journey with us
          </p>
          <button className="switch_button button switch-btn">SIGN UP</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
