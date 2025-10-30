import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';

interface PlanPageProps {
  plan: string;
  loading: boolean;
  onGeneratePlan: () => void;
}

export function PlanPage({ plan, loading, onGeneratePlan }: PlanPageProps) {
  const [error, setError] = useState<string>('');

  const handleSend = async () => {
    setError('');
    try {
      await onGeneratePlan();
    } catch (err) {
      setError('Failed to generate plan. Please try again.');
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Plan
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Send'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && !plan && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
            Generating plan...
          </Typography>
        </Box>
      )}

      {!loading && !plan && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
          <Typography variant="body1" color="text.secondary">
            Click "Send" to generate an AI agent plan based on your selected tools, queries, and prompt.
          </Typography>
        </Paper>
      )}

      {plan && (
        <Paper elevation={2} sx={{ p: 4 }}>
          <Box
            sx={{
              '& h1': {
                fontSize: '2rem',
                fontWeight: 'bold',
                mb: 2,
                mt: 3,
                '&:first-of-type': { mt: 0 }
              },
              '& h2': {
                fontSize: '1.5rem',
                fontWeight: 'bold',
                mb: 1.5,
                mt: 3,
                color: 'primary.main'
              },
              '& h3': {
                fontSize: '1.25rem',
                fontWeight: 'bold',
                mb: 1,
                mt: 2
              },
              '& p': {
                mb: 2,
                lineHeight: 1.7
              },
              '& ul, & ol': {
                mb: 2,
                pl: 3
              },
              '& li': {
                mb: 1
              },
              '& code': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9em'
              },
              '& pre': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                padding: 2,
                borderRadius: 1,
                overflow: 'auto',
                mb: 2
              },
              '& pre code': {
                backgroundColor: 'transparent',
                padding: 0
              },
              '& strong': {
                fontWeight: 600
              },
              '& em': {
                fontStyle: 'italic'
              }
            }}
          >
            <ReactMarkdown>{plan}</ReactMarkdown>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

