import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Reference } from '../flow/types';

interface ReferenceChipProps {
  reference: Reference;
  onClick?: (reference: Reference) => void;
  onDelete?: (reference: Reference) => void;
  size?: 'small' | 'medium';
}

export function ReferenceChip({ reference, onClick, onDelete, size = 'small' }: ReferenceChipProps) {
  const getLabel = () => {
    if (reference.type === 'parameter' && reference.parameterName) {
      return `${reference.itemName}.${reference.parameterName}`;
    }
    return reference.itemName;
  };

  const getColor = () => {
    switch (reference.type) {
      case 'tool':
        return 'primary';
      case 'query':
        return 'secondary';
      case 'parameter':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTooltip = () => {
    if (reference.type === 'parameter') {
      return `Parameter: ${reference.parameterName} in ${reference.itemName}`;
    }
    return `${reference.type === 'tool' ? 'Tool' : 'Query'}: ${reference.itemName}`;
  };

  return (
    <Tooltip title={getTooltip()} arrow>
      <Chip
        label={getLabel()}
        color={getColor()}
        size={size}
        onClick={() => onClick?.(reference)}
        onDelete={onDelete ? () => onDelete(reference) : undefined}
        sx={{
          margin: '2px',
          cursor: onClick ? 'pointer' : 'default',
          fontWeight: 'bold',
          '& .MuiChip-label': {
            px: 1.5
          }
        }}
      />
    </Tooltip>
  );
}

