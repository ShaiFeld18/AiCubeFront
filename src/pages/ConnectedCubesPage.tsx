import { ItemList } from '../components/ItemList';
import { FlowCube, UserDescriptions } from '../flow/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ConnectedCubesPageProps {
  linkedQueries: FlowCube[];
  connectedCubesDescriptions: UserDescriptions;
  onConnectedCubesDescriptionsChange: (descriptions: UserDescriptions) => void;
  highlightItemId?: string;
}

export function ConnectedCubesPage({
  linkedQueries,
  connectedCubesDescriptions,
  onConnectedCubesDescriptionsChange,
  highlightItemId,
}: ConnectedCubesPageProps) {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Connected Cubes
      </Typography>
      <ItemList 
        items={linkedQueries}
        initialDescriptions={connectedCubesDescriptions}
        onDescriptionsChange={onConnectedCubesDescriptionsChange}
        emptyMessage="No connected cubes available"
        highlightItemId={highlightItemId}
      />
    </Box>
  );
}

