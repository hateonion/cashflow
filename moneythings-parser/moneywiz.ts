import * as fs from 'fs';
import Papa from 'papaparse';
import { convertCurrencyStringToNumber } from '../utils/utils';

interface OldCsvRow {
  当前余额: string;
  账户: string;
  转账: string;
  描述: string;
  分类: string;
  日期: string;
  备注: string;
  金额: string;
  货币: string;
  支票号码: string;
  标签: string;
  余额: string;
}

interface NewCsvRow {
  'Scene Name': string;
  'Account Name': string;
  'Transaction Type': string;
  'Primary Category': string;
  'Secondary Category': string;
  Amount: string;
  'Transaction Time': string;
  Remark: string;
}

const processCsv = (inputFilePath: string, outputFilePath: string) => {
  const fileContent = fs.readFileSync(inputFilePath, 'utf8');
  const parseResult = Papa.parse<OldCsvRow>(fileContent, { header: true, skipEmptyLines: true });

  const newCsvRows: any[] = parseResult.data
    .filter((row) => row.金额 !== "")
    .map((row) => {
      const amount = convertCurrencyStringToNumber(row.金额);

      const sceneName = row.标签.includes("wedding") ? "Wedding" : "日常";
      const transactionType = amount < 0 ? "支出" : "收入";
      const primaryCategory =
        row.分类.match(/^(.*?) ▶︎ /)?.[1] ?? (row.分类 || "转账");
      const secondaryCategory = row.分类.match(/ ▶︎ (.*)$/)?.[1] ?? "";

      const transactionDate = row.日期;
      const remark = row.转账
        ? `转账-${row.账户}-${row.转账}--${amount}`
        : `${row.描述} ${row.备注}`;

      return {
        Completion:
          secondaryCategory !== "" ? secondaryCategory : primaryCategory,
        Prompt: remark,
      };
    })
    .filter((row) => row["Completion"] !== "转账");

  const newCsvContent = Papa.unparse(newCsvRows);
  fs.writeFileSync(outputFilePath, newCsvContent, 'utf8');
};

// 用实际的文件路径替换下面的占位符，并将要处理的 CSV 文件的路径替换为 inputFilePath
// 将输出的新 CSV 文件的路径替换为 outputFilePath
const inputFilePath = './mock/report.csv';
const outputFilePath = 'output.csv';

processCsv(inputFilePath, outputFilePath);
