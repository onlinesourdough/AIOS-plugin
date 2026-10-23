# Spaces, properties and templates

Map these roles onto the owner's existing Notion structure. This is a small
starter contract, not a mandatory schema or a fixed set of company documents.
Keep actual values, page IDs, templates and source mappings in the owner's guide.
Use the owner's chosen language consistently in setup labels and explanations.

## One home, multiple Spaces

A Space scopes business, brand, sub-brand or continuing-area context within one
OSM. A project is concrete work in a native workspace/repository; it can belong
to a Space without another OSM installation or a parallel project register.
Preserve the owner's actual hierarchy and explain it in the guide. Shared context
applies across areas, but is retrieved only when relevant.

For a small set of Spaces, reuse a select/multi-select property with the same
approved names across the relevant destinations. Include child Spaces in a
parent view deliberately; tags do not implement automatic inheritance. A new
Space updates the guide's map, matching options and affected views together.
Use multiple values only when the same item truly applies to each.

Reuse an existing Spaces relation if suitable. Introduce a separate Spaces
database only when a growing hierarchy or shared Space metadata justifies it
and the task authorizes that schema. Map existing records before converting
property types. A Space is not necessarily a Notion Teamspace; neither tags,
relations nor filtered views enforce access permissions.

## Minimal record roles

Preserve sufficient existing equivalents rather than adding synonymous fields.
Show the title and Space in everyday views; expose Type/Status where useful.
Keep technical identity, provenance and import metadata in page details.

| Destination | Useful fields | Meaning |
| --- | --- | --- |
| Docs | Title, Space, Type, Status; Key and Source for managed context | Knowledge and useful outputs |
| Native Skills | Native name, Description and supporting files; Space, Status, Audience, Owner, Key and Source | Personal and team methods |
| Memory | Title, Space, Status, Key, Source and known source date | Durable decisions, reasons and corrections |

Suggested Docs Type values: Context (reusable facts/constraints), Source (an
original business reference), Document (a plan, proposal, research or other
output). Keep an existing Category if it describes useful document formats;
do not require people to maintain overlapping classifications.

Suggested Status values: Current (selected for use), Needs review (incomplete or
uncertain), Superseded (retained history). Current is not a fresh verification
of every fact. Keep unclassified existing documents available without silently
promoting them to current context. Do not invent empty mandatory profile,
strategy or department pages; add a topic when real work requires it.

Skills use Audience = Personal or Team, mapped to an existing equivalent field
when available. Audience is separate from Space: an Operations method may be
personal or used by the team. Owner identifies the person responsible for the
method; use a native person field when the owner is known. Team methods need an
accountable maintainer and agreed change/review authority before becoming Current.
Keep one native Skills database with Personal/Team views when permissions fit.
If privacy differs, reuse separate private/team destinations or native verified
page access. A filter is never an access boundary. Never move or share personal
skills automatically. Existing personal records are classified only from evidence;
unclassified records are not implicitly team-approved. A solo owner needs no
team database or invented employee. Team templates/views are added when useful.

Notion page IDs are actual stable identity. Key is a logical deduplication name,
retained through renames, not a database-enforced unique constraint. Keep existing
keys; new managed items may use scoped prefixes. Ordinary documents need no
artificial key. Source records the exact original source/owner decision and date;
unknown dates stay unknown. An original Source document can own its provenance.
Keep source date, import date and last check distinct.

Use native page mentions for ordinary references. Add a native relation only
for a useful record relationship, such as Memory's Related docs pointing to the
Docs a decision affects. Resolve exact page IDs; matching titles or Space names
is not a foreign-key relationship. Links do not synchronize source systems.

## Native templates for humans and agents

Reuse useful templates. Suggested additions, only where missing:

| Template | Defaults | Body prompts |
| --- | --- | --- |
| Document / existing New doc | Type = Document; Needs review | Existing useful structure; preserve it |
| Context | Type = Context; Needs review | Facts/constraints, applicability, sources and uncertainty |
| Source | Type = Source; Needs review | What it owns, original content or exact source, currency/limits |
| Personal skill | Needs review; Audience = Personal | Trigger, inputs, procedure, output/checks, references and limits |
| Team skill (when needed) | Needs review; Audience = Team; accountable Owner | Trigger, procedure, output/checks, references and change authority |
| Decision | Needs review | Decision, reason/source, effect and review trigger |

Leave Space unset unless the specific template or view has a known scope.
Never hardcode a reusable Key, source date or decision into every new record.
Set a sensible default template through supported controls; keep template
repetition off unless recurring work was explicitly requested.

Database templates are native entries in the New menu, not sample documents
labelled as templates. Use the UI if the connector cannot create/register them.
Verify registration, defaults and an instantiated record before claiming that
workflow works. Application may be asynchronous; wait for readback, not merely a
successful create response. If it remains unpopulated, retain that draft and use
the native template UI or explicitly populate the inspected fields/content;
read back before retrying so a delayed application cannot duplicate content.
A personal-skill template must preserve or establish
native skill designation through supported tools; a template alone proves none.
See [personal skills](personal-skills.md) for invocation and supporting files.

## Integrity during writes and checks

Before creating or promoting managed context, a skill or memory to Current:
inspect the schema, confirm title, approved Space, unique logical Key, meaningful
content and source/provenance. Check exact identity, key and meaning against
existing records, including superseded items, before creating another. Use only
relevant metadata and fetch affected pages. Source date is required only when
known; preserve evidence rather than inventing a value to pass a check.

Templates assist entry; they do not enforce required fields or uniqueness. A
read-only Check reports missing fields, duplicate keys, mismatched Space options
and broken relations/routes. It does not repair them or create test data.
Maintenance repairs only within the task or standing write policy. Unchanged
reconciliation produces no write. Do not claim transactional concurrency locks.

For authorized schema migration, back up affected schema/records and preserve
IDs, original content and useful templates. Reconcile values and dependent views
before retiring old options. Read back renames before dependent type/description
edits; verify there is one intended property and all records retained their
values. Check native property descriptions in the UI. Keep the guide's routes
and schema mapping consistent with the final state.
