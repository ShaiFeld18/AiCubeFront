import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFlow, LoadDataParams, FlowResponseBuilder, UserDescriptions, ToolCubeDescriptions, FlowCube } from './flow';
import { PromptPage } from './pages/PromptPage';
import { ToolCubesPage } from './pages/ToolCubesPage';
import { ConnectedCubesPage } from './pages/ConnectedCubesPage';
import { PlanPage } from './pages/PlanPage';
import { API_CONFIG } from './config';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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
  const { t, i18n } = useTranslation();
  const [receivedData, setReceivedData] = useState<LoadDataParams | null>(null);
  const [connectedCubesDescriptions, setConnectedCubesDescriptions] = useState<UserDescriptions>({});
  const [selectedToolCubes, setSelectedToolCubes] = useState<FlowCube[]>([]);
  const [toolCubeDescriptions, setToolCubeDescriptions] = useState<ToolCubeDescriptions>({});
  const [promptContent, setPromptContent] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  // Create theme with RTL support
  const theme = createTheme({
    direction: i18n.language === 'he' ? 'rtl' : 'ltr',
  });

  // Update document direction when language changes
  useEffect(() => {
    document.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  useFlow({
    onLoadData: async (data: LoadDataParams) => {
      console.log('Received data from Flow:', data);
      setReceivedData(data);
      
      // Load connected cubes descriptions if they exist in the received data
      if (data.value.connectedCubesDescriptions) {
        // Clean up descriptions to remove entries that don't match actual queries
        const cleanedDescriptions = cleanupDescriptions(
          data.value.connectedCubesDescriptions,
          data.linkedQueries
        );
        setConnectedCubesDescriptions(cleanedDescriptions);
      }
      
      // Load prompt if it exists
      if (data.value.prompt) {
        setPromptContent(data.value.prompt);
      }
      
      // Load plan if it exists
      if (data.value.plan) {
        setPlan(data.value.plan);
      }
      
      // Load tool cube descriptions and reconstruct selected tool cubes
      if (data.value.toolCubeDescriptions) {
        setToolCubeDescriptions(data.value.toolCubeDescriptions);
        
        // Fetch tool cube metadata for each tool cube in toolCubeDescriptions
        const toolCubeNames = Object.keys(data.value.toolCubeDescriptions);
        const toolCubePromises = toolCubeNames.map(async (toolCubeName) => {
          try {
            const response = await fetch(API_CONFIG.TOOL_METADATA_URL(toolCubeName));
            if (response.ok) {
              return await response.json();
            }
          } catch (error) {
            console.error(`Failed to load tool cube metadata for ${toolCubeName}:`, error);
          }
          return null;
        });
        
        const toolCubes = await Promise.all(toolCubePromises);
        const validToolCubes = toolCubes.filter((toolCube): toolCube is FlowCube => toolCube !== null);
        setSelectedToolCubes(validToolCubes);
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
      
      // Add connected cubes descriptions to the response
      response.connectedCubesDescriptions = connectedCubesDescriptions;
      
      // Add tool cube descriptions to the response (selectedToolCubes can be inferred from toolCubeDescriptions keys)
      response.toolCubeDescriptions = toolCubeDescriptions;
      
      // Add prompt content to the response
      response.prompt = promptContent;
      
      // Add plan to the response
      response.plan = plan;
      
      console.log('Sending response:', response);
      console.log('Connected cubes descriptions:', connectedCubesDescriptions);
      console.log('Tool cube descriptions:', toolCubeDescriptions);
      console.log('Prompt content:', promptContent);
      console.log('Plan:', plan);
      
      return response;
    },
    onCancel: () => {
      console.log('Cancel triggered');
    },
  });

  const handleConnectedCubesDescriptionsChange = (descriptions: UserDescriptions) => {
    setConnectedCubesDescriptions(prev => {
      // Only update if there are actual changes
      if (JSON.stringify(prev) !== JSON.stringify(descriptions)) {
        return descriptions;
      }
      return prev;
    });
  };

  const handleToolCubeDescriptionsChange = (descriptions: ToolCubeDescriptions) => {
    setToolCubeDescriptions(prev => {
      // Only update if there are actual changes
      if (JSON.stringify(prev) !== JSON.stringify(descriptions)) {
        return descriptions;
      }
      return prev;
    });
  };

  const handleToolCubeSelected = (toolCube: FlowCube) => {
    // Check if tool cube is already added
    if (!selectedToolCubes.find(t => t.id === toolCube.id)) {
      setSelectedToolCubes(prev => [...prev, toolCube]);
    }
  };

  const handleToolCubeDelete = (toolCubeId: string) => {
    // Find the tool cube to get its display name
    const toolCubeToDelete = selectedToolCubes.find(t => t.id === toolCubeId);
    if (toolCubeToDelete) {
      const toolCubeDisplayName = toolCubeToDelete.Name || toolCubeToDelete.UniqueName;
      
      // Remove tool cube from selectedToolCubes
      setSelectedToolCubes(prev => prev.filter(t => t.id !== toolCubeId));
      
      // Remove tool cube descriptions
      setToolCubeDescriptions(prev => {
        const newDescriptions = { ...prev };
        delete newDescriptions[toolCubeDisplayName];
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
          tools: selectedToolCubes,
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Navigation Bar */}
        <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs 
              value={currentPage} 
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{ 
                flexGrow: 1,
                '& .MuiTab-root': { 
                  minWidth: 120,
                  fontWeight: 'bold'
                }
              }}
            >
              <Tab label={t('tabs.cubes')} />
              <Tab label={t('tabs.toolCubes')} />
              <Tab label={t('tabs.prompt')} />
              <Tab label={t('tabs.plan')} />
            </Tabs>
            <Tooltip title={i18n.language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}>
              <IconButton 
                onClick={toggleLanguage}
                sx={{ 
                  color: 'white',
                  fontSize: '1.5rem',
                  mr: 2
                }}
              >
                {i18n.language === 'en' ? '🇮🇱' : '🇬🇧'}
              </IconButton>
            </Tooltip>
          </Box>
        </AppBar>

      {/* Page Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, pt: 2 }}>
        {receivedData ? (
          <Box sx={{ position: 'relative', width: '100%' }}>
            {/* Cubes Page */}
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
                <ConnectedCubesPage
                  linkedQueries={receivedData.linkedQueries}
                  connectedCubesDescriptions={connectedCubesDescriptions}
                  onConnectedCubesDescriptionsChange={handleConnectedCubesDescriptionsChange}
                />
              </Box>
            </Slide>

            {/* Tool Cubes Page */}
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
                <ToolCubesPage
                  selectedToolCubes={selectedToolCubes}
                  toolCubeDescriptions={toolCubeDescriptions}
                  onToolCubeSelected={handleToolCubeSelected}
                  onToolCubeDescriptionsChange={handleToolCubeDescriptionsChange}
                  onToolCubeDelete={handleToolCubeDelete}
                />
              </Box>
            </Slide>

            {/* Prompt Page */}
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
                <PromptPage
                  toolCubes={selectedToolCubes}
                  queries={receivedData.linkedQueries}
                  promptContent={promptContent}
                  onPromptChange={handlePromptChange}
                />
              </Box>
            </Slide>

            {/* Plan Page */}
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
                <PlanPage
                  plan={plan}
                  loading={planLoading}
                  onGeneratePlan={handleGeneratePlan}
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
              {t('app.waitingForData')}
            </Box>
          </Box>
        )}
      </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

