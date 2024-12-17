import { AppError } from '@/errors';


export interface CustomFunction {
  id: string;
  name: string;
  description: string;
  implementation: string;
  parameters: FunctionParameter[];
  returnType: string;
  examples: FunctionExample[];
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    isShared?: boolean;
  };
}

export interface FunctionParameter {
  name: string;
  type: string;
  description: string;
  isOptional?: boolean;
  defaultValue?: any;
}

export interface FunctionExample {
  scenario: string;
  formula: string;
  result: string;
}

export class FunctionService {
  private static instance: FunctionService;
  private functions: Map<string, CustomFunction> = new Map();

  private constructor() {}

  public static getInstance(): FunctionService {
    if (!FunctionService.instance) {
      FunctionService.instance = new FunctionService();
    }
    return FunctionService.instance;
  }

  async getFunction(id: string): Promise<CustomFunction | undefined> {
    try {
      return this.functions.get(id);
    } catch (error) {
      throw new AppError('Failed to retrieve function', 'FUNCTION_ERROR', 'high', 'unknown', error);
    }
  }

  async getAllFunctions(): Promise<CustomFunction[]> {
    try {
      return Array.from(this.functions.values());
    } catch (error) {
      throw new AppError('Failed to retrieve functions', 'FUNCTION_ERROR', 'high', 'unknown', error);
    }
  }

  async saveFunction(func: Omit<CustomFunction, 'id'>): Promise<CustomFunction> {
    try {
      const id = this.generateFunctionId();
      const newFunction: CustomFunction = {
        id,
        ...func,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      };
      this.functions.set(id, newFunction);
      return newFunction;
    } catch (error) {
      throw new AppError('Failed to save function', 'FUNCTION_ERROR', 'high', 'unknown', error);
    }
  }

  async updateFunction(id: string, updates: Partial<Omit<CustomFunction, 'id'>>): Promise<CustomFunction> {
    try {
      const existingFunction = this.functions.get(id);
      if (!existingFunction) {
        throw new AppError(`Function with ID ${id} not found`, 'FUNCTION_NOT_FOUND', 'medium', 'validation');
      }

      const updatedFunction: CustomFunction = {
        ...existingFunction,
        ...updates,
        metadata: {
          ...existingFunction.metadata,
          createdAt: existingFunction.metadata?.createdAt || new Date(),
          updatedAt: new Date()
        }
      };
      
      this.functions.set(id, updatedFunction);
      return updatedFunction;
    } catch (error) {
      throw new AppError('Failed to update function', 'FUNCTION_ERROR', 'high', 'unknown', error);
    }
  }

  async deleteFunction(id: string): Promise<void> {
    try {
      if (!this.functions.has(id)) {
        throw new AppError(`Function with ID ${id} not found`, 'FUNCTION_NOT_FOUND', 'medium', 'validation');
      }
      this.functions.delete(id);
    } catch (error) {
      throw new AppError('Failed to delete function', 'FUNCTION_ERROR', 'high', 'unknown', error);
    }
  }

  private generateFunctionId(): string {
    return `fn_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const functionService = FunctionService.getInstance();