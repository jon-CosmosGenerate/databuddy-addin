/* global Office */

interface CommandsGlobal {
  showTaskpane: (event: Office.AddinCommands.Event) => void;
  refreshData: (event: Office.AddinCommands.Event) => void;
}

declare let global: CommandsGlobal;
declare let window: CommandsGlobal;

Office.onReady(() => {
  // Register command handlers
  Office.actions.associate("SHOW_TASKPANE", showTaskpane);
  Office.actions.associate("REFRESH_DATA", refreshData);
});

async function showTaskpane(event: Office.AddinCommands.Event) {
  try {
    await Office.addin.showAsTaskpane();
    event.completed();
  } catch (error) {
    console.error("Failed to show taskpane:", error);
    event.completed();
  }
}

async function refreshData(event: Office.AddinCommands.Event) {
  try {
    await Excel.run(async (context) => {
      // Add your Excel refresh operations here
      await context.sync();
    });
    event.completed();
  } catch (error) {
    console.error("Failed to refresh data:", error);
    event.completed();
  }
}

// Make functions available in global scope
const globalObj = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {} as any;

globalObj.showTaskpane = showTaskpane;
globalObj.refreshData = refreshData;

export { showTaskpane, refreshData };