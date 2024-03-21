import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { load } from "./load.js";
import { query as queryCommand } from "./query.js";
import { deleteIndex } from "./deleteIndex.js";
import { mdToCSVLike } from "./mdToCSVLike.js";

export const run = async () => {
  const parser = yargs(hideBin(process.argv))
    .scriptName("semanticSearchExample")
    .demandCommand(1)
    // Configure load command
    .command({
      command: "load",
      aliases: ["l"],
      describe: "Load the embeddings in to Pinecone",
      builder: (yargs) =>
        yargs
          .option("csvPath", {
            alias: "p",
            type: "string",
            description: "Path to your CSV path",
            demandOption: true,
          })
          .option("column", {
            alias: "c",
            type: "string",
            description: "The name for the CSV column",
            demandOption: true,
          }),
      handler: async (argv) => {
        const { csvPath, column } = argv;

        if (!csvPath) {
          console.error("Please provide a CSV path");
          process.exit(1);
        }

        await load(csvPath, column);
      },
    })
    // Configure query command
    .command({
      command: "query",
      aliases: ["q"],
      describe: "Query Pinecone DB",
      builder: (yargs) =>
        yargs
          .option("query", {
            alias: "q",
            type: "string",
            description: "Your query",
            demandOption: true,
          })
          .option("topK", {
            alias: "k",
            type: "number",
            description: "number of results to return",
            demandOption: true,
          })
          .option("verbose", {
            alias: "V",
            type: "boolean",
            description: "Wheter or not to print the query results",
            default: false,
            demandOption: false,
          }),
      handler: async (argv) => {
        const { query, topK, verbose } = argv;
        if (!query) {
          console.error("Please provide a query");
          process.exit(1);
        }

        await queryCommand(query, topK, verbose);
      },
    })
    .command({
      command: "convertMd",
      aliases: ["c"],
      describe: "Convert markdown file to a CSV-like file",
      builder: (yargs) =>
        yargs.option("mdFile", {
          alias: "m",
          type: "string",
          description: "Path to your markdown file",
          demandOption: true,
        }),
      handler: async (argv) => {
        const { mdFile } = argv;

        if (!mdFile) {
          console.error("Please provide a file path");
          process.exit(1);
        }

        await mdToCSVLike(mdFile);
      },
    })
    // Configure delete command
    .command({
      command: "delete",
      aliases: ["d"],
      describe: "Delete Pinecone Index",
      handler: async () => {
        await deleteIndex();
      },
    });

  // Ensure that parser is not calling real yargs process exit in case of tests
  if (typeof vitest !== "undefined") {
    parser.exit = (number) => {
      throw new Error("Parser, process.exit: " + number);
    };
  }

  // Parse query command
  return parser.parse();
};

// In case it is not test enviroment run automatically
/* c8 ignore start */
if (typeof vitest === "undefined") {
  run();
}
/* c8 ignore end */
