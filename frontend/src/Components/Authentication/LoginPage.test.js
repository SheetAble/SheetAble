import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureMockStore from "redux-mock-store";
import LoginPage from "./LoginPage";

const mockStore = configureMockStore();
const store = mockStore({
  user: {},
  UI: {},
});
const loginUserMock = jest.fn();

describe("LoginPage component", () => {
  it("renders without errors", () => {
    render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    );
  });

  it("submits the form when login button is clicked", () => {
    const loginUserMock = jest.fn();
    const { getByLabelText, getByText } = render(
      <Provider store={store}>
        <LoginPage loginUser={loginUserMock} />
      </Provider>
    );
    const emailInput = getByLabelText("Email Address");
    const passwordInput = getByLabelText("Password");
    const loginButton = getByText("Login");
  
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);
  
    expect(loginUserMock).toHaveBeenCalledTimes(1);
    expect(loginUserMock).toHaveBeenCalledWith(
      { email: "test@example.com", password: "password123" },
      expect.any(Object)
    );
  });

});