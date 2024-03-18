import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { load } from "./load.js";
import { query as queryCommand } from "./query.js";
import { deleteIndex } from "./deleteIndex.js";

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
        yargs.option("filePath", {
          alias: "p",
          type: "string",
          description: "Path to your json file",
          demandOption: true,
        }),
      handler: async (argv) => {
        const { filePath } = argv;

        if (!filePath) {
          console.error("Please provide a file path");
          process.exit(1);
        }

        await load(filePath);
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
        if (!query || !topK) {
          console.error("Please provide a query and the topK argument");
          process.exit(1);
        }

        await queryCommand(query, topK, verbose);
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
