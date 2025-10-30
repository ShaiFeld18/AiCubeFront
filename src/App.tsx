import { useState } from 'react';
import { useFlow, LoadDataParams, FlowResponseBuilder, UserDescriptions, ToolDescriptions, FlowCube } from './flow';
import { PromptPage } from './pages/PromptPage';
import { ToolsPage } from './pages/ToolsPage';
import { ConnectedQueriesPage } from './pages/ConnectedQueriesPage';
import { PlanPage } from './pages/PlanPage';
import { API_CONFIG } from './config';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Slide from '@mui/material/Slide';

// Helper function to clean up descriptions by removing entries that don't match actual items
function cleanupDescriptions(
  descriptions: UserDescriptions,
  items: FlowCube[]
): UserDescriptions {
  // Create a map of item display names to items for quick lookup
  const itemMap = new Map<string, FlowCube>();
  items.forEach(item => {
    const displayName = item.Name || item.UniqueName;
    itemMap.set(displayName, item);
  });

  const cleanedDescriptions: UserDescriptions = {};

  // Iterate through descriptions and validate
  Object.entries(descriptions).forEach(([itemDisplayName, descData]) => {
    const item = itemMap.get(itemDisplayName);
    
    // If item doesn't exist, skip this description entry
    if (!item) {
      return;
    }

    // Validate parameter descriptions
    const cleanedParameters: { [key: string]: string } = {};
    
    if (descData.parameters && item.Parameters) {
      // Get actual parameter display names from the item
      const actualParamNames = new Set(
        item.Parameters.map(param => param.DisplayName || param.Name).filter(Boolean)
      );

      // Only include parameter descriptions that match actual parameters
      Object.entries(descData.parameters).forEach(([paramName, paramDesc]) => {
        if (actualParamNames.has(paramName)) {
          cleanedParameters[paramName] = paramDesc;
        }
      });
    }

    // Include the cleaned entry
    cleanedDescriptions[itemDisplayName] = {
      queryDescription: descData.queryDescription,
      parameters: cleanedParameters
    };
  });

  return cleanedDescriptions;
}

