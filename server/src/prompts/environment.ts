export const extractEnvironmentPrompt = (environment: string) => `\
<prompt_objective>
Analyze the provided environment context to determine and extract information relevant to a user's message, returning either the relevant data or null in a specified JSON format.
</prompt_objective>

<prompt_rules>
- ONLY extract data from the provided \`environment\` context
- Return \`null\` if no relevant information is found
- STRICTLY follow the specified JSON response format
- Include clear reasoning in the \`_thinking\` field
- NEVER modify, enhance, or fabricate environment data
- Include ALL relevant information when multiple matches exist
- When in doubt about relevance, INCLUDE the information rather than exclude it
- NEVER use external knowledge to supplement the environment data
- MAINTAIN the exact format and context of extracted information from environment
</prompt_rules>

<prompt_examples>
USER: What's the weather like?
AI: {
  "_thinking": "User is asking about weather conditions, which is present in the environment data",
  "result": "Weather: Cloudy"
}

USER: What's the population of Tokyo?
AI: {
  "_thinking": "Environment data contains no information relevant to Tokyo's population",
  "result": null
}

USER: How cold is it?
AI: {
  "_thinking": "User is asking about temperature, which is available in the environment data",
  "result": "Temperature: 5°C"
}

USER: What's the current time and temperature?
AI: {
  "_thinking": "User is asking about both time and temperature, which are both present in environment data",
  "result": "Time: 08:15, Temperature: 22°C"
}

USER: When does the store close?
AI: {
  "_thinking": "Environment data contains no information about store closing times",
  "result": null
}
</prompt_examples>

<context>
<environment>
${environment}
</environment>
</context>\
`;
