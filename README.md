# lienalert-airtable-builder

Node.js script to create and verify an Airtable base schema for the LienAlert SaaS.

## What this does

`build_schema.js` uses Airtable's Metadata (Schema) API to:

- Create required tables if they do not already exist.
- Add any missing fields to existing tables.
- Run a schema verification step and print `PASS` or `FAIL`.

No external databases are used or required.

## Step-by-step setup

### 1) Install dependencies

```bash
npm install
```

### 2) Set `AIRTABLE_PAT` and `AIRTABLE_BASE_ID`

#### macOS/Linux (bash/zsh)

```bash
export AIRTABLE_PAT="your_airtable_personal_access_token"
export AIRTABLE_BASE_ID="appXXXXXXXXXXXXXX"
```

#### Windows PowerShell

```powershell
$env:AIRTABLE_PAT="your_airtable_personal_access_token"
$env:AIRTABLE_BASE_ID="appXXXXXXXXXXXXXX"
```

> Your Airtable PAT must have permissions to read and edit the target base schema.

### 3) Run the script

```bash
npm run build-schema
```

Expected result:

- `PASS: Schema verification succeeded.` if all required tables/fields are present.
- `FAIL: ...` with details if anything is missing or an API call fails.

## Required tables created

- Users
- Leads
- Projects
- Project Q&A
- Alerts
- Reminder Jobs
- States
- State Intake Questions
- Notice Types
- Form Templates
- Subscription Plans
- AI Prompts
