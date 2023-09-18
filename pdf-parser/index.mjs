/**
 * @original_author Miguel Aladro Estrada (1000103361)
 * @original_author Steffen Geving (1000103366)
 * @updated_by Grayson Orr
 * 
 * @description This file parses the path of study summaries PDF document.
 * The is a modified version of the code provided by Miguel and Steffen.
 *
 * @version 0.0.1
 * @license MIT
 * 
 * @see {@link https://github.com/Grayson-Orr/path-of-study-tooling}
 */

import * as fs from "fs";
import PDFParser from "pdf2json";

let papers = [];

const parseRawString = (string) => {
  const stringArray = string.split("Paper Code");

  for (let i = 0; i < stringArray.length; i++) {
    if (stringArray[i].trim() !== "") {
      let rawString = stringArray[i];
      const code = rawString.split("Paper Title")[0].trim();
      rawString = rawString.split("Paper Title")[1];
      const title = rawString.split(/Lecturer.{0,3}/)[0].trim();
      rawString = rawString.split(/Lecturer.{0,3}/)[1];
      const name = rawString.split("Semester")[0].trim();
      rawString = rawString.split("Semester Semester")[1];
      if (rawString.charAt(0) !== ' ') rawString = rawString.substring(1); 
      const semValue1 = parseInt(rawString.split("and")[0]);
      const semValue2 = parseInt(rawString.split("and")[1]);
      const semester = [semValue1];
      if (Number.isInteger(semValue2)) semester.push(semValue2);
      rawString = rawString.split("Summary")[1];
      const summary1 = rawString.split(/----------------Page/g)[0];
      rawString = rawString.split(/Break----------------/g)[1];
      const summary2 = rawString.split(/----------------Page/g)[0];
      const summary = (summary1 + summary2).replace(/  +/g, " ").trim();

      papers.push({ code, title, name, semester, summary });
    }
  }
};

const pdfParser = new PDFParser(this, 1);

pdfParser.loadPDF("./data/pos-summaries.pdf");

await new Promise(async (resolve, reject) => {
  pdfParser.on("pdfParser_dataError", (errData) =>
    console.error(errData.parserError)
  );
  pdfParser.on("pdfParser_dataReady", () => {
    const raw = pdfParser.getRawTextContent().replace(/\r\n/g, " ");

    resolve(parseRawString(raw));
  });
});

fs.writeFileSync(
  "./data/parseData.json",
  JSON.stringify(papers, null, 2),
  (err) => {
    if (err === null) throw err;
  }
);

console.log("Successfully parsed PDF and wrote data to ./data/pos-summaries.json");
