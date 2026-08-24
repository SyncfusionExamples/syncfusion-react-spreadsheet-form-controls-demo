# React Spreadsheet Form Control

## Overview

This sample demonstrates a proof-of-concept workaround for importing and exporting Excel files containing form controls in the [React Spreadsheet Component](https://www.syncfusion.com/spreadsheet-editor-sdk/react-spreadsheet-editor).

The solution preserves the following Excel form controls during both import and export operations:

- Check Boxes
- Option Buttons
- Combo Boxes

Using a combination of client-side and server-side processing, form controls are extracted from the Excel workbook, rendered within the Spreadsheet, tracked during user interaction, and recreated when the workbook is exported.

## Prerequisites:

Before implementing this solution, ensure that:

- [React Spreadsheet](https://www.syncfusion.com/spreadsheet-editor-sdk/react-spreadsheet-editor) is configured in your application.
- Spreadsheet Open and Save APIs are available on the server.
- [XlsIO package](https://www.nuget.org/packages/Syncfusion.EJ2.Spreadsheet.AspNet.Core) is installed and configured on the server.
- Node.js (Latest LTS version recommended)
- npm

---

## How It Works

### Import Process

1. The user opens an Excel file containing form controls in the React application.
2. The file is sent to the server for processing.
3. On the server, the XlsIO library identifies supported form controls and extracts their properties.
4. A custom `Form Control` object is created to store the control information.
5. The form control data is attached to the workbook payload and returned to the client.
6. On the client side, the workbook JSON is processed, and the form controls are rendered using Spreadsheet templates.
7. Custom properties are added to track form control changes during user interaction.

As a result, the form controls are displayed correctly when the workbook is opened in the Spreadsheet.

### Export Process

1. When the user saves the workbook, the client-side application scans the workbook for form controls.
2. The properties of each control are collected and stored in a dedicated `Form Control` object.
3. Temporary tracking properties are removed from the workbook JSON.
4. The workbook data and form control data are sent to the server.
5. Using XlsIO, the server recreates the form controls in the Excel workbook.
6. The final workbook is generated and returned to the user.

This ensures that all supported form controls are preserved in the exported Excel file.

---

## Supported Form Controls in this Workaround Solution

The sample currently supports the following Excel form controls:

- Check Box
- Option Button
- Combo Box

---

## Running the Sample

### Start the Client Application

Install the required dependencies:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

### Start the Server Application

Start the server application before performing any **Open** or **Save** operations.

> **Important:** The server must be running before opening or saving Excel files. The server is responsible for extracting form control information during import and recreating form controls during export.

Run the server project using your preferred method, such as:

- Visual Studio
- .NET CLI
- Any hosting environment configured for the sample

---

## Limitation

- This sample is provided as a proof-of-concept workaround.
- Not all the form controls are supported in this approach.
- Form controls are maintained through custom client-side and server-side processing.
- The solution uses the [XlsIO library](https://help.syncfusion.com/document-processing/excel/excel-library/net/create-read-edit-excel-files-in-asp-net-core-c-sharp) to extract and recreate form controls during import and export operations.
