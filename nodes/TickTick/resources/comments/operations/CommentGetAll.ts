import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { ENDPOINTS } from "../../../helpers/constants";

export const commentGetAllFields: INodeProperties[] = [
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The project containing the task",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchProjects",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
		displayOptions: {
			show: { resource: ["comment"], operation: ["getAll"] },
		},
	},
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to get comments for",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchTasks",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 6123abc456def789",
			},
		],
		displayOptions: {
			show: { resource: ["comment"], operation: ["getAll"] },
		},
	},
];

export async function commentGetAllExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const projectIdValue = this.getNodeParameter("projectId", index) as
		| string
		| { mode: string; value: string };
	const taskIdValue = this.getNodeParameter("taskId", index) as
		| string
		| { mode: string; value: string };

	const projectId =
		typeof projectIdValue === "object" && projectIdValue !== null
			? projectIdValue.value
			: projectIdValue;
	const taskId =
		typeof taskIdValue === "object" && taskIdValue !== null
			? taskIdValue.value
			: taskIdValue;

	if (!projectId || projectId.trim() === "") {
		throw new Error("Project ID is required");
	}
	if (!taskId || taskId.trim() === "") {
		throw new Error("Task ID is required");
	}

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.TASK_COMMENTS(projectId, taskId),
	);

	const comments = Array.isArray(response) ? response : [];

	return comments.map((comment: IDataObject) => ({
		json: comment,
	}));
}
