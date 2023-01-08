import { userTypeDefs, userResolvers } from "./userSchema.js";
import { nftTypeDefs, nftResolvers } from "./nftSchema.js";
import {
  nftActivityTypeDefs,
  nftActivityResolvers,
} from "./nftActivitySchema.js";

import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { collectionResolvers, collectionTypeDefs } from "./collectionSchema.js";

const types = [
  userTypeDefs,
  nftTypeDefs,
  nftActivityTypeDefs,
  collectionTypeDefs,
];
const resolv = [
  userResolvers,
  nftResolvers,
  nftActivityResolvers,
  collectionResolvers,
];

export const typeDefs = mergeTypeDefs(types);
export const resolvers = mergeResolvers(resolv);
