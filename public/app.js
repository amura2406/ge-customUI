// ---------- API catalog ----------
// Each entry defines how to build the request from config + user inputs.
// {placeholders} in paths refer to extra per-call inputs; config values are
// substituted automatically.

const APIS = [
  {
    group: 'Sessions',
    items: [
      {
        id: 'sessions.list',
        name: 'List sessions',
        desc: 'List all sessions for the engine. Useful for a "conversation history" sidebar.',
        method: 'GET',
        path: '{enginePath}/sessions',
        docPath: 'projects.locations.collections.engines.sessions/list',
        query: [
          { key: 'pageSize', label: 'Page size', default: '20' },
          { key: 'filter', label: 'Filter (e.g. userPseudoId = "user-1")', default: '' },
          { key: 'orderBy', label: 'Order by (e.g. update_time desc)', default: 'update_time desc' },
        ],
      },
      {
        id: 'sessions.get',
        name: 'Get session (conversation history)',
        desc: 'Fetch one session including its turns — the full conversation history.',
        method: 'GET',
        path: '{enginePath}/sessions/{sessionId}',
        docPath: 'projects.locations.collections.engines.sessions/get',
        inputs: [{ key: 'sessionId', label: 'Session ID', placeholder: 'e.g. 1234567890 or "-"' }],
        query: [{ key: 'includeAnswerDetails', label: 'Include answer details (true/false)', default: 'true' }],
      },
      {
        id: 'sessions.create',
        name: 'Create session',
        desc: 'Explicitly create a new session. (streamAssist can also auto-create one by passing session "-").',
        method: 'POST',
        path: '{enginePath}/sessions',
        docPath: 'projects.locations.collections.engines.sessions/create',
        body: {
          displayName: 'New session',
          userPseudoId: 'user-1',
        },
      },
      {
        id: 'sessions.patch',
        name: 'Update session (rename)',
        desc: 'Update a session — e.g. rename it via displayName. Essential for a "rename conversation" feature.',
        method: 'PATCH',
        path: '{enginePath}/sessions/{sessionId}',
        docPath: 'projects.locations.collections.engines.sessions/patch',
        inputs: [{ key: 'sessionId', label: 'Session ID' }],
        query: [{ key: 'updateMask', label: 'Update mask', default: 'displayName' }],
        body: {
          displayName: 'My renamed conversation',
        },
      },
      {
        id: 'sessions.addContextFile',
        name: 'Add context file (attach file)',
        desc: 'Upload a file into a session so the assistant can use it as context — the "attach a file to this chat" feature. fileContents is base64.',
        method: 'POST',
        path: '{enginePath}/sessions/{sessionId}:addContextFile',
        docPath: 'projects.locations.collections.engines.sessions/addContextFile',
        inputs: [{ key: 'sessionId', label: 'Session ID' }],
        body: {
          fileName: 'notes.txt',
          mimeType: 'text/plain',
          fileContents: 'SGVsbG8gd29ybGQh',
        },
      },
      {
        id: 'sessions.assistAnswers.get',
        name: 'Get assist answer (citations)',
        desc: 'Fetch the full details of one answer from a session turn — citations, grounding, references. Turn objects in sessions.get point here.',
        method: 'GET',
        path: '{enginePath}/sessions/{sessionId}/assistAnswers/{assistAnswerId}',
        docPath: 'projects.locations.collections.engines.sessions.assistAnswers/get',
        inputs: [
          { key: 'sessionId', label: 'Session ID' },
          { key: 'assistAnswerId', label: 'Assist answer ID' },
        ],
      },
      {
        id: 'sessions.delete',
        name: 'Delete session',
        desc: 'Delete a session.',
        method: 'DELETE',
        path: '{enginePath}/sessions/{sessionId}',
        docPath: 'projects.locations.collections.engines.sessions/delete',
        inputs: [{ key: 'sessionId', label: 'Session ID' }],
      },
    ],
  },
  {
    group: 'Assistant / Chat',
    items: [
      {
        id: 'assistants.streamAssist',
        name: 'streamAssist (chat)',
        desc: 'Send a query to the assistant. Set session to "-" (or leave the full session path with "-") to start a new session; pass an existing session resource name to continue it. Response is a stream of JSON chunks.',
        method: 'POST',
        path: '{assistantPath}:streamAssist',
        docPath: 'projects.locations.collections.engines.assistants/streamAssist',
        stream: true,
        body: {
          query: { text: 'Hello! What can you help me with?' },
          session: '{enginePathFull}/sessions/-',
          answerGenerationMode: 'NORMAL',
        },
      },
      {
        id: 'assistants.assist',
        name: 'assist (non-streaming chat)',
        desc: 'Same as streamAssist but returns the complete answer in one response — simpler to integrate when you don\'t need token-by-token streaming.',
        method: 'POST',
        path: '{assistantPath}:assist',
        docPath: 'projects.locations.collections.engines.assistants/assist',
        body: {
          query: { text: 'Hello! What can you help me with?' },
          session: '{enginePathFull}/sessions/-',
        },
      },
      {
        id: 'assistants.patch',
        name: 'Update assistant (branding/config)',
        desc: 'Update the assistant config — custom system instructions (persona/tone), web grounding, enabled tools. Key API for whitelabel customization.',
        method: 'PATCH',
        path: '{assistantPath}',
        docPath: 'projects.locations.collections.engines.assistants/patch',
        query: [{ key: 'updateMask', label: 'Update mask', default: 'generationConfig' }],
        body: {
          generationConfig: {
            systemInstruction: {
              additionalSystemInstruction: 'You are the helpful assistant of ACME Corp. Keep answers concise and friendly.',
            },
          },
        },
      },
      {
        id: 'assistants.get',
        name: 'Get assistant',
        desc: 'Fetch the assistant config (generation config, enabled tools, web grounding...).',
        method: 'GET',
        path: '{assistantPath}',
        docPath: 'projects.locations.collections.engines.assistants/get',
      },
      {
        id: 'assistants.list',
        name: 'List assistants',
        desc: 'List assistants under the engine (usually just default_assistant).',
        method: 'GET',
        path: '{enginePath}/assistants',
        docPath: 'projects.locations.collections.engines.assistants/list',
      },
    ],
  },
  {
    group: 'Agents',
    items: [
      {
        id: 'agents.list',
        name: 'List agents',
        desc: 'List agents registered under the assistant — for an agent picker UI.',
        method: 'GET',
        path: '{assistantPath}/agents',
        docPath: 'projects.locations.collections.engines.assistants.agents/list',
        query: [{ key: 'pageSize', label: 'Page size', default: '50' }],
      },
      {
        id: 'agents.get',
        name: 'Get agent',
        desc: 'Fetch a single agent definition.',
        method: 'GET',
        path: '{assistantPath}/agents/{agentId}',
        docPath: 'projects.locations.collections.engines.assistants.agents/get',
        inputs: [{ key: 'agentId', label: 'Agent ID' }],
      },
      {
        id: 'agents.create',
        name: 'Create agent (ADK / dialogflow)',
        desc: 'Register a new agent under the assistant. Edit the body for your agent type.',
        method: 'POST',
        path: '{assistantPath}/agents',
        docPath: 'projects.locations.collections.engines.assistants.agents/create',
        body: {
          displayName: 'My new agent',
          description: 'Agent description shown to users',
          icon: { uri: 'https://example.com/icon.png' },
          adkAgentDefinition: {
            toolSettings: { toolDescription: 'Describe what this agent does, used for routing' },
            provisionedReasoningEngine: {
              reasoningEngine: 'projects/{project}/locations/{region}/reasoningEngines/REASONING_ENGINE_ID',
            },
          },
        },
      },
      {
        id: 'agents.createLowCode',
        name: 'Create low-code agent',
        desc: 'Create a low-code agent with LLM agent nodes (undocumented lowCodeAgentDefinition — verified working). Edit nodes: each has an id, displayName and llmAgentNode with model/instruction; link them via subAgentIds and point rootAgentId at the entry node. Created as a PRIVATE draft — use "Request agent review" to submit for admin approval.',
        method: 'POST',
        path: '{assistantPath}/agents',
        docPath: 'projects.locations.collections.engines.assistants.agents/create',
        body: {
          displayName: 'New Low Code Agent',
          description: 'Agent created via the API.',
          lowCodeAgentDefinition: {
            nodes: [
              {
                id: 'root_agent',
                displayName: 'New Low Code Agent',
                llmAgentNode: {
                  model: 'gemini-3.5-flash',
                  instruction: 'You are the root agent. Describe your behavior here.',
                  subAgentIds: ['sub_agent_1'],
                  selectedTools: {
                    tool: [{ name: 'googleSearch' }],
                  },
                },
              },
              {
                id: 'sub_agent_1',
                displayName: 'Sub Agent 1',
                llmAgentNode: {
                  description: 'Agent that handles a specific task',
                  model: 'gemini-3.5-flash',
                  instruction: 'You are a subagent. Describe your task here.',
                  selectedTools: {
                    tool: [{ name: 'googleSearch' }],
                  },
                },
              },
            ],
            rootAgentId: 'root_agent',
          },
        },
      },
      {
        id: 'agents.patchLowCode',
        name: 'Update low-code agent (nodes)',
        desc: 'Edit a low-code agent\'s draft nodes. Note: the API requires displayName AND lowCodeAgentDefinition.draftDisplayName to be re-sent on every patch, even if unchanged. deployedNodes is output-only — deployment happens via the review/approval flow.',
        method: 'PATCH',
        path: '{assistantPath}/agents/{agentId}',
        docPath: 'projects.locations.collections.engines.assistants.agents/patch',
        inputs: [{ key: 'agentId', label: 'Agent ID' }],
        body: {
          displayName: 'My Low Code Agent',
          description: 'Updated description.',
          lowCodeAgentDefinition: {
            draftDisplayName: 'My Low Code Agent',
            draftDescription: 'Updated description.',
            nodes: [
              {
                id: 'root_agent',
                displayName: 'My Low Code Agent',
                llmAgentNode: {
                  model: 'gemini-3.5-flash',
                  instruction: 'Updated instruction for the root agent.',
                  selectedTools: {
                    tool: [{ name: 'googleSearch' }],
                  },
                },
              },
            ],
            rootAgentId: 'root_agent',
          },
        },
      },
      {
        id: 'agents.requestAgentReview',
        name: 'Request agent review',
        desc: 'Submit a draft (PRIVATE) agent for admin review — moves it to DISABLED (pending review) state. First step of the deployment/approval workflow.',
        method: 'POST',
        path: '{assistantPath}/agents/{agentId}:requestAgentReview',
        docPath: 'projects.locations.collections.engines.assistants.agents/requestAgentReview',
        inputs: [{ key: 'agentId', label: 'Agent ID' }],
        body: {},
      },
      {
        id: 'agents.rejectAgent',
        name: 'Reject agent (admin)',
        desc: 'Admin action: reject an agent that is pending review (DISABLED state) — returns it to PRIVATE. Requires a rejectionReason.',
        method: 'POST',
        path: '{assistantPath}/agents/{agentId}:rejectAgent',
        docPath: 'projects.locations.collections.engines.assistants.agents/rejectAgent',
        inputs: [{ key: 'agentId', label: 'Agent ID' }],
        body: {
          rejectionReason: 'Reason shown to the agent author.',
        },
      },
      {
        id: 'agents.withdrawAgent',
        name: 'Withdraw agent from review',
        desc: 'Author action: withdraw an agent from pending review (DISABLED state) — returns it to PRIVATE without admin involvement.',
        method: 'POST',
        path: '{assistantPath}/agents/{agentId}:withdrawAgent',
        docPath: 'projects.locations.collections.engines.assistants.agents/withdrawAgent',
        inputs: [{ key: 'agentId', label: 'Agent ID' }],
        body: {},
      },
      {
        id: 'agents.patch',
        name: 'Update agent',
        desc: 'Update an agent\'s display name, description, icon or definition.',
        method: 'PATCH',
        path: '{assistantPath}/agents/{agentId}',
        docPath: 'projects.locations.collections.engines.assistants.agents/patch',
        inputs: [{ key: 'agentId', label: 'Agent ID' }],
        query: [{ key: 'updateMask', label: 'Update mask', default: 'displayName,description' }],
        body: {
          displayName: 'Updated agent name',
          description: 'Updated description shown to users',
        },
      },
      {
        id: 'agents.delete',
        name: 'Delete agent',
        desc: 'Unregister an agent from the assistant.',
        method: 'DELETE',
        path: '{assistantPath}/agents/{agentId}',
        docPath: 'projects.locations.collections.engines.assistants.agents/delete',
        inputs: [{ key: 'agentId', label: 'Agent ID' }],
      },
    ],
  },
  {
    group: 'Search & Answers',
    items: [
      {
        id: 'servingConfigs.search',
        name: 'Search',
        desc: 'Classic search over the engine\'s data stores — build your own search results page instead of (or alongside) chat.',
        method: 'POST',
        path: '{enginePath}/servingConfigs/default_search:search',
        docPath: 'projects.locations.collections.engines.servingConfigs/search',
        body: {
          query: 'example query',
          pageSize: 10,
        },
      },
      {
        id: 'servingConfigs.answer',
        name: 'Answer (search + generated answer)',
        desc: 'Answer API: generated answer with citations over search results. Good for a "answer box above results" UX, distinct from the chat assistant.',
        method: 'POST',
        path: '{enginePath}/servingConfigs/default_search:answer',
        docPath: 'projects.locations.collections.engines.servingConfigs/answer',
        body: {
          query: { text: 'example question' },
        },
      },
      {
        id: 'servingConfigs.streamAnswer',
        name: 'streamAnswer',
        desc: 'Streaming variant of the Answer API — chunks arrive incrementally.',
        method: 'POST',
        path: '{enginePath}/servingConfigs/default_search:streamAnswer',
        docPath: 'projects.locations.collections.engines.servingConfigs/streamAnswer',
        stream: true,
        body: {
          query: { text: 'example question' },
        },
      },
      {
        id: 'completionConfig.completeQuery',
        name: 'Autocomplete (completeQuery)',
        desc: 'Search-as-you-type query suggestions for your search box.',
        method: 'POST',
        path: '{enginePath}/completionConfig:completeQuery',
        docPath: 'projects.locations.collections.engines.completionConfig/completeQuery',
        body: {
          query: 'hel',
        },
      },
    ],
  },
  {
    group: 'Engine',
    items: [
      {
        id: 'engines.get',
        name: 'Get engine (connected data stores)',
        desc: 'Fetch the engine config. The dataStoreIds field lists exactly which data stores are connected to this engine — the authoritative answer to "what knowledge backs this assistant".',
        method: 'GET',
        path: '{enginePath}',
        docPath: 'projects.locations.collections.engines/get',
      },
      {
        id: 'engines.patch',
        name: 'Update engine (attach/detach data stores)',
        desc: 'Update the engine — e.g. set dataStoreIds to connect or disconnect data stores, or change displayName for branding.',
        method: 'PATCH',
        path: '{enginePath}',
        docPath: 'projects.locations.collections.engines/patch',
        query: [{ key: 'updateMask', label: 'Update mask', default: 'dataStoreIds' }],
        body: {
          dataStoreIds: ['datastore-id-1', 'datastore-id-2'],
        },
      },
      {
        id: 'engines.list',
        name: 'List engines',
        desc: 'List all engines in the collection — discover what engine IDs exist.',
        method: 'GET',
        path: '{collectionPath}/engines',
        docPath: 'projects.locations.collections.engines/list',
      },
    ],
  },
  {
    group: 'Data Stores',
    items: [
      {
        id: 'dataStores.list',
        name: 'List data stores',
        desc: 'List all data stores in the collection. Cross-reference with the engine\'s dataStoreIds (Get engine) to know which ones are connected.',
        method: 'GET',
        path: '{collectionPath}/dataStores',
        docPath: 'projects.locations.collections.dataStores/list',
        query: [{ key: 'pageSize', label: 'Page size', default: '50' }],
      },
      {
        id: 'dataStores.get',
        name: 'Get data store',
        desc: 'Fetch one data store\'s config (content type, industry vertical, connector state).',
        method: 'GET',
        path: '{collectionPath}/dataStores/{dataStoreId}',
        docPath: 'projects.locations.collections.dataStores/get',
        inputs: [{ key: 'dataStoreId', label: 'Data store ID' }],
      },
      {
        id: 'documents.list',
        name: 'List documents',
        desc: 'List the documents inside a data store — build a "browse the knowledge base" view. Branch is usually default_branch.',
        method: 'GET',
        path: '{collectionPath}/dataStores/{dataStoreId}/branches/{branchId}/documents',
        docPath: 'projects.locations.collections.dataStores.branches.documents/list',
        inputs: [
          { key: 'dataStoreId', label: 'Data store ID' },
          { key: 'branchId', label: 'Branch ID', placeholder: 'default_branch', default: 'default_branch' },
        ],
        query: [{ key: 'pageSize', label: 'Page size', default: '20' }],
      },
      {
        id: 'documents.get',
        name: 'Get document',
        desc: 'Fetch one document\'s metadata and content reference — e.g. to resolve a citation to its source document.',
        method: 'GET',
        path: '{collectionPath}/dataStores/{dataStoreId}/branches/{branchId}/documents/{documentId}',
        docPath: 'projects.locations.collections.dataStores.branches.documents/get',
        inputs: [
          { key: 'dataStoreId', label: 'Data store ID' },
          { key: 'branchId', label: 'Branch ID', placeholder: 'default_branch', default: 'default_branch' },
          { key: 'documentId', label: 'Document ID' },
        ],
      },
    ],
  },
  {
    group: 'NotebookLM',
    items: [
      {
        id: 'notebooks.listRecentlyViewed',
        name: 'List notebooks (recently viewed)',
        desc: 'List the calling user\'s recently viewed notebooks with their sources — the NotebookLM home screen list. Note: this is per-user (whoever owns the access token).',
        method: 'GET',
        path: '{locationPath}/notebooks:listRecentlyViewed',
        docPath: 'projects.locations.notebooks/listRecentlyViewed',
        appLink: true,
        query: [
          { key: 'pageSize', label: 'Page size', default: '20' },
          { key: 'pageToken', label: 'Page token', default: '' },
        ],
      },
      {
        id: 'notebooks.get',
        name: 'Get notebook (open one)',
        desc: 'Fetch one notebook with its title, emoji, sources and share metadata. The notebook ID is a UUID — get it from the list call.',
        method: 'GET',
        path: '{locationPath}/notebooks/{notebookId}',
        docPath: 'projects.locations.notebooks/get',
        appLink: true,
        inputs: [{ key: 'notebookId', label: 'Notebook ID (UUID)' }],
      },
      {
        id: 'notebooks.create',
        name: 'Create notebook',
        desc: 'Create a new, empty notebook. Only title is writable — add sources with "Add sources" afterwards.',
        method: 'POST',
        path: '{locationPath}/notebooks',
        docPath: 'projects.locations.notebooks/create',
        appLink: true,
        body: {
          title: 'My new notebook',
        },
      },
      {
        id: 'notebooks.sources.batchCreate',
        name: 'Add sources to notebook',
        desc: 'Upload sources into a notebook. Each userContent is ONE of: textContent {sourceName, content}, webContent {url, sourceName}, videoContent, googleDriveContent, or agentspaceContent. Remove the variants you don\'t need from the template.',
        method: 'POST',
        path: '{locationPath}/notebooks/{notebookId}/sources:batchCreate',
        docPath: 'projects.locations.notebooks.sources/batchCreate',
        inputs: [{ key: 'notebookId', label: 'Notebook ID (UUID)' }],
        body: {
          userContents: [
            {
              textContent: {
                sourceName: 'Pasted notes',
                content: 'Text of the source goes here.',
              },
            },
            {
              webContent: {
                sourceName: 'Example web page',
                url: 'https://example.com/article',
              },
            },
          ],
        },
      },
      {
        id: 'notebooks.sources.batchDelete',
        name: 'Delete sources from notebook',
        desc: 'Remove sources from a notebook by full resource name.',
        method: 'POST',
        path: '{locationPath}/notebooks/{notebookId}/sources:batchDelete',
        docPath: 'projects.locations.notebooks.sources/batchDelete',
        inputs: [{ key: 'notebookId', label: 'Notebook ID (UUID)' }],
        body: {
          names: [
            'projects/{project}/locations/{region}/notebooks/NOTEBOOK_ID/sources/SOURCE_ID',
          ],
        },
      },
      {
        id: 'notebooks.audioOverviews.create',
        name: 'Generate audio overview (podcast)',
        desc: 'Kick off Audio Overview generation for a notebook. episodeFocus steers what the hosts discuss; sourceIds (optional) limits grounding to specific sources; languageCode is BCP 47. Generation is async — poll with "Get notebook" until the audio overview appears.',
        method: 'POST',
        path: '{locationPath}/notebooks/{notebookId}/audioOverviews',
        docPath: 'projects.locations.notebooks.audioOverviews/create',
        inputs: [{ key: 'notebookId', label: 'Notebook ID (UUID)' }],
        body: {
          generationOptions: {
            episodeFocus: 'Give an engaging overview of the key themes.',
            languageCode: 'en',
          },
        },
      },
      {
        id: 'notebooks.audioOverviews.delete',
        name: 'Delete audio overview',
        desc: 'Delete a notebook\'s generated audio overview (e.g. before regenerating with a different focus).',
        method: 'DELETE',
        path: '{locationPath}/notebooks/{notebookId}/audioOverviews/{audioOverviewId}',
        docPath: 'projects.locations.notebooks.audioOverviews/delete',
        inputs: [
          { key: 'notebookId', label: 'Notebook ID (UUID)' },
          { key: 'audioOverviewId', label: 'Audio overview ID' },
        ],
      },
      {
        id: 'notebooks.share',
        name: 'Share notebook',
        desc: 'Share a notebook with other users by email. Roles observed: reader/writer-style roles per account.',
        method: 'POST',
        path: '{locationPath}/notebooks/{notebookId}:share',
        docPath: 'projects.locations.notebooks/share',
        inputs: [{ key: 'notebookId', label: 'Notebook ID (UUID)' }],
        body: {
          accountAndRoles: [
            { email: 'colleague@example.com', role: 'ROLE_READER' },
          ],
          notifyViaEmail: true,
        },
      },
      {
        id: 'notebooks.batchDelete',
        name: 'Delete notebooks',
        desc: 'Delete one or more notebooks by full resource name.',
        method: 'POST',
        path: '{locationPath}/notebooks:batchDelete',
        docPath: 'projects.locations.notebooks/batchDelete',
        body: {
          names: [
            'projects/{project}/locations/{region}/notebooks/NOTEBOOK_ID',
          ],
        },
      },
    ],
  },
];

