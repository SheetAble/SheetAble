import React from "react";
import { render } from "@testing-library/react";
import ResultBox from "./ResultBox";
import "@testing-library/jest-dom/extend-expect"

describe("ResultBox component", () => {
  it("renders NoResults component when searchResponse is empty", () => {
    const { getByText } = render(<ResultBox searchResponse={[]} />);
    expect(getByText("There were no results found")).toBeInTheDocument();
  });

  it("renders Results component with correct props when searchResponse is not empty", () => {
    const searchResponse = [
      { sheet_name: "Sheet 1", sheet_data: "Some data" },
      { sheet_name: "Sheet 2", sheet_data: "More data" }
    ];
    const { getByText } = render(<ResultBox searchResponse={searchResponse} />);
    expect(getByText("Sheet 1")).toBeInTheDocument();
    expect(getByText("Sheet 2")).toBeInTheDocument();
  });

    it("renders the correct number of SheetBox components when searchResponse is not empty", () => {
    const searchResponse = [    { sheet_name: "Sheet 1", sheet_type: "Type A" },    { sheet_name: "Sheet 2", sheet_type: "Type B" }  ];
    const { getAllByTestId } = render(<ResultBox searchResponse={searchResponse} />);
    const sheetBoxes = getAllByTestId("sheet-box-container");
    expect(sheetBoxes).toHaveLength(2);
  });
});