import type { INodeProperties } from "n8n-workflow";
import { commentGetAllFields, commentCreateFields } from "./operations";

export const commentOperations: INodeProperties[] = [
	{
		displayName:
			"Comments require the TickTick Session API (V2) credential. Please select it above.",
		name: "commentV2Notice",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				resource: ["comment"],
				authentication: ["tickTickTokenApi", "tickTickOAuth2Api"],
			},
		},
	},
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["comment"],
				authentication: ["tickTickSessionApi"],
			},
		},
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a comment on a task",
				action: "Create a comment",
			},
			{
				name: "Get Many",
				value: "getAll",
				description: "Get many comments on a task",
				action: "Get many comments",
			},
		],
		default: "getAll",
	},
];

export const commentFields: INodeProperties[] = [
	...commentGetAllFields,
	...commentCreateFields,
];
