import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export const CategoryPage = () => {
  const [category, setCategory] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/category`)
      .then(res => res.json())
      .then(result => {
        setCategory(result.data);
      });
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold">Danh mục</h2>

      <div className="row g-4">
        {category.map((item) => (
          <div key={item.CategoryID} className="col-12 col-sm-6 col-lg-4">
            <NavLink to={`/blog/${item.CategoryID}`}>
              <div className="card h-100 text-center border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                <div className="card-body d-flex align-items-center justify-content-center" style={{ gap: "10px" }}>
                  <img
                    src={item.Image}
                    alt={item.Title}
                    className="mb-3"
                    style={{ width: "60px", height: "60px", padding: "5px", objectFit: "contain", borderRadius: "50%", objectFit: "contain" }}
                  />
                  <p style={{ fontSize: "18px", color: "black" }}>{item.Title}</p>
                </div>
              </div>
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
};