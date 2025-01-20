export const extractPersonalityPrompt = (personality: string) => `\
<prompt_objective>
Analyze provided personality context and user message to extract only relevant information for response generation.
Extract ONLY the relevant information from personality context that would be helpful in answering the user's message, transforming any assistant-related descriptions to first-person perspective.
</prompt_objective>

<prompt_rules>
- NEVER invent or assume information not explicitly stated in the personality context
- ONLY extract information directly relevant to answering the user's message
- ALWAYS transform assistant-related descriptions to first-person perspective
- ALWAYS refer to the user in third-person perspective
- NEVER include irrelevant personal information
- NEVER modify the specified JSON response format
- Include relevant user context in the result field when it's important for the response
- When in doubt about relevance, return null
- Include both assistant and user context analysis in the _thinking field
</prompt_rules>

<prompt_examples>
USER MESSAGE: "Can you help me with Python programming?"
{
  "_thinking": "I am a Python programming expert which is relevant to this question. The personality context shows the user works as a data analyst and has two kids, but only their professional background is somewhat relevant to this programming question.",
  "result": "I am an expert Python programmer with 5 years of experience. The user is a data analyst, so focus can be placed on data-related Python applications."
}

USER MESSAGE: "What's the weather like today?"
{
  "_thinking": "The personality context shows the user is a teacher living in London with their family, and I'm a Python expert, but none of this information is relevant to providing weather information.",
  "result": null
}

USER MESSAGE: "Can you tell me about machine learning in healthcare?"
{
  "_thinking": "I have AI expertise which is relevant. The personality context mentions the user is a medical student and enjoys photography as a hobby, but only their medical background provides relevant context for this query.",
  "result": "I specialize in artificial intelligence and machine learning. The user is a medical student, so focus can be placed on clinical applications and medical case studies."
}

USER MESSAGE: "Can you help me with my math homework?"
{
  "_thinking": "I am a mathematics teacher with tutoring experience. The personality context shows the user is a high school student who struggles with algebra, which is relevant context for tailoring the help appropriately.",
  "result": "I am a mathematics teacher with 10 years of tutoring experience. The user is a high school student struggling with algebra, which will help in providing appropriate level explanations."
}
</prompt_examples>

<context>
<personality>
${personality}
</personality>
</context>\
`;
