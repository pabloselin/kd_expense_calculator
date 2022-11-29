import axios from "axios";
import { useEffect, useState } from "react";
import { co2 } from "@tgwf/co2";

import "./App.scss";

//all style tags
const styleTags = document.querySelectorAll("style");
const stylesheetTags = document.querySelectorAll("link[rel=stylesheet]");
//all img tags
const imgTags = document.querySelectorAll("img");
//all script tags
const scriptTags = document.querySelectorAll("script");
//all html size
const htmlSize = document.documentElement.outerHTML.length;

function App() {
  const [calculate, setCalculate] = useState(false);
  const [ip, setIP] = useState(null);
  const [intensity, setIntensity] = useState(null);
  const [pageSize, setPageSize] = useState(0);
  const [co2e, setCo2e] = useState(0);
  const [equivalence, setEquivalence] = useState(null);

  //IP for carbon intensity
  const getIP = async () => {
    const res = await axios.get("https://api.ipify.org?format=json");
    setIP(res.data.ip);
  };

  //Carbon intensity
  const getIntensity = async () => {
    if (ip) {
      const res = await axios.get(
        `https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`
      );
      setIntensity(res.data);
    }
  };

   const getEquivalence = async () => {
    const data = await axios.get('./data/expenses_table.json');
    setEquivalence(data.data);
   }

  //Get IP
  useEffect(() => {
    if (calculate === true) {
      getIP();
      getIntensity();
      getEquivalence();
      //calculate size
      for (let i = 0; i < imgTags.length; i++) {
        getFileStats(imgTags[i].src);
      }
      for (let i = 0; i < stylesheetTags.length; i++) {
        if (
          stylesheetTags[i].hasAttribute("href") ||
          stylesheetTags[i].hasAttribute("data-href")
        ) {
          getFileStats(stylesheetTags[i].src);
        }
      }
      for (let i = 0; i < scriptTags.length; i++) {
        getFileStats(scriptTags[i].src);
      }

      if (htmlSize) {
        console.log("html", htmlSize);
        setPageSize(htmlSize + pageSize);
      }
    }
  }, [calculate, ip]);

  useEffect(() => {
    if (pageSize) {
      const swd = new co2({ model: "swd" });
      setCo2e(swd.perVisit(pageSize));
    }
  }, [pageSize]);

  const getFileStats = async (url) => {
    console.log("getting file stats for: ", url);
    let currentSize = pageSize;
    let fileBlob = await axios.get(url, { responseType: "blob" });
    let fileSize = fileBlob.data.size;
    //let fileSizeInMB = fileSize / 1000000;
    setPageSize(currentSize + fileSize);
    //return fileSize;
  };

  return (
    <div className="kd_expense_calculator_app">
      {calculate === true ? (
        <div className="expense_table">
          <h1>Calculadora de gasto</h1>
          <p>IP: {ip}</p>
          <p>
            Tipo de intensidad de la matriz energética según tu país:{" "}
            {intensity && intensity.generation_from_fossil}
          </p>
          <h2>Datos</h2>
          
          <p>Tamaño de todos los elementos de la página: {pageSize && pageSize / 1000}kb</p>
          
          <p>Gasto energético: {co2e}</p>
          <ul>
            {(equivalence && co2e) && equivalence.map((item, index) => <li key={'activity-' + index}>{item.cost * co2e} de {item.activity}</li>)}
          </ul>
          <p>
            <button onClick={() => setCalculate(false)}>Cerrar</button>
          </p>
        </div>
      ) : (
        <button onClick={() => setCalculate(true)}>Calcular gasto energético</button>
      )}
    </div>
  );
}

export default App;
