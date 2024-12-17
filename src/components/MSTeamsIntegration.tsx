import * as microsoftTeams from "@microsoft/teams-js";
import { FunctionDefinition } from '../services/function/types';
import { FunctionService } from "@/services/function/FunctionService";

interface SharedContent {
  type: 'function' | 'shortcut';
  content: FunctionDefinition | KeyboardShortcut;
  sharedBy: string;
  timestamp: Date;
}

interface KeyboardShortcut {
  id: string;
  keys: string;
  description: string;
  action: string;
}

export class TeamsIntegrationService {
  private roles: Map<string, string[]> = new Map();
  private static instance: TeamsIntegrationService;

  private constructor() {}

  public static getInstance(): TeamsIntegrationService {
    if (!TeamsIntegrationService.instance) {
      TeamsIntegrationService.instance = new TeamsIntegrationService();
    }
    return TeamsIntegrationService.instance;
  }

  private async getUserRoles(teamId: string): Promise<string[]> {
    if (this.roles.has(teamId)) {
      return this.roles.get(teamId)!;
    }
    // Fetch roles logic
    const fetchedRoles: string[] = await this.fetchRolesFromServer(teamId);
    this.roles.set(teamId, fetchedRoles);
    return fetchedRoles;
  }

  private async fetchRolesFromServer(teamId: string): Promise<string[]> {
    // Simulate fetching roles from a server
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(['role1', 'role2']);
      }, 1000);
    });
  }

  async shareFunction(func: FunctionDefinition) {
    // Implementation of shareFunction
  }

  async shareShortcut(shortcut: KeyboardShortcut) {
    const card = {
      type: "AdaptiveCard",
      body: [
        {
          type: "TextBlock",
          text: `Keyboard Shortcut: ${shortcut.description}`,
          weight: "bolder"
        },
        {
          type: "TextBlock",
          text: `Keys: ${shortcut.keys}`,
          fontType: "monospace"
        },
        {
          type: "TextBlock",
          text: `Action: ${shortcut.action}`
        }
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Import Shortcut",
          data: {
            type: 'shortcut',
            content: shortcut
          }
        }
      ]
    };

    const adaptiveCardString = JSON.stringify({
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: card
    });

    await microsoftTeams.tasks.startTask({ card: adaptiveCardString });
  }

  private async handleIncomingMessage(message: any) {
    if (message.data?.type === 'function') {
      await this.importFunction(message.data.content);
    } else if (message.data?.type === 'shortcut') {
      await this.importShortcut(message.data.content);
    }
    // ... existing message handlers ...
  }

  private async importFunction(func: FunctionDefinition) {
    // Add to local storage/function service
    await FunctionService.saveFunction(func);
  }

  private async importShortcut(shortcut: KeyboardShortcut) {
    // Register shortcut locally
    const shortcuts = JSON.parse(localStorage.getItem('customShortcuts') || '[]');
    shortcuts.push(shortcut);
    localStorage.setItem('customShortcuts', JSON.stringify(shortcuts));
  }
}

export const teamsIntegrationService = TeamsIntegrationService.getInstance();