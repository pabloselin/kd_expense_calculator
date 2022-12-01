import axios from "axios";
import { useEffect, useState } from "react";
import { co2 } from "@tgwf/co2";
//import countries from "./data/countries.json";
import expenses_table from "./data/expenses_table.json";

//all style tags
//const styleTags = document.querySelectorAll("style");
const stylesheetTags = document.querySelectorAll("link[rel=stylesheet]");
console.log(stylesheetTags);
//all img tags
const imgTags = document.querySelectorAll("img");
//all script tags
const scriptTags = document.querySelectorAll("script");
//all html size
const htmlLength = document.documentElement.outerHTML.length;

function App() {
  const [calculate, setCalculate] = useState(false);
  // const [ip, setIP] = useState(null);
  // const [intensity, setIntensity] = useState(null);

  const [activity, setActivity] = useState(0);

 
  const [totalSize, setTotalSize] = useState(htmlLength);

  const [co2e, setCo2e] = useState(0);
  const equivalence = expenses_table;
  const [isCalculated, setIsCalculated] = useState(false);
  //const [countries, setCountries] = useState(null);

  // useEffect(() => {
  //   if (calculate) {
  //     axios.get("https://api.ipify.org?format=json").then((res) => {
  //       setIP(res.data.ip);
  //     });
  //   }
  // }, [calculate]);

  // useEffect(() => {
  //   //Carbon intensity
  //   if (ip) {
  //     axios
  //       .get(
  //         `https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`
  //       )
  //       .then((res) => {
  //         setIntensity(res.data);
  //       });
  //   }
  // }, [ip]);

  useEffect(() => {
    let min = 0;
    let max = equivalence.length;
    let randomActivity = Math.floor(Math.random() * (max - min)) + min;
    setActivity(randomActivity);
  }, [isCalculated, equivalence]);

  useEffect(() => {
    const getFileStatsfromArray = async (urls) => {
      urls.forEach((url) => {
        axios.get(url, { responseType: "blob" }).then((res) => {
          setTotalSize((totalSize) => {
            console.log(
              "getting file stats for: ",
              `${url}: ${res.data.size / 1000}kb / previous ${
                totalSize / 1000
              }kb`
            );
            return totalSize + res.data.size;
          });
        });
      });
    };

    if (calculate === true && isCalculated === false) {
      //build array of all file urls
      let fileUrls = [];
      for (let i = 0; i < imgTags.length; i++) {
        fileUrls.push(imgTags[i].src);
      }
      for (let i = 0; i < scriptTags.length; i++) {
        fileUrls.push(scriptTags[i].src);
      }
      for (let i = 0; i < stylesheetTags.length; i++) {
        fileUrls.push(stylesheetTags[i].href);
      }

      //get file stats
      getFileStatsfromArray(fileUrls);

      //set page size

      //setTotalSize(totalSize + htmlSize);

      setIsCalculated(true);
    }
  }, [calculate, isCalculated, totalSize]);

  useEffect(() => {
    if (totalSize) {
      const swd = new co2({ model: "swd" });
      setCo2e(swd.perVisit(totalSize));
    }
  }, [totalSize]);

  return (
    <div className="kd_expense_calculator_app">
      {calculate === true ? (
        <div className="kd_expense_table">
          <h1>Calculadora de gasto energético digital</h1>
          <span className="kd_detail">
            (Valores aproximados calculados según ubicación, servidor y
            dispositivo)
          </span>

          {isCalculated && (
            <>
              <p className="kd_activity">
                El{" "}
                <strong>
                  {((co2e * 100) / equivalence[activity].cost).toFixed(4)}%
                </strong>{" "}
                de {equivalence[activity].activity}
              </p>

              <p className="kd_equivalence">
                Gasto energético: <strong>{co2e.toFixed(2)} de co2e</strong> (equivalencia de
                carbono)
              </p>

              <p>
                <button
                  className="kd_calculate_button"
                  onClick={() => setCalculate(false)}
                >
                  Cerrar
                </button>
              </p>
            </>
          )}

          <div className="kd_desglose">
            <p>
              Tamaño de todos los elementos de la página:{" "}
              <strong>{totalSize && totalSize / 1000}kb</strong>
            </p>
            
          </div>
        </div>
      ) : (
        <div className="kd_expense_calculator_app">
          <button
            title="Calcular gasto energético"
            className="kd_calculate_button"
            onClick={() => setCalculate(true)}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
