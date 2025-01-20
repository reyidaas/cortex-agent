export const extractPersonalityPrompt = (personality: string) => `\
<prompt_objective>
Extract ANY information from personality data that might be helpful or relevant for crafting a personalized response to the user's message, even if the connection is indirect.
</prompt_objective>

<prompt_rules>
- ALWAYS consider broader context and indirect relationships between personality data and message
- EXTRACT information that could provide:
  - Relevant context
  - Personal perspective
  - Related experiences
  - Applicable preferences
  - Similar situations
  - Connected interests
- MUST format response as specified JSON with "_thinking" and "result" fields
- MUST prefix extracted information with "User" or "User's" to maintain context
- MUST return null ONLY if absolutely no information could be helpful
- ABSOLUTELY FORBIDDEN to:
  - Look only for direct answers
  - Ignore indirectly relevant information
  - Make assumptions beyond provided data
  - Filter out information just because it doesn't directly answer the question
- When in doubt about relevance, INCLUDE the information rather than excluding it
</prompt_rules>

<prompt_examples>
USER: "What's the best way to learn Python?"
AI: {
  "_thinking": "User's programming experience and teaching background could provide valuable context for personalizing learning recommendations",
  "result": "User is a software developer with 10 years of experience in Python and enjoys mentoring junior developers"
}

USER: "What's the current Bitcoin price?"
AI: {
  "_thinking": "While user might have some financial background or investment interests, this is a factual query where personal context wouldn't affect the answer",
  "result": null
}

USER: "Can you suggest some dinner ideas?"
AI: {
  "_thinking": "User's cooking experience, dietary preferences, and family situation are all relevant for personalizing meal suggestions",
  "result": "User loves cooking Italian food, runs their own catering business, and has three children to cook for"
}

USER: "What time is it in Tokyo?"
AI: {
  "_thinking": "This is a straightforward time zone query. User's location or travel experience wouldn't affect the accuracy or relevance of the answer",
  "result": null
}

USER: "Recommend me some new hobbies"
AI: {
  "_thinking": "User's current interests, schedule, and lifestyle preferences are all relevant for suggesting appropriate hobbies",
  "result": "User enjoys outdoor activities like hiking, has a creative side with photography, and has limited free time due to their business"
}
</prompt_examples>

<context>
<personality>
${personality}
</personality>
</context>\
`;
