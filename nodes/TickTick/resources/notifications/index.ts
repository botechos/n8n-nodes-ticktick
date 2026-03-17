import type { ResourceDefinition } from "../../helpers/types";
import {
	notificationFields,
	notificationOperations,
} from "./NotificationsDescription";
import * as operations from "./operations";

export const notificationResource: ResourceDefinition = {
	name: "notification",
	operations: notificationOperations,
	fields: notificationFields,
	handlers: {
		getAll: operations.notificationGetAllExecute,
		markRead: operations.notificationMarkReadExecute,
	},
};

export * from "./NotificationsDescription";
export * from "./operations";
