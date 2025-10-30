import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { FlowCube, Reference } from '../flow/types';

interface ReferenceMenuProps {
  toolCubes: FlowCube[];
  queries: FlowCube[];
  onDragStart: (reference: Reference) => void;
}

export function ReferenceMenu({ toolCubes, queries, onDragStart }: ReferenceMenuProps) {
  const { t } = useTranslation();
  const [expandedToolCube, setExpandedToolCube] = useState<string | false>(false);
  const [expandedQuery, setExpandedQuery] = useState<string | false>(false);

  const handleToolCubeChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedToolCube(isExpanded ? panel : false);
  };

  const handleQueryChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedQuery(isExpanded ? panel : false);
  };

  // Create a styled drag preview image for references
  const createStyledDragPreview = (reference: Reference, label: string): HTMLElement => {
    const dragPreview = document.createElement('div');
    
    // Define color schemes based on reference type
    const colorMap: Record<string, string> = {
      tool: '#1976d2',
      query: '#9c27b0',
      parameter: '#2e7d32'
    };
    
    const bgColorMap: Record<string, string> = {
      tool: '#e3f2fd',
      query: '#f3e5f5',
      parameter: '#e8f5e9'
    };
    
    const color = colorMap[reference.type] || '#666';
    const bgColor = bgColorMap[reference.type] || '#f5f5f5';
    
    // Style the drag preview to match the final chip appearance
    dragPreview.style.cssText = `
      display: inline-block;
      padding: 4px 12px;
      background-color: ${bgColor};
      color: ${color};
      border: 1px solid ${color};
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
      cursor: grabbing;
      user-select: none;
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 9999;
    `;
    dragPreview.textContent = label;
    
    return dragPreview;
  };

  const createDraggableItem = (
    item: FlowCube,
    type: 'tool' | 'query',
    param?: { index: number; name: string; displayName: string }
  ) => {
    const reference: Reference = {
      id: `${type}-${item.id}${param ? `-param-${param.index}` : ''}`,
      type: param ? 'parameter' : type,
      itemId: item.id,
      itemName: item.Name || item.UniqueName,
      parameterId: param ? `${param.index}` : undefined,
      parameterName: param ? param.displayName || param.name : undefined,
    };

    const label = param 
      ? `${item.Name || item.UniqueName}.${param.displayName || param.name}`
      : item.Name || item.UniqueName;

    return (
      <ListItem
        key={reference.id}
        disablePadding
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('application/json', JSON.stringify(reference));
          
          // Create and set styled drag preview
          const dragPreview = createStyledDragPreview(reference, label);
          document.body.appendChild(dragPreview);
          
          // Set the custom drag image
          e.dataTransfer.setDragImage(dragPreview, 0, 0);
          
          // Clean up the preview element after a short delay
          setTimeout(() => {
            document.body.removeChild(dragPreview);
          }, 0);
          
          onDragStart(reference);
        }}
        sx={{
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          },
          pl: param ? 4 : 0
        }}
      >
        <ListItemButton>
          <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
          <ListItemText
            primary={param ? param.displayName || param.name : item.Name || item.UniqueName}
            primaryTypographyProps={{
              fontSize: param ? '0.875rem' : '0.95rem',
              fontWeight: param ? 'normal' : 'medium'
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ width: '100%', maxHeight: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
        {t('referenceMenu.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        {t('referenceMenu.dragInstruction')}
      </Typography>

      {/* Tool Cubes Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          {t('referenceMenu.toolCubes')}
        </Typography>
        {toolCubes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {t('referenceMenu.noToolCubes')}
          </Typography>
        ) : (
          toolCubes.map((toolCube) => (
            <Accordion
              key={toolCube.id}
              expanded={expandedToolCube === toolCube.id}
              onChange={handleToolCubeChange(toolCube.id)}
              sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {toolCube.Name || toolCube.UniqueName}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense disablePadding>
                  {createDraggableItem(toolCube, 'tool')}
                  {toolCube.Parameters && toolCube.Parameters.length > 0 && (
                    <>
                      <ListItem sx={{ pl: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('referenceMenu.parameters')}
                        </Typography>
                      </ListItem>
                      {toolCube.Parameters.map((param, idx) => 
                        createDraggableItem(toolCube, 'tool', {
                          index: idx,
                          name: param.Name || '',
                          displayName: param.DisplayName || param.Name || ''
                        })
                      )}
                    </>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Connected Cubes Section */}
      <Box>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
          {t('referenceMenu.connectedCubes')}
        </Typography>
        {queries.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {t('referenceMenu.noConnectedCubes')}
          </Typography>
        ) : (
          queries.map((query) => (
            <Accordion
              key={query.id}
              expanded={expandedQuery === query.id}
              onChange={handleQueryChange(query.id)}
              sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {query.Name || query.UniqueName}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense disablePadding>
                  {createDraggableItem(query, 'query')}
                  {query.Parameters && query.Parameters.length > 0 && (
                    <>
                      <ListItem sx={{ pl: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('referenceMenu.parameters')}
                        </Typography>
                      </ListItem>
                      {query.Parameters.map((param, idx) => 
                        createDraggableItem(query, 'query', {
                          index: idx,
                          name: param.Name || '',
                          displayName: param.DisplayName || param.Name || ''
                        })
                      )}
                    </>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );
}

