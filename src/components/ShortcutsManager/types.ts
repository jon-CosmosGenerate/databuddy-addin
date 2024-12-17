// src/components/ShortcutsManager/types.ts
export interface Shortcut {
    id: string;
    action: string;
    key: string;
    description: string;
    native: boolean;
    category?: string;
    lastModified?: Date;
  }
  
  export interface ShortcutFormProps {
    shortcut?: Shortcut;
    onSave: (shortcut: Omit<Shortcut, 'id' | 'native'>) => void;
    onClose: () => void;
  }