// ---------- Config helpers ----------

function cfg() {
  return {
    project: val('cfg-project'),
    region: val('cfg-region') || 'global',
    collection: val('cfg-collection') || 'default_collection',
    engine: val('cfg-engine'),
    assistant: val('cfg-assistant') || 'default_assistant',
    version: val('cfg-version'),
  };
}

function val(id) {
  return document.getElementById(id).value.trim();
}

function baseUrl(c) {
  const host = c.region === 'global'
    ? 'https://discoveryengine.googleapis.com'
    : `https://${c.region}-discoveryengine.googleapis.com`;
  return `${host}/${c.version}`;
}

function docUrl(docPath) {
  const version = val('cfg-version') || 'v1alpha';
  return `https://docs.cloud.google.com/gemini/enterprise/docs/reference/rest/${version}/${docPath}`;
}

function resourcePaths(c) {
  const locationPath = `projects/${c.project}/locations/${c.region}`;
  const collectionPath = `${locationPath}/collections/${c.collection}`;
  const enginePath = `${collectionPath}/engines/${c.engine}`;
  return {
    locationPath,
    collectionPath,
    enginePath,
    enginePathFull: enginePath,
    assistantPath: `${enginePath}/assistants/${c.assistant}`,
  };
}

// Persist config in localStorage
const CFG_IDS = ['cfg-project', 'cfg-region', 'cfg-collection', 'cfg-engine', 'cfg-assistant', 'cfg-version'];
CFG_IDS.forEach((id) => {
  const el = document.getElementById(id);
  const saved = localStorage.getItem('ge-' + id);
  if (saved) el.value = saved;
  el.addEventListener('change', () => localStorage.setItem('ge-' + id, el.value));
});

