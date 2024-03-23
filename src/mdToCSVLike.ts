import fs from "fs/promises";

export const mdToCSVLike = async (mdFile: string) => {
  const mdAbsolutePath = await fs.realpath(mdFile);
  const markdown = await fs.readFile(mdAbsolutePath, "utf8");

  const csv = markdown
    .replace(/### (.+)\n\n*/g, '|Title:"$1",Content:')
    .replace(/- (.+)\n/g, '"$1",')
    .replace(/,\n\|/g, "|\n")
    .replace(/^\|/, "CHUNK\n");

  const outFilename = "./semantic-chunks.csv";

  await fs.writeFile(outFilename, csv);
  console.log("Markdown file converted to", outFilename);
};
