import type { ResourceDefinition } from "../../helpers/types";
import { commentFields, commentOperations } from "./CommentsDescription";
import * as operations from "./operations";

export const commentResource: ResourceDefinition = {
	name: "comment",
	operations: commentOperations,
	fields: commentFields,
	handlers: {
		getAll: operations.commentGetAllExecute,
		create: operations.commentCreateExecute,
	},
};

export * from "./CommentsDescription";
export * from "./operations";