// Links under the API title: Google Cloud REST reference (matching the
// selected API version) and/or the NotebookLM web app.
function renderApiLinks(api) {
  const wrap = document.getElementById('api-doc-link');
  wrap.innerHTML = '';
  const links = [];
  if (api.docPath) {
    links.push({ href: docUrl(api.docPath), label: 'Google Cloud documentation ↗' });
  }
  if (api.appLink) {
    const c = cfg();
    links.push({
      href: `https://notebooklm.cloud.google.com/${c.region || 'global'}/?project=${c.project || ''}`,
      label: 'Open NotebookLM app ↗',
    });
  }
  links.forEach((l, i) => {
    if (i > 0) wrap.appendChild(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = l.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = l.label;
    wrap.appendChild(a);
  });
  wrap.classList.toggle('hidden', links.length === 0);
}

// Keep links in sync when config changes
['cfg-version', 'cfg-project', 'cfg-region'].forEach((id) => {
  document.getElementById(id).addEventListener('change', () => {
    if (currentApi) renderApiLinks(currentApi);
  });
});

// ---------- UI: API list ----------

const navEl = document.getElementById('api-list');
let currentApi = null;

APIS.forEach((group) => {
  const h = document.createElement('h3');
  h.textContent = group.group;
  navEl.appendChild(h);
  group.items.forEach((api) => {
    const btn = document.createElement('button');
    btn.className = 'api-item';
    const tag = document.createElement('span');
    tag.className = `method ${api.method}`;
    tag.textContent = api.method;
    btn.appendChild(tag);
    btn.appendChild(document.createTextNode(api.name));
    btn.addEventListener('click', () => selectApi(api, btn));
    navEl.appendChild(btn);
  });
});

function selectApi(api, btn) {
  currentApi = api;
  document.querySelectorAll('.api-item').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  document.getElementById('placeholder').classList.add('hidden');
  document.getElementById('api-detail').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');

  document.getElementById('api-title').textContent = api.name;
  document.getElementById('api-desc').textContent = api.desc;

  renderApiLinks(api);

  // Per-call inputs (path params + query params)
  const paramsEl = document.getElementById('api-params');
  paramsEl.innerHTML = '';
  (api.inputs || []).forEach((inp) => {
    paramsEl.appendChild(makeField('in-' + inp.key, inp.label, inp.placeholder || '', inp.default || ''));
  });
  (api.query || []).forEach((q) => {
    paramsEl.appendChild(makeField('q-' + q.key, q.label + ' (query param)', '', q.default || ''));
  });

  // Request body editor and custom StreamAssist form
  const bodyWrap = document.getElementById('api-body-wrap');
  const customFormWrap = document.getElementById('custom-stream-assist-form-wrap');
  const isAssist = api.id === 'assistants.streamAssist' || api.id === 'assistants.assist';

  if (isAssist) {
    bodyWrap.classList.add('hidden');
    customFormWrap.classList.remove('hidden');
    renderStreamAssistForm(api);
  } else {
    customFormWrap.classList.add('hidden');
    if (api.body) {
      bodyWrap.classList.remove('hidden');
      const c = cfg();
      const paths = resourcePaths(c);
      let bodyText = JSON.stringify(api.body, null, 2);
      bodyText = bodyText
        .replace(/{enginePathFull}/g, paths.enginePath)
        .replace(/{project}/g, c.project || '{project}')
        .replace(/{region}/g, c.region);
      document.getElementById('api-body').value = bodyText;
    } else {
      bodyWrap.classList.add('hidden');
    }
  }
}

// ---------- Background Fetching Helper ----------
async function fetchEngineDataStores() {
  const c = cfg();
  if (!c.project || !c.engine) {
    throw new Error('Project and Engine configuration are required');
  }
  const paths = resourcePaths(c);
  const url = `${baseUrl(c)}/${paths.enginePath}`;
  const token = await getValidToken();
  if (!token) {
    throw new Error('No valid token available');
  }

  const resp = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ url, method: 'GET', body: null, project: c.project }),
  });

  if (!resp.ok) {
    throw new Error(`HTTP error ${resp.status}`);
  }

  const data = await resp.json();
  return data.dataStoreIds || [];
}

