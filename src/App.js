import axios from "axios";
import { useEffect, useState } from "react";
import { co2 } from "@tgwf/co2";
import countries from "./data/countries.json";
import expenses_table from "./data/expenses_table.json";

//all style tags
//const styleTags = document.querySelectorAll("style");
const stylesheetTags = document.querySelectorAll("link[rel=stylesheet]");
//all img tags
const imgTags = document.querySelectorAll("img");
//all script tags
const scriptTags = document.querySelectorAll("script");
//all html size
const htmlLength = document.documentElement.outerHTML.length;

function App() {
  const [calculate, setCalculate] = useState(false);
  const [ip, setIP] = useState(null);
  const [intensity, setIntensity] = useState(null);
  const [pageSize, setPageSize] = useState({
    images: 0,
    scripts: 0,
    styles: 0,
    html: 0,
  });
  const [activity, setActivity] = useState(0);

  const [imageSize, setImageSize] = useState(0);
  const [scriptSize, setScriptSize] = useState(0);
  const [styleSize, setStyleSize] = useState(0);
  const [htmlSize, setHtmlSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  const [co2e, setCo2e] = useState(0);
  const [equivalence, setEquivalence] = useState(expenses_table);
  const [isCalculated, setIsCalculated] = useState(false);
  const [countries, setCountries] = useState(null);

  useEffect(() => {
    if (calculate) {
      axios.get("https://api.ipify.org?format=json").then((res) => {
        setIP(res.data.ip);
      });
    }
  }, [calculate]);

  useEffect(() => {
    //Carbon intensity
    if (ip) {
      axios
        .get(
          `https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`
        )
        .then((res) => {
          setIntensity(res.data);
        });
    }
  }, [ip]);

  useEffect(() => {
    let min = 0;
    let max = equivalence.length;
    let randomActivity = Math.floor(Math.random() * (max - min)) + min;
    setActivity(randomActivity);
  }, [isCalculated]);

  useEffect(() => {
    const getFileStats = async (url, category) => {
      //let fileBlob = await
      axios
        .get(url, { responseType: "blob" })
        .then((res) => {
          console.log(
            "getting file stats for: ",
            `${url} - ${res.data.size / 1000}kb`
          );
          console.log("category: ", category);
          if (category === "images") {
            setImageSize(imageSize + res.data.size);
          } else if (category === "scripts") {
            setScriptSize(scriptSize + res.data.size);
          } else if (category === "styles") {
            setStyleSize(styleSize + res.data.size);
          } else if (category === "html") {
            setHtmlSize(htmlLength + res.data.size);
          }
          //setPageSize({...pageSize,[category]: pageSize[category] + res.data.size});
        })
        .catch((err) => {
          console.log(err);
        });
    };

    if (calculate === true && isCalculated === false) {
      //calculate size
      for (let i = 0; i < imgTags.length; i++) {
        getFileStats(imgTags[i].src, "images");
      }
      for (let i = 0; i < stylesheetTags.length; i++) {
        if (
          stylesheetTags[i].hasAttribute("href") ||
          stylesheetTags[i].hasAttribute("data-href")
        ) {
          getFileStats(stylesheetTags[i].src, "styles");
        }
      }
      for (let i = 0; i < scriptTags.length; i++) {
        getFileStats(scriptTags[i].src, "scripts");
      }

      setPageSize(htmlSize, "html");

      setIsCalculated(true);
    }
  }, [
    calculate,
    pageSize,
    isCalculated,
    imageSize,
    scriptSize,
    styleSize,
    htmlSize,
  ]);

  useEffect(() => {}, [isCalculated]);

  useEffect(() => {
    setTotalSize(imageSize + scriptSize + styleSize + htmlSize);
  }, [imageSize, scriptSize, styleSize, htmlSize, totalSize]);

  useEffect(() => {
    if (totalSize) {
      const swd = new co2({ model: "swd" });
      setCo2e(swd.perVisit(totalSize));
    }
  }, [totalSize]);

  return (
    <div className="kd_expense_calculator_app">
      {calculate === true ? (
        <div className="expense_table">
          <h1>Calculadora de gasto energético digital</h1>
          <span>
            (Valores aproximados calculados según ubicación geográfica, servidor
            y dispositivo)
          </span>

          {isCalculated && (
            <>
              <p className="equivalence">
                Gasto energético: {co2e.toFixed(2)} de co2e (equivalencia de
                carbono)
              </p>

              {activity && equivalence && (
                <p>
                  El{" "}
                  <strong>{(co2e / equivalence[activity].cost).toFixed(4)}%</strong>{" "}
                  de {equivalence[activity].activity}
                </p>
              )}

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

          <p>IP: {ip}</p>
          <p>
            Emisión de carbono por cada kilowatt/hora en tu país:{" "}
            {intensity && intensity.carbon_intensity}grs
          </p>

          <div className="desglose">
            <h2>Desglose de transferencia de datos</h2>
            <p>
              Tamaño de todos los elementos de la página:{" "}
              {totalSize && totalSize / 1000}kb
            </p>
            <ul>
              <li>Imágenes: {imageSize && imageSize / 1000}kb</li>
              <li>Scripts: {scriptSize && scriptSize / 1000}kb</li>
              <li>Estilos: {styleSize && styleSize / 1000}kb</li>
            </ul>
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
