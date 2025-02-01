import type { State } from '@/models/State';

export interface Tool {
  name: string;
  description: string;
}

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

<environment>
${state.getFromThinkingPhase('environment') ?? ''}
</environment>

<personality>
${state.getFromThinkingPhase('personality') ?? ''}
</personality>
</context>\
`;
};
