import { CustomFunction } from '@/services/function/FunctionService';
import { AppError } from '@/errors'; // or '../errors' depending on file location

export class ExcelFunctionRegistry {
  private static instance: ExcelFunctionRegistry;
  private registeredFunctions: Map<string, CustomFunction> = new Map();

  private constructor() {}

  public static getInstance(): ExcelFunctionRegistry {
    if (!ExcelFunctionRegistry.instance) {
      ExcelFunctionRegistry.instance = new ExcelFunctionRegistry();
    }
    return ExcelFunctionRegistry.instance;
  }

  async registerFunction(func: CustomFunction): Promise<void> {
    try {
      if (!this.isValidFunctionName(func.name)) {
        throw new AppError(
          `Invalid function name: ${func.name}`,
          'INVALID_FUNCTION_NAME',
          'medium',
          'validation'
        );
      }

      // Using the correct Excel JavaScript API for custom functions
      await Office.onReady();
      // Note: Custom functions need to be defined during add-in initialization
      // They cannot be dynamically registered at runtime
      // Instead, we'll store the function definition for manifest generation
      this.registeredFunctions.set(func.name, func);
      
    } catch (error) {
      throw new AppError(
        'Failed to register Excel function',
        'EXCEL_FUNCTION_ERROR',
        'high',
        'excel',
        error
      );
    }
  }

  async unregisterFunction(name: string): Promise<void> {
    try {
      // Remove from our internal registry
      this.registeredFunctions.delete(name);
      // Note: Custom functions cannot be unregistered at runtime
      // They need to be removed from the manifest
    } catch (error) {
      throw new AppError(
        'Failed to unregister Excel function',
        'EXCEL_FUNCTION_ERROR',
        'high',
        'excel',
        error
      );
    }
  }

  isRegistered(name: string): boolean {
    return this.registeredFunctions.has(name);
  }

  private isValidFunctionName(name: string): boolean {
    // Excel function naming rules
    const reservedWords = ['IF', 'SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'];
    const validNameRegex = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;
    
    return (
      validNameRegex.test(name) &&
      !reservedWords.includes(name.toUpperCase()) &&
      name.length <= 64
    );
  }
}

export const excelFunctionRegistry = ExcelFunctionRegistry.getInstance();