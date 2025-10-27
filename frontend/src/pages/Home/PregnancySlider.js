import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { Container, Row, Col, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const weeksData = [
  {
    week: 1,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week1-2.png",
    name: "Tuần 1",
    weight: "-",
    note: "Bạn chưa thật sự có thai",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/1-3-weeks_1419791783.png"
  },
  {
    week: 2,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week1-2.png",
    name: "Tuần 2",
    weight: "-",
    note: "Sự rụng trứng sắp diễn ra",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/1-3-weeks_1419791783.png"
  },
  {
    week: 3,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week3.png",
    name: "Tuần 3",
    weight: "-",
    note: "Sự thụ tinh",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/1-3-weeks_1419791783.png"
  },
  {
    week: 4,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week4.png",
    name: "Tuần 4",
    weight: "-",
    note: "Phôi làm tổ",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/4-weeks_727110898.png"
  },
  {
    week: 5,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week5-ha%CC%A3t-me%CC%80.png",
    name: "Tuần 5",
    weight: "Hạt mè",
    note: "Sự phát triển chính của tuần 5 này là mũi, miệng và tai. Một cái đầu quá khổ và những đốm sẫm màu nơi mắt và lỗ mũi của bé bắt đầu hình thành.",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/5-weeks_1482584441.png"
  },
  {
    week: 6,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week6-Ha%CC%A3t-ta%CC%81o-ta%CC%82y.png",
    name: "Tuần 6",
    weight: "Hạt táo tây",
    note: "Tuần thai thứ 6 là lúc mắt, mũi, miệng và tai của bé bắt đầu hình thành cùng một trái tim nhỏ đang đập với nhịp nhanh gần gấp đôi so với mẹ.",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/6-weeks_1482584444.png"
  },
  {
    week: 7,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week7-Da%CC%A3%CC%82u-ha%CC%80-lan.png",
    name: "Tuần 7",
    weight: "Đậu Hà Lan",
    note: "Phôi đang thích nghi với tử cung",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/7-weeks-1482584438.png"
  },
  {
    week: 8,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week8-Vie%CC%A3%CC%82t-qua%CC%82%CC%81t.png",
    name: "Tuần 8",
    weight: "Quả việt quất",
    note: "Lần khám thai thứ hai",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/8-weeks_1482584405.png"
  },
  {
    week: 9,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week9-Ma%CC%82n-xo%CC%82i.png",
    name: "Tuần 9",
    weight: "Quả mâm xôi",
    note: "Thai nhi hình thành cơ quan sinh sản",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/9-weeks_293546375.png"
  },
  {
    week: 10,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week10-Anh-da%CC%80o.png",
    name: "Tuần 10",
    weight: "Quả anh đào",
    note: "Lần khám thai thứ ba",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/10-weeks_293546450.png"
  },
  {
    week: 11,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week11-Da%CC%82u-ta%CC%82y.png",
    name: "Tuần 11",
    weight: "0,007 kg - Quả dâu tây",
    note: "Thai nhi vẫn còn rất bé",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/11-weeks_293546396.png"
  },
  {
    week: 12,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week12-Chanh-ta.png",
    name: "Tuần 12",
    weight: "0,014 kg - Quả chanh ta",
    note: "Kết thúc tam cá nguyệt đầu tiên",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/12-weeks_293546420.png"
  },
  {
    week: 13,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week13-Qua%CC%89-ma%CC%A3%CC%82n.png",
    name: "Tuần 13",
    weight: "0,028 kg - Quả mận",
    note: "Bước vào tam cá nguyệt thứ hai",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/13-weeks_293545115.png"
  },
  {
    week: 14,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week14-Chanh-va%CC%80ng.png",
    name: "Tuần 14",
    weight: "0,057 kg - Quả chanh vàng",
    note: "Bé phát triển hệ sinh sản",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/14-weeks_293546378.png"
  },
  {
    week: 15,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week15-Qua%CC%89-da%CC%80o.png",
    name: "Tuần 15",
    weight: "0,071 kg - Quả đào",
    note: "Bé phát triển nhanh chóng",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/15-weeks_727111789.png"
  },
  {
    week: 16,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week16-Cam-va%CC%80ng.png",
    name: "Tuần 16",
    weight: "0,1 kg - Quả cam vàng",
    note: "Lần đầu bé đạp",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/16-weeks-1.png"
  },
  {
    week: 17,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week17-Bo%CC%9B.png",
    name: "Tuần 17",
    weight: "0,14 kg - Quả bơ",
    note: "Bánh nhau phát triển mạnh mẽ",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/17-weeks-1.png"
  },
  {
    week: 18,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week18-Qua%CC%89-lu%CC%9B%CC%A3u.png",
    name: "Tuần 18",
    weight: "0,14-0,18 kg - Quả lựu",
    note: "Hình dáng tai bắt đầu hoàn thiện",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/18-weeks_293546339.png"
  },
  {
    week: 19,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week19-Bo%CC%82ng-atiso.png",
    name: "Tuần 19",
    weight: "0,23 kg - Bông atiso",
    note: "Thận bắt đầu sản xuất nước tiểu",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/19-weeks_293545064.png"
  },
  {
    week: 20,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week20-Qua%CC%89-xoa%CC%80i.png",
    name: "Tuần 20",
    weight: "0,28 kg - Quả xoài",
    note: "Bé thải ra phân su",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/20-weeks_1482584372.png"
  },
  {
    week: 21,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week21-Chuo%CC%82%CC%81i.png",
    name: "Tuần 21",
    weight: "0,31-0,35 kg - Quả chuối",
    note: "Thai nhi cử động rõ rệt",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/21-weeks_293545046.png"
  },
  {
    week: 22,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week22-Rau-die%CC%82%CC%81p-xoan.png",
    name: "Tuần 22",
    weight: "0,45 kg - Rau diếp xoăn",
    note: "Bé phản ứng với ánh sáng",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/22-weeks_458875654.png"
  },
  {
    week: 23,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week23-Du%CC%9B%CC%80a.png",
    name: "Tuần 23",
    weight: "0,54 kg - Quả dừa",
    note: "Bé nghe được âm thanh từ bên ngoài",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/23-weeks_293546480.png"
  },
  {
    week: 24,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week24-Bu%CC%9Bo%CC%9B%CC%89i.png",
    name: "Tuần 24",
    weight: "0,59 kg - Quả bưởi",
    note: "Xét nghiệm đái tháo đường thai kỳ",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/24-weeks_458875597.png"
  },
  {
    week: 25,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week25-Du%CC%9Ba-lu%CC%9Bo%CC%9B%CC%81i.png",
    name: "Tuần 25",
    weight: "0,68 kg - Quả dưa lưới",
    note: "Thai nhi phát triển mạnh mẽ",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/25-weeks-458875555.png"
  },
  {
    week: 26,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week26-Su%CC%81p-lo%CC%9B.png",
    name: "Tuần 26",
    weight: "0,77 kg - Súp lơ",
    note: "Bé tích mỡ và tăng cơ",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/26-weeks_1482584366.png"
  },
  {
    week: 27,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week27-Ca%CC%82y-ca%CC%89i-xoa%CC%86n.png",
    name: "Tuần 27",
    weight: "0,86 kg - Cây cải xoăn",
    note: "Bước qua tam cá nguyệt thứ 3",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/27-weeks_293545130.png"
  },
  {
    week: 28,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week28-Ba%CC%86%CC%81p-ca%CC%89i-tha%CC%89o.png",
    name: "Tuần 28",
    weight: "1 kg - Bắp cải thảo",
    note: "Xác định ngôi thai của con",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/28-weeks-1.png"
  },
  {
    week: 29,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week29-Ca%CC%80-ti%CC%81m.png",
    name: "Tuần 29",
    weight: "1,13 kg - Quả cà tím",
    note: "Não bộ thai nhi phát triển nhanh chóng",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/29-weeks_293545127.png"
  },
  {
    week: 30,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week30-Bi%CC%81-da%CC%82u.png",
    name: "Tuần 30",
    weight: "1,13 kg - Quả cà tím",
    note: "Bé to bằng một quả dưa hấu nhỏ",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/30-weeks_458875693.png"
  },
  {
    week: 31,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week31-Bi%CC%81-ngo%CC%80i.png",
    name: "Tuần 31",
    weight: "1,5 kg - Quả bí ngòi",
    note: "Bé thải ra nước tiểu",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/31-weeks-1.png"
  },
  {
    week: 32,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week32-Ma%CC%86ng-ta%CC%82y.png",
    name: "Tuần 32",
    weight: "1,72 kg - Măng tây",
    note: "Bé phát triển gần như đầy đủ",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/32-weeks_458875585.png"
  },
  {
    week: 33,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week33-Bi%CC%81-dao.png",
    name: "Tuần 33",
    weight: "1,9 kg - Quả bí đao",
    note: "Bé ngủ rất nhiều",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/33-weeks_293545121.png"
  },
  {
    week: 34,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week34-Ca%CC%82%CC%80n-ta%CC%82y.png",
    name: "Tuần 34",
    weight: "2,13 kg - Cần tây",
    note: "Bé sẵn sàng ở vị trí sinh",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/34-weeks-1.png"
  },
  {
    week: 35,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week35-Bi%CC%81-nghe%CC%A3%CC%82.png",
    name: "Tuần 35",
    weight: "2,4 kg - Quả bí nghệ",
    note: "Bé trở nên đầy đặn hơn",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/35-weeks_293545061.png"
  },
  {
    week: 36,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week36-Tra%CC%81i-du%CC%9B%CC%81a.png",
    name: "Tuần 36",
    weight: "2,63 kg - Quả dứa lớn",
    note: "Thai nhi tiến dần về phía tử cung",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/36-weeks-1.png"
  },
  {
    week: 37,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week37-Du-du%CC%89.png",
    name: "Tuần 37",
    weight: "2,85 kg - Quả đu đủ lớn",
    note: "Con vẫn đang tăng cân",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/37-weeks_293545148.png"
  },
  {
    week: 38,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week38-Xa%CC%80-la%CC%81ch.png",
    name: "Tuần 38",
    weight: "3,08kg - Xà lách La Mã",
    note: "Bé phát triển chậm lại",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/38-weeks_293546369.png"
  },
  {
    week: 39,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week39-Tra%CC%81i-bi%CC%81-dao-gia%CC%80.png",
    name: "Tuần 39",
    weight: "3,3 kg - Quả bí đao già",
    note: "Chỉ số không thay đổi",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/39-weeks_293545079.png"
  },
  {
    week: 40,
    icon: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/Week40-Bi%CC%81-ngo%CC%82.png",
    name: "Tuần 40",
    weight: "3,44 kg- Quả bí ngô lớn",
    note: "Con sẵn sàng chào đời",
    image: "https://cdn.marrybaby.vn/wp-content/uploads/2021/10/40-weeks_293546468.png"
  },
];

 export const PregnancySlider = ({ activeWeek: propWeek = 1 }) => {
  const [activeWeek, setActiveWeek] = useState(propWeek);
  const sliderRef = useRef(null);
  
  useEffect(() => {
    setActiveWeek(propWeek);
    const index = weeksData.findIndex((w) => w.week === propWeek);
    if (index !== -1 && sliderRef.current) {
      sliderRef.current.slickGoTo(index); // tự động trỏ tới tuần hiện tại
    }
  }, [propWeek]);
const currentWeekData = weeksData.find((w) => w.week === activeWeek);

  const settings = {
    dots: false,
    infinite: true, // lặp vòng
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    swipeToSlide: true,
    focusOnSelect: true,
    centerMode: true,
    arrows: true,
  };

  return (
    <Container className="pregnancy-slider text-center mt-5">
      <h2 className="mb-4 fw-bold">40 Tuần Thai</h2>

      {/* Slider tuần */}
      <Slider {...settings}>
        {weeksData.map((item) => (
          <div
            key={item.week}
            className={`week-item ${activeWeek === item.week ? "active" : ""}`}
            onClick={() => setActiveWeek(item.week)}
          >
            <div className="icon" style={{ display: "flex", justifyContent: "center" }}><img src={item.icon} alt="" style={{ width: "50px", height: "auto" }} /></div>
            <div className="label">{item.name}</div>
          </div>
        ))}
      </Slider>

      {/* Thông tin thai nhi */}
      <Row className="mt-3 justify-content-center">
        <Col md={12}>
          <div className="baby-section p-4 rounded" style={{ paddingLeft: "50px" }}>
            <h4 className="mb-3" style={{ color: "black" }}>{currentWeekData.name}</h4>
            <p style={{ height: "50px", color: "black" }}>{currentWeekData.note}</p>

            <div className="mb-5" style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: "20px" }}>
              <div className="info-box p-3 rounded mt-3">
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <p><img src="https://www.marrybaby.vn/icons/scale_line.svg" alt="" style={{ width: "20px", height: "auto", marginRight: "10px" }} />Cân nặng</p>
                  <p className="fw-bold">{currentWeekData.weight}</p>
                  <NavLink to={`/blog/${currentWeekData.week}`} style={{ padding: "20px", border: "1px solid #565acf", borderRadius: "20px", marginTop: "10px"}}>Đọc toàn bộ bài viết</NavLink>
                </div>

              </div>
              <img src={currentWeekData.image} alt="" />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}