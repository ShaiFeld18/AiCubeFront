import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('connectedCubes.title')}
      </Typography>
      <ItemList 
        items={linkedQueries}
        initialDescriptions={connectedCubesDescriptions}
        onDescriptionsChange={onConnectedCubesDescriptionsChange}
        emptyMessage={t('itemList.emptyMessage')}
        highlightItemId={highlightItemId}
      />
    </Box>
  );
}

