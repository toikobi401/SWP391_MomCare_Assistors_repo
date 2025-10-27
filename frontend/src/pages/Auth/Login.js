import JustValidate from "just-validate";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

export const LoginPage = () => {

  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    const res = await fetch(`${process.env.REACT_APP_API_URL}/users/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    });
    const data = await res.json();

    if (data.code === "success") {
      navigate("/");
    } else {
      alert(data.message);
    }
  };

  useEffect(() => {
    const validator = new JustValidate("#loginForm");

    validator
      .addField('#email', [
        {
          rule: 'required',
          errorMessage: 'Vui lòng nhập email của bạn!',
        },
        {
          rule: 'email',
          errorMessage: 'Email không đúng định dạng!',
        },
      ])
      .addField('#password', [
        {
          rule: 'required',
          errorMessage: 'Vui lòng nhập mật khẩu!',
        },
        {
          validator: (value) => value.length >= 8,
          errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
        },
        // {
        //   validator: (value) => /[A-Z]/.test(value),
        //   errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
        // },
        // {
        //   validator: (value) => /[a-z]/.test(value),
        //   errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
        // },
        // {
        //   validator: (value) => /\d/.test(value),
        //   errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
        // },
        // {
        //   validator: (value) => /[@$!%*?&]/.test(value),
        //   errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
        // },
      ])
      .onSuccess((event) => {
        event.preventDefault();

        const dataFinal = {
          Email: event.target.Email.value,
          Password: event.target.Password.value
        };

        fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataFinal),
          credentials: "include" // Giữ cookie
        })
          .then(res => res.json())
          .then((data) => {

            if (data.code === "error") {
              alert(data.message);
            }

            if (data.code === "success") {
              navigate("/");
            }
          })
      });
    return () => {
      validator.destroy();
    };
  }, []);
  return (
    <>
      <div className="section-area account-wraper2">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="appointment-form form-wraper" style={{ overflow: "hidden" }}>
                <div className="logo">
                  <a href="/"><img src="images/logo.png" alt="" /></a>
                </div>
                <div className="tab-content" id="myTabContent">

                  <div className="tab-pane fade show active" id="formLogin" role="tabpanel" aria-labelledby="formLogin">
                    <form id="loginForm" action="">
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Email" name="Email" id="email" />
                      </div>
                      <div className="form-group">
                        <input type="password" className="form-control" placeholder="Password" name="Password" id="password" />
                      </div>
                      <div className="form-group" style={{ textAlign: "end" }}>
                        <a href="/forgot-password" data-toggle="tab">Forgot Password</a>
                        <button type="submit" className="btn mb-20 btn-lg btn-primary w-100" style={{ marginTop: "20px" }}>Sign in</button>
                      </div>
                      <div className="text-center mt-30">
                        <p className="mt-0">Don't have any account?<a href="/register" data-toggle="tab" style={{ marginLeft: "10px" }}>Sign up</a></p>
                      </div>
                      <div className="text-center mt-30" style={{ display: "flex", justifyContent: "center" }}>
                        <GoogleLogin 
                          onSuccess={handleSuccess}
                          onError={() => alert("Login Failed")}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}