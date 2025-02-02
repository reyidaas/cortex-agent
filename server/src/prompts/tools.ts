import type { Tool as PrismaTool, Action } from '@prisma/client';

import type { State } from '@/models/State';

// TODO: tools - move this elsewhere later
export type Tool = Pick<PrismaTool, 'name' | 'description'> & {
  actions: Pick<Action, 'name' | 'description' | 'instruction'>[];
};

export const generateToolsQueriesPrompt = (tools: Tool[], state: State): string => {
  const parsedTools = tools
    .map(
      ({ name, description }) => `\
<tool name="${name}">
${description}
</tool>\
`,
    )
    .join('\n');

  return `\
<prompt_objective>
Generate up to 10 relevant search/action queries for provided tools based on user input, returning them in a specified JSON format with reasoning, always ending with final-answer tool query.
</prompt_objective>

<prompt_rules>
- ALWAYS return a JSON object with "_thinking" and "result" fields
- "_thinking" MUST contain clear reasoning for query generation or null result
- "result" MUST be either null or an array of {query, tool} objects
- NEVER generate more than 10 queries
- ONLY use tool names that are provided in the context
- Generate ALL reasonable queries when multiple tools could satisfy the request
- Order queries logically based on execution dependency
- ALWAYS include final-answer tool as the last query
- Return null result when no meaningful queries can be generated
- ENSURE each query is actionable and specific
</prompt_rules>

<prompt_examples>
USER: "Show me my recent photos from vacation"
AI: {
  "_thinking": "Need to search for vacation-related photos in both cloud storage and local files, then check for recent metadata, and inform user about findings",
  "result": [
    {"query": "Find files with type:image AND metadata.tags:vacation ORDER BY date DESC LIMIT 50", "tool": "fileSystem"},
    {"query": "Search photos WHERE album_name CONTAINS 'vacation' AND date >= NOW() - 90days", "tool": "cloudStorage"},
    {"query": "Get vacation mentions from last 3 months", "tool": "memory"},
    {"query": "Display found vacation photos to user", "tool": "final-answer"}
  ]
}

USER: "What's the weather like in London?"
AI: {
  "_thinking": "Need current weather data for London, checking saved preferences, and provide information to user",
  "result": [
    {"query": "Get current weather conditions for London", "tool": "weatherAPI"},
    {"query": "Find saved weather preferences for London", "tool": "userPreferences"},
    {"query": "Present London weather information to user", "tool": "final-answer"}
  ]
}

USER: "Order my usual coffee"
AI: {
  "_thinking": "Need to check user preferences for coffee order, previous orders, place the order, and confirm to user",
  "result": [
    {"query": "Get preferred coffee order settings", "tool": "userPreferences"},
    {"query": "Get most frequent coffee order from last 10 orders", "tool": "orderHistory"},
    {"query": "Place coffee order with retrieved preferences", "tool": "coffeeShopAPI"},
    {"query": "Confirm coffee order placement to user", "tool": "final-answer"}
  ]
}

USER: "Calculate 2+2"
AI: {
  "_thinking": "Simple calculation doesn't require any tool queries as it can be performed directly",
  "result": null
}

USER: "Turn on lights and play relaxing music"
AI: {
  "_thinking": "Need to control smart home lights, find/play appropriate music, and inform user about actions taken",
  "result": [
    {"query": "Get current lighting scene preferences", "tool": "smartHome"},
    {"query": "Set lights to ON", "tool": "smartHome"},
    {"query": "Find playlists tagged as 'relaxing'", "tool": "musicPlayer"},
    {"query": "Start playback of relaxing playlist", "tool": "musicPlayer"},
    {"query": "Inform user about lights and music status", "tool": "final-answer"}
  ]
}
</prompt_examples>

Process user input by:
1. Analyzing the request to identify required actions/information
2. Matching requirements with available tool capabilities
3. Generating specific, actionable queries for each relevant tool
4. Ordering queries based on logical execution sequence
5. Adding final-answer tool query as the last step
6. Formatting response in required JSON structure

<context>
<tools>
${parsedTools}
</tools>

${state.get('thinking').parseToPromptText(['environment', 'personality'])}
</context>`;
};

export const generateToolPayloadPrompt = (state: State): string => {
  const toolName = state.get('execution').get('step')?.tool ?? '';
  const actionName = state.get('execution').get('step')?.action ?? '';
  const tool =
    state
      .get('config')
      .get('tools')
      .find(({ name }) => toolName === name) ?? '';
  const action = tool && tool.actions.find(({ name }) => name === actionName);
  const step = state.get('execution').get('step') ?? '';

  return `\
<prompt_objective>
Generate a JSON payload that strictly follows the provided payload_structure, using contextual information and user input to populate all required fields accurately.
</prompt_objective>

<prompt_rules>
- ALWAYS generate response in the exact format: {"_thinking": string, "result": object}
- STRICTLY follow the provided payload_structure for the "result" object
- ALL fields defined in payload_structure are required and MUST be filled
- NEVER add fields that aren't defined in payload_structure
- NEVER omit any fields defined in payload_structure
- ALWAYS explain reasoning and data source usage in "_thinking"
- USE context data in the following priority order:
  1. payload_structure (structure definition)
  2. user message (current request)
  3. current_task (current context)
  4. memories (historical context)
  5. environment (situational context)
  6. personality (general context)
- When no relevant context exists for a required field, use appropriate default values and explain in "_thinking"
</prompt_rules>

<prompt_examples>
USER: Play something I like
AI: {
  "_thinking": "Based on personality context, user has preference for classical music, specifically Mozart. Using this information to fill required payload fields.",
  "result": {
    "genre": "classical",
    "artist": "Mozart"
  }
}

USER: Play audio
AI: {
  "_thinking": "Environment shows user is at work. Memory indicates preference for low volume in office. Setting appropriate values for all required fields.",
  "result": {
    "volume": 20,
    "source": "internal_speaker"
  }
}

USER: Process this
AI: {
  "_thinking": "No relevant context found. Using default values to ensure all required fields are filled.",
  "result": {
    "required_field_1": "default_value_1",
    "required_field_2": "default_value_2"
  }
}
</prompt_examples>

Generate payload by:
1. Parse payload_structure to identify all required fields
2. Analyze user message and current task context
3. Match required fields with available context data using priority order
4. Select appropriate values from context or use defaults when needed
5. Document reasoning process in "_thinking" field
6. Generate "result" object with all required fields filled
7. Validate final JSON matches payload_structure exactly

<context>
${state.get('thinking').parseToPromptText(['environment', 'personality'])}

${state.get('planning').parseToPromptText(['memories'])}

<selected_tool>
${
  tool &&
  action &&
  `\
<tool name="${tool.name}" description="${tool.description}">
<action name="${action.name}">
${action.description}
</action>
</tool>`
}
</selected_tool>

<current_task>
${
  step &&
  `\
<task name="${step.name}" status="${step.status}">
${step.description}
</task>`
}
</current_task>

<payload_structure>
${action && action.instruction}
</payload_structure>
<context>`;
};
