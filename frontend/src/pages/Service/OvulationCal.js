import React, { useState } from "react";
import { format, addDays, parseISO } from "date-fns";


export const OvulationCal = () => {
  const [tab, setTab] = useState("cycle"); // cycle | chance | avoid
  const [lmp, setLmp] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(6);
  const [result, setResult] = useState(null);

  const [ovulationInput, setOvulationInput] = useState("");
  const [chanceCalendar, setChanceCalendar] = useState([]);
  const [avoidCalendar, setAvoidCalendar] = useState([]);

  // 🔹 Tính ngày rụng trứng từ kỳ kinh
  const calculateOvulation = () => {
    if (!lmp) return;
    const lmpDate = parseISO(lmp);
    const ovulationDate = addDays(lmpDate, cycleLength - 14);
    const fertileStart = addDays(ovulationDate, -5);
    const fertileEnd = addDays(ovulationDate, 1);
    const nextPeriod = addDays(lmpDate, cycleLength);

    setResult({
      ovulation: format(ovulationDate, "dd/MM/yyyy"),
      fertileStart: format(fertileStart, "dd/MM/yyyy"),
      fertileEnd: format(fertileEnd, "dd/MM/yyyy"),
      nextPeriod: format(nextPeriod, "dd/MM/yyyy"),
    });
  };

  // 🔹 Sinh dữ liệu gom nhóm
  const generateCalendar = (ovulationDate, mode = "chance") => {
    const temp = [];
    for (let i = -5; i <= 10; i++) {
      const date = addDays(ovulationDate, i);
      const formatted = format(date, "yyyy-MM-dd");
      let status = "";
      let chance = 1;

      // Chế độ tính khác nhau
      if (mode === "chance") {
        switch (true) {
          case i < -1 && i >= -5:
            status = "Ngày dễ thụ thai";
            chance = 20 + (5 + i) * 5;
            break;
          case i === -1:
            status = "Cơ hội cao";
            chance = 35;
            break;
          case i === 0:
            status = "Ngày rụng trứng";
            chance = 40;
            break;
          case i > 0 && i < 5:
            status = "Thời kỳ ít thụ thai";
            chance = 5;
            break;
          default:
            status = "Ngoài chu kỳ";
            chance = 1;
            break;
        }
      } else if (mode === "avoid") {
        switch (true) {
          case i < -1 && i >= -5:
            status = "Thời kỳ nguy hiểm (không an toàn)";
            chance = 80;
            break;
          case i === -1:
          case i === 0:
            status = "Rất nguy hiểm";
            chance = 95;
            break;
          case i > 0 && i < 5:
            status = "Nguy cơ thấp";
            chance = 30;
            break;
          default:
            status = "An toàn";
            chance = 5;
            break;
        }
      }

      temp.push({ date: formatted, status, chance });
    }

    // 🔹 Gom nhóm liên tiếp cùng trạng thái
    const merged = [];
    let groupStart = temp[0];
    for (let i = 1; i <= temp.length; i++) {
      const prev = temp[i - 1];
      const current = temp[i];
      if (!current || current.status !== prev.status || current.chance !== prev.chance) {
        merged.push({
          start: groupStart.date,
          end: prev.date,
          status: prev.status,
          chance: prev.chance,
        });
        groupStart = current;
      }
    }

    if (mode === "chance") setChanceCalendar(merged);
    else setAvoidCalendar(merged);
  };

  // 🔹 Tính cơ hội thụ thai
  const calculateChance = () => {
    if (!ovulationInput) return;
    const ovulationDate = parseISO(ovulationInput);
    generateCalendar(ovulationDate, "chance");
  };

  // 🔹 Tính cơ hội tránh thai
  const calculateAvoid = () => {
    if (!ovulationInput) return;
    const ovulationDate = parseISO(ovulationInput);
    generateCalendar(ovulationDate, "avoid");
  };

  return (
    <div className="ovulation-page">
      <div className="header-section">
        <h2>Tính ngày rụng trứng • Thụ thai • Tránh thai</h2>
      </div>

      <div className="ovulation-box">
        <h3 className="box-title">Mục đích</h3>
        <div className="purpose-tabs">
          <button className={tab === "cycle" ? "active" : ""} onClick={() => setTab("cycle")}>
            Theo dõi chu kỳ kinh
          </button>
          <button className={tab === "chance" ? "active" : ""} onClick={() => setTab("chance")}>
            Cơ hội thụ thai
          </button>
          <button className={tab === "avoid" ? "active" : ""} onClick={() => setTab("avoid")}>
            Cơ hội tránh thai
          </button>
        </div>

        {/* --- TAB 1: Theo dõi chu kỳ kinh --- */}
        {tab === "cycle" && (
          <div className="form-section">
            <label>Ngày đầu tiên của kỳ kinh gần nhất</label>
            <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} />

            <label>Độ dài chu kỳ kinh nguyệt (ngày)</label>
            <input
              type="number"
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              min="20"
              max="40"
            />

            <label>Số ngày hành kinh (ngày)</label>
            <input
              type="number"
              value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
              min="3"
              max="10"
            />

            <button className="btn-calc" onClick={calculateOvulation}>
              Tính ngay
            </button>

            {result && (
              <div className="result-section">
                <h4>Kết quả dự kiến</h4>
                <p>🌸 Ngày rụng trứng: <b>{result.ovulation}</b></p>
                <p>🌿 Cửa sổ thụ thai: <b>{result.fertileStart}</b> – <b>{result.fertileEnd}</b></p>
                <p>📅 Kỳ kinh tiếp theo: <b>{result.nextPeriod}</b></p>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: Cơ hội thụ thai --- */}
        {tab === "chance" && (
          <div className="form-section">
            <label>Ngày rụng trứng dự kiến</label>
            <input type="date" value={ovulationInput} onChange={(e) => setOvulationInput(e.target.value)} />

            <button className="btn-calc" onClick={calculateChance}>
              Tính cơ hội thụ thai
            </button>

            {chanceCalendar.length > 0 && (
              <div className="fertility-result">
                <h3>🌼 Kết quả cơ hội thụ thai</h3>
                <div className="chance-table">
                  <div className="table-header">
                    <span>Khoảng ngày</span>
                    <span>Trạng thái</span>
                    <span>Tỷ lệ (%)</span>
                  </div>

                  {chanceCalendar.map((d, i) => (
                    <div
                      key={i}
                      className={`table-row ${
                        d.status.includes("rụng") ? "ovulation-day" :
                        d.status.includes("dễ") ? "fertile-day" :
                        d.status.includes("cao") ? "fertile-day" :
                        d.status.includes("ít") ? "low-day" : "normal-day"
                      }`}
                    >
                      <span>
                        {format(parseISO(d.start), "dd/MM")}
                        {d.start !== d.end ? ` – ${format(parseISO(d.end), "dd/MM")}` : ""}
                      </span>
                      <span>{d.status}</span>
                      <span className="chance">{d.chance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: Cơ hội tránh thai --- */}
        {tab === "avoid" && (
          <div className="form-section">
            <label>Ngày rụng trứng dự kiến</label>
            <input type="date" value={ovulationInput} onChange={(e) => setOvulationInput(e.target.value)} />

            <button className="btn-calc" onClick={calculateAvoid}>
              Tính cơ hội tránh thai
            </button>

            {avoidCalendar.length > 0 && (
              <div className="fertility-result">
                <h3>🚫 Kết quả cơ hội tránh thai</h3>
                <div className="chance-table">
                  <div className="table-header">
                    <span>Khoảng ngày</span>
                    <span>Trạng thái</span>
                    <span>Nguy cơ (%)</span>
                  </div>

                  {avoidCalendar.map((d, i) => (
                    <div
                      key={i}
                      className={`table-row ${
                        d.status.includes("Rất") ? "ovulation-day" :
                        d.status.includes("nguy") ? "fertile-day" :
                        d.status.includes("thấp") ? "low-day" : "normal-day"
                      }`}
                    >
                      <span>
                        {format(parseISO(d.start), "dd/MM")}
                        {d.start !== d.end ? ` – ${format(parseISO(d.end), "dd/MM")}` : ""}
                      </span>
                      <span>{d.status}</span>
                      <span className="chance">{d.chance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
