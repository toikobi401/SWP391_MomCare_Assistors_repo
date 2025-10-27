import React, { useState } from "react";
import { format, addDays, parseISO, differenceInWeeks } from "date-fns";

export const EstimateDoB = () => {
  const [method, setMethod] = useState("period"); // period | conception | ivf
  const [inputDate, setInputDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [result, setResult] = useState(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState(null);
  const [openInfo, setOpenInfo] = useState([]); 
  const [embryoAge, setEmbryoAge] = useState(3); 

  // Cho phép mở nhiều phần accordion
  const toggleInfo = (id) => {
    setOpenInfo((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // logic tính toán
  const calculateDueDate = () => {
    if (!inputDate) return;
    const date = parseISO(inputDate);
    let dueDate;

    switch (method) {
      case "period":
        // Ngày dự sinh = ngày đầu kỳ kinh cuối + 280 ngày
        dueDate = addDays(date, 280 - (28 - cycleLength));
        break;
      case "conception":
        // Ngày dự sinh = ngày thụ thai + 266 ngày
        dueDate = addDays(date, 266);
        break;
      case "ivf":
        // IVF = ngày chuyển phôi + (266 - tuổi phôi)
        dueDate = addDays(date, 266 - embryoAge);
        break;
      default:
        return;
    }

    setResult(format(dueDate, "dd/MM/yyyy"));

    //  Tính số tuần thai hiện tại
    const now = new Date();
    let weeks = differenceInWeeks(now, date);
    if (weeks < 0) weeks = 0;
    setPregnancyWeeks(weeks);
  };

  return (
    <div className="due-date-page">
      <div className="header-section">
        <h2> Công cụ tính ngày dự sinh</h2>
        <p>
          Hãy sử dụng công cụ này để ước tính ngày dự sinh của bạn. 
          Kết quả chỉ mang tính chất tham khảo — hầu hết mẹ bầu sinh trong vòng một tuần trước hoặc sau ngày này.
        </p>
      </div>

      <div className="due-box">
        <h3>Phương pháp tính toán</h3>
        <div className="method-tabs">
          <button
            className={method === "period" ? "active" : ""}
            onClick={() => setMethod("period")}
          >
            Kỳ kinh nguyệt cuối
          </button>
          <button
            className={method === "conception" ? "active" : ""}
            onClick={() => setMethod("conception")}
          >
            Ngày thụ thai
          </button>
          <button
            className={method === "ivf" ? "active" : ""}
            onClick={() => setMethod("ivf")}
          >
            Thụ tinh ống nghiệm (IVF)
          </button>
        </div>

        <div className="form-section">
          <label>
            {method === "period"
              ? "Ngày đầu tiên của kỳ kinh gần nhất"
              : method === "conception"
              ? "Ngày thụ thai"
              : "Ngày chuyển phôi"}
          </label>
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
          />

          {/* Radio chọn 3 hoặc 5 ngày chuyển phôi */}
          {method === "ivf" && (
            <div className="embryo-select">
              <label>
                <input
                  type="radio"
                  name="embryo"
                  value="3"
                  checked={embryoAge === 3}
                  onChange={() => setEmbryoAge(3)}
                />
                3 - Ngày chuyển phôi
              </label>
              <label>
                <input
                  type="radio"
                  name="embryo"
                  value="5"
                  checked={embryoAge === 5}
                  onChange={() => setEmbryoAge(5)}
                />
                5 - Ngày chuyển phôi
              </label>
            </div>
          )}

          {method === "period" && (
            <>
              <label>Độ dài chu kỳ kinh nguyệt</label>
              <input
                type="number"
                min="20"
                max="40"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
              />
            </>
          )}

          <button className="btn-calc" onClick={calculateDueDate}>
            Tính ngay
          </button>

          {/*  Phần hiển thị kết quả  */}
          {result && (
            <div className="result-box congrat-section">
              <h3> Xin chúc mừng!</h3>
              <p>
                <strong>Bạn đã mang thai </strong>
                <span className="highlight">
                  {pregnancyWeeks ? `${pregnancyWeeks} tuần` : "1 tuần"}
                </span>
                
              </p>
              <p>Ngày dự sinh của bạn là</p>
              <h4 className="due-date-text">{result}</h4>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="info-section">
        <h3>ℹ️ Thông tin chi tiết</h3>

        {/* Kỳ kinh nguyệt cuối */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("period")}>
            <h4>Kỳ kinh nguyệt cuối</h4>
            <span>{openInfo.includes("period") ? "−" : "+"}</span>
          </div>
          {openInfo.includes("period") && (
            <div className="info-body open">
              <p>
                Hầu hết các trường hợp mang thai kéo dài khoảng 40 tuần (hoặc 38 tuần kể từ khi thụ thai). Vì vậy,
                cách tốt nhất để ước tính ngày dự sinh là đếm 40 tuần hoặc 280 ngày, kể từ ngày đầu tiên của kỳ kinh
                nguyệt cuối. Một cách khác là lấy ngày đầu tiên của kỳ kinh nguyệt cuối cùng, trừ đi ba tháng và cộng 7
                ngày. Điều kiện để áp dụng tính ngày dự sanh theo kỳ kinh nguyệt cuối đó là chu kỳ kinh nguyệt phải đều,
                chu kỳ 28 ngày và nhớ rõ ngày kinh cuối.Vì vậy, nếu kỳ kinh cuối của bạn bắt đầu vào ngày 11-4-2020, bạn 
                sẽ trừ ngược lại ba tháng là ngày 11-1-2020, sau đó cộng thêm 7 ngày, có nghĩa là ngày dự sinh của bạn sẽ
                là ngày 18-1-2021. Đây là cách bác sĩ sẽ ước tính ngày dự sinh cho các mẹ bầu. Nhưng hãy nhớ rằng sẽ rất
                bình thường nếu bạn sinh sớm hay trễ một tuần so với ngày dự kiến.
              </p>
              <p>
                Ví dụ: Nếu chu kỳ là 30 ngày, bạn có thể cộng thêm 2 ngày; nếu chu kỳ là 26 ngày, trừ đi 2 ngày.
              </p>
            </div>
          )}
        </div>

        {/* Ngày thụ thai */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("conception")}>
            <h4>Ngày thụ thai</h4>
            <span>{openInfo.includes("conception") ? "−" : "+"}</span>
          </div>
          {openInfo.includes("conception") && (
            <div className="info-body open">
              <p>
                Cách tính tuổi thai theo ngày quan hệ áp dụng cho các cặp đôi nhớ chính xác ngày quan hệ, 
                người nữ có chu kỳ kinh nguyệt đều và xác định được ngày rụng trứng. Nguyên do là tinh trùng
                có thể sống trong cơ thể nữ giới 5 ngày nhưng trứng sau khi rụng chỉ sống được 1 ngày. Tinh trùng 
                chỉ có thể thụ tinh cho trứng trong khoảng thời gian này.Theo cách tính này thì ngày đầu tiên của 
                tuổi thai sẽ được tính bắt đầu vào ngày quan hệ có rụng trứng rồi cộng thêm 38 tuần (tức là 266 ngày).
              </p>
            </div>
          )}
        </div>

        {/* IVF */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("ivf")}>
            <h4>Thụ tinh trong ống nghiệm (IVF)</h4>
            <span>{openInfo.includes("ivf") ? "−" : "+"}</span>
          </div>
          {openInfo.includes("ivf") && (
            <div className="info-body open">
              <p>
                Việc tính tuần thai và ngày dự sinh khi thụ tinh nhân tạo sẽ chính xác hơn so với thụ thai
                bình thường. Điều này là do đã xác định được chính xác ngày cấy phôi hoặc ngày rụng trứng.
                Ngày dự sinh khi thụ tinh trong ống nghiệm sẽ được tính bằng cách cộng thêm 38 tuần (tức là 266 ngày)
                kể từ khi trứng được thụ tinh. Một cách tính khác là vẫn cộng thêm 38 tuần nhưng sẽ trừ đi số ngày mà
                phôi được cấy vào (được thụ tinh, tức tại thời điểm đưa phôi vào buồng tử cung). Nếu phôi đã được 3 ngày
                tuổi thì trừ đi 3 ngày, và 5 ngày tuổi thì trừ đi 5 ngày..
              </p>
            </div>
          )}
        </div>

        <div className="note">
           Kết quả chỉ mang tính tham khảo. Hãy tham khảo ý kiến bác sĩ để có tư vấn chính xác nhất.
        </div>
      </div>
    </div>
  );
};
