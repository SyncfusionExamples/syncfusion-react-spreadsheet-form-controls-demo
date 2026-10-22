# React Spreadsheet

## Overview

This is a simplified React Spreadsheet Component application that demonstrates spreadsheet's form control functionality using the [Syncfusion React Spreadsheet Editor](https://www.syncfusion.com/spreadsheet-editor-sdk/react-spreadsheet-editor).

The implementation includes support for:
- Form Control (Check Box, Combo Box (Drop-Down), and Option Button (Radio Button) ) import and export
-	Client-side overlay rendering
-	Editing and resizing
-	Drag-and-drop interactions
-	Copy, cut, and paste operations
-	Form Control properties such as Cell Link, Input Range, Caption, and Alt Text, where applicable

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

The application will start and you can access it in your browser. The Spreadsheet component is configured to use Syncfusion's Demo API endpoints for opening and saving files.

The application uses the following Syncfusion Demo API endpoints:
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
