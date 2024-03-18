import { config } from "dotenv";
import { embedder } from "./embeddings.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { getEnv, validateEnvironmentVariables } from "./utils/util.js";
import type { TextMetadata } from "./types.js";
import fs from "fs/promises";

config();
validateEnvironmentVariables();

export const query = async (query: string, topK: number, verbose = false) => {
  validateEnvironmentVariables();
  const pinecone = new Pinecone();

  // Target the index
  const indexName = getEnv("PINECONE_INDEX");
  const index = pinecone.index<TextMetadata>(indexName);

  await embedder.init();

  // Embed the query
  const queryEmbedding = await embedder.embed(query);

  // Query the index using the query embedding
  const results = await index.query({
    vector: queryEmbedding.values,
    topK,
    includeMetadata: true,
    includeValues: false,
  });

  const response = results.matches?.map((match) => ({
    text: match.metadata?.text,
    score: match.score,
  }));

  if (verbose) {
    // Print the results
    console.log(response);
  }

  const outputFilename = "./out.json";
  await fs
    .writeFile(outputFilename, JSON.stringify(response))
    .catch((err) => console.error(err));

  console.log("Results have been written to", outputFilename);
};
