import JustValidate from "just-validate";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const RegisterPage = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const validator = new JustValidate("#registerForm");

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
      .addField('#username', [
        {
          rule: 'required',
          errorMessage: 'Vui lòng nhập Username của bạn!',
        },
        {
          rule: 'minLength',
          value: 3,
          errorMessage: 'Username phải chứa ít nhất 3 ký tự!',
        },
        {
          rule: 'maxLength',
          value: 15,
          errorMessage: 'Username không vượt quá 15 ký tự!',
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
              const repeatPasswordValue =
                fields['#password'].elem.value;

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
          Email: event.target.Email.value,
          Username: event.target.Username.value,
          Password: event.target.Password.value
        };

        fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
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
              navigate("/login");
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
                    <form id="registerForm">
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Email" name="Email" id="email" />
                      </div>
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Username" name="Username" id="username" />
                      </div>
                      <div className="form-group">
                        <input type="password" className="form-control" placeholder="Password" name="Password" id="password" />
                      </div>
                      <div className="form-group">
                        <input type="password" className="form-control" placeholder="Confirm Password" name="Confirm-password" id="confirm-password" />
                      </div>
                      <div className="form-group">
                        <button type="submit" className="btn btn-lg btn-primary w-100 radius-xl">Submit</button>
                      </div>
                      <div className="text-center mt-30">
                        <p className="mt-0">Already have an account?<a href="/login" data-toggle="tab" style={{ marginLeft: "10px" }}>Sign in</a></p>
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