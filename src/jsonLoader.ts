import fs from "fs/promises";

async function loadJsonFile(filePath: string) {
  try {
    const jsonAbsolutePath = await fs.realpath(filePath);

    // Create a readable stream from the JSON file
    const data = await fs.readFile(jsonAbsolutePath, "utf8");

    // Parse the JSON file
    return (await JSON.parse(data)) as { title: string; content: string[] }[];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default loadJsonFile;
