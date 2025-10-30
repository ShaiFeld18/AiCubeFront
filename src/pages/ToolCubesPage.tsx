import { ToolCubeSelector } from '../components/ToolCubeSelector';
import { ItemList } from '../components/ItemList';
import { FlowCube, ToolCubeDescriptions } from '../flow/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ToolCubesPageProps {
  selectedToolCubes: FlowCube[];
  toolCubeDescriptions: ToolCubeDescriptions;
  onToolCubeSelected: (tool: FlowCube) => void;
  onToolCubeDescriptionsChange: (descriptions: ToolCubeDescriptions) => void;
  onToolCubeDelete: (toolId: string) => void;
  highlightItemId?: string;
}

export function ToolCubesPage({
  selectedToolCubes,
  toolCubeDescriptions,
  onToolCubeSelected,
  onToolCubeDescriptionsChange,
  onToolCubeDelete,
  highlightItemId,
}: ToolCubesPageProps) {
  const selectedToolCubeNames = selectedToolCubes.map(t => t.Name || t.UniqueName);

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tool Cubes
      </Typography>
      <ToolCubeSelector 
        onToolCubeSelected={onToolCubeSelected}
        selectedToolCubeNames={selectedToolCubeNames}
      />
      <ItemList 
        items={selectedToolCubes}
        initialDescriptions={toolCubeDescriptions}
        onDescriptionsChange={onToolCubeDescriptionsChange}
        onDelete={onToolCubeDelete}
        emptyMessage="No tool cubes selected. Choose a tool cube from the dropdown above."
        highlightItemId={highlightItemId}
      />
    </Box>
  );
}

