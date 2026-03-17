import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { ENDPOINTS } from "../../../helpers/constants";

export const notificationMarkReadFields: INodeProperties[] = [];

export async function notificationMarkReadExecute(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[]> {
	await tickTickApiRequestV2.call(
		this,
		"PUT",
		ENDPOINTS.NOTIFICATIONS_MARK_READ,
		{},
		{ category: "notifications" },
	);

	return [{ json: { success: true } }];
}
