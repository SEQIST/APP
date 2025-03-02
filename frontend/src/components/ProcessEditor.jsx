import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box, Grid, TextField, Typography } from '@mui/material';

const ProcessEditor = ({ process, processGroups, roles, onChange, onQuillChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: process.processPurpose,
    onUpdate: ({ editor }) => onQuillChange(editor.getHTML()),
  });

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={4}>
        <TextField
          label="Name"
          name="name"
          value={process.name}
          onChange={onChange}
          variant="outlined"
          size="small"
          sx={{ mr: 2, fontSize: '0.8em' }}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Abkürzung"
          name="abbreviation"
          value={process.abbreviation}
          onChange={onChange}
          variant="outlined"
          size="small"
          sx={{ fontSize: '0.8em' }}
        />
      </Grid>
      <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.7em', color: '#666' }}>
        <Typography sx={{ mr: 2 }}>
          Gruppe: {processGroups.find(g => g._id.toString() === process.processGroup)?.name || 'Keine'}
        </Typography>
        <Typography>
          Eigentümer: {roles.find(r => r._id.toString() === process.owner)?.name || 'Kein Eigentümer'}
        </Typography>
      </Grid>
      <Grid item xs={12} sx={{ mt: 2 }}>
        <EditorContent editor={editor} style={{ fontSize: '0.9em' }} />
      </Grid>
    </Grid>
  );
};

export default ProcessEditor;