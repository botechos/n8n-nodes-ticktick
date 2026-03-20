import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "../../../helpers/apiRequest";
import { ENDPOINTS } from "../../../helpers/constants";
import { generateCommentId } from "../../../helpers/generators";
import { formatISO8601WithMillis } from "../../../helpers/dates";

export const commentCreateFields: INodeProperties[] = [
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
			show: { resource: ["comment"], operation: ["create"] },
		},
	},
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to add a comment to",
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
			show: { resource: ["comment"], operation: ["create"] },
		},
	},
	{
		displayName: "Comment Text",
		name: "title",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. This task needs review",
		description: "The text content of the comment",
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: { resource: ["comment"], operation: ["create"] },
		},
	},
	{
		displayName: "Mentions",
		name: "mentions",
		type: "fixedCollection",
		default: {},
		placeholder: "Add Mention",
		typeOptions: { multipleValues: true },
		description: "Users to mention in the comment",
		displayOptions: {
			show: { resource: ["comment"], operation: ["create"] },
		},
		options: [
			{
				name: "mentionValues",
				displayName: "Mention",
				values: [
					{
						displayName: "User ID",
						name: "userId",
						type: "number",
						default: 0,
						required: true,
						description: "The numeric ID of the user to mention",
					},
					{
						displayName: "Label",
						name: "atLabel",
						type: "string",
						default: "",
						required: true,
						placeholder: "e.g. @Koba",
						description: 'The display label for the mention (e.g. "@Username")',
					},
				],
			},
		],
	},
];

export async function commentCreateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const projectIdValue = this.getNodeParameter("projectId", index) as
		| string
		| { mode: string; value: string };
	const taskIdValue = this.getNodeParameter("taskId", index) as
		| string
		| { mode: string; value: string };
	const title = this.getNodeParameter("title", index) as string;

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
	if (!title || title.trim() === "") {
		throw new Error("Comment text is required");
	}

	const mentionsRaw = this.getNodeParameter("mentions", index, {}) as {
		mentionValues?: Array<{ userId: number; atLabel: string }>;
	};

	const commentId = generateCommentId();
	const createdTime = formatISO8601WithMillis(new Date());

	const mentions =
		mentionsRaw.mentionValues &&
		Array.isArray(mentionsRaw.mentionValues) &&
		mentionsRaw.mentionValues.length > 0
			? mentionsRaw.mentionValues.map((m) => ({
					userId: m.userId,
					atLabel: m.atLabel,
				}))
			: undefined;

	const body: IDataObject = {
		id: commentId,
		projectId,
		taskId,
		title,
		createdTime,
		isNew: true,
		userProfile: { isMyself: true },
	};

	if (mentions) {
		body.mentions = mentions;
	}

	await tickTickApiRequestV2.call(
		this,
		"POST",
		ENDPOINTS.TASK_COMMENT(projectId, taskId),
		body,
	);

	return [{ json: body }];
}
