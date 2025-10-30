export const API_CONFIG = {
  TOOLS_LIST_URL: 'http://localhost:3000/api/tools',
  TOOL_METADATA_URL: (toolName: string) => `http://localhost:3000/api/tools/${encodeURIComponent(toolName)}`,
};

