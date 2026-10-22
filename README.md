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

The application will start and you can access it in your browser. You can then open the sample Excel file and interact with the form controls.

## Sample Files

A sample Excel file (`formControls.xlsx`) is included in the repository with pre-configured form controls (checkboxes, radio buttons, and combo boxes). You can use this file to:

1. Open the file in the application using the "Open" button
2. Interact with the form controls
3. Make changes and save the file using the "Save" button

This sample file demonstrates the form control functionality supported by the Spreadsheet component.

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
├── formControls.xlsx        # Sample Excel file with form controls
└── README.md                # This file
```

## Features

- Clean, minimal spreadsheet UI
- Synchronized open/save operations with Syncfusion APIs
- Full spreadsheet editing capabilities via the Syncfusion Spreadsheet component
- Support for form control import and export (Checkboxes, Radio Buttons, Combo Boxes)
