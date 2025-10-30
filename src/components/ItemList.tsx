import { useState, useEffect, useRef } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { FlowCube, UserDescriptions } from '../flow/types';

interface ItemListProps {
  items: FlowCube[];
  initialDescriptions?: UserDescriptions;
  onDescriptionsChange?: (descriptions: UserDescriptions) => void;
  emptyMessage?: string;
  highlightItemId?: string; // ID of item to scroll to and expand
}

interface InternalDescriptions {
  items: { [itemId: string]: string };
  parameters: { [key: string]: string }; // key format: "itemId-paramIndex"
}

export function ItemList({ 
  items, 
  initialDescriptions, 
  onDescriptionsChange,
  emptyMessage = 'No items available',
  highlightItemId
}: ItemListProps) {
  const [descriptions, setDescriptions] = useState<InternalDescriptions>({
    items: {},
    parameters: {}
  });
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  
  const previousExternalRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);
  const accordionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load initial descriptions
  useEffect(() => {
    if (initialDescriptions && isInitialLoadRef.current) {
      const internal: InternalDescriptions = { items: {}, parameters: {} };
      
      Object.entries(initialDescriptions).forEach(([itemDisplayName, data]) => {
        const item = items.find(i => (i.Name || i.UniqueName) === itemDisplayName);
        if (item) {
          internal.items[item.id] = data.queryDescription || '';
          
          if (item.Parameters) {
            item.Parameters.forEach((param, paramIndex) => {
              const paramDisplayName = param.DisplayName || param.Name;
              if (paramDisplayName && data.parameters?.[paramDisplayName]) {
                const key = `${item.id}-${paramIndex}`;
                internal.parameters[key] = data.parameters[paramDisplayName];
              }
            });
          }
        }
      });
      
      setDescriptions(internal);
      isInitialLoadRef.current = false;
    }
  }, [initialDescriptions, items]);

  // Convert internal format to external format and notify parent
  useEffect(() => {
    const external: UserDescriptions = {};
    
    items.forEach(item => {
      const itemDisplayName = item.Name || item.UniqueName;
      const itemDesc = descriptions.items[item.id] || '';
      const paramDescs: { [key: string]: string } = {};
      
      if (item.Parameters) {
        item.Parameters.forEach((param, paramIndex) => {
          const paramDisplayName = param.DisplayName || param.Name;
          const key = `${item.id}-${paramIndex}`;
          const paramDesc = descriptions.parameters[key] || '';
          
          if (paramDesc && paramDisplayName) {
            paramDescs[paramDisplayName] = paramDesc;
          }
        });
      }
      
      if (itemDesc || Object.keys(paramDescs).length > 0) {
        external[itemDisplayName] = {
          queryDescription: itemDesc,
          parameters: paramDescs
        };
      }
    });
    
    // Only call onDescriptionsChange if the data actually changed
    const externalString = JSON.stringify(external);
    if (onDescriptionsChange && externalString !== previousExternalRef.current) {
      previousExternalRef.current = externalString;
      onDescriptionsChange(external);
    }
  }, [descriptions, items, onDescriptionsChange]);

  const handleItemDescriptionChange = (itemId: string, value: string) => {
    setDescriptions(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: value
      }
    }));
  };

  const handleParameterDescriptionChange = (itemId: string, paramIndex: number, value: string) => {
    const key = `${itemId}-${paramIndex}`;
    setDescriptions(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  const handleAccordionChange = (itemId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? itemId : false);
  };

  // Handle highlighting and scrolling to a specific item
  useEffect(() => {
    if (highlightItemId && items.some(item => item.id === highlightItemId)) {
      // Expand the accordion
      setExpandedAccordion(highlightItemId);
      
      // Scroll to the item after a short delay to ensure accordion is expanded
      setTimeout(() => {
        const element = accordionRefs.current[highlightItemId];
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
          
          // Add a highlight effect
          element.style.backgroundColor = '#fff3cd';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 2000);
        }
      }, 100);
    }
  }, [highlightItemId, items]);

  if (!items || items.length === 0) {
    return (
      <Box sx={{ 
        padding: 3, 
        textAlign: 'center', 
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {items.map((item, index) => (
        <Accordion 
          key={item.id || index} 
          sx={{ mb: 1 }}
          expanded={expandedAccordion === item.id}
          onChange={handleAccordionChange(item.id)}
          ref={(el) => {
            accordionRefs.current[item.id] = el;
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`item-${index}-content`}
            id={`item-${index}-header`}
            sx={{ 
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
              transition: 'background-color 0.3s ease'
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography sx={{ fontWeight: 'bold' }}>
                {item.Name || item.UniqueName}
              </Typography>
              {item.Description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.Description}
                </Typography>
              )}
              {descriptions.items[item.id] && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 0.5, 
                    fontStyle: 'italic',
                    color: 'primary.main'
                  }}
                >
                  📝 {descriptions.items[item.id]}
                </Typography>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* User Description for Item */}
              <TextField
                label="Add Your Notes"
                placeholder="Add your own description or notes..."
                multiline
                rows={2}
                value={descriptions.items[item.id] || ''}
                onChange={(e) => handleItemDescriptionChange(item.id, e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ backgroundColor: 'white' }}
              />

              {/* Parameters */}
              {item.Parameters && item.Parameters.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {item.Parameters.map((param, paramIndex) => {
                    const paramKey = `${item.id}-${paramIndex}`;
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
                          value={descriptions.parameters[paramKey] || ''}
                          onChange={(e) => handleParameterDescriptionChange(item.id, paramIndex, e.target.value)}
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

