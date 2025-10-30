import { useState } from 'react';
import { useFlow, LoadDataParams, FlowResponseBuilder, UserDescriptions, ToolDescriptions, FlowCube } from './flow';
import { ItemList } from './components/ItemList';
import { ToolSelector } from './components/ToolSelector';
import { API_CONFIG } from './config';
import Divider from '@mui/material/Divider';

function App() {
  const [receivedData, setReceivedData] = useState<LoadDataParams | null>(null);
  const [userDescriptions, setUserDescriptions] = useState<UserDescriptions>({});
  const [selectedTools, setSelectedTools] = useState<FlowCube[]>([]);
  const [toolDescriptions, setToolDescriptions] = useState<ToolDescriptions>({});

  useFlow({
    onLoadData: async (data: LoadDataParams) => {
      console.log('Received data from Flow:', data);
      setReceivedData(data);
      
      // Load user descriptions if they exist in the received data
      if (data.value.userDescriptions) {
        setUserDescriptions(data.value.userDescriptions);
      }
      
      // Load tool descriptions and reconstruct selected tools
      if (data.value.toolDescriptions) {
        setToolDescriptions(data.value.toolDescriptions);
        
        // Fetch tool metadata for each tool in toolDescriptions
        const toolNames = Object.keys(data.value.toolDescriptions);
        const toolPromises = toolNames.map(async (toolName) => {
          try {
            const response = await fetch(API_CONFIG.TOOL_METADATA_URL(toolName));
            if (response.ok) {
              return await response.json();
            }
          } catch (error) {
            console.error(`Failed to load tool metadata for ${toolName}:`, error);
          }
          return null;
        });
        
        const tools = await Promise.all(toolPromises);
        const validTools = tools.filter((tool): tool is FlowCube => tool !== null);
        setSelectedTools(validTools);
      }
    },
    onSave: () => {
      console.log('Save triggered');
      
      // Build a response using the FlowResponseBuilder
      const builder = new FlowResponseBuilder();
      
      if (receivedData) {
        // Load the original data
        builder.loadFromObject(receivedData.value);
        
        // Modify or add some parameters
        builder.addParameter(
          'custom_param',
          'Custom Parameter',
          'String',
          'Modified by demo app',
          { IsRequired: false }
        );
      }
      
      const response = builder.build();
      
      // Add user descriptions to the response
      response.userDescriptions = userDescriptions;
      
      // Add tool descriptions to the response (selectedTools can be inferred from toolDescriptions keys)
      response.toolDescriptions = toolDescriptions;
      
      console.log('Sending response:', response);
      console.log('User descriptions:', userDescriptions);
      console.log('Tool descriptions:', toolDescriptions);
      
      return response;
    },
    onCancel: () => {
      console.log('Cancel triggered');
    },
  });

  const handleUserDescriptionsChange = (descriptions: UserDescriptions) => {
    setUserDescriptions(prev => {
      // Only update if there are actual changes
      if (JSON.stringify(prev) !== JSON.stringify(descriptions)) {
        return descriptions;
      }
      return prev;
    });
  };

  const handleToolDescriptionsChange = (descriptions: ToolDescriptions) => {
    setToolDescriptions(prev => {
      // Only update if there are actual changes
      if (JSON.stringify(prev) !== JSON.stringify(descriptions)) {
        return descriptions;
      }
      return prev;
    });
  };

  const handleToolSelected = (tool: FlowCube) => {
    // Check if tool is already added
    if (!selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools(prev => [...prev, tool]);
    }
  };

  const selectedToolNames = selectedTools.map(t => t.Name || t.UniqueName);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {receivedData ? (
        <>
          {/* Connected Queries Section */}
          <h1>Connected Queries</h1>
          <ItemList 
            items={receivedData.linkedQueries}
            initialDescriptions={userDescriptions}
            onDescriptionsChange={handleUserDescriptionsChange}
            emptyMessage="No connected queries available"
          />
          
          <Divider sx={{ my: 4 }} />
          
          {/* Tools Section */}
          <h1>Tools</h1>
          <ToolSelector 
            onToolSelected={handleToolSelected}
            selectedToolNames={selectedToolNames}
          />
          <ItemList 
            items={selectedTools}
            initialDescriptions={toolDescriptions}
            onDescriptionsChange={handleToolDescriptionsChange}
            emptyMessage="No tools selected. Choose a tool from the dropdown above."
          />
        </>
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p style={{ color: '#999' }}>Waiting for data from Flow parent window...</p>
        </div>
      )}
    </div>
  );
}

export default App;

