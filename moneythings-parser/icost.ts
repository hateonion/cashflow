import * as fs from 'fs';
import Papa from 'papaparse';

// Function to format the date from YYYY/MM/DD to YYYY年MM月DD日 12:00:00
const formatDate = (date: string): string => {
  const [year, month, day] = date.split('/');
  return `${year}年${month}月${day}日`;
};

// Function to format the amount, remove commas, and handle negatives
const formatAmount = (amount: string, type: string): string => {
  let formattedAmount = amount?.replace(/,/g, '');
  return type === '转账' && parseFloat(formattedAmount) < 0 ? '' : formattedAmount;
};

// Function to determine the transaction type and appropriate accounts
const getTypeAndAccounts = (amount: string, account: string, transfer: string): [string, string, string] => {
  let type = '';
  let account1 = '';
  let account2 = '';

  if (transfer) {
    type = '转账';
    account1 = transfer;
    account2 = account;
  } else {
    type = parseFloat(amount.replace(/,/g, '')) < 0 ? '支出' : '收入';
    account1 = account;
    account2 = '';
  }

  return [type, account1, account2];
};

// Function to merge description and notes
const formatNotes = (description: string, note: string): string => {
  let notes = description;
  if (note && note.trim() !== '') {
    notes += ` - ${note}`;
  }
  return notes.trim();
};

// Function to map old data to new template
const mapData = (oldData: any, index: number): any => {
  const [type, account1, account2] = getTypeAndAccounts(oldData['金额'], oldData['账户'], oldData['转账']);
  return {
    日期: formatDate(oldData["日期"]),
    类型: type,
    金额: formatAmount(oldData["金额"], oldData["转账"]),
    一级分类: oldData["分类"],
    二级分类: "",
    账户1: account1,
    账户2: account2,
    备注: formatNotes(oldData["描述"], oldData["备注"]),
    货币: oldData["货币"],
    标签: oldData["标签"]
      ? oldData["标签"]
          .split(",")
          .map((tag: any) => `#${tag.trim()}`)
          .join("")
      : "",
  };
};

// Reading the old CSV file
const oldCsv = fs.readFileSync('report.csv', 'utf8');

// Parsing the old CSV file
Papa.parse(oldCsv, {
  header: true,
  complete: (result) => {
    const newData = result.data
      .filter(
        (record: any) =>
          !(record["转账"] && parseFloat(record["金额"].replace(/,/g, "")) < 0)
      ) // Filter out negative transfers
      .map(mapData);

    // Convert the new data back to CSV
    const newCsv = Papa.unparse(newData);

    // Write the new CSV to a file
    fs.writeFileSync('newData.csv', newCsv);
  }
});