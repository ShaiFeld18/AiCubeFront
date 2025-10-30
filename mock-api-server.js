// Simple mock API server for testing tools feature
// Run with: node mock-api-server.js

import http from 'http';
import url from 'url';

const PORT = 3000;

// Mock tools data
const tools = [
  'Data Analyzer',
  'Report Generator',
  'Chart Builder'
];

const toolsMetadata = {
  'Data Analyzer': {
    id: 'tool-data-analyzer',
    UniqueName: 'data_analyzer',
    Name: 'Data Analyzer',
    Description: 'Analyze data patterns and generate insights',
    Type: 'query',
    Parameters: [
      {
        Name: 'data_source',
        DisplayName: 'Data Source',
        Type: 'String',
        IsSingleValue: true,
        IsRequired: true,
        Description: 'Select the data source to analyze',
        HideFromList: null,
        AutoCompleteProvider: '',
        OptionsProvider: '',
        Options: [],
        Category: 'Input',
        ParameterSubtitle: null,
        Value: '',
        visible: true,
        Role: '',
        OntologyType: null,
        IsServerFilterAutoComplete: false
      },
      {
        Name: 'analysis_type',
        DisplayName: 'Analysis Type',
        Type: 'String',
        IsSingleValue: true,
        IsRequired: true,
        Description: 'Type of analysis to perform',
        HideFromList: null,
        AutoCompleteProvider: '',
        OptionsProvider: '',
        Options: [],
        Category: 'Settings',
        ParameterSubtitle: null,
        Value: 'statistical',
        visible: true,
        Role: '',
        OntologyType: null,
        IsServerFilterAutoComplete: false
      }
    ],
    Fields: [],
    Metadata: { Owner: 'system' },
    Processes: [],
    ViewConfig: {},
    SavedProperties: {}
  },
  'Report Generator': {
    id: 'tool-report-generator',
    UniqueName: 'report_generator',
    Name: 'Report Generator',
    Description: 'Generate comprehensive reports from your data',
    Type: 'query',
    Parameters: [
      {
        Name: 'report_template',
        DisplayName: 'Report Template',
        Type: 'String',
        IsSingleValue: true,
        IsRequired: true,
        Description: 'Choose a report template',
        HideFromList: null,
        AutoCompleteProvider: '',
        OptionsProvider: '',
        Options: [],
        Category: 'Configuration',
        ParameterSubtitle: null,
        Value: '',
        visible: true,
        Role: '',
        OntologyType: null,
        IsServerFilterAutoComplete: false
      },
      {
        Name: 'include_charts',
        DisplayName: 'Include Charts',
        Type: 'Boolean',
        IsSingleValue: true,
        IsRequired: false,
        Description: 'Include visualizations in the report',
        HideFromList: null,
        AutoCompleteProvider: '',
        OptionsProvider: '',
        Options: [],
        Category: 'Options',
        ParameterSubtitle: null,
        Value: true,
        visible: true,
        Role: '',
        OntologyType: null,
        IsServerFilterAutoComplete: false
      }
    ],
    Fields: [],
    Metadata: { Owner: 'system' },
    Processes: [],
    ViewConfig: {},
    SavedProperties: {}
  },
  'Chart Builder': {
    id: 'tool-chart-builder',
    UniqueName: 'chart_builder',
    Name: 'Chart Builder',
    Description: 'Create interactive charts and visualizations',
    Type: 'query',
    Parameters: [
      {
        Name: 'chart_type',
        DisplayName: 'Chart Type',
        Type: 'String',
        IsSingleValue: true,
        IsRequired: true,
        Description: 'Select chart type (bar, line, pie, etc.)',
        HideFromList: null,
        AutoCompleteProvider: '',
        OptionsProvider: '',
        Options: [],
        Category: 'Chart Settings',
        ParameterSubtitle: null,
        Value: 'bar',
        visible: true,
        Role: '',
        OntologyType: null,
        IsServerFilterAutoComplete: false
      },
      {
        Name: 'x_axis',
        DisplayName: 'X-Axis Field',
        Type: 'String',
        IsSingleValue: true,
        IsRequired: true,
        Description: 'Field to use for X-axis',
        HideFromList: null,
        AutoCompleteProvider: '',
        OptionsProvider: '',
        Options: [],
        Category: 'Chart Settings',
        ParameterSubtitle: null,
        Value: '',
        visible: true,
        Role: '',
        OntologyType: null,
        IsServerFilterAutoComplete: false
      },
      {
        Name: 'y_axis',
        DisplayName: 'Y-Axis Field',
        Type: 'String',
        IsSingleValue: true,
        IsRequired: true,
        Description: 'Field to use for Y-axis',
        HideFromList: null,
        AutoCompleteProvider: '',
        OptionsProvider: '',
        Options: [],
        Category: 'Chart Settings',
        ParameterSubtitle: null,
        Value: '',
        visible: true,
        Role: '',
        OntologyType: null,
        IsServerFilterAutoComplete: false
      }
    ],
    Fields: [],
    Metadata: { Owner: 'system' },
    Processes: [],
    ViewConfig: {},
    SavedProperties: {}
  }
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // GET /api/tools - Return list of tool names
  if (pathname === '/api/tools' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tools));
    return;
  }

  // GET /api/tools/:toolName - Return tool metadata
  const toolMatch = pathname.match(/^\/api\/tools\/(.+)$/);
  if (toolMatch && req.method === 'GET') {
    const toolName = decodeURIComponent(toolMatch[1]);
    const metadata = toolsMetadata[toolName];
    
    if (metadata) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(metadata));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Tool not found' }));
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}/`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET http://localhost:${PORT}/api/tools`);
  console.log(`  GET http://localhost:${PORT}/api/tools/{toolName}`);
  console.log(`\nAvailable tools: ${tools.join(', ')}`);
});

