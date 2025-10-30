import { ItemList } from '../components/ItemList';
import { FlowCube, UserDescriptions } from '../flow/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ConnectedQueriesPageProps {
  linkedQueries: FlowCube[];
  connectedQueriesDescriptions: UserDescriptions;
  onConnectedQueriesDescriptionsChange: (descriptions: UserDescriptions) => void;
  highlightItemId?: string;
}

export function ConnectedQueriesPage({
  linkedQueries,
  connectedQueriesDescriptions,
  onConnectedQueriesDescriptionsChange,
  highlightItemId,
}: ConnectedQueriesPageProps) {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Connected Queries
      </Typography>
      <ItemList 
        items={linkedQueries}
        initialDescriptions={connectedQueriesDescriptions}
        onDescriptionsChange={onConnectedQueriesDescriptionsChange}
        emptyMessage="No connected queries available"
        highlightItemId={highlightItemId}
      />
    </Box>
  );
}

