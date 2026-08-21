import { SpreadsheetComponent, setCell, getCell, getRowHeight, getRangeIndexes } from '@syncfusion/ej2-react-spreadsheet';
import { RadioButton } from '@syncfusion/ej2-buttons';
import { select, createElement } from '@syncfusion/ej2-base';
import { createCheckBox } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';

import './App.css';

export default function App() {
  let spreadsheet: any;
  var jsonData: any;
  var workbookJson: any;
  var formControls: any;

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

  const beforeSave = (args: any) => {
    // console.log(args);
  }

  const performSave = () => {
    spreadsheet.saveAsJson().then((res: any) => {
      workbookJson = res.jsonObject.Workbook;
      processWorkbookJson(workbookJson);
      
      var formData = new FormData();

      // Add the JSON data to the formData object
      formData.append(
        "JSONData",
        JSON.stringify(workbookJson)
      );

      // Specify the file name and save type as Excel (Xlsx)
      formData.append("fileName", "Sample");
      formData.append("saveType", "Xlsx");
      
      // Add form controls data - sending each collection separately for better server processing
      formData.append("formControls[checkboxCol]", JSON.stringify(formControls.checkboxCol));
      formData.append("formControls[optionButtonCol]", JSON.stringify(formControls.optionButtonCol));
      formData.append("formControls[comboBoxCol]", JSON.stringify(formControls.comboBoxCol));
      
      // Add PDF layout settings, even though this is for Excel export
      formData.append("pdfLayoutSettings", JSON.stringify({ fitSheetOnOnePage: false, orientation: "Portrait" }));

      // Send a POST request to Syncfusion's save API
      fetch(
        'https://localhost:44341/api/spreadsheet/save',
        {
          method: 'POST',
          body: formData,
        }
      ).then((response) => {
        response.blob().then((data) => {
          var anchor: any = createElement('a', {
            attrs: { download: 'Sample.xlsx' },
          });
          var url = URL.createObjectURL(data);
          anchor.href = url;
          document.body.appendChild(anchor);
          anchor.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(anchor);
        });
      })
    });
  }

  const processWorkbookJson = (workbook: any) => {
    // Initialize formControls object
    formControls = {
      checkboxCol: [],
      optionButtonCol: [],
      comboBoxCol: []
    };

    if (workbook.sheets && Array.isArray(workbook.sheets)) {
      workbook.sheets.forEach((sheet: any) => {
        // Loop through each row
        if (sheet.rows && Array.isArray(sheet.rows)) {
          sheet.rows.forEach((row: any) => {
            // Loop through each cell
            if (row.cells && Array.isArray(row.cells)) {
              row.cells.forEach((cell: any) => {
                // Check if the cell has formControl property
                if (cell.formControlType) {
                  // Perform separate action based on the form control type
                  switch (cell.formControlType) {
                    case 'checkbox':
                      // Add checkboxInfo to checkboxCol array
                      if (cell.checkboxInfo) {
                        formControls.checkboxCol.push(cell.checkboxInfo);
                      }
                      // Remove form control properties from the cell
                      delete cell.formControlType;
                      delete cell.checkboxInfo;
                      delete cell.template;
                      break;
                    case 'optionbutton':
                      // Add optionButtonInfo to optionButtonCol array
                      if (cell.optionButtonInfo) {
                        formControls.optionButtonCol.push(cell.optionButtonInfo);
                      }
                      // Remove form control properties from the cell
                      delete cell.formControlType;
                      delete cell.optionButtonInfo;
                      delete cell.template;
                      break;
                    case 'comboBox':
                      // Add comboBoxInfo to comboBoxCol array
                      if (cell.comboBoxInfo) {
                        formControls.comboBoxCol.push(cell.comboBoxInfo);
                      }
                      // Remove form control properties from the cell
                      delete cell.formControlType;
                      delete cell.comboBoxInfo;
                      delete cell.template;
                      break;
                  }
                }
              });
            }
          });
        }
      });
    }
    
  }

  const openComplete = () => {
    addFormControls();
  }

  const addFormControls = () => {
    if (jsonData || jsonData.Workbook || jsonData.Workbook.formControls) {
      const formControls = jsonData.Workbook.formControls;

      // Processing Checkboxes
      if (formControls.checkboxCol) {
        // Iterate through all checkboxes
        Object.keys(formControls.checkboxCol).forEach(key => {
          const checkbox = formControls.checkboxCol[key];
          var rowIndex = { clientY: checkbox.Top, isImage: true, isCheckDPR: true };
          var colIndex = { clientX: checkbox.Left, isImage: true };

          spreadsheet.notify('getRowIdxFromClientY', rowIndex);
          spreadsheet.notify('getColIdxFromClientX', colIndex);
          var checkboxRowIndex = rowIndex.clientY;
          var checkboxColIndex = colIndex.clientX;
          var sheet: any = spreadsheet.sheets[checkbox.SheetIndex];
          // util method - setCell(rowIndex: number, colIndex: number, sheet: sheet, cell: any, isExtend?: boolean): void
          setCell(checkboxRowIndex, checkboxColIndex, sheet, { template: "checkbox", value: checkbox.Text, formControlType: "checkbox", checkboxInfo: checkbox } as any, true);

          const cellModel = getCell(checkboxRowIndex, checkboxColIndex, sheet);
          const cellEle = spreadsheet.getCell(checkboxRowIndex, checkboxColIndex);
          addCheckBox(cellEle, cellModel);

        });
      }

      // Processing option Button
      if (formControls.optionButtonCol) {
        // Iterate through all optionButtons
        Object.keys(formControls.optionButtonCol).forEach(key => {
          const optionButton = formControls.optionButtonCol[key];
          var rowIndex = { clientY: optionButton.Top, isImage: true, isCheckDPR: true };
          var colIndex = { clientX: optionButton.Left, isImage: true };

          spreadsheet.notify('getRowIdxFromClientY', rowIndex);
          spreadsheet.notify('getColIdxFromClientX', colIndex);
          var optionButtonRowIndex = rowIndex.clientY;
          var optionButtonColIndex = colIndex.clientX;
          var sheet: any = spreadsheet.sheets[optionButton.SheetIndex];
          setCell(optionButtonRowIndex, optionButtonColIndex, sheet, { template: "optionButton", value: optionButton.Text, formControlType: "optionbutton", optionButtonInfo: optionButton } as any, true);

          const cellModel = getCell(optionButtonRowIndex, optionButtonColIndex, sheet);
          const cellEle = spreadsheet.getCell(optionButtonRowIndex, optionButtonColIndex);

          addOptionButton(cellEle, cellModel);
        });
      }

      // Processing Combo Box
      if (formControls.comboBoxCol) {
        // Iterate through all comboboxex
        Object.keys(formControls.comboBoxCol).forEach(key => {
          const comboBox = formControls.comboBoxCol[key];
          var rowIndex = { clientY: comboBox.Top, isImage: true, isCheckDPR: true };
          var colIndex = { clientX: comboBox.Left, isImage: true };

          spreadsheet.notify('getRowIdxFromClientY', rowIndex);
          spreadsheet.notify('getColIdxFromClientX', colIndex);
          var comboBoxRowIndex = rowIndex.clientY;
          var comboBoxColIndex = colIndex.clientX;
          var sheet: any = spreadsheet.sheets[comboBox.SheetIndex];
          setCell(comboBoxRowIndex, comboBoxColIndex, sheet, { template: "comboBox", formControlType: "comboBox", comboBoxInfo: comboBox } as any, true);

          const cellModel = getCell(comboBoxRowIndex, comboBoxColIndex, sheet);
          const cellEle = spreadsheet.getCell(comboBoxRowIndex, comboBoxColIndex);

          var comboBoxData: any = getRangeData(comboBox.ListFillRange, sheet);

          addComboBox(cellEle, cellModel, comboBoxData);
        });
      }

    }

  }

  // Helper method to get data from all the cells within the given range
  const getRangeData = (dataRange: any, sheet: any) => {
    var comboBoxData: any = [];
    var cellRange = dataRange.split("!")[1];
    var rangeIndexes = getRangeIndexes(cellRange, sheet);

    for (var i = rangeIndexes[0]; i <= rangeIndexes[2]; i++) {
      for (var j = rangeIndexes[1]; j <= rangeIndexes[3]; j++) {
        var cell = getCell(i, j, sheet);
        comboBoxData.push(cell?.value);
      }
    }
    return comboBoxData;
  }

  // To render the Radio button.
  const addOptionButton = (element: any, cellModel: any) => {
    element.innerHTML = '';
    var inputEle = document.createElement('input');
    element.appendChild(inputEle);
    new RadioButton({
      label: cellModel && cellModel.value ? cellModel.value : null,
      name: "radioButton Col",
      checked: cellModel.optionButtonInfo.CheckState,
    }, inputEle);
  }

  // To render the Check box.
  const addCheckBox = (element: any, cellModel: any) => {
    const sheet = spreadsheet.getActiveSheet();
    const checked = !!cellModel?.checkboxInfo?.CheckState;

    const checkboxWrapper = createCheckBox(
      spreadsheet.createElement,
      false,
      {
        checked,
        label: cellModel.value,
      }
    );

    element.appendChild(checkboxWrapper);

    // For maintaining the checked state
    checkboxWrapper.addEventListener('click', () => {
      const input = select('.e-frame', checkboxWrapper);
      const newChecked = !input.classList.contains('e-check');
      if (newChecked) input.classList.add('e-check');
      else input.classList.remove('e-check');
    });
  }

  // To handle the change event of dropdown list.
  const dropDownChangeHandler = (event: any) => {
    const sheet = spreadsheet.getActiveSheet();
    spreadsheet.updateCell({ value: event.value.toString() }, sheet.activeCell);
  };

  // To render combo Box
  const addComboBox = (element: any, cellModel: any, comboBoxData: any) => {
    element.innerHTML = '';
    var inputEle = document.createElement('input');
    element.appendChild(inputEle);
    new DropDownList({
      text: cellModel && cellModel.value ? cellModel.value : null,
      dataSource: comboBoxData,
      cssClass: 'e-dropdown-list',
      value: cellModel && cellModel.comboBoxInfo && cellModel.comboBoxInfo.SelectedIndex ? comboBoxData[cellModel.comboBoxInfo.SelectedIndex - 1] : null,
      change: (event) => {
        dropDownChangeHandler(event);
      }
    }, inputEle);
  }

  const handleBeforeCellRender = (args: any) => {
    // adding checkbox if the cell contains 'checkbox' template
    if (args.element && args.cell?.template === 'checkbox') {
      while (args.element.firstChild) {
        args.element.removeChild(args.element.firstChild);
      }
      args.element.textContent = "";
      addCheckBox(args.element, args.cell);
    } else if (args.element && args.cell && args.cell.template === 'comboBox') {
      var sheet = spreadsheet.getActiveSheet();
      args.element.textContent = "";
      var comboBoxData = getRangeData(args.cell.comboBoxInfo.ListFillRange, sheet);
      addComboBox(args.element, args.cell, comboBoxData);
    }
    else if (args.element && args.cell && args.cell.template === 'optionButton') {
      args.element.textContent = "";
      addOptionButton(args.element, args.cell);
    }
  }

  return (
    <div className="app-container">
      <h1 className="app-header">Spreadsheet Form Controls</h1>
      <button className='btn' onClick={performSave}>Perform Save</button>
      <SpreadsheetComponent
        openUrl='https://localhost:44341/api/spreadsheet/open'
        saveUrl='https://localhost:44341/api/spreadsheet/save'
        ref={(ssObj: any) => { spreadsheet = ssObj; }}
        created={onCreated}
        openComplete={openComplete}
        beforeCellRender={handleBeforeCellRender}
        beforeSave={beforeSave}
        height='600px'
      >
      </SpreadsheetComponent>
    </div>
  );
}