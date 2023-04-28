import fs from 'fs';
import Papa from 'papaparse';
import { convertCurrencyStringToNumber } from "./utils";

const inputFile = 'wechat.csv';
const outputFile = 'wechatout.csv';

interface InputRow {
  '交易时间': string;
  '交易类型': string;
  '商品': string;
  '收/支': string;
  '金额(元)': string;
  '支付方式': string;
  '交易对方': string;
}

interface OutputRow {
  Date: string;
  Category: string;
  Description: string;
  Amount: number;
  Account: string;
  Notes: string;
}

// Read input file
fs.readFile(inputFile, 'utf8', (err: NodeJS.ErrnoException | null, inputCsvData: string) => {
  if (err) {
    console.error(`Error reading input file: ${err.message}`);
    return;
  }

  // Parse input CSV data
  Papa.parse<InputRow>(inputCsvData, {
    header: true,
    complete: (results) => {
      const inputRows: InputRow[] = results.data;
      const outputRows: OutputRow[] = [];

      inputRows.forEach((row: InputRow) => {
        // Create new mapping object
        const newRow: OutputRow = {
          Date: row['交易时间'],
          Category: row['交易类型'],
          Description: row['商品'],
          Amount: row['收/支'] === '收入' ? convertCurrencyStringToNumber(row['金额(元)']) : -convertCurrencyStringToNumber(row['金额(元)']),
          Account: row['支付方式'],
          Notes: row['交易对方'],
        };

        // Add new row to output array
        outputRows.push(newRow);
      });

      // Convert output data back to CSV
      const outputCsvData: string = Papa.unparse(outputRows, { header: true });

      // Write new CSV data to output file
      fs.writeFile(outputFile, outputCsvData, 'utf8', (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.error(`Error writing output file: ${err.message}`);
          return;
        }

        console.log('Conversion completed successfully.');
      });
    }
  });
});