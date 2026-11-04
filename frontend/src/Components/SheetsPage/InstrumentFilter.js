import React, { useEffect, useState } from "react";
import axios from "axios";
import "./InstrumentFilter.css";

function InstrumentFilter({ value, onChange }) {
  const [instruments, setInstruments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/instruments")
      .then((response) => {
        if (!Array.isArray(response.data)) {
          throw new Error("The instrument list response was invalid.");
        }
        setInstruments(response.data);
      })
      .catch((requestError) => {
        setError(
          (requestError.response &&
            requestError.response.data &&
            requestError.response.data.error) ||
            requestError.message ||
            "Unable to load instruments."
        );
      });
  }, []);

  return (
    <div className="instrument-filter">
      <label htmlFor="instrument-filter-select">Filter by instrument: </label>
      <select
        id="instrument-filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All instruments</option>
        {instruments.map((instrument) => (
          <option value={instrument} key={instrument}>
            {instrument}
          </option>
        ))}
      </select>
      {error && <span role="alert">{error}</span>}
    </div>
  );
}

export default InstrumentFilter;
