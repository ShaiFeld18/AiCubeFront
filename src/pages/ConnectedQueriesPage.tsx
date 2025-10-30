import { ItemList } from '../components/ItemList';
import { FlowCube, UserDescriptions } from '../flow/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ConnectedQueriesPageProps {
  linkedQueries: FlowCube[];
  connectedQueriesDescriptions: UserDescriptions;
  onConnectedQueriesDescriptionsChange: (descriptions: UserDescriptions) => void;
}

export function ConnectedQueriesPage({
  linkedQueries,
  connectedQueriesDescriptions,
  onConnectedQueriesDescriptionsChange,
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
      />
    </Box>
  );
}

