import type { INodeProperties } from "n8n-workflow";
import {
	notificationGetAllFields,
	notificationMarkReadFields,
} from "./operations";

export const notificationOperations: INodeProperties[] = [
	{
		displayName:
			"Notifications require the TickTick Session API (V2) credential. Please select it above.",
		name: "notificationV2Notice",
		type: "notice",
		default: "",
		displayOptions: {
			show: {
				resource: ["notification"],
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
				resource: ["notification"],
				authentication: ["tickTickSessionApi"],
			},
		},
		options: [
			{
				name: "Get Many",
				value: "getAll",
				description: "Get many notifications",
				action: "Get many notifications",
			},
			{
				name: "Mark Read",
				value: "markRead",
				description: "Mark all notifications as read",
				action: "Mark all notifications as read",
			},
		],
		default: "getAll",
	},
];

export const notificationFields: INodeProperties[] = [
	...notificationGetAllFields,
	...notificationMarkReadFields,
];
