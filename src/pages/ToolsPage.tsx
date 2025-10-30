import { ToolSelector } from '../components/ToolSelector';
import { ItemList } from '../components/ItemList';
import { FlowCube, ToolDescriptions } from '../flow/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ToolsPageProps {
  selectedTools: FlowCube[];
  toolDescriptions: ToolDescriptions;
  onToolSelected: (tool: FlowCube) => void;
  onToolDescriptionsChange: (descriptions: ToolDescriptions) => void;
  highlightItemId?: string;
}

export function ToolsPage({
  selectedTools,
  toolDescriptions,
  onToolSelected,
  onToolDescriptionsChange,
  highlightItemId,
}: ToolsPageProps) {
  const selectedToolNames = selectedTools.map(t => t.Name || t.UniqueName);

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tools
      </Typography>
      <ToolSelector 
        onToolSelected={onToolSelected}
        selectedToolNames={selectedToolNames}
      />
      <ItemList 
        items={selectedTools}
        initialDescriptions={toolDescriptions}
        onDescriptionsChange={onToolDescriptionsChange}
        emptyMessage="No tools selected. Choose a tool from the dropdown above."
        highlightItemId={highlightItemId}
      />
    </Box>
  );
}

