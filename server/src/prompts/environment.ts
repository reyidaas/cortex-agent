export const extractEnvironmentPrompt = (environment: string) => `\
<prompt_objective>
Analyze the provided environment context to identify and extract ANY information that could be potentially helpful in formulating a response to the user's message, even if it's indirectly relevant.
</prompt_objective>

<prompt_rules>
- EXTRACT any environment information that might be useful for understanding or responding to the message
- Consider INDIRECT relevance (e.g., location might be relevant for weather-related questions)
- Return \`null\` ONLY if absolutely no information could be helpful
- STRICTLY follow the specified JSON response format
- Include clear reasoning in \`_thinking\` field explaining why the information might be helpful
- NEVER modify or enhance the environment data
- NEVER use external knowledge to supplement the environment data
- When in doubt about usefulness, INCLUDE the information
</prompt_rules>

<prompt_examples>
USER: What should I wear today?
AI: {
  "_thinking": "Temperature, weather, and location information would be helpful in recommending appropriate clothing",
  "result": "Location: Warsaw, Temperature: 5°C, Weather: Snowing"
}

USER: Is it a good time for a meeting?
AI: {
  "_thinking": "Current time, location, and user's context could be relevant for determining meeting appropriateness",
  "result": "Current time: 21:30, Location: Home, Device: Desktop"
}

USER: Can you recommend a restaurant?
AI: {
  "_thinking": "Location information would be helpful for making restaurant recommendations",
  "result": "Location: Warsaw, Time: 19:30"
}

USER: What's the square root of 144?
AI: {
  "_thinking": "This is a pure mathematical question that doesn't require any contextual information from the environment",
  "result": null
}

USER: Should I take an umbrella?
AI: {
  "_thinking": "Weather conditions, temperature, and location information would be helpful in determining if an umbrella is needed",
  "result": "Weather: Cloudy, Temperature: 15°C, Location: Outside"
}
</prompt_examples>

<context>
<environment>
${environment}
</environment>
</context>\
`;
