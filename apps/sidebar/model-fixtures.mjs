// Invented, connector-shaped AI Operating Model texts for tests and the
// preview fixture. They follow the shape of an official Notion fetch response
// (page header, properties and enhanced-Markdown content); they are not
// sanitized captures of a real connector and use invented page identities.
const page = n => `https://app.notion.com/p/${String(n).padStart(32, '0')}`;
export const modelTarget = page(10);

// Two source groups, a policy list, evidence and pricing links in prose, a code
// block and a quotation. Only the two reference lists become groups.
export const ownerModel = `Here is the result of "view" for the Page with URL ${modelTarget} as of 2026-10-19T09:00:00.000Z:
<page url="${modelTarget}">
<properties>
{"title":"AI Operating Model"}
</properties>
<content>
Read this model once per session for owner-context work. See the [privacy policy](${page(20)}) before sharing anything.
## Context sources {toggle="true"}
\t- <mention-page url="${page(11)}">Soul</mention-page> — collaboration preferences
\t- <mention-page url="${page(12)}">About</mention-page>
\t- <mention-database url="${page(13)}">Memory</mention-database>: facts, decisions &amp; lessons
\t- [Skills](${page(14)})
## Rules
- Never copy live task status into Memory; read [Tasks](${page(21)}) instead.
- Keep private records private.
## Work and outputs
<database url="${page(15)}" inline="false">Tasks</database>
- <mention-page url="${page(16)}">Projects</mention-page>
- [Repository](https://github.com/example/project)
## Evidence
The 2026-10-12 review is in [this run](${page(22)}) and the [backup](${page(23)}).
\`\`\`
- [Example in code](${page(24)})
\`\`\`
> - [Quoted link](${page(25)})
## Commercial policy
Offer prices follow [the pricing page](https://example.com/pricing).
</content>
</page>`;

// Different language and headings, optional team sources, no owner names.
export const teamModel = `<page url="${page(30)}">
<content>
# Arbejdsmodel
### Kilder
#### Personlig
- [Hukommelse](${page(31)})
- [Metoder](${page(32)})
#### Team
- [Team hukommelse](${page(33)}): delt
- [Team metoder](${page(34)}) (team)
### Leverancer
1. <mention-page url="${page(35)}">Kunder</mention-page>
</content>
</page>`;

// A section that mixes a source with an instruction cannot be resolved alone.
export const mixedModel = `<content>
## Sources
- [Docs](${page(41)})
- Ask before sharing anything.
## Team
- [Team docs](${page(42)})
</content>`;
