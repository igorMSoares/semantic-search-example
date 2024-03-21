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

export const chunkFile = async (
  filePath: string,
  maxTokenSize = 50,
  verbose = false
) => {
  const srcFileAbsPath = await fs.realpath(filePath);
  const text = await fs.readFile(srcFileAbsPath, "utf8");

  const chunks = (await chunkit(text, {
    logging: verbose,
    maxTokenSize,
  })) as string[];

  const outputFilepath = "./semantic-chunks.csv";

  await fs
    .writeFile(outputFilepath, chunksToCSV(chunks, ["CHUNK"]))
    .catch((err) => console.error({ err }));

  console.log(chunks.length, "chunks written to", outputFilepath);
};
