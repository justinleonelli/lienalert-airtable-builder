#!/usr/bin/env node

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0/meta/bases';

const { AIRTABLE_PAT, AIRTABLE_BASE_ID } = process.env;

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error('Missing required environment variables: AIRTABLE_PAT and/or AIRTABLE_BASE_ID.');
  process.exit(1);
}

const TABLE_DEFINITIONS = [
  {
    name: 'Users',
    fields: [
      { name: 'Auth User ID', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Full Name', type: 'singleLineText' },
      { name: 'Company Name', type: 'singleLineText' },
      { name: 'Role', type: 'singleSelect', options: { choices: [{ name: 'Admin' }, { name: 'Member' }] } },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Active' }, { name: 'Inactive' }, { name: 'Trial' }] } },
      { name: 'Created At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '12hour' }, timeZone: 'client' } }
    ]
  },
  {
    name: 'Leads',
    fields: [
      { name: 'Lead Name', type: 'singleLineText' },
      { name: 'Company', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Source', type: 'singleSelect', options: { choices: [{ name: 'Web' }, { name: 'Referral' }, { name: 'Manual' }, { name: 'Import' }] } },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'New' }, { name: 'Contacted' }, { name: 'Qualified' }, { name: 'Closed' }] } },
      { name: 'Owner User ID', type: 'singleLineText' }
    ]
  },
  {
    name: 'Projects',
    fields: [
      { name: 'Project Name', type: 'singleLineText' },
      { name: 'Project Number', type: 'singleLineText' },
      { name: 'Lead ID', type: 'singleLineText' },
      { name: 'Owner User ID', type: 'singleLineText' },
      { name: 'State Code', type: 'singleLineText' },
      { name: 'Notice Type', type: 'singleLineText' },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Intake' }, { name: 'Drafting' }, { name: 'Pending' }, { name: 'Completed' }] } },
      { name: 'Due Date', type: 'date' }
    ]
  },
  {
    name: 'Project Q&A',
    fields: [
      { name: 'Project ID', type: 'singleLineText' },
      { name: 'Question Key', type: 'singleLineText' },
      { name: 'Question Label', type: 'singleLineText' },
      { name: 'Answer', type: 'multilineText' },
      { name: 'Is Required', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
      { name: 'Updated At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '12hour' }, timeZone: 'client' } }
    ]
  },
  {
    name: 'Alerts',
    fields: [
      { name: 'Project ID', type: 'singleLineText' },
      { name: 'User ID', type: 'singleLineText' },
      { name: 'Alert Type', type: 'singleSelect', options: { choices: [{ name: 'Deadline' }, { name: 'Status Change' }, { name: 'Missing Data' }, { name: 'General' }] } },
      { name: 'Message', type: 'multilineText' },
      { name: 'Channel', type: 'singleSelect', options: { choices: [{ name: 'Email' }, { name: 'In-App' }, { name: 'SMS' }] } },
      { name: 'Sent At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '12hour' }, timeZone: 'client' } },
      { name: 'Read', type: 'checkbox', options: { icon: 'check', color: 'blueBright' } }
    ]
  },
  {
    name: 'Reminder Jobs',
    fields: [
      { name: 'Project ID', type: 'singleLineText' },
      { name: 'User ID', type: 'singleLineText' },
      { name: 'Run At', type: 'dateTime', options: { dateFormat: { name: 'local' }, timeFormat: { name: '12hour' }, timeZone: 'client' } },
      { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Queued' }, { name: 'Running' }, { name: 'Complete' }, { name: 'Failed' }] } },
      { name: 'Attempts', type: 'number', options: { precision: 0 } },
      { name: 'Last Error', type: 'multilineText' }
    ]
  },
  {
    name: 'States',
    fields: [
      { name: 'State Name', type: 'singleLineText' },
      { name: 'State Code', type: 'singleLineText' },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
      { name: 'Agency Name', type: 'singleLineText' },
      { name: 'Agency URL', type: 'url' }
    ]
  },
  {
    name: 'State Intake Questions',
    fields: [
      { name: 'State Code', type: 'singleLineText' },
      { name: 'Question Key', type: 'singleLineText' },
      { name: 'Question Label', type: 'singleLineText' },
      { name: 'Input Type', type: 'singleSelect', options: { choices: [{ name: 'Text' }, { name: 'Textarea' }, { name: 'Date' }, { name: 'Number' }, { name: 'Select' }] } },
      { name: 'Required', type: 'checkbox', options: { icon: 'check', color: 'yellowBright' } },
      { name: 'Sort Order', type: 'number', options: { precision: 0 } }
    ]
  },
  {
    name: 'Notice Types',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Code', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Applies To State', type: 'singleLineText' },
      { name: 'Default Days To File', type: 'number', options: { precision: 0 } }
    ]
  },
  {
    name: 'Form Templates',
    fields: [
      { name: 'Template Name', type: 'singleLineText' },
      { name: 'Notice Type Code', type: 'singleLineText' },
      { name: 'State Code', type: 'singleLineText' },
      { name: 'Template Body', type: 'multilineText' },
      { name: 'Version', type: 'number', options: { precision: 0 } },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } }
    ]
  },
  {
    name: 'Subscription Plans',
    fields: [
      { name: 'Plan Name', type: 'singleLineText' },
      { name: 'Plan Code', type: 'singleLineText' },
      { name: 'Price Monthly', type: 'currency', options: { precision: 2, symbol: '$' } },
      { name: 'Project Limit', type: 'number', options: { precision: 0 } },
      { name: 'Features', type: 'multilineText' },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } }
    ]
  },
  {
    name: 'AI Prompts',
    fields: [
      { name: 'Prompt Name', type: 'singleLineText' },
      { name: 'Prompt Key', type: 'singleLineText' },
      { name: 'Prompt Body', type: 'multilineText' },
      { name: 'Model', type: 'singleLineText' },
      { name: 'Temperature', type: 'number', options: { precision: 2 } },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } }
    ]
  }
];