// ---------- Render StreamAssist Form ----------
function renderStreamAssistForm(api) {
  const container = document.getElementById('custom-stream-assist-form');
  if (!container) return;
  container.innerHTML = ''; // Clear previous fields

  // 1. Query Text field
  const queryGroup = document.createElement('div');
  queryGroup.className = 'form-field';
  const queryLabel = document.createElement('label');
  queryLabel.innerHTML = '<span>Query Text</span>';
  const queryTextarea = document.createElement('textarea');
  queryTextarea.id = 'sa-query-text';
  queryTextarea.rows = 3;
  queryTextarea.spellcheck = false;

  let defaultQuery = 'Hello! What can you help me with?';
  try {
    const currentJson = JSON.parse(document.getElementById('api-body').value);
    if (currentJson?.query?.text) {
      defaultQuery = currentJson.query.text;
    }
  } catch (e) {
    if (api.body?.query?.text) {
      defaultQuery = api.body.query.text;
    }
  }
  queryTextarea.value = defaultQuery;
  queryLabel.appendChild(queryTextarea);
  queryGroup.appendChild(queryLabel);
  container.appendChild(queryGroup);

  // 2. Session field
  const sessionGroup = document.createElement('div');
  sessionGroup.className = 'form-field';
  const sessionLabel = document.createElement('label');
  sessionLabel.innerHTML = '<span>Session Resource Name</span>';
  const sessionInput = document.createElement('input');
  sessionInput.id = 'sa-session';
  sessionInput.type = 'text';
  sessionInput.spellcheck = false;

  const c = cfg();
  const paths = resourcePaths(c);
  let defaultSession = `${paths.enginePath}/sessions/-`;
  try {
    const currentJson = JSON.parse(document.getElementById('api-body').value);
    if (currentJson?.session) {
      defaultSession = currentJson.session;
    }
  } catch (e) {
    if (api.body?.session) {
      defaultSession = api.body.session.replace(/{enginePathFull}/g, paths.enginePath);
    }
  }
  sessionInput.value = defaultSession;
  sessionLabel.appendChild(sessionInput);
  sessionGroup.appendChild(sessionLabel);
  container.appendChild(sessionGroup);

  // 3. Answer Generation Mode select
  const modeGroup = document.createElement('div');
  modeGroup.className = 'form-field';
  const modeLabel = document.createElement('label');
  modeLabel.innerHTML = '<span>Answer Generation Mode</span>';
  const modeSelect = document.createElement('select');
  modeSelect.id = 'sa-mode';

  const modes = ['NORMAL', 'ADVANCED', 'ANSWER_GENERATION_MODE_UNSPECIFIED'];
  modes.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    modeSelect.appendChild(opt);
  });

  let defaultMode = 'NORMAL';
  try {
    const currentJson = JSON.parse(document.getElementById('api-body').value);
    if (currentJson?.answerGenerationMode) {
      defaultMode = currentJson.answerGenerationMode;
    }
  } catch (e) {
    if (api.body?.answerGenerationMode) {
      defaultMode = api.body.answerGenerationMode;
    }
  }
  modeSelect.value = defaultMode;
  modeLabel.appendChild(modeSelect);
  modeGroup.appendChild(modeLabel);
  container.appendChild(modeGroup);

  // 4. Data Stores checklist container
  const dsGroup = document.createElement('div');
  dsGroup.className = 'form-field';
  
  const dsLabelSpan = document.createElement('span');
  dsLabelSpan.textContent = 'Data Store Specifications (dataStoreSpecs)';
  dsGroup.appendChild(dsLabelSpan);

  const dsChecklistContainer = document.createElement('div');
  dsChecklistContainer.className = 'datastore-checklist-container';
  dsChecklistContainer.id = 'sa-datastore-checklist-container';

  const loadingEl = document.createElement('div');
  loadingEl.id = 'sa-datastore-loading';
  loadingEl.style.color = 'var(--muted)';
  loadingEl.style.fontSize = '12px';
  loadingEl.textContent = 'Attempting to fetch connected data stores for the active engine...';
  dsChecklistContainer.appendChild(loadingEl);

  dsGroup.appendChild(dsChecklistContainer);
  container.appendChild(dsGroup);

  // Immediately initialize JSON with baseline values
  syncStreamAssistFormToJson();

  // Asynchronously load dataStoreIds
  fetchEngineDataStores()
    .then(dataStoreIds => {
      renderDataStoreSpecsList(dataStoreIds);
    })
    .catch(err => {
      console.warn('Failed to fetch engine data stores:', err);
      renderDataStoreSpecsList([]);
    });
}

