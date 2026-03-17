import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { ENDPOINTS } from "../../../helpers/constants";

export const notificationGetAllFields: INodeProperties[] = [
	{
		displayName: "Unread Only",
		name: "unreadOnly",
		type: "boolean",
		default: false,
		description: "Whether to return only unread notifications",
		displayOptions: {
			show: { resource: ["notification"], operation: ["getAll"] },
		},
	},
];

export async function notificationGetAllExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const unreadOnly = this.getNodeParameter("unreadOnly", index) as boolean;

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.NOTIFICATIONS,
		{},
		{ autoMarkRead: "false" },
	);

	let notifications = Array.isArray(response) ? response : [];

	if (unreadOnly) {
		notifications = notifications.filter(
			(n: IDataObject) => n.unread === true,
		);
	}

	return notifications.map((notification: IDataObject) => ({
		json: notification,
	}));
}