function App() {
  const [receivedData, setReceivedData] = useState<LoadDataParams | null>(null);
  const [connectedQueriesDescriptions, setConnectedQueriesDescriptions] = useState<UserDescriptions>({});
  const [selectedTools, setSelectedTools] = useState<FlowCube[]>([]);
  const [toolDescriptions, setToolDescriptions] = useState<ToolDescriptions>({});
  const [promptContent, setPromptContent] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(3);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  useFlow({
    onLoadData: async (data: LoadDataParams) => {
      console.log('Received data from Flow:', data);
      setReceivedData(data);
      
      // Load connected queries descriptions if they exist in the received data
      if (data.value.connectedQueriesDescriptions) {
        // Clean up descriptions to remove entries that don't match actual queries
        const cleanedDescriptions = cleanupDescriptions(
          data.value.connectedQueriesDescriptions,
          data.linkedQueries
        );
        setConnectedQueriesDescriptions(cleanedDescriptions);
      }
      
      // Load prompt if it exists
      if (data.value.prompt) {
        setPromptContent(data.value.prompt);
      }
      
      // Load plan if it exists
      if (data.value.plan) {
        setPlan(data.value.plan);
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
      
      // Add connected queries descriptions to the response
      response.connectedQueriesDescriptions = connectedQueriesDescriptions;
      
      // Add tool descriptions to the response (selectedTools can be inferred from toolDescriptions keys)
      response.toolDescriptions = toolDescriptions;
      
      // Add prompt content to the response
      response.prompt = promptContent;
      
      // Add plan to the response
      response.plan = plan;
      
      console.log('Sending response:', response);
      console.log('Connected queries descriptions:', connectedQueriesDescriptions);
      console.log('Tool descriptions:', toolDescriptions);
      console.log('Prompt content:', promptContent);
      console.log('Plan:', plan);
      
      return response;
    },
    onCancel: () => {
      console.log('Cancel triggered');
    },
  });

  const handleConnectedQueriesDescriptionsChange = (descriptions: UserDescriptions) => {
    setConnectedQueriesDescriptions(prev => {
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

  const handleToolDelete = (toolId: string) => {
    // Find the tool to get its display name
    const toolToDelete = selectedTools.find(t => t.id === toolId);
    if (toolToDelete) {
      const toolDisplayName = toolToDelete.Name || toolToDelete.UniqueName;
      
      // Remove tool from selectedTools
      setSelectedTools(prev => prev.filter(t => t.id !== toolId));
      
      // Remove tool descriptions
      setToolDescriptions(prev => {
        const newDescriptions = { ...prev };
        delete newDescriptions[toolDisplayName];
        return newDescriptions;
      });
    }
  };

  const handlePromptChange = (content: string) => {
    setPromptContent(content);
  };

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    try {
      const response = await fetch(API_CONFIG.GENERATE_PLAN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: receivedData?.linkedQueries || [],
          tools: selectedTools,
          prompt: promptContent
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }
      
      const data = await response.json();
      setPlan(data.plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      throw error;
    } finally {
      setPlanLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Set slide direction based on navigation
    setSlideDirection(newValue > currentPage ? 'left' : 'right');
    setCurrentPage(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Tabs 
          value={currentPage} 
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ 
            '& .MuiTab-root': { 
              minWidth: 120,
              fontWeight: 'bold'
            }
          }}
        >
          <Tab label="Plan" />
          <Tab label="Prompt" />
          <Tab label="Tools" />
          <Tab label="Queries" />
        </Tabs>
      </AppBar>

      {/* Page Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, pt: 2 }}>
        {receivedData ? (
          <Box sx={{ position: 'relative', width: '100%' }}>
            {/* Plan Page */}
            <Slide
              direction={slideDirection === 'right' ? 'right' : 'left'}
              in={currentPage === 0}
              mountOnEnter
              unmountOnExit
              timeout={300}
            >
              <Box
                role="tabpanel"
                id="tabpanel-0"
                aria-labelledby="tab-0"
                sx={{ 
                  position: currentPage === 0 ? 'relative' : 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
              >
                <PlanPage
                  plan={plan}
                  loading={planLoading}
                  onGeneratePlan={handleGeneratePlan}
                />
              </Box>
            </Slide>

            {/* Prompt Page */}
            <Slide
              direction={slideDirection === 'left' ? 'left' : 'right'}
              in={currentPage === 1}
              mountOnEnter
              unmountOnExit
              timeout={300}
            >
              <Box
                role="tabpanel"
                id="tabpanel-1"
                aria-labelledby="tab-1"
                sx={{ 
                  position: currentPage === 1 ? 'relative' : 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
              >
                <PromptPage
                  tools={selectedTools}
                  queries={receivedData.linkedQueries}
                  promptContent={promptContent}
                  onPromptChange={handlePromptChange}
                />
              </Box>
            </Slide>

            {/* Tools Page */}
            <Slide
              direction={slideDirection === 'left' ? 'left' : 'right'}
              in={currentPage === 2}
              mountOnEnter
              unmountOnExit
              timeout={300}
            >
              <Box
                role="tabpanel"
                id="tabpanel-2"
                aria-labelledby="tab-2"
                sx={{ 
                  position: currentPage === 2 ? 'relative' : 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
              >
                <ToolsPage
                  selectedTools={selectedTools}
                  toolDescriptions={toolDescriptions}
                  onToolSelected={handleToolSelected}
                  onToolDescriptionsChange={handleToolDescriptionsChange}
                  onToolDelete={handleToolDelete}
                />
              </Box>
            </Slide>

            {/* Queries Page */}
            <Slide
              direction={slideDirection === 'left' ? 'left' : 'right'}
              in={currentPage === 3}
              mountOnEnter
              unmountOnExit
              timeout={300}
            >
              <Box
                role="tabpanel"
                id="tabpanel-3"
                aria-labelledby="tab-3"
                sx={{ 
                  position: currentPage === 3 ? 'relative' : 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
              >
                <ConnectedQueriesPage
                  linkedQueries={receivedData.linkedQueries}
                  connectedQueriesDescriptions={connectedQueriesDescriptions}
                  onConnectedQueriesDescriptionsChange={handleConnectedQueriesDescriptionsChange}
                />
              </Box>
            </Slide>
          </Box>
        ) : (
          <Box sx={{ 
            padding: 5, 
            textAlign: 'center', 
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            mt: 3
          }}>
            <Box component="p" sx={{ color: 'text.secondary' }}>
              Waiting for data from Flow parent window...
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;

