import { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { FlowCube } from '../flow/types';
import { API_CONFIG } from '../config';

interface ToolSelectorProps {
  onToolSelected: (tool: FlowCube) => void;
  selectedToolNames: string[];
}

export function ToolSelector({ onToolSelected, selectedToolNames }: ToolSelectorProps) {
  const [toolNames, setToolNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // Fetch list of tools on mount
  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(API_CONFIG.TOOLS_LIST_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setToolNames(data);
        } else {
          throw new Error('Invalid response format: expected array of strings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tools');
        console.error('Error fetching tools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const handleToolChange = async (event: SelectChangeEvent) => {
    const toolName = event.target.value;
    setSelectedTool(toolName);
    
    if (!toolName) return;

    setFetchingMetadata(true);
    setError(null);

    try {
      const response = await fetch(API_CONFIG.TOOL_METADATA_URL(toolName));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const toolMetadata: FlowCube = await response.json();
      
      // Validate the response has required fields
      if (!toolMetadata.id || !toolMetadata.Name) {
        throw new Error('Invalid tool metadata format');
      }
      
      onToolSelected(toolMetadata);
      setSelectedTool(''); // Reset selection after adding
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tool metadata');
      console.error('Error fetching tool metadata:', err);
    } finally {
      setFetchingMetadata(false);
    }
  };

  // Filter out already selected tools
  const availableTools = toolNames.filter(name => !selectedToolNames.includes(name));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: 2 }}>
        <CircularProgress size={24} />
        <span>Loading tools...</span>
      </Box>
    );
  }

  if (error && toolNames.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading tools: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="tool-select-label">Select a Tool to Add</InputLabel>
        <Select
          labelId="tool-select-label"
          id="tool-select"
          value={selectedTool}
          label="Select a Tool to Add"
          onChange={handleToolChange}
          disabled={fetchingMetadata || availableTools.length === 0}
        >
          {availableTools.length === 0 ? (
            <MenuItem value="" disabled>
              All tools have been added
            </MenuItem>
          ) : (
            availableTools.map((toolName) => (
              <MenuItem key={toolName} value={toolName}>
                {toolName}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
      
      {fetchingMetadata && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <CircularProgress size={16} />
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            Loading tool metadata...
          </span>
        </Box>
      )}
      
      {error && toolNames.length > 0 && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

