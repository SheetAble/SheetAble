import React, { Fragment, useState } from "react";
import SideBar from "../Sidebar/SideBar";
import "./SearchPage.css";

import { searchData } from "../../Redux/Actions/dataActions";
import { connect } from "react-redux";
import ResultBox from "./ResultBox";

function SearchPage({ searchData }) {
  const [searchValue, setSearchValue] = useState("");

  const [searchResponse, setSearchResponse] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = () => {
    if (searchValue.trim() !== "") {
      searchData(searchValue.trim(), (data) => {
        setSearchResponse(data);
        setHasSearched(true);
      });
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value === "") {
      setSearchResponse([]);
      setHasSearched(false);
    }
  };

  /* Checks if Enter is pressed while in input */
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div>
      <Fragment>
        <SideBar />
        <div className="home_content">
          <div className="search_wrapper">
            <div className="search_input_box">
              <input
                type="text"
                name="text"
                placeholder="Search for sheets"
                value={searchValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              <i
                className="bx bx-search-alt-2 cursor"
                onClick={handleSubmit}
              ></i>
            </div>

            <ResultBox
              searchResponse={searchResponse}
              hasSearched={hasSearched}
            />
          </div>
        </div>
      </Fragment>
    </div>
  );
}

const mapStateToProps = (state) => ({});

const mapActionsToProps = {
  searchData,
};

export default connect(mapStateToProps, mapActionsToProps)(SearchPage);
