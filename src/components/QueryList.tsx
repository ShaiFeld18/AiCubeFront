import { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { FlowCube, UserDescriptions } from '../flow/types';

interface QueryListProps {
  queries: FlowCube[];
  initialUserDescriptions?: UserDescriptions;
  onUserDescriptionsChange?: (descriptions: UserDescriptions) => void;
}

interface InternalUserDescriptions {
  queries: { [queryId: string]: string };
  parameters: { [key: string]: string }; // key format: "queryId-paramIndex"
}

export function QueryList({ queries, initialUserDescriptions, onUserDescriptionsChange }: QueryListProps) {
  const [userDescriptions, setUserDescriptions] = useState<InternalUserDescriptions>({
    queries: {},
    parameters: {}
  });

  // Load initial user descriptions
  useEffect(() => {
    if (initialUserDescriptions) {
      const internal: InternalUserDescriptions = { queries: {}, parameters: {} };
      
      Object.entries(initialUserDescriptions).forEach(([queryDisplayName, data]) => {
        const query = queries.find(q => (q.Name || q.UniqueName) === queryDisplayName);
        if (query) {
          internal.queries[query.id] = data.queryDescription || '';
          
          if (query.Parameters) {
            query.Parameters.forEach((param, paramIndex) => {
              const paramDisplayName = param.DisplayName || param.Name;
              if (paramDisplayName && data.parameters?.[paramDisplayName]) {
                const key = `${query.id}-${paramIndex}`;
                internal.parameters[key] = data.parameters[paramDisplayName];
              }
            });
          }
        }
      });
      
      setUserDescriptions(internal);
    }
  }, [initialUserDescriptions, queries]);

  // Convert internal format to external format and notify parent
  useEffect(() => {
    const external: UserDescriptions = {};
    
    queries.forEach(query => {
      const queryDisplayName = query.Name || query.UniqueName;
      const queryDesc = userDescriptions.queries[query.id] || '';
      const paramDescs: { [key: string]: string } = {};
      
      if (query.Parameters) {
        query.Parameters.forEach((param, paramIndex) => {
          const paramDisplayName = param.DisplayName || param.Name;
          const key = `${query.id}-${paramIndex}`;
          const paramDesc = userDescriptions.parameters[key] || '';
          
          if (paramDesc && paramDisplayName) {
            paramDescs[paramDisplayName] = paramDesc;
          }
        });
      }
      
      if (queryDesc || Object.keys(paramDescs).length > 0) {
        external[queryDisplayName] = {
          queryDescription: queryDesc,
          parameters: paramDescs
        };
      }
    });
    
    if (onUserDescriptionsChange) {
      onUserDescriptionsChange(external);
    }
  }, [userDescriptions, queries, onUserDescriptionsChange]);

  const handleQueryDescriptionChange = (queryId: string, value: string) => {
    setUserDescriptions(prev => ({
      ...prev,
      queries: {
        ...prev.queries,
        [queryId]: value
      }
    }));
  };

  const handleParameterDescriptionChange = (queryId: string, paramIndex: number, value: string) => {
    const key = `${queryId}-${paramIndex}`;
    setUserDescriptions(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  if (!queries || queries.length === 0) {
    return (
      <Box sx={{ 
        padding: 3, 
        textAlign: 'center', 
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography color="text.secondary">
          No linked queries available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {queries.map((query, index) => (
        <Accordion key={query.id || index} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`query-${index}-content`}
            id={`query-${index}-header`}
            sx={{ 
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              }
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography sx={{ fontWeight: 'bold' }}>
                {query.Name || query.UniqueName}
              </Typography>
              {query.Description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {query.Description}
                </Typography>
              )}
              {userDescriptions.queries[query.id] && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 0.5, 
                    fontStyle: 'italic',
                    color: 'primary.main'
                  }}
                >
                  📝 {userDescriptions.queries[query.id]}
                </Typography>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* User Description for Query */}
              <TextField
                label="Add Your Notes"
                placeholder="Add your own description or notes about this query..."
                multiline
                rows={2}
                value={userDescriptions.queries[query.id] || ''}
                onChange={(e) => handleQueryDescriptionChange(query.id, e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ backgroundColor: 'white' }}
              />

              {/* Parameters */}
              {query.Parameters && query.Parameters.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {query.Parameters.map((param, paramIndex) => {
                    const paramKey = `${query.id}-${paramIndex}`;
                    return (
                      <Box 
                        key={paramIndex}
                        sx={{ 
                          padding: 2, 
                          backgroundColor: '#fafafa',
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 500 }}>
                            {param.DisplayName || param.Name}
                          </Typography>
                          <Chip 
                            label={param.Type} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        {param.Description && (
                          <Typography variant="body2" color="text.secondary">
                            {param.Description}
                          </Typography>
                        )}
                        <TextField
                          label="Add Your Notes"
                          placeholder="Add your own notes about this parameter..."
                          multiline
                          rows={1}
                          value={userDescriptions.parameters[paramKey] || ''}
                          onChange={(e) => handleParameterDescriptionChange(query.id, paramIndex, e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ backgroundColor: 'white' }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No parameters available
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

