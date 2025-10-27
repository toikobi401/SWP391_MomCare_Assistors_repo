// src/pages/Blog/BlogDetails.js
import { CommentList } from "./CommentList";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ userId: 1, content: "" });

  useEffect(() => {
    // Lấy chi tiết bài viết
    fetch(`http://localhost:5000/api/blog/${id}`)
      .then((res) => res.json())
      .then((result) => setBlog(result.data || null))
      .catch((err) => console.error("Lỗi load blog:", err));

    // Lấy comment
    fetch(`http://localhost:5000/api/blog/${id}/comments`)
      .then((res) => res.json())
      .then((result) => setComments(result.data || []))
      .catch((err) => console.error("Lỗi load comments:", err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content) return;

    await fetch(`http://localhost:5000/api/blog/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ ...form, content: "" });

    // Reload comments
    fetch(`http://localhost:5000/api/blog/${id}/comments`)
      .then((res) => res.json())
      .then((result) => setComments(result.data || []));
  };

  if (!blog) return <p className="text-center py-5">⏳ Đang tải...</p>;

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
              <h1>{blog.Title}</h1>
              <nav aria-label="breadcrumb" className="breadcrumb-row">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/">Home</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/blog">Blog</Link>
                  </li>
                  <li className="breadcrumb-item active">{blog.Title}</li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung */}
      <section className="section-area section-sp1">
        <div className="container">
          <div className="row">
            {/* Main content */}
            <div className="col-lg-8 col-md-7">
              <article className="blog-single">
                <div className="ttr-post-media">
                  <img
                    src={blog.Image || "/assets/images/blog/default/pic1.jpg"}
                    alt={blog.Title}
                    className="w-100"
                  />
                </div>

                <div className="ttr-post-info">
                  <ul className="media-post">
                    <li>
                      <i className="fa fa-calendar"></i>{" "}
                      {new Date(blog.CreatedAt).toLocaleDateString("vi-VN")}
                    </li>
                    <li>
                      <i className="fa fa-user"></i> {blog.Author || "Admin"}
                    </li>
                  </ul>

                  <div className="ttr-post-title">
                    <h2 className="post-title">{blog.Title}</h2>
                  </div>

                  <div className="ttr-post-text text">
                    <div dangerouslySetInnerHTML={{ __html: blog.Description }}></div>
                  </div>
                </div>
              </article>

              {/* Khu vực bình luận */}
              <div className="comments-area" id="comments">

                {/* Form bình luận */}
                {/* Khu vực bình luận */}
                <div className="comments-area" id="comments">
                  <h4 className="comments-title">
                    Bình luận ({comments.length})
                  </h4>

                  <CommentList
                    comments={comments}
                    postId={id}
                    reloadComments={() => {
                      fetch(`http://localhost:5000/api/blog/${id}/comments`)
                        .then((res) => res.json())
                        .then((result) => setComments(result.data || []));
                    }}
                  />

              
                  <div className="comment-respond mt-4">
                    <h4 className="comment-reply-title">Để lại bình luận</h4>
                    <form className="comment-form" onSubmit={handleSubmit}>
                      <p className="comment-form-comment">
                        <textarea
                          name="content"
                          placeholder="Nội dung bình luận"
                          value={form.content}
                          onChange={(e) =>
                            setForm({ ...form, content: e.target.value })
                          }
                          required
                        />
                      </p>
                      <p className="form-submit">
                        <input
                          type="submit"
                          className="submit"
                          value="Gửi bình luận"
                        />
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 col-md-5 sticky-top">
              <aside className="side-bar">
                <div className="widget">
                  <h5 className="widget-title">Bài viết mới</h5>
                  <ul>
                    <li>
                      <Link to="/blog/1">Thực đơn cho mẹ bầu tháng thứ 3</Link>
                    </li>
                    <li>
                      <Link to="/blog/2">Các dấu hiệu cần đi khám ngay</Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
