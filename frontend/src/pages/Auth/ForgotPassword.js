import JustValidate from "just-validate";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const ForgotPasswordPage = () => {

  const [step, setStep] = useState("sendEmail"); // sendEmail | enterOTP | reset
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (step === "sendEmail") {
      const validator = new JustValidate("#sendEmail");
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
        .onSuccess((event) => {
          event.preventDefault();

          const Email = event.target.Email.value;

          fetch(`${process.env.REACT_APP_API_URL}/users/password/forgot`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ Email })
          })
            .then(res => res.json())
            .then((data) => {

              if (data.code === "error") {
                alert(data.message);
              }

              if (data.code === "success") {
                setEmail(Email);
                setStep("enterOTP");
              }
            })
        });
    }

    if (step === "enterOTP") {
      const validator = new JustValidate("#enterOTPForm");

      validator
        .addField('#otp', [
          {
            rule: 'required',
            errorMessage: 'Vui lòng nhập OTP của bạn!',
          },
          {
            rule: 'minLength',
            value: 5,
            errorMessage: 'OTP phải đủ 5 ký tự!',
          },
          {
            rule: 'maxLength',
            value: 5,
            errorMessage: 'OTP không vượt quá 5 ký tự!',
          },
        ])
        .onSuccess((event) => {
          event.preventDefault();

          const OTP = event.target.OTP.value;
          
          fetch(`${process.env.REACT_APP_API_URL}/users/password/otp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ Email: email, OTP })
          })
            .then(res => res.json())
            .then((data) => {
              
              if (data.code === "error") {
                alert(data.message);
              }

              if (data.code === "success") {
                setStep("reset");
              }
            })
        });
    }

    if (step === "reset") {
      const validator = new JustValidate("#resetForm");

      validator
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
        .addField('#confirm-password', [
          {
            rule: 'required',
            errorMessage: 'Vui lòng xác nhận mật khẩu!',
          },
          {
            validator: (value, fields) => {
              if (
                fields['#password'] &&
                fields['#password'].elem
              ) {
                const repeatPasswordValue = fields['#password'].elem.value;

                return value === repeatPasswordValue;
              }

              return true;
            },
            errorMessage: 'Mật khẩu không trùng lặp',
          },
        ])
        .onSuccess((event) => {
          event.preventDefault();

          const dataFinal = {
            Email: email,
            Password: event.target.Password.value
          };

          fetch(`${process.env.REACT_APP_API_URL}/users/password/reset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(dataFinal)
          })
            .then(res => res.json())
            .then((data) => {
              console.log(data.code);

              if (data.code === "error") {
                alert(data.message);
              }

              if (data.code === "success") {
                setStep("sendEmail"); // quay lại bước đầu
                setEmail("");

                navigate("/login");
              }
            })
        });
    }
  }, [step, email]);

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

                    {step === "sendEmail" && (
                      <form id="sendEmail">
                        <div className="form-group">
                          <input type="text" className="form-control" placeholder="Email" name="Email" id="email" />
                        </div>
                        <div className="form-group">
                          <button type="submit" className="btn btn-lg btn-secondary w-100 radius-xl">Send OTP</button>
                        </div>
                      </form>
                    )}
                    {step === "enterOTP" && (
                      <form id="enterOTPForm">
                        <div className="form-group">
                          <input type="text" className="form-control" placeholder="Email" name="Email" id="email" defaultValue={email} disabled />
                        </div>
                        <div className="form-group">
                          <input type="text" className="form-control" placeholder="OTP" name="OTP" id="otp" />
                        </div>
                        <div className="form-group">
                          <button type="submit" className="btn btn-lg btn-secondary w-100 radius-xl">Submit</button>
                        </div>
                      </form>
                    )}
                    {step === "reset" && (
                      <form id="resetForm">
                        <div className="form-group">
                          <input type="text" className="form-control" placeholder="Email" name="Email" id="email" defaultValue={email} disabled />
                        </div>
                        <div className="form-group">
                          <input type="password" className="form-control" placeholder="New Password" name="Password" id="password" />
                        </div>
                        <div className="form-group">
                          <input type="password" className="form-control" placeholder="Confirm New Password" name="Confirm-password" id="confirm-password" />
                        </div>
                        <div className="form-group">
                          <button type="submit" className="btn btn-lg btn-primary w-100 radius-xl">Submit</button>
                        </div>
                      </form>
                    )}


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