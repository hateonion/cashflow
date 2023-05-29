import fs from "fs";
import Papa from "papaparse";

interface DataRow {
  Date: string;
  Category: string;
  Description: string;
  Amount: number;
  Account: string;
  Notes: string;
}

// The CSV file path to parse and process
const csvFilePath: string = "mock/alipay.csv";

// Read the CSV file content
fs.readFile(csvFilePath, "utf-8", (error: NodeJS.ErrnoException | null, data: string) => {
  if (error) {
    console.error("Error reading the csv file:", error.message);
    return;
  }

  // Parse the CSV file
  const parsedData = Papa.parse<{ [key: string]: string }>(data, {
    header: true,
    skipEmptyLines: true,
  });

  // 过滤掉交易状态为'交易关闭'的条目，并进行映射
  const filteredData = parsedData.data
    .filter((row) => row["交易状态"] !== "交易关闭")
    .map((row) => {
      const amount =
        row["收/支"] === "收入"
          ? parseFloat(row["金额"])
          : row["收/支"] === "支出"
          ? -parseFloat(row["金额"])
          : parseFloat(row["金额"]);

      return {
        Date: row["交易时间"],
        Category: row["交易分类"],
        Description: row["商品说明"],
        Amount: amount,
        Account: row["收/付款方式"],
        Notes: row["交易对方"],
      };
    });

  // 将处理后的数据转换回CSV格式
  const mappedCsv = Papa.unparse(filteredData);

  // 将处理后的数据写入新的CSV文件
  fs.writeFile("alipay.csv", mappedCsv, (error) => {
    if (error) {
      console.error("Error writing the mapped csv file:", error.message);
      return;
    }
    console.log("The mapped csv file has been created successfully.");
  });
});