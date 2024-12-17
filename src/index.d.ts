/// <reference types="@types/office-js" />
/// <reference types="@types/office-runtime" />

declare global {
    interface Window {
      Office: typeof Office;
      Excel: typeof Excel;
    }
  }
  
  export {};