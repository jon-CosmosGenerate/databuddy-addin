import { useState } from 'react';
import {
  Input,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardHeader,
  Label,
  makeStyles,
  tokens,
  Text,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Select,
  Textarea,
} from '@fluentui/react-components';
import { Add24Regular, Edit24Regular, Delete24Regular, Search24Regular } from '@fluentui/react-icons';
import React from 'react';

// Types
interface Shortcut {
  id: string;
  action: string;
  key: string;
  description: string;
  native: boolean;
  category?: string;
  lastModified?: Date;
}

// Styles
const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  searchBar: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
  },
  shortcutCard: {
    marginBottom: tokens.spacingVerticalS,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalM,
  },
  keyCombo: {
    fontFamily: 'monospace',
    backgroundColor: tokens.colorNeutralBackground3,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
  },
  metadata: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
});

// Default shortcuts data
const defaultShortcuts: Shortcut[] = [
  {
    id: '1',
    action: 'Save',
    key: 'Ctrl+S',
    description: 'Saves the current document.',
    native: true,
    category: 'File',
    lastModified: new Date()
  },
  {
    id: '2',
    action: 'Open',
    key: 'Ctrl+O',
    description: 'Opens a file.',
    native: true,
    category: 'File',
    lastModified: new Date()
  }
];

// ShortcutForm Component
const ShortcutForm: React.FC<{
  shortcut?: Shortcut;
  onSave: (shortcut: Omit<Shortcut, 'id' | 'native'>) => void;
  onClose: () => void;
}> = ({ shortcut, onSave, onClose }) => {
  const styles = useStyles();
  const [keyRecording, setKeyRecording] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    onSave({
      action: formData.get('action') as string,
      key: formData.get('key') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      lastModified: new Date(),
    });
  };

  const handleKeyCapture = (event: React.KeyboardEvent) => {
    if (!keyRecording) return;
    
    event.preventDefault();
    const key = [];
    if (event.ctrlKey) key.push('Ctrl');
    if (event.shiftKey) key.push('Shift');
    if (event.altKey) key.push('Alt');
    if (event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt') {
      key.push(event.key.toUpperCase());
    }
    
    const keyCombo = key.join('+');
    (event.currentTarget as HTMLInputElement).value = keyCombo;
    setKeyRecording(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formField}>
        <Label htmlFor="action">Action Name</Label>
        <Input
          id="action"
          name="action"
          defaultValue={shortcut?.action}
          required
        />
      </div>

      <div className={styles.formField}>
        <Label htmlFor="key">Keyboard Shortcut</Label>
        <Input
          id="key"
          name="key"
          defaultValue={shortcut?.key}
          onFocus={() => setKeyRecording(true)}
          onKeyDown={handleKeyCapture}
          placeholder="Click to record shortcut"
          required
        />
      </div>

      <div className={styles.formField}>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          name="category"
          defaultValue={shortcut?.category}
        >
          <option value="File">File</option>
          <option value="Edit">Edit</option>
          <option value="View">View</option>
          <option value="Custom">Custom</option>
        </Select>
      </div>

      <div className={styles.formField}>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={shortcut?.description}
          required
        />
      </div>

      <DialogActions>
        <Button appearance="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" appearance="primary">Save</Button>
      </DialogActions>
    </form>
  );
};

// Main ShortcutManager Component
export const ShortcutManager: React.FC = () => {
  const styles = useStyles();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(defaultShortcuts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShortcut, setSelectedShortcut] = useState<Shortcut | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSaveShortcut = (shortcutData: Omit<Shortcut, 'id' | 'native'>) => {
    if (selectedShortcut) {
      setShortcuts(shortcuts.map(s => 
        s.id === selectedShortcut.id 
          ? { ...s, ...shortcutData }
          : s
      ));
    } else {
      setShortcuts([...shortcuts, {
        ...shortcutData,
        id: crypto.randomUUID(),
        native: false,
      }]);
    }
    setIsDialogOpen(false);
    setSelectedShortcut(null);
  };

  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text as="h1" size={800}>Keyboard Shortcuts</Text>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => {
            setSelectedShortcut(null);
            setIsDialogOpen(true);
          }}
        >
          Add Shortcut
        </Button>
      </div>

      <div className={styles.searchBar}>
        <Search24Regular />
        <Input
          placeholder="Search shortcuts..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Action</TableHeaderCell>
            <TableHeaderCell>Shortcut</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredShortcuts.map((shortcut) => (
            <TableRow key={shortcut.id}>
              <TableCell>{shortcut.action}</TableCell>
              <TableCell>
                <code className={styles.keyCombo}>{shortcut.key}</code>
              </TableCell>
              <TableCell>{shortcut.category}</TableCell>
              <TableCell>{shortcut.description}</TableCell>
              <TableCell>
                {!shortcut.native && (
                  <>
                    <Button
                      icon={<Edit24Regular />}
                      appearance="subtle"
                      onClick={() => {
                        setSelectedShortcut(shortcut);
                        setIsDialogOpen(true);
                      }}
                    />
                    <Button
                      icon={<Delete24Regular />}
                      appearance="subtle"
                      onClick={() => {
                        setShortcuts(shortcuts.filter(s => s.id !== shortcut.id));
                      }}
                    />
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={(_, { open }) => setIsDialogOpen(open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{selectedShortcut ? 'Edit Shortcut' : 'Add New Shortcut'}</DialogTitle>
            <DialogContent>
              <ShortcutForm
                shortcut={selectedShortcut || undefined}
                onSave={handleSaveShortcut}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};