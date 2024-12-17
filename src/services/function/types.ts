// src/services/function/types.ts
export interface FunctionDefinition {
    name: string;
    description: string;
    syntax: string;
    example: string;
    createdAt?: Date;
    updatedAt?: Date;
    isShared?: boolean;
    author?: string;
  }
  
  export interface FunctionMetadata {
    totalCount: number;
    sharedCount: number;
    lastUpdated: Date | null;
  }