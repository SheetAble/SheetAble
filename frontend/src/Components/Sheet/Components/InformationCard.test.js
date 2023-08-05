import React from "react";
import { render, fireEvent } from "@testing-library/react";
import InformationCard from "./InformationCard";

describe("InformationCard", () => {
  const infoText = "This is some information text";
  const tags = ["tag1", "tag2", "tag3"];
  const sheetName = "Sheet 1";

  it("renders the component with the provided props", () => {
    const { getByText } = render(
      <InformationCard infoText={infoText} tags={tags} sheetName={sheetName} />
    );

    expect(getByText("Information")).toBeInTheDocument();
    expect(getByText(infoText)).toBeInTheDocument();
    expect(getByText(tags[0])).toBeInTheDocument();
    expect(getByText(tags[1])).toBeInTheDocument();
    expect(getByText(tags[2])).toBeInTheDocument();
  });

  it("opens and closes the edit tag modal when add button is clicked", () => {
    const { getByText, queryByText } = render(
      <InformationCard infoText={infoText} tags={tags} sheetName={sheetName} />
    );

    expect(queryByText("Edit Tag")).not.toBeInTheDocument();
    fireEvent.click(getByText("Edit"));

    expect(getByText("Edit Tag")).toBeInTheDocument();
    fireEvent.click(getByText("Close"));

    expect(queryByText("Edit Tag")).not.toBeInTheDocument();
  });
});