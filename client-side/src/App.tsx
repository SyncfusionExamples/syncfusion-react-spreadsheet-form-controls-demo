import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './App.css';

export default function App() {
  let spreadsheet: any;
  var jsonData: any;

  const onCreated = () => {
    // Fetch call to server to load the Excel file.
    fetch('https://localhost:44341/api/spreadsheet/open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ FileName: 'formControls' }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Load the JSON data into spreadsheet.
        jsonData = data;
        spreadsheet.openFromJson({ file: data, triggerEvent: true });
      })
  };

  const openComplete = () => {
    var currRowIdx = { clientY: 40, isImage: true, isCheckDPR: true };
    var currColIdx = { clientX: 191, isImage: true };
    // Using proper string event names for notify method
    spreadsheet.notify('getRowIdxFromClientY', currRowIdx);
    spreadsheet.notify('getColIdxFromClientX', currColIdx);
     
    console.log(currRowIdx, currColIdx);
    // addFormControls();
    // console.log(getColumnIndex(191));
    // console.log(getColumnWidth(spreadsheet.getActiveSheet(), 0, false, true));
  }

  const addFormControls = () => {
    // Check if jsonData exists and contains formControls
    if (!jsonData || !jsonData.Workbook || !jsonData.Workbook.formControls) {
      console.log("No form controls found in JSON data");
      return;
    }

    const formControls = jsonData.Workbook.formControls;
    
    // Check if checkboxCol exists
    if (!formControls.checkboxCol) {
      console.log("No checkbox controls found");
      return;
    }

    // Iterate through all checkboxes
    Object.keys(formControls.checkboxCol).forEach(key => {
      const checkbox = formControls.checkboxCol[key];
      
      // Get row and column indices based on top and left positions
      const rowIndex = getRowIndex(checkbox.Top);
      const colIndex = getColumnIndex(checkbox.Left);
      

      
    });
  }

  const getRowHeight = (sheet: any, rowIndex: number, checkDPR?: boolean): number => {
    let hgt: number;
    let stdHeight: number | undefined;

    // Try to get standard height from sheet
    if (sheet && sheet.standardHeight) {
      stdHeight = sheet.standardHeight;
    }

    // Check if row exists and has custom height
    if (sheet && sheet.rows && sheet.rows[rowIndex]) {
      // Return 0 for hidden rows
      if (sheet.rows[rowIndex].hidden) {
        return 0;
      }
      // Use custom height or fall back to standard height
      hgt = sheet.rows[rowIndex].height === undefined ?
        (stdHeight === undefined ? 20 : stdHeight) : sheet.rows[rowIndex].height;
    } else {
      // Use standard height if row doesn't exist
      hgt = stdHeight === undefined ? 20 : stdHeight;
    }

    // Check DPR if requested
    if (checkDPR && window.devicePixelRatio % 1 > 0) {
      const pointValue: number = (hgt * window.devicePixelRatio) % 1;
      return hgt + (pointValue ? ((pointValue > 0.5 ? (1 - pointValue) : -1 * pointValue) / window.devicePixelRatio) : 0);
    } else {
      return hgt;
    }
  };

  const getColumnWidth = (sheet: any, index: number, skipHidden?: boolean, checkDPR?: boolean): number => {
    let width: number;
    if (sheet && sheet.columns && sheet.columns[index]) {
      if (!skipHidden && sheet.columns[index].hidden) { return 0; }
      width = (sheet.columns[index].width || sheet.columns[index].customWidth) ?
        sheet.columns[index].width : 64;
    } else {
      width = 64;
    }
    if (checkDPR && window.devicePixelRatio % 1 > 0) {
      const pointValue: number = (width * window.devicePixelRatio) % 1;
      return width + (pointValue ? ((pointValue > 0.5 ? (1 - pointValue) : -1 * pointValue) / window.devicePixelRatio) : 0);
    } else {
      return width;
    }
  };

  const getRowIndex = (topVal: number) => {
    // Access the spreadsheet instance
    if (!spreadsheet) return -1;

    // Get the active sheet
    const sheet: any = spreadsheet.getActiveSheet();

    // Calculate row index based on top position
    let height: number = 0;
    for (let i: number = 0; ; i++) {
      // Get row height for current row using our helper function with DPR checking
      const rowHeight: number = getRowHeight(sheet, i, true);
      height += rowHeight;

      // Check if we've reached the target position
      if (topVal < height || (sheet && sheet.rowCount && i === sheet.rowCount - 1)) {
        return i;
      }

      // Safety check to prevent infinite loop
      if (i > 10000) {
        return -1;
      }
    }
  }

  const getColumnIndex = (leftVal: number) => {
    // Access the spreadsheet instance
    if (!spreadsheet) return -1;

    // Get the active sheet
    const sheet: any = spreadsheet.getActiveSheet();

    // Calculate column index based on left position
    let width: number = 0;
    for (let i: number = 0; ; i++) {
      // Get column width for current column using our helper function with DPR checking
      const colWidth: number = getColumnWidth(sheet, i, false, true);
      width += colWidth;

      // Check if we've reached the target position
      if (leftVal < width || (sheet && sheet.colCount && i === sheet.colCount - 1)) {
        return i;
      }

      // Safety check to prevent infinite loop
      if (i > 10000) {
        return -1;
      }
    }
  }

  return (
    <div className="app-container">
      <h1 className="app-header">Spreadsheet Form Controls</h1>
      <SpreadsheetComponent
        openUrl='https://localhost:44341/api/spreadsheet/open'
        saveUrl='https://localhost:44341/api/spreadsheet/save'
        ref={(ssObj: any) => { spreadsheet = ssObj; }}
        created={onCreated}
        openComplete={openComplete}
        height='600px'
      >
      </SpreadsheetComponent>
    </div>
  );
}