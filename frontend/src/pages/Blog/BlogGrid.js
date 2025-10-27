// src/pages/Blog/BlogGrid.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const BlogGrid = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = mới nhất, asc = cũ nhất
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // 🧩 Load danh mục 1 lần
  useEffect(() => {
    fetch("http://localhost:5000/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .catch((err) => console.error("Category fetch error:", err));
  }, []);

  // 🧩 Load blog mỗi khi category hoặc sortOrder thay đổi
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const queryParams = new URLSearchParams({
          category: selectedCategory,
          sort: sortOrder,
        });

        const res = await fetch(
          `http://localhost:5000/api/blog?${queryParams}`
        );
        const data = await res.json();
        setBlogs(data.data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error("Fetch blogs error:", err);
      }
    };

    fetchBlogs();
  }, [selectedCategory, sortOrder]);

  // 🧩 Pagination
  const totalPages = Math.ceil(blogs.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogs.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page-content bg-white">
      {/* Banner */}
      <div className="banner-wraper">
        <div
          className="page-banner"
          style={{ backgroundImage: "url(/assets/images/banner/img1.jpg)" }}
        >
          <div className="container">
            <div className="page-banner-entry text-center">
              <h1>Blog Grid</h1>
              <nav aria-label="breadcrumb" className="breadcrumb-row">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">Blog Grid</li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Filter + Sort */}
      <section className="section-area section-sp1 blog-area position-relative">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            {/* Filter */}
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="category" className="fw-bold me-2">
                Danh mục:
              </label>
              <select
                id="category"
                className="form-select"
                style={{ width: "200px" }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {categories.map((cat) => (
                  <option key={cat.CategoryID} value={cat.CategoryID}>
                    {cat.Title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sort" className="fw-bold me-2">
                Sắp xếp:
              </label>
              <select
                id="sort"
                className="form-select"
                style={{ width: "180px" }}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Blog list */}
          <div className="row">
            {currentPosts.map((blog) => (
              <div key={blog.ContentID} className="col-lg-4 col-md-6 mb-4">
                <div className="blog-card">
                  <div className="post-media">
                    <Link to={`/blog/${blog.ContentID}`}>
                      <img
                        src={
                          blog.Image || "/assets/images/blog/blog-grid/pic1.jpg"
                        }
                        alt={blog.Title}
                      />
                    </Link>
                  </div>
                  <div className="post-info">
                    <ul className="post-meta">
                      <li>
                        <i className="fa fa-calendar"></i>{" "}
                        {new Date(blog.CreatedAt).toLocaleDateString("vi-VN")}
                      </li>
                      <li className="author">
                        <i className="fa fa-user"></i> {blog.Author || "Admin"}
                      </li>
                    </ul>
                    <h5 className="post-title">
                      <Link to={`/blog/${blog.ContentID}`}>{blog.Title}</Link>
                    </h5>
                    <p>{blog.Description?.slice(0, 100)}...</p>
                    <Link to={`/blog/${blog.ContentID}`} className="btn-link">
                      Đọc thêm
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {blogs.length === 0 && (
              <p className="text-center">Không có bài viết phù hợp.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bx text-center mt-4">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <span className="page-link">«</span>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    <span className="page-link">{index + 1}</span>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span className="page-link">»</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
