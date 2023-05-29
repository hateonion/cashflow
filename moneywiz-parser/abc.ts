import * as fs from 'fs';
import * as Papa from 'papaparse';

// 读取CSV文件
const csvFile = fs.readFileSync('abc.csv', 'utf8');

// 解析CSV文件
Papa.parse(csvFile, {
    header: true,
    complete: (results) => {
        const transactions = results.data;

        // 过滤和格式化数据
        const formattedData = transactions
          .filter(
            (transaction: any) =>
              !transaction["交易地点"].includes("财付通") &&
              !transaction["交易地点"].includes("支付宝")
          )
          .map((transaction: any) => {
            let amount = parseFloat(
              transaction["入账金额/币种(支出为-)"].split("/")[0]
            );

            let income = amount > 0 ? amount : '';
            let expense = amount < 0 ? amount : '';
            // 保留两位小数
            return {
              Date: transaction["交易日"],
              description: transaction["交易地点"],
              income,
	      expense
            };
          });

        // 将格式化的数据转换回CSV格式
        const csv = Papa.unparse(formattedData);

        // 将结果写入新的CSV文件
        fs.writeFileSync('formatted_transactions.csv', csv);
    },
});