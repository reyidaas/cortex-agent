import type { Tool } from '@/prompts/tools';
import type { State } from '@/models/State';
import type { Task } from '@/models/Task';

export type GeneratedTask = Pick<Task, 'name' | 'description' | 'status'> & {
  id: string | null;
};

export const generateOrUpdateTasksPrompt = (tools: Tool[], state: State): string => {
  const availableTools =
    tools
      .map(
        ({ name, description }) => `\
<tool name="${name}">
${description}
</tool>\
`,
      )
      .join('\n') ?? '';

  const memories = state
    .get('planning')
    .get('memories')
    .map(
      ({ name, content }) => `\
<memory name="${name}">
${content}
</memory>\
`,
    )
    .join('\n');

  const currentTasks = state
    .get('planning')
    .get('tasks')
    .map(
      ({ id, name, description, status }) => `\
<task id="${id}" name="${name}" status="${status}">
<description>
${description}
</description>
</task>\
`,
    )
    .join('\n');

  return `\
<prompt_objective>
Generate or update a prioritized list of tasks based on provided context data and user message, returning a structured JSON response while maintaining task integrity and execution order.
</prompt_objective>

<prompt_rules>
- ANALYZE all provided context data: memories, available_tools, current_tasks, initial_thoughts_about_needed_tools, initial_thoughts_about_needed_memory_categories, environment, and personality
- FOLLOW strict data priority hierarchy:
  1. Current tasks (completed ones are immutable)
  2.Available Tools and memories (prefer most recent/relevant)
  3. Initial thoughts about tools and memory categories
  4. Environment and personality (supplementary context only)
- NEVER modify tasks marked as "completed"
- NEVER change existing task IDs
- ALWAYS set new tasks' ID to null
- ALWAYS set new tasks' status to "pending"
- ALWAYS use dashes instead of spaces in task names
- ALWAYS maintain logical task execution order in result array
- NEVER create duplicate tasks
- ALWAYS include "_thinking" field explaining reasoning
- ALWAYS make the final task in the result array a communication task to inform the user about the results of all previous tasks
  - Name it using pattern: "inform-user-about-[action]"
  - Description should specify what information needs to be communicated to the user
</prompt_rules>

<prompt_examples>
USER: "Send an email to John"
AI: {
  "_thinking": "Need to find John's contact info first, then compose and send email",
  "result": [
    {"id": null, "status": "pending", "name": "find-contact", "description": "Locate John's email address"},
    {"id": null, "status": "pending", "name": "compose-email", "description": "Create email draft to John"},
    {"id": null, "status": "pending", "name": "send-email", "description": "Send the composed email"},
    {"id": null, "status": "pending", "name": "inform-user-about-mail", "description": "Inform user about email status"}
  ]
}

USER: "Update my shopping list and add milk"
AI: {
  "_thinking": "Shopping list already exists with completed items, adding new item",
  "result": [
    {"id": "abc123", "status": "completed", "name": "create-list", "description": "Create new shopping list"},
    {"id": "def456", "status": "completed", "name": "add-initial-items", "description": "Add initial items to list"},
    {"id": null, "status": "pending", "name": "add-milk", "description": "Add milk to existing shopping list"},
    {"id": null, "status": "pending", "name": "inform-user-about-update", "description": "Inform user about list update"}
  ]
}

USER: "What's the weather?" (with no weather available_tool available)
AI: {
  "_thinking": "No weather tool available in provided available_tools, cannot fulfill request",
  "result": [
    {"id": null, "status": "pending", "name": "inform-user-about-unavailable-tol", "description": "Inform user that weather information is not available due to missing tool access"}
  ]
}

USER: "Update my calendar with doctor's appointment"
AI: {
  "_thinking": "Some tasks already completed, need to add new appointment and confirm",
  "result": [
    {"id": "abc123", "status": "completed", "name": "open-calendar", "description": "Access calendar system"},
    {"id": null, "status": "pending", "name": "validate-appointment", "description": "Validate doctor's appointment details"},
    {"id": null, "status": "pending", "name": "add-appointment", "description": "Add the appointment to calendar"},
    {"id": null, "status": "pending", "name": "inform-user-about-calendar-update", "description": "Inform user about the successful calendar update with doctor's appointment"}
  ]
}
</prompt_examples>

When processing a request:
1. Analyze user message and all context data according to priority hierarchy
2. Review existing tasks in current_tasks
3. Generate new tasks or update existing ones while preserving completed tasks
4. Sort tasks in logical execution order
5. ENSURE the final task is always user communication about results
6. Return JSON response with thinking process and ordered task array

<context>
${state.get('thinking').parseToPromptText(['environment', 'personality', 'memories', 'tools'])}

<memories>
${memories}
</memories>

<available_tools>
${availableTools}
</available_tools>

<current_tasks>
${currentTasks}
</current_tasks>
</context>\
`;
};
