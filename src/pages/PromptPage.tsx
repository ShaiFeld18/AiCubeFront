import { useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { ReferenceMenu } from '../components/ReferenceMenu';
import { FlowCube, Reference } from '../flow/types';

interface PromptPageProps {
  toolCubes: FlowCube[];
  queries: FlowCube[];
  promptContent: string;
  onPromptChange: (content: string) => void;
}

export function PromptPage({
  toolCubes,
  queries,
  promptContent,
  onPromptChange,
}: PromptPageProps) {
  const { t } = useTranslation();
  const quillRef = useRef<ReactQuill>(null);
  const draggedReferenceRef = useRef<Reference | null>(null);

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'direction': 'rtl' }],
      ['clean']
    ],
  }), []);

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'direction'
  ];

  // Generate plain text marker for reference: [[toolCube/connectedCube:name:parameter]]
  const createReferenceMarker = (reference: Reference): string => {
    const typePrefix = reference.type === 'parameter' 
      ? (reference.itemId.startsWith('tool-') ? 'toolCube' : 'connectedCube')
      : reference.type === 'tool' ? 'toolCube' : 'connectedCube';
    
    return reference.parameterName
      ? `[[${typePrefix}:${reference.itemName}:${reference.parameterName}]]`
      : `[[${typePrefix}:${reference.itemName}]]`;
  };

  // Add drop handler to Quill editor for drag and drop
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const editorElement = quill.root;

    const handleEditorDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const draggedRef = draggedReferenceRef.current;
      if (!draggedRef) {
        return;
      }

      // Create plain text marker in format: [[toolCube/connectedCube:name:parameter]]
      const marker = createReferenceMarker(draggedRef);
      
      // Insert marker text
      const selection = quill.getSelection();
      const insertIndex = selection ? selection.index : quill.getLength();
      
      quill.insertText(insertIndex, ` ${marker} `, 'user');
      quill.setSelection(insertIndex + marker.length + 2, 0);

      draggedReferenceRef.current = null;
    };

    const handleEditorDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    editorElement.addEventListener('drop', handleEditorDrop);
    editorElement.addEventListener('dragover', handleEditorDragOver);

    return () => {
      editorElement.removeEventListener('drop', handleEditorDrop);
      editorElement.removeEventListener('dragover', handleEditorDragOver);
    };
  }, []);

  const handleContentChange = (content: string) => {
    onPromptChange(content);
  };

  const handleDragStart = (reference: Reference) => {
    draggedReferenceRef.current = reference;
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('prompt.title')}
      </Typography>

      <Grid container spacing={2}>
        {/* Left sidebar - Reference Menu */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={2}
            sx={{
              height: '600px',
              overflowY: 'auto',
              bgcolor: 'background.default'
            }}
          >
            <ReferenceMenu
              toolCubes={toolCubes}
              queries={queries}
              onDragStart={handleDragStart}
            />
          </Paper>
        </Grid>

        {/* Right content - Editor */}
        <Grid item xs={12} md={9}>
          <Paper
            elevation={2}
            sx={{ minHeight: '500px' }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('prompt.instructionText')}
              </Typography>
            </Box>
            <Box sx={{ 
              '& .ql-container': {
                minHeight: '450px',
                fontSize: '16px'
              },
              '& .ql-editor': {
                minHeight: '450px'
              },
              '& .ql-editor.ql-blank::before': {
                left: 'inherit',
                right: 'inherit'
              },
              '& .ql-editor[dir="rtl"]': {
                textAlign: 'right',
                direction: 'rtl'
              },
              '& .ql-editor[dir="ltr"]': {
                textAlign: 'left',
                direction: 'ltr'
              }
            }}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={promptContent}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder={t('prompt.placeholder')}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

