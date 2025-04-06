import express, { Request, Response } from "express";

// AI-generated code
// Add utility function to convert arrays to Sets for proper scenario handling

/**
 * 递归转换 scenario 中需要转成对象的数组字段
 * @param {any} data - 输入数据
 * @returns 转换后的数据
 */
function convertScenarioArrays(data: any): any {
  // 定义需要转换的字段列表
  const keysToConvert = new Set([
    "returnDistribution",
    "incomeDistribution",
    "start",
    "duration",
    "changeDistribution",
    "assetAllocation",
    "assetAllocation2",
  ]);

  if (Array.isArray(data)) {
    // 对数组中的每个元素递归调用转换函数
    return data.map((item: any) => convertScenarioArrays(item));
  } else if (data && typeof data === "object") {
    const result: { [key: string]: any } = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        let value = data[key];
        // 如果当前属性是数组，且字段名在转换列表中，并且数组只有一个元素，则转换成单个对象
        if (
          Array.isArray(value) &&
          keysToConvert.has(key) &&
          value.length === 1
        ) {
          result[key] = convertScenarioArrays(value[0]);
        } else {
          result[key] = convertScenarioArrays(value);
        }
      }
    }
    return result;
  }
  // 对于基本类型，直接返回
  return data;
}

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const rawScenario = req.body;
  // Process the incoming data to convert arrays back to Sets
  console.log("scenario", rawScenario);
  console.log("------------------------------------------");
  const convertedScenario = convertScenarioArrays(rawScenario);
  console.log("------------------------------------------");
  console.log("转换后的 scenario:\n", JSON.stringify(convertedScenario, null, 2));
  res.status(201).json(convertedScenario);
});

export default router;
