In this project, we experimented with approximately five different AI coding assistants:

DeepSeek V3

ChatGPT 4o

Cursor

Claude 3.7 Sonnet with Thinking Mode

ChatGPT O1

we used Cursor, Claude 3.7 Sonnet (Thinking), and ChatGPT O1. These AI tools helped generate:

Frontend and database storage logic (specifically the DB storage logic for investmentType)

Application logic

Frontend UI and UX design

For UI/UX design, Cursor Agent Mode combined with Claude 3.7 Sonnet Thinking proved to be very powerful. When given just a basic UI form or requirement, the AI could infer the design and generate an appropriate interactive questionnaire through reasoning. After generating the basic UI, we used the /ui command in Cursor to further polish and modernize the interface. For example, on the base scenario page, we initially had solid-colored buttons—after applying /ui, the visual blocks were adjusted to appear only on certain parts, resulting in a more modern aesthetic.

We also utilized MCP (multi-command prompting) to prompt the AI into deeper thought processes. However, the performance improvement gained from Sequential Thinking is not quantifiable.

If you have the Pro version of Cursor, you get unlimited access to ChatGPT 4o, but every use of Claude 3.7 Sonnet (Thinking) costs 2 tokens, and each Pro user only has 500 tokens per month. Therefore, we used 4o to handle basic logic questions or Git-related issues. For example, we used this prompt:

“I accidentally ran git add . — is there a way to undo that?”

4o would then explain how to reset the repo. We also used it to interpret code, for example:

“Explain what the following code does and give an example:”
case DistributionType.NORMAL: const mean = params.get(StatisticType.MEAN); if (typeof(mean) !== "number") { throw new Error("selecting value from normal distribution without mean"); } const standard_deviation = params.get(StatisticType.STDEV);

We found that 4o provides fairly detailed explanations for small files (under 300 lines). This helped speed up team development by reducing the need to explain code logic individually.

However, due to 4o's weaker long-context handling, we avoided using it for large file modifications. Also, switching between Claude 3.7 Sonnet Thinking and 4o in the same conversation often caused hallucinations, likely because Claude was accessing ChatGPT’s earlier responses.

Since Cursor integrates multiple AIs, we rarely used the web version of ChatGPT. Still, in some cases, we used ChatGPT to reduce Cursor token usage. For example, we pasted the project requirements into ChatGPT to get ideas. Some sidebar items remained unimplemented simply because ChatGPT O1 predicted their necessity.

We would then rephrase ChatGPT’s suggestions into prompts that other AIs could understand, feeding those into Cursor for execution. In this setup, Claude 3.7 could almost always generate working code in one attempt.

In general, AI participated more heavily in frontend development than in the backend. When we tried using AI to handle backend tasks—such as generating the PayMandatoryExpenses logic—Claude 3.7 + Cursor Agent Mode failed to produce code that matched the Simulation Algorithm Overview. The success rate was under 30%, and significant manual cleanup was needed.

We suspect the reason is the depth and complexity of the logic: the long context and nested steps likely caused the AI to stop reasoning after a certain depth. However, for code generation within a single file, the AI had a much higher accuracy.

We also used DeepSeek for resolving terminal errors. Though it’s a ChatGPT O1-level model, it’s free, so we preferred it for general debugging or when high accuracy wasn’t critical.

Our most frequently used prompts were:

use sequential thinking

/ui (for UI beautification)

We also needed to explicitly say things like “please think and implement”—otherwise, the AI might only output code in chat rather than applying the changes.

Here’s an interesting prompt we used during frontend generation:

“Before making modifications, refer to the Development and Update Process.md file.
After making changes, update the content of the Development and Update Process.md file as well.
Additionally, determine whether other development documents in the root directory need to be updated based on the changes.
When modifying code files, do not use the filesystem MCP service.
However, when modifying markdown files, the filesystem MCP service can be used.”

This prompt needed to be kept at the bottom of the conversation to reduce hallucinations. However, as we made more manual modifications, we eventually stopped updating this file. It was also git-ignored, so resets or restores didn’t affect it.

We also discovered that Claude 3.7 Sonnet stops re-reading file changes after about 10 conversation turns. Instead, it would try to build upon its prior suggestions, which sometimes made it necessary to start a new conversation to refresh its understanding.
