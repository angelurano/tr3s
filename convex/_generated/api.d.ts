/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as crons from "../crons.js";
import type * as helpers_spaces from "../helpers/spaces.js";
import type * as http from "../http.js";
import type * as routes_clerkWebhook from "../routes/clerkWebhook.js";
import type * as routes_spaces from "../routes/spaces.js";
import type * as schemaShared from "../schemaShared.js";
import type * as spaces from "../spaces.js";
import type * as spacesPresences from "../spacesPresences.js";
import type * as spacesUsers from "../spacesUsers.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  "helpers/spaces": typeof helpers_spaces;
  http: typeof http;
  "routes/clerkWebhook": typeof routes_clerkWebhook;
  "routes/spaces": typeof routes_spaces;
  schemaShared: typeof schemaShared;
  spaces: typeof spaces;
  spacesPresences: typeof spacesPresences;
  spacesUsers: typeof spacesUsers;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
