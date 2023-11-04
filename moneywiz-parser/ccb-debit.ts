import * as fs from "fs";
import * as Papa from "papaparse";

function transformCSV(inputFile: string, outputFile: string): void {
  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading input file: ${err}`);
      return;
    }

    Papa.parse(data, {
      header: true,
      complete: async (results) => {
        const tasks = results.data
          // .filter(
          //   (transaction: any) =>
          //     !transaction["交易地点/附言"].includes("财付通") &&
          //     !transaction["交易地点/附言"].includes("支付宝")
          // )
        .map(async (row: any) => {
          const date = row["交易日期"];
          const formattedDate = `${date.slice(0, 4)}/${date.slice(
            4,
            6
          )}/${date.slice(6, 8)}`;

          const amount = parseFloat(row["交易金额"].replace(",", ""));
          const formattedAmount = amount.toFixed(2);

          return {
            Date: formattedDate,
            Amount: formattedAmount,
            Description: row["交易地点/附言"],
            Notes: row["对方账号与户名"],
          };
        });
        const transformedData = await Promise.all(tasks)

        const csv = Papa.unparse(transformedData);

        fs.writeFile(outputFile, csv, "utf8", (err) => {
          if (err) {
            console.error(`Error writing output file: ${err}`);
          }
        });
      },
    });
  });
}
const inputFile = "./mock/ccb-debit.csv";
const outputFile = "ccb-debit.csv"

transformCSV(inputFile, outputFile);
