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

interface ToolCubeSelectorProps {
  onToolCubeSelected: (tool: FlowCube) => void;
  selectedToolCubeNames: string[];
}

export function ToolCubeSelector({ onToolCubeSelected, selectedToolCubeNames }: ToolCubeSelectorProps) {
  const [toolCubeNames, setToolCubeNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedToolCube, setSelectedToolCube] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // Fetch list of tool cubes on mount
  useEffect(() => {
    const fetchToolCubes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(API_CONFIG.TOOLS_LIST_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setToolCubeNames(data);
        } else {
          throw new Error('Invalid response format: expected array of strings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tool cubes');
        console.error('Error fetching tool cubes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchToolCubes();
  }, []);

  const handleToolCubeChange = async (event: SelectChangeEvent) => {
    const toolCubeName = event.target.value;
    setSelectedToolCube(toolCubeName);
    
    if (!toolCubeName) return;

    setFetchingMetadata(true);
    setError(null);

    try {
      const response = await fetch(API_CONFIG.TOOL_METADATA_URL(toolCubeName));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const toolCubeMetadata: FlowCube = await response.json();
      
      // Validate the response has required fields
      if (!toolCubeMetadata.id || !toolCubeMetadata.Name) {
        throw new Error('Invalid tool cube metadata format');
      }
      
      onToolCubeSelected(toolCubeMetadata);
      setSelectedToolCube(''); // Reset selection after adding
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tool cube metadata');
      console.error('Error fetching tool cube metadata:', err);
    } finally {
      setFetchingMetadata(false);
    }
  };

  // Filter out already selected tool cubes
  const availableToolCubes = toolCubeNames.filter(name => !selectedToolCubeNames.includes(name));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: 2 }}>
        <CircularProgress size={24} />
        <span>Loading tool cubes...</span>
      </Box>
    );
  }

  if (error && toolCubeNames.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading tool cubes: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="tool-cube-select-label">Select a Tool Cube to Add</InputLabel>
        <Select
          labelId="tool-cube-select-label"
          id="tool-cube-select"
          value={selectedToolCube}
          label="Select a Tool Cube to Add"
          onChange={handleToolCubeChange}
          disabled={fetchingMetadata || availableToolCubes.length === 0}
        >
          {availableToolCubes.length === 0 ? (
            <MenuItem value="" disabled>
              All tool cubes have been added
            </MenuItem>
          ) : (
            availableToolCubes.map((toolCubeName) => (
              <MenuItem key={toolCubeName} value={toolCubeName}>
                {toolCubeName}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
      
      {fetchingMetadata && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <CircularProgress size={16} />
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            Loading tool cube metadata...
          </span>
        </Box>
      )}
      
      {error && toolCubeNames.length > 0 && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

