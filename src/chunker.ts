// @ts-ignore
import { chunkit } from "semantic-chunking";
import fs from "fs/promises";

const chunksToCSV = (chunks: string[], colNames: string[]) => {
  return (
    colNames.reduce((row, colName) => `${row}${row ? "," : ""}${colName}`, "") +
    "\n" +
    chunks.map((chunk) => chunk.trim().replace(/\s\s+/g, "")).join("|\n")
  );
};

export const chunkFile = async (filePath: string, maxTokenSize = 50) => {
  const srcFileAbsPath = await fs.realpath(filePath);
  const text = await fs.readFile(srcFileAbsPath, "utf8");

  const chunks = (await chunkit(text, {
    logging: true,
    maxTokenSize,
  })) as string[];

  console.log(chunks.length);

  await fs
    .writeFile("./semantic-chunks.csv", chunksToCSV(chunks, ["CHUNK"]))
    .catch((err) => console.error({ err }));
};