async function airtableRequest(path, options = {}) {
  const response = await fetch(`${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Airtable API error (${response.status}): ${errorBody}`);
  }

  return response.json();
}

async function getExistingTables() {
  const response = await airtableRequest('/tables', { method: 'GET' });
  return response.tables;
}

async function createTable(tableDefinition) {
  return airtableRequest('/tables', {
    method: 'POST',
    body: JSON.stringify(tableDefinition)
  });
}

async function createField(tableId, fieldDefinition) {
  return airtableRequest(`/tables/${tableId}/fields`, {
    method: 'POST',
    body: JSON.stringify(fieldDefinition)
  });
}

async function ensureTablesAndFields() {
  let existingTables = await getExistingTables();

  for (const tableDef of TABLE_DEFINITIONS) {
    const existingTable = existingTables.find((table) => table.name === tableDef.name);

    if (!existingTable) {
      console.log(`Creating table: ${tableDef.name}`);
      await createTable(tableDef);
      existingTables = await getExistingTables();
      continue;
    }

    console.log(`Table exists: ${tableDef.name}`);
    const existingFieldNames = new Set(existingTable.fields.map((field) => field.name));

    for (const fieldDef of tableDef.fields) {
      if (!existingFieldNames.has(fieldDef.name)) {
        console.log(`  Adding missing field '${fieldDef.name}' to table '${tableDef.name}'`);
        await createField(existingTable.id, fieldDef);
      }
    }
  }
}

async function verifySchema() {
  const tables = await getExistingTables();
  const tableByName = new Map(tables.map((table) => [table.name, table]));
  const verificationIssues = [];

  for (const tableDef of TABLE_DEFINITIONS) {
    const createdTable = tableByName.get(tableDef.name);
    if (!createdTable) {
      verificationIssues.push(`Missing table: ${tableDef.name}`);
      continue;
    }

    const fieldNames = new Set(createdTable.fields.map((field) => field.name));
    for (const fieldDef of tableDef.fields) {
      if (!fieldNames.has(fieldDef.name)) {
        verificationIssues.push(`Missing field '${fieldDef.name}' in table '${tableDef.name}'`);
      }
    }
  }

  if (verificationIssues.length === 0) {
    console.log('PASS: Schema verification succeeded.');
    return true;
  }

  console.error('FAIL: Schema verification failed.');
  for (const issue of verificationIssues) {
    console.error(`- ${issue}`);
  }
  return false;
}

async function main() {
  try {
    console.log('Starting Airtable schema build...');
    await ensureTablesAndFields();

    const isValid = await verifySchema();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('FAIL: Schema build encountered an error.');
    console.error(error.message);
    process.exit(1);
  }
}

main();
