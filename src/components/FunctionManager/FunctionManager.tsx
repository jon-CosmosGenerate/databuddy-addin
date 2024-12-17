import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  makeStyles,
  tokens,
  Text,
  Spinner,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Play24Regular,
} from '@fluentui/react-icons';
import { CustomFunction, functionService } from '../../services/function/FunctionService';
import { excelFunctionRegistry } from './ExcelFunctionRegistry';
import { FunctionForm } from './FunctionForm';
import { useError } from '../../errors';
import { AppError } from '@/errors';


const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  codeCell: {
    fontFamily: 'monospace',
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusMedium,
  },
  table: {
    marginTop: tokens.spacingVerticalM,
  },
});

export const FunctionManagerUI: React.FC = () => {
  const styles = useStyles();
  const { setError } = useError();
  const [functions, setFunctions] = useState<CustomFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<CustomFunction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadFunctions = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedFunctions = await functionService.getAllFunctions();
      setFunctions(loadedFunctions);
    } catch (error) {
      setError(new AppError(
        (error as Error).message,
        'UNKNOWN_ERROR',
        'high',
        'unknown',
        error
      ));
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    loadFunctions();
  }, [loadFunctions]);

  const handleSaveFunction = async (func: Omit<CustomFunction, 'id'>) => {
    try {
      if (selectedFunction) {
        const updatedFunction = await functionService.updateFunction(selectedFunction.id, func);
        setFunctions(functions.map(f => 
          f.id === selectedFunction.id ? updatedFunction : f
        ));
      } else {
        const newFunction = await functionService.saveFunction(func);
        setFunctions([...functions, newFunction]);
      }
      setIsDialogOpen(false);
      setSelectedFunction(null);
    } catch (error) {
      setError(new AppError(
        (error as Error).message,
        'UNKNOWN_ERROR',
        'high',
        'database',
        error
      ));
    }
  };

  const handleDeleteFunction = async (id: string) => {
    try {
      await functionService.deleteFunction(id);
      setFunctions(functions.filter(f => f.id !== id));
    } catch (error) {
      setError(new AppError(
        (error as Error).message,
        'UNKNOWN_ERROR',
        'high',
        'database',
        error
      ));
    }
  };

  const handleTestFunction = async (func: CustomFunction) => {
    try {
      await excelFunctionRegistry.registerFunction(func);
      // Create a test range and apply the function
      await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getRange('A1');
        range.formulas = [[`=${func.name}()`]];
        await context.sync();
      });
    } catch (error) {
      setError(new AppError(
        (error as Error).message,
        'UNKNOWN_ERROR',
        'high',
        'excel',
        error
      ));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text as="h1" size={800}>Custom Functions</Text>
        <Button
          icon={<Add24Regular />}
          appearance="primary"
          onClick={() => {
            setSelectedFunction(null);
            setIsDialogOpen(true);
          }}
        >
          Add Function
        </Button>
      </div>

      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Parameters</TableHeaderCell>
            <TableHeaderCell>Return Type</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {functions.map((func) => (
            <TableRow key={func.id}>
              <TableCell>
                <code className={styles.codeCell}>{func.name}</code>
              </TableCell>
              <TableCell>{func.description}</TableCell>
              <TableCell>
                {func.parameters.map(p => p.name).join(', ')}
              </TableCell>
              <TableCell>{func.returnType}</TableCell>
              <TableCell>
                <div className={styles.actionButtons}>
                  <Button
                    icon={<Edit24Regular />}
                    appearance="subtle"
                    onClick={() => {
                      setSelectedFunction(func);
                      setIsDialogOpen(true);
                    }}
                  />
                  <Button
                    icon={<Delete24Regular />}
                    appearance="subtle"
                    onClick={() => handleDeleteFunction(func.id)}
                  />
                  <Button
                    icon={<Play24Regular />}
                    appearance="subtle"
                    onClick={() => handleTestFunction(func)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={(_, { open }) => setIsDialogOpen(open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {selectedFunction ? 'Edit Function' : 'Add New Function'}
            </DialogTitle>
            <DialogContent>
              <FunctionForm
                function={selectedFunction || undefined}
                onSave={handleSaveFunction}
                onClose={() => {
                  setIsDialogOpen(false);
                  setSelectedFunction(null);
                }}
              />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};