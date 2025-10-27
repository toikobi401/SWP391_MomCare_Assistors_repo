import React, { useState } from "react";

export const CommentList = ({ comments, postId, reloadComments }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    await fetch(`http://localhost:5000/api/blog/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        content: replyText,
        parentId,
      }),
    });
    setReplyText("");
    setReplyingTo(null);
    reloadComments();
  };

  return (
    <ol className="comment-list">
      {comments.map((c) => (
        <li key={c.CommentID} className="comment">
          <div className="comment-body">
            <div className="comment-author vcard">
              <img
                className="avatar photo"
                src={c.Avatar || "/assets/images/testimonials/default.jpg"}
                alt={c.Username}
              />
              <cite className="fn">{c.Username}</cite>
            </div>
            <p>{c.Content}</p>

            <button
              className="btn btn-link p-0 text-primary"
              onClick={() =>
                setReplyingTo(replyingTo === c.CommentID ? null : c.CommentID)
              }
            >
              {replyingTo === c.CommentID ? "Hủy" : "Trả lời"}
            </button>

            {replyingTo === c.CommentID && (
              <div className="reply-form mt-2">
                <textarea
                  className="form-control mb-2"
                  rows="2"
                  placeholder="Nhập phản hồi của bạn..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleReplySubmit(c.CommentID)}
                >
                  Gửi phản hồi
                </button>
              </div>
            )}
          </div>

          {/* Hiển thị reply đệ quy */}
          {c.replies && c.replies.length > 0 && (
            <ul className="children ms-5 border-start ps-3 mt-2">
              <CommentList
                comments={c.replies}
                postId={postId}
                reloadComments={reloadComments}
              />
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
};
