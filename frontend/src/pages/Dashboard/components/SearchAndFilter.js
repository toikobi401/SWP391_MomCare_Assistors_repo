import React from "react";
import { LuSearch } from "react-icons/lu";

const SearchAndFilter = ({
  filterBtn,
  getFilterLabel,
  setSearchKeyword,
  setFilterRole,
  setFilterStatus,
  setPage
}) => {
  return (
    <div className="d-flex mt-3 justify-content-between align-items-center px-2">
      {/* Search */}
      <div className="position-relative search-wrapper">
        <LuSearch className="position-absolute top-50 translate-middle-y ms-3 text-gray-400" />
        <input
          type="text"
          className="search-dashboard ps-5 py-2"
          placeholder="Search..."
          onChange={(e) => setSearchKeyword(e.target.value.toLowerCase())}
        />
      </div>
      {/* Filter */}
      <div className="d-flex gap-2 justify-content-center">
        {filterBtn.map((filter, index) => (
          <div className="dropdown" key={`dropdown-${index}`}>
            <button
              className="btn btn-white dropdown-toggle border rounded-2 hover-gray"
              type="button"
              id={`dropdownBtn-${filter.name}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {getFilterLabel(filter)}
            </button>
            <ul
              className="dropdown-menu"
              aria-labelledby={`dropdownBtn-${filter.name}`}
            >
              {filter.list.map((stat, statIndex) => (
                <li
                  key={`${filter.name}-${statIndex}`}
                  onClick={() => {
                    if (filter.type === "role") setFilterRole(stat);
                    if (filter.type === "status") setFilterStatus(stat);
                    setPage(1);
                  }}
                >
                  <a className="dropdown-item" href="#">
                    {stat}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilter;