// ---------- Render checklist of Data Stores ----------
function renderDataStoreSpecsList(dataStoreIds) {
  const container = document.getElementById('sa-datastore-checklist-container');
  if (!container) return;

  container.innerHTML = ''; // clear loading message

  const title = document.createElement('div');
  title.className = 'datastore-checklist-title';
  title.textContent = 'Select Data Stores to Query:';
  container.appendChild(title);

  const listWrap = document.createElement('div');
  listWrap.id = 'sa-datastore-list-wrap';
  container.appendChild(listWrap);

  // Attempt to parse existing dataStoreSpecs from textarea to restore checked states/inputs
  let existingSpecs = {};
  try {
    const currentJson = JSON.parse(document.getElementById('api-body').value);
    if (currentJson?.dataStoreSpecs && Array.isArray(currentJson.dataStoreSpecs)) {
      currentJson.dataStoreSpecs.forEach(spec => {
        const parts = spec.dataStore.split('/');
        const dsId = parts[parts.length - 1];
        const querySpec = spec.querySpec || {};
        const searchSpec = querySpec.searchSpec || {};
        const maxResultsVal = spec.numResults !== undefined ? spec.numResults : 
                             (searchSpec.maxResults !== undefined ? searchSpec.maxResults : 
                             (spec.maxResults !== undefined ? spec.maxResults : 10));
        existingSpecs[dsId] = {
          checked: true,
          filter: spec.filter || querySpec.filter || '',
          maxResults: maxResultsVal
        };
      });
    }
  } catch (e) {
    // ignore
  }

  // Render checkable entries
  if (dataStoreIds && dataStoreIds.length > 0) {
    dataStoreIds.forEach(dsId => {
      const specState = existingSpecs[dsId] || { checked: false, filter: '', maxResults: 10 };
      const itemEl = createDataStoreItemElement(dsId, specState.checked, specState.filter, specState.maxResults);
      listWrap.appendChild(itemEl);
    });
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.style.color = 'var(--muted)';
    emptyEl.style.fontSize = '12px';
    emptyEl.style.marginBottom = '8px';
    emptyEl.textContent = 'No connected data stores found for this engine. Add custom entries below.';
    listWrap.appendChild(emptyEl);
  }

  // Render any manually added specs that were already in the JSON body but are not in the fetched list
  Object.keys(existingSpecs).forEach(dsId => {
    if (!dataStoreIds.includes(dsId)) {
      const specState = existingSpecs[dsId];
      const itemEl = createDataStoreItemElement(dsId, specState.checked, specState.filter, specState.maxResults);
      listWrap.appendChild(itemEl);
    }
  });

  // Small text input + "+" button for custom manual data store IDs
  const manualAddContainer = document.createElement('div');
  manualAddContainer.className = 'custom-datastore-add';

  const manualInput = document.createElement('input');
  manualInput.type = 'text';
  manualInput.id = 'sa-manual-ds-id';
  manualInput.placeholder = 'Enter Custom Data Store ID (e.g. datastore-1)';

  const manualBtn = document.createElement('button');
  manualBtn.type = 'button';
  manualBtn.textContent = '+ Add Store';

  manualBtn.addEventListener('click', () => {
    const dsId = manualInput.value.trim();
    if (!dsId) return;

    const existingCbs = Array.from(document.querySelectorAll('.sa-datastore-checkbox'));
    const duplicate = existingCbs.some(cb => cb.dataset.id === dsId);
    if (duplicate) {
      alert('Data Store ID already in the list.');
      return;
    }

    const emptyMsg = listWrap.querySelector('div');
    if (emptyMsg && emptyMsg.textContent.includes('No connected data stores found')) {
      emptyMsg.remove();
    }

    const itemEl = createDataStoreItemElement(dsId, true, '', 10);
    listWrap.appendChild(itemEl);

    manualInput.value = '';
    syncStreamAssistFormToJson();
  });

  manualInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      manualBtn.click();
    }
  });

  manualAddContainer.appendChild(manualInput);
  manualAddContainer.appendChild(manualBtn);
  container.appendChild(manualAddContainer);
}

// ---------- Create Data Store Checkbox and Spec Inputs ----------
function createDataStoreItemElement(dsId, checked, filter, maxResults) {
  const itemEl = document.createElement('div');
  itemEl.className = 'datastore-item';

  const checkboxLabel = document.createElement('label');
  checkboxLabel.className = 'datastore-checkbox-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'sa-datastore-checkbox';
  checkbox.dataset.id = dsId;
  checkbox.checked = checked;

  checkboxLabel.appendChild(checkbox);
  checkboxLabel.appendChild(document.createTextNode(dsId));
  itemEl.appendChild(checkboxLabel);

  // Specs grid: exposed when checked
  const specsGrid = document.createElement('div');
  specsGrid.className = 'datastore-specs-grid';
  if (!checked) {
    specsGrid.style.display = 'none';
  }

  // Filter input
  const filterLabel = document.createElement('label');
  filterLabel.innerHTML = '<span>Filter Expression</span>';
  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.className = 'sa-ds-filter';
  filterInput.placeholder = 'e.g. state = "CA"';
  filterInput.value = filter || '';
  filterLabel.appendChild(filterInput);
  specsGrid.appendChild(filterLabel);

  // MaxResults input
  const maxResultsLabel = document.createElement('label');
  maxResultsLabel.innerHTML = '<span>Max Results</span>';
  const maxResultsInput = document.createElement('input');
  maxResultsInput.type = 'number';
  maxResultsInput.className = 'sa-ds-max-results';
  maxResultsInput.placeholder = '10';
  maxResultsInput.value = maxResults !== undefined ? maxResults : 10;
  maxResultsLabel.appendChild(maxResultsInput);
  specsGrid.appendChild(maxResultsLabel);

  itemEl.appendChild(specsGrid);

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      specsGrid.style.display = 'grid';
    } else {
      specsGrid.style.display = 'none';
    }
    syncStreamAssistFormToJson();
  });

  return itemEl;
}

// ---------- Form to JSON Compiler ----------
function syncStreamAssistFormToJson() {
  if (!currentApi) return;

  const queryText = document.getElementById('sa-query-text')?.value || '';
  const sessionVal = document.getElementById('sa-session')?.value || '';
  const modeVal = document.getElementById('sa-mode')?.value || 'NORMAL';

  const dataStoreSpecs = [];
  const checkboxes = document.querySelectorAll('.sa-datastore-checkbox');
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const dsId = cb.dataset.id;
      const itemEl = cb.closest('.datastore-item');
      const filterVal = itemEl.querySelector('.sa-ds-filter')?.value.trim() || '';
      const maxResultsVal = parseInt(itemEl.querySelector('.sa-ds-max-results')?.value || '10', 10);

      const c = cfg();
      const project = c.project || '{project}';
      const region = c.region || 'global';
      const collection = c.collection || 'default_collection';

      const dataStorePath = `projects/${project}/locations/${region}/collections/${collection}/dataStores/${dsId}`;

      const spec = {
        dataStore: dataStorePath
      };

      if (filterVal) {
        spec.filter = filterVal;
      }

      if (!isNaN(maxResultsVal)) {
        spec.numResults = maxResultsVal;
      }

      dataStoreSpecs.push(spec);
    }
  });

  const bodyObj = {
    query: { text: queryText },
    session: sessionVal,
  };

  if (currentApi.id === 'assistants.streamAssist') {
    bodyObj.answerGenerationMode = modeVal;
  }

  if (dataStoreSpecs.length > 0) {
    bodyObj.dataStoreSpecs = dataStoreSpecs;
  }

  document.getElementById('api-body').value = JSON.stringify(bodyObj, null, 2);
}

// Bind real-time event delegation on the form
document.getElementById('custom-stream-assist-form').addEventListener('input', syncStreamAssistFormToJson);
document.getElementById('custom-stream-assist-form').addEventListener('change', syncStreamAssistFormToJson);

