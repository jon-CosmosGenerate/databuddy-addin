import React, { useState, useCallback } from 'react';
import {
  Input,
  Button,
  Label,
  Textarea,
  DialogActions,
  TabList,
  Tab,
  makeStyles,
  tokens,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { CustomFunction, FunctionParameter } from '../../services/function/FunctionService';
import { useError } from '../../errors';
import { AppError } from '@/errors';

const useStyles = makeStyles({
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  parameterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  parameter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
  },
  codeEditor: {
    fontFamily: 'monospace',
    minHeight: '200px',
  },
});

interface FunctionFormProps {
  function?: CustomFunction;
  onSave: (func: Omit<CustomFunction, 'id'>) => Promise<void>;
  onClose: () => void;
}

export const FunctionForm: React.FC<FunctionFormProps> = ({ 
  function: existingFunction, 
  onSave, 
  onClose 
}) => {
  const styles = useStyles();
  const { setError } = useError();
  const [currentTab, setCurrentTab] = useState('basic');
  const [parameters, setParameters] = useState<FunctionParameter[]>(
    existingFunction?.parameters || []
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (formData: FormData): boolean => {
    const errors: string[] = [];
    
    if (!formData.get('name')) {
      errors.push('Function name is required');
    }
    if (!formData.get('implementation')) {
      errors.push('Implementation is required');
    }
    if (parameters.length === 0) {
      errors.push('At least one parameter is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    try {
      const newFunction: Omit<CustomFunction, 'id'> = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        implementation: formData.get('implementation') as string,
        parameters,
        returnType: formData.get('returnType') as string,
        examples: [],
      };

      await onSave(newFunction);
      onClose();
    } catch (error) {
      setError(new AppError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        'FUNCTION_ERROR',
        'high',
        'validation',
        error
      ));
    }
  }, [parameters, onSave, onClose, setError]);

  const addParameter = useCallback(() => {
    setParameters([
      ...parameters,
      { name: '', type: 'string', description: '' }
    ]);
  }, [parameters]);

  const removeParameter = useCallback((index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  }, [parameters]);

  const updateParameter = useCallback((index: number, updates: Partial<FunctionParameter>) => {
    setParameters(parameters.map((param, i) => 
      i === index ? { ...param, ...updates } : param
    ));
  }, [parameters]);

  return (
    <form onSubmit={handleSubmit}>
      {validationErrors.length > 0 && (
        <MessageBar intent="error">
          <MessageBarBody>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </MessageBarBody>
        </MessageBar>
      )}

      <TabList 
        selectedValue={currentTab} 
        onTabSelect={(_, data) => setCurrentTab(data.value as string)}
      >
        <Tab value="basic">Basic Info</Tab>
        <Tab value="parameters">Parameters</Tab>
        <Tab value="implementation">Implementation</Tab>
      </TabList>

      {currentTab === 'basic' && (
        <div className={styles.formSection}>
          <div>
            <Label htmlFor="name">Function Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={existingFunction?.name}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={existingFunction?.description}
              required
            />
          </div>
          <div>
            <Label htmlFor="returnType">Return Type</Label>
            <Input
              id="returnType"
              name="returnType"
              defaultValue={existingFunction?.returnType}
              required
            />
          </div>
        </div>
      )}

      {currentTab === 'parameters' && (
        <div className={styles.formSection}>
          <div className={styles.parameterList}>
            {parameters.map((param, index) => (
              <div key={index} className={styles.parameter}>
                <Input
                  placeholder="Parameter name"
                  value={param.name}
                  onChange={(e) => updateParameter(index, { name: e.target.value })}
                />
                <Input
                  placeholder="Type"
                  value={param.type}
                  onChange={(e) => updateParameter(index, { type: e.target.value })}
                />
                <Button onClick={() => removeParameter(index)}>Remove</Button>
              </div>
            ))}
          </div>
          <Button onClick={addParameter}>Add Parameter</Button>
        </div>
      )}

      {currentTab === 'implementation' && (
        <div className={styles.formSection}>
          <div>
            <Label htmlFor="implementation">Function Implementation</Label>
            <Textarea
              id="implementation"
              name="implementation"
              className={styles.codeEditor}
              defaultValue={existingFunction?.implementation}
              required
            />
          </div>
        </div>
      )}

      <DialogActions>
        <Button appearance="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button appearance="primary" type="submit">
          Save Function
        </Button>
      </DialogActions>
    </form>
  );
};