import React from "react";

function HomePageNotLoggedIn() {
  return (
    <div>
      <p>Hey bud you're not logged in yet</p>{" "}
      <a href="/login">click here for login</a>
    </div>
  );
}

export default HomePageNotLoggedIn;