// Auto-refresh checklist on config change
['cfg-project', 'cfg-engine'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    if (currentApi && (currentApi.id === 'assistants.streamAssist' || currentApi.id === 'assistants.assist')) {
      const checklistContainer = document.getElementById('sa-datastore-checklist-container');
      if (checklistContainer) {
        checklistContainer.innerHTML = '';
        const loading = document.createElement('div');
        loading.id = 'sa-datastore-loading';
        loading.style.color = 'var(--muted)';
        loading.style.fontSize = '12px';
        loading.textContent = 'Project or Engine changed. Fetching connected data stores...';
        checklistContainer.appendChild(loading);
      }
      fetchEngineDataStores()
        .then(dataStoreIds => {
          renderDataStoreSpecsList(dataStoreIds);
        })
        .catch(err => {
          console.warn('Failed to fetch engine data stores:', err);
          renderDataStoreSpecsList([]);
        });
    }
  });
});

function makeField(id, label, placeholder, defVal) {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  wrap.textContent = label;
  const input = document.createElement('input');
  input.id = id;
  input.placeholder = placeholder;
  input.value = defVal;
  wrap.appendChild(input);
  return wrap;
}

// ---------- Send request ----------

document.getElementById('btn-send').addEventListener('click', sendRequest);

async function sendRequest() {
  if (!currentApi) return;
  const c = cfg();
  const needsEngine = /{enginePath}|{assistantPath}/.test(currentApi.path);
  if (!c.project || (needsEngine && !c.engine)) {
    alert(needsEngine
      ? 'Please fill in project number and engine in the Configuration section.'
      : 'Please fill in project number in the Configuration section.');
    return;
  }

  const paths = resourcePaths(c);

  // Build path with substitutions
  let path = currentApi.path
    .replace('{locationPath}', paths.locationPath)
    .replace('{collectionPath}', paths.collectionPath)
    .replace('{enginePath}', paths.enginePath)
    .replace('{assistantPath}', paths.assistantPath);

  for (const inp of currentApi.inputs || []) {
    const v = val('in-' + inp.key);
    if (!v) {
      alert(`Please provide: ${inp.label}`);
      return;
    }
    path = path.replace(`{${inp.key}}`, encodeURIComponent(v));
  }

  // Query params
  const queryParams = {};
  for (const q of currentApi.query || []) {
    const v = val('q-' + q.key);
    if (v) queryParams[q.key] = v;
  }
  const qs = new URLSearchParams(queryParams).toString();

  const url = `${baseUrl(c)}/${path}${qs ? '?' + qs : ''}`;

  // Body
  let body = null;
  if (currentApi.body) {
    try {
      body = JSON.parse(document.getElementById('api-body').value);
    } catch (e) {
      alert('Request body is not valid JSON: ' + e.message);
      return;
    }
  }

  const isChat = currentApi.id === 'assistants.streamAssist' || currentApi.id === 'assistants.assist';
  let queryText = '';
  if (isChat) {
    queryText = document.getElementById('sa-query-text')?.value.trim() || '';
    const sessionInputVal = document.getElementById('sa-session')?.value || '';
    if (sessionInputVal.endsWith('/sessions/-') || !activeSessionId) {
      chatHistory = [];
      activeSessionId = null;
    }
    if (queryText) {
      // Avoid duplicating the user query if we already have it at the end of history
      const lastItem = chatHistory[chatHistory.length - 1];
      if (!lastItem || lastItem.role !== 'user' || lastItem.text !== queryText) {
        chatHistory.push({ role: 'user', text: queryText });
      }
    }
  }

  // Hide toggle controls and clear rendered response container
  document.getElementById('response-toggle-wrap').classList.add('hidden');
  
  if (isChat) {
    renderMultiTurnChat('res-rendered', chatHistory, '', [], true);
    document.getElementById('res-rendered').classList.remove('hidden');
  } else {
    document.getElementById('res-rendered').innerHTML = '';
    document.getElementById('res-rendered').classList.add('hidden');
  }
  
  document.getElementById('res-json').classList.remove('hidden');
  document.getElementById('btn-toggle-raw').classList.add('active');
  document.getElementById('btn-toggle-rendered').classList.remove('active');

  // Show request info immediately
  const results = document.getElementById('results');
  results.classList.remove('hidden');
  setText('res-endpoint', `${currentApi.method} ${url}`);
  setJsonContent('res-params', Object.keys(queryParams).length ? queryParams : '(none)');
  setJsonContent('res-body', body || '(none)');
  document.getElementById('res-json').textContent = 'Sending…';
  setText('res-status', '');
  setText('res-curl', buildCurl(currentApi.method, url, body, c.project));

  const btn = document.getElementById('btn-send');
  btn.disabled = true;

  if (isChat) {
    // For chat endpoints, focus rendered response immediately
    document.getElementById('btn-toggle-rendered').click();
  }

  const token = await getValidToken();
  if (!token) {
    alert('Session expired. Please log in again.');
    logout();
    return;
  }

  try {
    const resp = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url, method: currentApi.method, body, project: c.project }),
    });

    document.getElementById('res-status').textContent = `HTTP ${resp.status}`;
    document.getElementById('res-status').className = resp.ok ? 'ok' : 'err';

    if (currentApi.stream) {
      // Stream chunks into the response pane as they arrive
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';
      document.getElementById('res-json').textContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        
        // Render raw highlighted JSON
        setJsonContent('res-json', raw);
        
        // Extract and render streamed text & suggestion chips
        const parsedObjects = extractJsonObjects(raw);
        const chatContent = extractChatContent(parsedObjects);
        
        if (isChat) {
          // Track and update session ID if available
          let returnedSessionName = '';
          for (const obj of parsedObjects) {
            if (obj.sessionInfo?.session) {
              returnedSessionName = obj.sessionInfo.session;
            }
          }
          if (returnedSessionName && returnedSessionName !== activeSessionId) {
            activeSessionId = returnedSessionName;
            const sInput = document.getElementById('sa-session');
            if (sInput) {
              sInput.value = returnedSessionName;
              syncStreamAssistFormToJson();
            }
          }

          if (chatContent.text) {
            renderMultiTurnChat('res-rendered', chatHistory, chatContent.text, chatContent.suggestions, true);
            document.getElementById('response-toggle-wrap').classList.remove('hidden');
          }
        } else if (chatContent.text) {
          renderChatResponse('res-rendered', chatContent.text, chatContent.suggestions);
          document.getElementById('response-toggle-wrap').classList.remove('hidden');
        }
      }
      
      // Final render
      setJsonContent('res-json', raw);
      const parsedObjects = extractJsonObjects(raw);
      const chatContent = extractChatContent(parsedObjects);
      
      if (isChat && chatContent.text) {
        chatHistory.push({ role: 'model', text: chatContent.text, suggestions: chatContent.suggestions });
        renderMultiTurnChat('res-rendered', chatHistory, '', [], false);
        document.getElementById('response-toggle-wrap').classList.remove('hidden');
        
        // Clear the Query Input text area
        const queryInput = document.getElementById('sa-query-text');
        if (queryInput) {
          queryInput.value = '';
          syncStreamAssistFormToJson();
        }
      } else if (chatContent.text) {
        renderChatResponse('res-rendered', chatContent.text, chatContent.suggestions);
        document.getElementById('response-toggle-wrap').classList.remove('hidden');
      }
    } else {
      const text = await resp.text();
      setJsonContent('res-json', text);
      
      // Also extract and render text for non-streaming response if possible
      try {
        const parsed = JSON.parse(text);
        const parsedObjects = Array.isArray(parsed) ? parsed : [parsed];
        const chatContent = extractChatContent(parsedObjects);
        
        if (isChat) {
          // Capture session Info
          let returnedSessionName = '';
          for (const obj of parsedObjects) {
            if (obj.sessionInfo?.session) {
              returnedSessionName = obj.sessionInfo.session;
            } else if (obj.session) {
              returnedSessionName = obj.session;
            }
          }
          if (returnedSessionName && returnedSessionName !== activeSessionId) {
            activeSessionId = returnedSessionName;
            const sInput = document.getElementById('sa-session');
            if (sInput) {
              sInput.value = returnedSessionName;
              syncStreamAssistFormToJson();
            }
          }

          if (chatContent.text) {
            chatHistory.push({ role: 'model', text: chatContent.text, suggestions: chatContent.suggestions });
            renderMultiTurnChat('res-rendered', chatHistory, '', [], false);
            document.getElementById('response-toggle-wrap').classList.remove('hidden');
            
            // Clear Query
            const queryInput = document.getElementById('sa-query-text');
            if (queryInput) {
              queryInput.value = '';
              syncStreamAssistFormToJson();
            }
          }
        } else if (chatContent.text) {
          renderChatResponse('res-rendered', chatContent.text, chatContent.suggestions);
          document.getElementById('response-toggle-wrap').classList.remove('hidden');
          // For chat assist, let's default to showing the rendered response!
          btnToggleRendered.click();
        }
      } catch (err) {
        // Not JSON or no text extracted
      }
    }
  } catch (e) {
    document.getElementById('res-json').textContent = 'Request failed: ' + e.message;
    document.getElementById('res-status').textContent = 'ERROR';
    document.getElementById('res-status').className = 'err';
  } finally {
    btn.disabled = false;
  }
}

