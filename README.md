# AiCubeFront - Flow Iframe Integration Library

A React TypeScript library for building iframe-based UI components that integrate with the Flow application system.

## Overview

This library provides tools for creating custom parameter editors and UI components that can be embedded as iframes within a larger Flow/Cube-based data analytics system. It handles all the iframe communication complexity through the `postMessage` API.

## Project Structure

```
src/
├── flow/              # Flow iframe integration library
│   ├── types.ts       # TypeScript type definitions
│   ├── useFlow.ts     # React hook for iframe communication
│   ├── FlowResponseBuilder.ts  # Response builder utility
│   └── index.ts       # Library exports
├── components/        # UI components
│   └── QueryList.tsx  # MUI accordion list for queries
├── App.tsx           # Demo application
└── main.tsx          # React entry point
```

## Configuration (`src/config.ts`)

API endpoint configuration:
```typescript
export const API_CONFIG = {
  TOOLS_LIST_URL: 'http://localhost:3000/api/tools',
  TOOL_METADATA_URL: (toolName: string) => `http://localhost:3000/api/tools/${toolName}`,
};
```

**Expected API Responses:**
- `GET /api/tools` - Returns array of tool names: `["tool1", "tool2", ...]`
- `GET /api/tools/{toolName}` - Returns FlowCube metadata for the tool

## Library Components (`src/flow/`)

### `useFlow` Hook

A React hook that manages iframe communication with a parent window.

**Features:**
- Loads data from the parent Flow application
- Saves parameter values back to the parent
- Handles cancel operations
- Manages iframe lifecycle

### `FlowResponseBuilder` Class

A builder pattern utility for constructing Flow responses.

**Features:**
- Add/modify parameters
- Define data fields
- Set display names
- Configure filters

### Type Definitions

Comprehensive TypeScript types including:
- `FlowCube` - Query/data cube representation
- `IFlowParameter` - Parameter configuration
- `IField` - Field definitions
- `FlowResponse` - Response format

## Demo Application

The demo application (`src/App.tsx` & `src/main.tsx`) demonstrates the Flow iframe integration by displaying connected queries with their parameters.

### UI Components

The project uses Material-UI (MUI) for the user interface:
- `src/components/ItemList.tsx` - Generic accordion list component for both cubes and tool cubes with editable user notes
- `src/components/ToolCubeSelector.tsx` - Dropdown to select and add tool cubes from an API

**Features:**
- View cube/tool cube names and descriptions
- Expand items to see their parameters
- Add personal notes/descriptions to cubes/tool cubes and parameters
- User notes are displayed with a 📝 icon in the header
- User descriptions are persisted when saving and restored when reopening
- Tool cube selection with API integration:
  - Fetches available tool cubes from API endpoint
  - Loads tool cube metadata when selected
  - Prevents duplicate tool cube selection
  - Shows loading and error states
- Descriptions are returned in separate dictionaries for cubes and tool cubes:
  ```typescript
  {
    "Item Display Name": {
      queryDescription: "User's note about the item",
      parameters: {
        "Parameter Display Name": "User's note about parameter"
      }
    }
  }
  ```

### Installation

```bash
npm install
```

### Running the Demo

1. **Start the mock API server** (for tool cubes feature):
```bash
node mock-api-server.js
```

2. **Start the Vite development server**:
```bash
npm run dev
```

3. **Open `parent.html`** in your browser (you can double-click it or use a local web server)

3. Use the controls in the parent window to:
   - **Send Data & Open Iframe**: Opens the iframe and sends mock Flow data to it
   - **Trigger Save**: Tests the save flow - the iframe processes data and sends response back to parent
   - **Trigger Cancel**: Tests the cancel operation
   - **Close Iframe**: Closes the iframe view

### How It Works

The demo consists of two parts:

1. **parent.html** - Simulates the Flow parent window
   - Embeds the demo app in an iframe (hidden by default)
   - Clicking "Send Data & Open Iframe" opens the iframe and sends mock Flow data
   - Shows the sent data in the parent window
   - Displays responses from the iframe when save is triggered
   - Can close the iframe with the "Close Iframe" button

2. **src/App.tsx** - The embedded iframe application
   - Uses the `useFlow` hook to receive data
   - Displays received data in a readable format
   - Returns modified responses when save is triggered
   - The response is shown in the parent window, not the iframe

### Communication Flow

```
Parent Window (parent.html)
    ↓ send_iframe_data
    ↓ save_parameter_value
    ↓ cancel_parameter_value
    ↓
Iframe (demo/App.tsx)
    ↓ iframe_is_ready
    ↓ set_parameter_value
    ↑
Parent Window
```

## Usage in Your Project

### Basic Example

```typescript
import { useFlow, FlowResponseBuilder } from './flow';

function MyCustomEditor() {
  useFlow({
    onLoadData: (data) => {
      // Handle incoming data from Flow
      console.log('Received:', data);
    },
    onSave: () => {
      // Build and return your response
      const builder = new FlowResponseBuilder();
      builder.addParameter('my_param', 'My Parameter', 'String', 'value');
      return builder.build();
    },
    onCancel: () => {
      // Handle cancel
    },
  });

  return <div>Your custom UI here</div>;
}
```

## Development

### Building

```bash
npm run build
```

### Type Checking

The project uses TypeScript with strict mode enabled for type safety.

## License

MIT

