import React from "react";
import LoadingAnimation from "../../../Images/Animations/Loading.svg";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import Thumbnail from "../../Common/Thumbnail";

function RandomPieceSelection({ sheetPages, page }) {
  const [loading, setLoading] = useState(true);

  const [sheet, setSheet] = useState(undefined);

  const [bubblyButton, setBubblyButton] = useState("bubbly-button");

  const pickPiece = () => {
    setLoading(true);
    return sheetPages[page][
      Math.floor(Math.random() * sheetPages[page].length)
    ];
  };

  useEffect(() => {
    setSheet(pickPiece());
    setLoading(false);
  }, []);

  var animateButton = function (e) {
    e.preventDefault();
    //reset animation

    setBubblyButton("bubbly-button");

    setBubblyButton("bubbly-button animate");

    setSheet(pickPiece());
    setLoading(false);

    setTimeout(function () {
      setBubblyButton("bubbly-button");
    }, 700);
  };

  let history = useHistory();

  return (
    <div className="box rand-piece remove_shadow">
      {loading ? (
        <img className="loading-animation-rand" src={LoadingAnimation} alt="" />
      ) : (
        <div>
          <div>
            <div
              className="rand-img cursor"
              onClick={() =>
                history.push(`sheet/${sheet.pdf_url.split("pdf/").pop()}`)
              }
            >
              <Thumbnail sheet={sheet} width={230} />
            </div>
            <div className="sheet-name-container n-cursor">
              <span className="sheet-name">{sheet.sheet_name}</span>
            </div>
            <div className="sheet-composer-container">
              <span className="sheet-composer">{sheet.composer}</span>
            </div>
          </div>
          <button onClick={animateButton} className={bubblyButton}>
            Shuffle
          </button>
        </div>
      )}
    </div>
  );
}

export default RandomPieceSelection;