function buildCurl(method, url, body, project) {
  const activeToken = localStorage.getItem('ge-access-token') || 'YOUR_ACCESS_TOKEN';
  const lines = [
    `curl -X ${method} \\`,
    `  -H "Authorization: Bearer ${activeToken}" \\`,
    `  -H "X-Goog-User-Project: ${project}" \\`,
    `  -H "Content-Type: application/json" \\`,
  ];
  if (body) {
    // Single-quote the JSON payload; escape any single quotes inside it
    const json = JSON.stringify(body, null, 2).replace(/'/g, `'\\''`);
    lines.push(`  -d '${json}' \\`);
  }
  lines.push(`  "${url}"`);
  return lines.join('\n');
}

document.getElementById('btn-copy-curl').addEventListener('click', async () => {
  const btn = document.getElementById('btn-copy-curl');
  await navigator.clipboard.writeText(document.getElementById('res-curl').textContent);
  btn.textContent = 'Copied!';
  setTimeout(() => (btn.textContent = 'Copy'), 1500);
});

// ---------- Multiturn Chat System State & Renderers ----------
let chatHistory = [];
let activeSessionId = null;

function renderMultiTurnChat(containerId, history, activeStreamText, activeSuggestions, isTyping) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  document.getElementById('response-toggle-wrap').classList.remove('hidden');

  // Create the main chat container
  const chatWrap = document.createElement('div');
  chatWrap.className = 'chat-container';

  // 1. Add Chat Header with "Reset Session / Clear Chat" button
  const header = document.createElement('div');
  header.className = 'chat-control-header';
  
  const title = document.createElement('span');
  title.style.fontWeight = '600';
  title.style.fontSize = '12px';
  title.style.color = 'var(--muted)';
  title.textContent = 'Active Multi-turn Conversation';
  header.appendChild(title);
  
  const clearBtn = document.createElement('button');
  clearBtn.id = 'btn-clear-chat';
  clearBtn.textContent = 'Clear Chat / Reset Session';
  clearBtn.addEventListener('click', resetChatSession);
  header.appendChild(clearBtn);
  
  chatWrap.appendChild(header);

  // 2. Render all past turns in history
  history.forEach((turn) => {
    const row = document.createElement('div');
    row.className = `chat-bubble-row ${turn.role}`;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${turn.role}`;

    if (turn.role === 'user') {
      bubble.textContent = turn.text;
    } else {
      bubble.innerHTML = parseMarkdownToHtml(turn.text);
      
      // Render suggestion chips at the end of the turn if any
      if (Array.isArray(turn.suggestions) && turn.suggestions.length > 0) {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'suggestion-chips-container';
        turn.suggestions.forEach(q => {
          const chip = document.createElement('div');
          chip.className = 'suggestion-chip';
          chip.textContent = q;
          chip.addEventListener('click', () => applySuggestion(q));
          chipsContainer.appendChild(chip);
        });
        bubble.appendChild(chipsContainer);
      }
    }

    row.appendChild(bubble);
    chatWrap.appendChild(row);
  });

  // 3. Render active stream bubble
  if (activeStreamText || isTyping) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row model';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble model';

    if (activeStreamText) {
      bubble.innerHTML = parseMarkdownToHtml(activeStreamText);
    } else {
      const typing = document.createElement('div');
      typing.className = 'typing-indicator';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typing.appendChild(dot);
      }
      bubble.appendChild(typing);
    }

    if (Array.isArray(activeSuggestions) && activeSuggestions.length > 0) {
      const chipsContainer = document.createElement('div');
      chipsContainer.className = 'suggestion-chips-container';
      activeSuggestions.forEach(q => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = q;
        chip.addEventListener('click', () => applySuggestion(q));
        chipsContainer.appendChild(chip);
      });
      bubble.appendChild(chipsContainer);
    }

    row.appendChild(bubble);
    chatWrap.appendChild(row);
  }

  container.appendChild(chatWrap);

  // Auto-scroll
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

function resetChatSession() {
  chatHistory = [];
  activeSessionId = null;
  
  const sessionInput = document.getElementById('sa-session');
  if (sessionInput) {
    const c = cfg();
    const paths = resourcePaths(c);
    sessionInput.value = `${paths.enginePath}/sessions/-`;
    syncStreamAssistFormToJson();
  }
  
  renderMultiTurnChat('res-rendered', chatHistory, '', [], false);
  const btnToggleRendered = document.getElementById('btn-toggle-rendered');
  if (btnToggleRendered) {
    btnToggleRendered.click();
  }
}

function prettyMaybe(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text; // streaming partial JSON or non-JSON
  }
}

// ---------- Authentication & Session Management ----------

async function getValidToken() {
  const token = localStorage.getItem('ge-access-token');
  const expiry = Number(localStorage.getItem('ge-token-expiry') || 0);
  const refreshToken = localStorage.getItem('ge-refresh-token');

  if (!token) return null;

  // If expired or expiring in less than 2 minutes, refresh it!
  if (Date.now() + 120000 >= expiry && refreshToken) {
    try {
      const clientId = localStorage.getItem('ge-client-id');
      const clientSecret = localStorage.getItem('ge-client-secret');

      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret
        })
      });

      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      
      localStorage.setItem('ge-access-token', data.access_token);
      localStorage.setItem('ge-token-expiry', Date.now() + (data.expires_in || 3600) * 1000);
      if (data.refresh_token) {
        localStorage.setItem('ge-refresh-token', data.refresh_token);
      }
      return data.access_token;
    } catch (err) {
      console.error('Failed to auto-refresh access token:', err);
      logout();
      return null;
    }
  }

  return token;
}

async function initAuth() {
  let serverConfigured = false;
  let preloadedProjectNumber = '';
  try {
    const res = await fetch('/api/auth/config');
    const data = await res.json();
    serverConfigured = data.isConfigured;
    preloadedProjectNumber = data.projectNumber || '';
  } catch (e) {
    console.error('Failed to load server auth config:', e);
  }

  // Preload project number from server env if present
  if (preloadedProjectNumber) {
    const projectInput = document.getElementById('cfg-project');
    if (projectInput) {
      projectInput.value = preloadedProjectNumber;
      localStorage.setItem('ge-cfg-project', preloadedProjectNumber);
    }
  }

  const credsForm = document.getElementById('credentials-form');
  const envMsg = document.getElementById('env-configured-message');
  if (serverConfigured) {
    credsForm.classList.add('hidden');
    envMsg.classList.remove('hidden');
  } else {
    credsForm.classList.remove('hidden');
    envMsg.classList.add('hidden');
    
    const savedId = localStorage.getItem('ge-client-id');
    const savedSecret = localStorage.getItem('ge-client-secret');
    if (savedId) document.getElementById('oauth-client-id').value = savedId;
    if (savedSecret) document.getElementById('oauth-client-secret').value = savedSecret;
  }

  const token = await getValidToken();
  const appContainer = document.getElementById('app-container');
  const loginScreen = document.getElementById('login-screen');
  const userBadge = document.getElementById('user-badge');
  const userEmailSpan = document.getElementById('user-email');

  if (token) {
    appContainer.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    userBadge.classList.remove('hidden');
    userEmailSpan.textContent = 'Google Account Connected';
  } else {
    appContainer.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    userBadge.classList.add('hidden');
  }
}

function logout() {
  localStorage.removeItem('ge-access-token');
  localStorage.removeItem('ge-refresh-token');
  localStorage.removeItem('ge-token-expiry');
  window.location.reload();
}

