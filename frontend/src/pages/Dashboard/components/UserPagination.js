import React from "react";

const UserPagination = ({
  handleNext,
  handlePrev,
  handlePageChange,
  page,
  totalPages,
}) => {
  const generatePage = () => {
    const pages = [];
    if (totalPages < 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 2) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 1) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page, "...", totalPages);
      }
    }
    return pages;
  };

  const pageToShow = generatePage();

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination">
        <li
          className={`page-item ${page === 1 ? "disabled" : ""}`}
          onClick={page === 1 ? null : handlePrev}
        >
          <a className="page-link">«</a>
        </li>
        {pageToShow.map((p, index) => {
          if (p === "...") {
            return (
              <li
                key={`ellipsis-${index}`}
                className="page-item"
                aria-hidden="true"
              >
                <span className="page-link" style={{ cursor: "default" }}>
                  …
                </span>
              </li>
            );
          } else {
            return (
              <li
                key={index}
                className={`page-item ${p === page ? "active" : ""}`}
                // isActive={p === page}
                onClick={() => {
                  if (p !== page) handlePageChange(p);
                }}
              >
                <a className="page-link cursor-pointer">{p}</a>
              </li>
            );
          }
        })}
        <li
          className={`page-item ${page === totalPages ? "disabled" : ""}`}
          onClick={page === totalPages ? null : handleNext}
        >
          <a className="page-link">»</a>
        </li>
      </ul>
    </nav>
  );
};

export default UserPagination;
