import React, { useState } from "react";
import { PregnancySlider } from "../Home/PregnancySlider";

export const EstimatedWeight = () => {
  const [week, setWeek] = useState(28);
  const [preWeight, setPreWeight] = useState("");
  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [result, setResult] = useState(null);
  const [openInfo, setOpenInfo] = useState([]);

  // Toggle accordion sections
  const toggleInfo = (key) => {
    setOpenInfo((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  // Hàm tính toán
  const handleCalculate = () => {
    if (!preWeight || !height || !currentWeight)
      return alert("Vui lòng nhập đầy đủ thông tin!");

    const pre = parseFloat(preWeight);
    const h = parseFloat(height);
    const current = parseFloat(currentWeight);
    const wk = parseInt(week);

    const bmi = pre / Math.pow(h / 100, 2);
    let category = "";
    let totalGain = { min: 0, max: 0 };

    if (bmi < 18.5) {
      category = "Thiếu cân";
      totalGain = { min: 12.5, max: 18 };
    } else if (bmi < 25) {
      category = "Bình thường";
      totalGain = { min: 11.5, max: 16 };
    } else if (bmi < 30) {
      category = "Thừa cân";
      totalGain = { min: 7, max: 11.5 };
    } else {
      category = "Béo phì";
      totalGain = { min: 5, max: 9 };
    }

    const gainPerWeek = (totalGain.max - 2) / (40 - 13);
    const expectedMin = (pre + 1 + gainPerWeek * (wk - 13)).toFixed(1);
    const expectedMax = (pre + 2 + (gainPerWeek + 0.1) * (wk - 13)).toFixed(1);

    const status =
      current < expectedMin
        ? "Thiếu cân"
        : current > expectedMax
        ? "Tăng nhanh"
        : "Khỏe mạnh";

    setResult({
      week: wk,
      bmi: bmi.toFixed(1),
      currentWeight: current,
      expectedMin,
      expectedMax,
      category,
      status,
    });
  };

  return (
    <div className="weight-tool">
      <div className="header-section">
        <h2>Công cụ tính cân nặng trong thai kỳ</h2>
        <p>
          Ước tính cân nặng lý tưởng theo từng tuần thai, dựa vào BMI của mẹ.
        </p>
      </div>

      {/* Form nhập liệu */}
      <div className="form-box">
        <label>Tuần thai hiện tại: {week}</label>
        <input
          type="range"
          min="1"
          max="40"
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
        />

        <label>Cân nặng trước khi mang thai (kg)</label>
        <input
          type="number"
          value={preWeight}
          onChange={(e) => setPreWeight(e.target.value)}
        />

        <label>Chiều cao của bạn (cm)</label>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <label>Cân nặng hiện tại (kg)</label>
        <input
          type="number"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
        />

        <button className="btn-calc" onClick={handleCalculate}>
          Tính ngay
        </button>
      </div>

      {/* Kết quả */}
      {result && (
        <>
          <div className="summary-card">
            <h3>Bạn đang ở tuần {result.week}</h3>
            <p>
              Cân nặng lý tưởng:{" "}
              <b>
                {result.expectedMin} - {result.expectedMax} kg
              </b>
            </p>
            <p>
              Tình trạng:{" "}
              <span
                className={
                  result.status === "Khỏe mạnh"
                    ? "status-normal"
                    : result.status === "Thiếu cân"
                    ? "status-low"
                    : "status-high"
                }
              >
                {result.status}
              </span>
            </p>
          </div>

          {/* Biểu đồ 40 tuần */}
          <PregnancySlider activeWeek={result.week} />
        </>
      )}
        {/*  Miễn trừ trách nhiệm */}
      <div className="disclaimer">
        <div className="disclaimer-icon">ℹ️</div>
        <div className="disclaimer-content">
          <h4>Miễn trừ trách nhiệm</h4>
          <p>
            Công cụ này không cung cấp lời khuyên y tế mà chỉ dành cho mục đích
            cung cấp thông tin tham khảo. Đừng bao giờ bỏ qua lời khuyên y tế
            chuyên nghiệp trong quá trình tìm kiếm phương pháp điều trị vì
            những thông tin bạn đã đọc trên website. Hãy nhớ rằng mỗi thai kỳ
            đều khác nhau.
          </p>
        </div>
      </div>
      {/* Accordion thông tin */}
      <div className="info-section">
        {/* thông tin tại sao tăng cân */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("reason")}>
            <h4>Tại sao bạn lại tăng cân khi mang thai?</h4>
            <span>{openInfo.includes("reason") ? "−" : "+"}</span>
          </div>
          <div className={`info-body ${openInfo.includes("reason") ? "open" : ""}`}>
            <p>
              Khi mang thai, cơ thể phụ nữ thay đổi và tăng thêm trọng lượng để
              đảm bảo thai nhi nhận đủ dưỡng chất. Lượng tăng cân tùy theo cân
              nặng trước khi mang thai — phụ nữ nhỏ nhắn cần tăng nhiều hơn so
              với người thừa cân.
            </p>
          </div>
        </div>

        {/* thông tin thay đổi khi mang thai */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("changes")}>
            <h4>Những thay đổi trong cơ thể khi mang thai</h4>
            <span>{openInfo.includes("changes") ? "−" : "+"}</span>
          </div>
          <div className={`info-body ${openInfo.includes("changes") ? "open" : ""}`}>
            <ul>
              <li>Tăng lưu thông máu, da hồng hào hơn.</li>
              <li>Nội tiết thay đổi gây sạm da, nám, mụn.</li>
              <li>Tử cung mở rộng làm bụng to hơn.</li>
              <li>Thay đổi ở ngực để thích ứng việc tiết sữa.</li>
              <li>Táo bón, ợ chua có thể xuất hiện.</li>
            </ul>
          </div>
        </div>

        {/* lời khuyên cân nặng */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("gain")}>
            <h4>Tôi nên tăng bao nhiêu cân khi mang thai?</h4>
            <span>{openInfo.includes("gain") ? "−" : "+"}</span>
          </div>
          <div className={`info-body ${openInfo.includes("gain") ? "open" : ""}`}>
            <p>Để biết bạn nên tăng bao nhiêu cân khi mang thai, điều quan trọng
                 là phải bắt đầu với chỉ số BMI (chỉ số khối cơ thể) của bạn.</p>
            <ul>
              <li>Béo phì: 12–18kg</li>
              <li>Thừa cân: 11–12kg</li>
              <li>Bình thường: 7–12kg</li>
              <li>Thiếu cân: 6–10kg</li>
            </ul>
          </div>
        </div>

        {/* giai đoạn tăng cân nhiều */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("trimester")}>
            <h4>Bạn sẽ tăng cân nhiều nhất vào tam cá nguyệt nào?</h4>
            <span>{openInfo.includes("trimester") ? "−" : "+"}</span>
          </div>
          <div
            className={`info-body ${
              openInfo.includes("trimester") ? "open" : ""
            }`}
          >
            <p>
              Phụ nữ thường tăng cân nhanh nhất trong tam cá nguyệt thứ ba, khi
              thai nhi phát triển mạnh nhất.
            </p>
          </div>
        </div>

        {/* kế hoạch tăng cân cụ thể */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("weekly")}>
            <h4>Bạn nên tăng bao nhiêu cân mỗi tuần khi mang thai?</h4>
            <span>{openInfo.includes("weekly") ? "−" : "+"}</span>
          </div>
          <div className={`info-body ${openInfo.includes("weekly") ? "open" : ""}`}>
            <p>
              Trung bình, bạn nên tăng khoảng 0.9–1.3kg trong tam cá nguyệt đầu
              tiên và 0.45kg mỗi tuần trong hai tam cá nguyệt còn lại.
            </p>
          </div>
        </div>

        {/* Nguồn tham khảo */}
        <div className="info-item">
          <div className="info-header" onClick={() => toggleInfo("source")}>
            <h4>Nguồn tham khảo</h4>
            <span>{openInfo.includes("source") ? "−" : "+"}</span>
          </div>
          <div className={`info-body ${openInfo.includes("source") ? "open" : ""}`}>
            <p>
              <b>Tăng cân khi mang thai</b><br />
              https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/weight-gain/<br />
              
            </p>
          </div>
        </div>
      </div>

      
    </div>
  );
};