document.getElementById('btn-login-google').addEventListener('click', () => {
  const clientIdInput = document.getElementById('oauth-client-id');
  const clientSecretInput = document.getElementById('oauth-client-secret');

  let clientId = '';
  let clientSecret = '';

  const isFormVisible = !document.getElementById('credentials-form').classList.contains('hidden');
  if (isFormVisible) {
    clientId = clientIdInput.value.trim();
    clientSecret = clientSecretInput.value.trim();

    if (!clientId || !clientSecret) {
      alert('Please enter both OAuth Client ID and Client Secret.');
      return;
    }

    localStorage.setItem('ge-client-id', clientId);
    localStorage.setItem('ge-client-secret', clientSecret);
  }

  let loginUrl = `/api/auth/login`;
  if (clientId && clientSecret) {
    loginUrl += `?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
  }
  window.location.href = loginUrl;
});

document.getElementById('btn-logout').addEventListener('click', logout);

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

// ---- Custom JSON Syntax Highlighting & Rendering ----
function syntaxHighlightJson(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  // Escape HTML entities to prevent XSS
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
        return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

function setJsonContent(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  
  if (value === null || value === undefined || value === '(none)') {
    el.textContent = String(value);
    return;
  }
  
  let jsonStr = '';
  if (typeof value === 'object') {
    jsonStr = JSON.stringify(value, null, 2);
  } else if (typeof value === 'string') {
    try {
      jsonStr = JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      // Partial stream or non-JSON text
      jsonStr = value;
    }
  }
  
  const trimmed = jsonStr.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    el.textContent = jsonStr;
    return;
  }
  
  el.innerHTML = syntaxHighlightJson(jsonStr);
}

// ---- Stream Lenient Parsing & Extraction ----
function extractJsonObjects(rawStream) {
  const objects = [];
  let braceCount = 0;
  let startIdx = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < rawStream.length; i++) {
    const char = rawStream[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        if (braceCount === 0) {
          startIdx = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && startIdx !== -1) {
          const candidate = rawStream.substring(startIdx, i + 1);
          try {
            objects.push(JSON.parse(candidate));
          } catch (e) {
            // Ignore parse errors for unfinished objects
          }
          startIdx = -1;
        }
      }
    }
  }
  return objects;
}

function extractChatContent(objects) {
  let text = '';
  const suggestions = [];

  for (const obj of objects) {
    if (obj.answer && Array.isArray(obj.answer.replies)) {
      for (const reply of obj.answer.replies) {
        if (reply.groundedContent && reply.groundedContent.content) {
          const content = reply.groundedContent.content;
          if (typeof content.text === 'string') {
            text += content.text;
          }
          if (content.inlineData && content.inlineData.mimeType === 'application/json+suggestions') {
            try {
              // Decode base64 encoded suggested follow-ups
              const decoded = atob(content.inlineData.data);
              const dataObj = JSON.parse(decoded);
              if (dataObj.recommendedQuestionsResponse && Array.isArray(dataObj.recommendedQuestionsResponse.questions)) {
                dataObj.recommendedQuestionsResponse.questions.forEach(q => {
                  if (!suggestions.includes(q)) {
                    suggestions.push(q);
                  }
                });
              }
            } catch (err) {
              console.error('Error parsing suggestions:', err);
            }
          }
        }
      }
    }
    
    // Also fallback to simpler keys in case it is a flatter structure
    if (!text) {
      if (obj.answer && typeof obj.answer.answerText === 'string') {
        text = obj.answer.answerText;
      } else if (obj.answerText && typeof obj.answerText === 'string') {
        text = obj.answerText;
      } else if (obj.text && typeof obj.text === 'string') {
        text = obj.text;
      } else if (obj.content && typeof obj.content === 'string') {
        text = obj.content;
      }
    }
  }

  return { text, suggestions };
}

function parseMarkdownToHtml(md) {
  if (!md) return '';
  
  let html = md;

  // Escape HTML tags to prevent XSS except the ones we generate
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 1. Code blocks
  html = html.replace(/```([\s\S]+?)```/g, function(match, code) {
    return `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`;
  });
  html = html.replace(/`([^`\n]+?)`/g, '<code>$1</code>');

  // 2. Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<div class="table-wrap"><table>';
        // Header columns
        const cols = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        tableHtml += '<thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        if (line.includes('---')) {
          continue;
        }
        const cols = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        tableHtml += '<tr>' + cols.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }
      lines[i] = ''; 
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table></div>';
        lines[i] = tableHtml + '\n' + lines[i];
        tableHtml = '';
      }
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table></div>';
    lines.push(tableHtml);
  }
  html = lines.filter(l => l !== '').join('\n');

  // 3. Headers (### or ## or #)
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // 4. Bold and italics
  html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+?)\*/g, '<em>$1</em>');

  // 5. Bullet Lists
  html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // 6. Paragraphs and Line Breaks
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<div') || trimmed.startsWith('<pre') || trimmed.startsWith('<li>')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

function applySuggestion(suggestionText) {
  const textarea = document.getElementById('api-body');
  if (!textarea) return;
  
  try {
    const body = JSON.parse(textarea.value);
    if (body && body.query) {
      body.query.text = suggestionText;
      textarea.value = JSON.stringify(body, null, 2);
    } else {
      textarea.value = JSON.stringify({ query: { text: suggestionText } }, null, 2);
    }
  } catch {
    textarea.value = JSON.stringify({ query: { text: suggestionText } }, null, 2);
  }
  
  const sendBtn = document.getElementById('btn-send');
  if (sendBtn) {
    sendBtn.focus();
    sendBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    sendBtn.classList.add('pulse-highlight');
    setTimeout(() => {
      sendBtn.classList.remove('pulse-highlight');
    }, 2400);
  }
}

function renderChatResponse(containerId, text, suggestions) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Render Markdown to HTML
  container.innerHTML = parseMarkdownToHtml(text);
  
  // Render interactive suggestion chips if suggestions are present
  if (Array.isArray(suggestions) && suggestions.length > 0) {
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'suggestion-chips-container';
    
    suggestions.forEach(q => {
      const chip = document.createElement('div');
      chip.className = 'suggestion-chip';
      chip.textContent = q;
      chip.addEventListener('click', () => applySuggestion(q));
      chipsContainer.appendChild(chip);
    });
    
    container.appendChild(chipsContainer);
  }
}

// ---- Engine Combo Box Preloading ----
async function pullAndPopulateEngines() {
  const c = cfg();
  if (!c.project) return;
  
  const token = await getValidToken();
  if (!token) return;
  
  const bUrl = baseUrl(c);
  const url = `${bUrl}/projects/${c.project}/locations/${c.region}/collections/${c.collection}/engines`;
  
  const resp = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url,
      method: 'GET',
      project: c.project
    })
  });
  
  if (!resp.ok) return;
  
  const data = await resp.json();
  const datalist = document.getElementById('engines-list');
  if (!datalist) return;
  
  datalist.innerHTML = '';
  if (data.engines && Array.isArray(data.engines)) {
    data.engines.forEach(eng => {
      const parts = eng.name.split('/');
      const engineId = parts[parts.length - 1];
      
      const option = document.createElement('option');
      option.value = engineId;
      option.textContent = eng.displayName || engineId;
      datalist.appendChild(option);
    });
  }
}

// Attach engine autofocus preloader
document.getElementById('cfg-engine').addEventListener('focus', async () => {
  const input = document.getElementById('cfg-engine');
  if (!input.value.trim()) {
    const oldPlaceholder = input.placeholder;
    input.placeholder = 'Fetching engines list...';
    try {
      await pullAndPopulateEngines();
    } catch (e) {
      console.error('Failed to pre-populate engines:', e);
    } finally {
      input.placeholder = oldPlaceholder;
    }
  }
});

// ---- Response raw/rendered toggling ----
const btnToggleRaw = document.getElementById('btn-toggle-raw');
const btnToggleRendered = document.getElementById('btn-toggle-rendered');
const preResJson = document.getElementById('res-json');
const divResRendered = document.getElementById('res-rendered');

btnToggleRaw.addEventListener('click', () => {
  btnToggleRaw.classList.add('active');
  btnToggleRendered.classList.remove('active');
  preResJson.classList.remove('hidden');
  divResRendered.classList.add('hidden');
});

btnToggleRendered.addEventListener('click', () => {
  btnToggleRendered.classList.add('active');
  btnToggleRaw.classList.remove('active');
  preResJson.classList.add('hidden');
  divResRendered.classList.remove('hidden');
});

// Initialize authentication on load
initAuth();
