# React Spreadsheet

## Overview

This is a simplified React Spreadsheet Component application that demonstrates basic spreadsheet functionality using the [Syncfusion React Spreadsheet Editor](https://www.syncfusion.com/spreadsheet-editor-sdk/react-spreadsheet-editor).

The application allows users to:
- Open and edit Excel files
- Save changes back to Excel format
- Use the Syncfusion production API endpoints for file operations

## Prerequisites

Before running this application, ensure that you have:

- Node.js (Latest LTS version recommended)
- npm (Node Package Manager)

## Getting Started

### Installation

Navigate to the `client-side` directory and install the required dependencies:

```bash
cd client-side
npm install
```

### Running the Application

Start the React development server:

```bash
npm run dev
```

The application will start and you can access it in your browser. The Spreadsheet component is configured to use Syncfusion's production API endpoints for opening and saving files.

### File Operations

- **Open**: Click the open button to select and open an Excel file
- **Save**: Click the save button to save your changes back to an Excel file

The application uses the following Syncfusion production API endpoints:
- Open URL: `https://services.syncfusion.com/angular/production/api/spreadsheet/open`
- Save URL: `https://services.syncfusion.com/angular/production/api/spreadsheet/save`

## Project Structure

```
.
├── client-side/              # React client application
│   ├── src/
│   │   ├── App.tsx          # Main spreadsheet component
│   │   ├── App.css          # Application styles
│   │   └── main.tsx         # Application entry point
│   ├── package.json         # Dependencies and scripts
│   └── vite.config.ts       # Vite configuration
└── README.md                # This file
```

## Features

- Clean, minimal spreadsheet UI
- Synchronized open/save operations with Syncfusion APIs
- Full spreadsheet editing capabilities via the Syncfusion Spreadsheet component
- No custom form control handling or event processing

## Notes

- The application relies on Syncfusion's production API for all file operations
- Internet connectivity is required to access the Syncfusion API endpoints
- All spreadsheet functionality is provided by the Syncfusion React Spreadsheet Component
