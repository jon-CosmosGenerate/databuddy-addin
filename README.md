
# DataBuddy Excel Add-in

## Overview

DataBuddy is a user-focused web app and Excel task pane add-in designed and intended to improve access to high-quality information by eliminating information asymmetries wrought by market imperfections and structures that seem legacy to the current world we live in. The minimum viable product (the "MVP") is designed around financial data, though the vision encompasses all sectors and verticals of data. Below, we will provide more details about the app's existing capabilities.

DataBuddy enhances financial data analysis capabilities within Excel by integrating a high-quality data universe with Office 365. We hope to extend our add-in beyond finance, across all sectors and forms of data. Built with TypeScript and modern web technologies, the add-in provides a seamless interface for public company data research and analysis, custom function and keyboard shortcut management, and financial analysis tools. The add-in developers are currently working on improving the add-in with a focus on collaboration and security.

## Features

### Public Company Research, Analysis, and Management

- Company search and snapshot functionality
- Financial data visualization
- Excel data export capabilities
- Template-based reporting

### Custom Functions

- Create and manage custom Excel functions
- Local storage for function persistence
- Function sharing capabilities
- User-friendly function editing interface

### User Interface

- Modern, responsive task pane design
- Dark/light theme support
- Intuitive navigation system
- Keyboard accessibility

## Project Structure

````markdown
```plaintext
```

## Technology Stack
```
src/
├── commands/              # Office add-in commands
│   ├── commands.html
│   └── commands.ts
├── features/             
│   ├── company/          # Company management
│   │   └── companyManager.ts
│   ├── functions/        # Function management
│   │   └── functionManager.ts
│   └── navigation/       # Navigation components
│       ├── navbar.ts
│       └── templateDesigner.ts
├── services/             # Business logic and API services
│   ├── companySearchService.ts
│   └── functionService.ts
├── styles/              
│   ├── base/            # Base styles
│   │   ├── _reset.scss
│   │   ├── _theme.scss
│   │   └── _variables.scss
│   ├── features/        # Feature-specific styles
│   │   ├── _company-manager.scss
│   │   ├── _function-manager.scss
│   │   ├── _navbar.scss
│   │   └── _template-designer.scss
│   ├── layout/          # Layout styles
│   │   └── _taskpane.scss
│   └── main.scss        # Main style entry
├── taskpane/            # Main entry point
│   ├── taskpane.html
│   └── taskpane.ts
└── types/               # TypeScript definitions
    ├── global.d.ts
    └── index.d.ts
```plaintext

## Technology Stack

- TypeScript for type-safe development
- Office.js for Excel integration
- SCSS for styled components
- Webpack for bundling and development
- Local storage for data persistence

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)
- Microsoft Excel (Desktop or Online)
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/jon-CosmosGenerate/databuddy.git
cd databuddy
```plaintext

1. Install dependencies:

```bash
npm install
```

1. Start the development server:

```bash
npm run dev-server
```

1. In Excel, sideload the add-in using the manifest file.

### Available Scripts

- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run dev-server` - Start development server
- `npm run lint` - Run linting checks
- `npm run lint:fix` - Fix linting issues
- `npm run start` - Start debugging
- `npm run stop` - Stop debugging

## Development

### Development Environment Setup

The development server runs on HTTPS (required for Office Add-ins) using port 3000 by default. SSL certificates are handled automatically by office-addin-dev-certs.

### Development Style Guidelines

- Follow the feature-based architecture
- Use SCSS for styling
- Maintain theme consistency using variables
- Follow TypeScript best practices
- Implement proper error handling

### Building for Production

1. Update version in manifest.xml

2. Run `npm run build`
3. Test the production build
4. Deploy according to your distribution strategy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# DataBuddy Excel Add-in Project

## Project Overview

A TypeScript-based Excel task pane add-in focused on company data management, custom functions, and template design capabilities. The project follows a feature-based architecture and uses modern web development practices.

## Core Features

1. **Company Management**
   - Company search functionality
   - Data visualization
   - Excel export capabilities
   - Custom template design

2. **Function Management**
   - Custom Excel functions creation
   - Function sharing capabilities
   - Template management
   - Local storage integration

3. **Navigation & UI**
   - Modern taskpane interface
   - Dark/light theme support
   - Responsive design
   - Keyboard navigation

## Technical Stack

- TypeScript for type safety
- Office.js for Excel integration
- SCSS for styling
- Webpack for bundling
- Local storage for data persistence

## Project Structure Overview

```plaintext
src/
├── commands/              # Office add-in commands
├── features/             
│   ├── company/          # Company management feature
│   ├── functions/        # Function management feature
│   └── navigation/       # Navigation components
├── services/             # Business logic and API calls
├── styles/               
│   ├── base/            # Base styles and variables
│   ├── features/        # Feature-specific styles
│   └── layout/          # Layout components
├── taskpane/            # Main entry point
└── types/               # TypeScript definitions
```


## Current Progress

- ✅ Basic project structure implemented
- ✅ Core feature components created
- ✅ Style system with theme support
- ✅ Webpack configuration
- ✅ TypeScript setup
- ✅ Office.js integration

## Helpful Context for Future Development

### Key Files to Know

1. `src/taskpane/taskpane.ts` - Main entry point
2. `src/features/company/companyManager.ts` - Company management
3. `src/features/functions/functionManager.ts` - Function management
4. `src/styles/main.scss` - Main styles entry point

### Environment Setup

- Local development requires HTTPS certificates (handled by office-addin-dev-certs)
- Development server runs on port 3000
- Supports Excel desktop and online versions

### Style Guidelines

- Feature-based SCSS organization
- Theme variables in `_theme.scss`
- Common variables in `_variables.scss`
- BEM-like naming convention

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured
- Office.js types included
- Global type definitions in `types/` directory

### Webpack Configuration

- Development and production builds
- SCSS processing
- Asset handling
- Source maps enabled in development

### Common Development Tasks

1. Starting the dev server:

   ```bash
   npm run dev-server
   ```

2. Building for production:

   ```bash
   npm run build
   ```

3. Linting:

   ```bash
   npm run lint
   ```

### Known Requirements

1. HTTPS for development
2. Excel API permissions
3. Local storage access
4. Minimum Excel version support

## Next Steps & Priorities

1. Complete company data integration
2. Implement function sharing capabilities
3. Add comprehensive error handling
4. Implement caching strategy
5. Add unit testing

## Helpful Add-in Development Resources

1. [Office Add-in Documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/)
2. [Excel JavaScript API Reference](https://docs.microsoft.com/en-us/javascript/api/excel)
3. [Office-Addin-Dev-Certs](https://www.npmjs.com/package/office-addin-dev-certs)
4. [Excel Add-in Design Guidelines](https://docs.microsoft.com/en-us/office/dev/add-ins/design/add-in-design)

## Development Notes

- Office.js operations should be batched when possible
- Always use async/await with Excel.run()
- Handle offline scenarios gracefully
- Consider Excel version compatibility
- Implement proper error boundaries
- Use TypeScript strict mode consistently
