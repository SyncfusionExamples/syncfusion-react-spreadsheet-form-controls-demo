import { SpreadsheetComponent, setCell, getCell, getRowHeight, getRangeIndexes } from '@syncfusion/ej2-react-spreadsheet';
import { RadioButton } from '@syncfusion/ej2-buttons';
import { select } from '@syncfusion/ej2-base';
import { createCheckBox } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';

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
          // console.log("Checkboxexs");
          // console.log(checkboxRowIndex, checkboxColIndex, checkbox.SheetIndex);

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
          setCell(optionButtonRowIndex, optionButtonColIndex, sheet, { template: "optionButton", value: optionButton.Text, formControlType: "checkbox", optionButtonInfo: optionButton } as any, true);
          // console.log("Option Button");
          // console.log(optionButtonRowIndex, optionButtonColIndex);

          const cellModel = getCell(optionButtonRowIndex, optionButtonColIndex, sheet);
          const cellEle = spreadsheet.getCell(optionButtonRowIndex, optionButtonColIndex);

          addOptionButton(cellEle, cellModel);
          // if (getRowHeight(sheet, optionButtonRowIndex) < 25) {
          // spreadsheet.setRowHeight(25, optionButtonRowIndex);
          // }
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
          // console.log("Combo Box");
          // console.log(comboBoxRowIndex, comboBoxColIndex);

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
      checked: true,
    }, inputEle);
  }

  // To render the Check box.
  const addCheckBox = (element: any, cellModel: any) => {
    const sheet = spreadsheet.getActiveSheet();
    const checked = !!cellModel?.value;

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
  };

  // To render combo Box
  const addComboBox = (element: any, cellModel: any, comboBoxData: any) => {
    element.innerHTML = '';
    var inputEle = document.createElement('input');
    element.appendChild(inputEle);
    console.log(cellModel.value);
    new DropDownList({
      placeholder: 'Select a value',
      text: cellModel && cellModel.value ? cellModel.value : null,
      dataSource: comboBoxData,
      cssClass: 'e-dropdown-list',
      value: cellModel && cellModel.value ? cellModel.value : null,
      change: (event) => {
        // dropDownChangeHandler(event);
      }
    }, inputEle);
  };

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
  };

  return (
    <div className="app-container">
      <h1 className="app-header">Spreadsheet Form Controls</h1>
      <SpreadsheetComponent
        openUrl='https://localhost:44341/api/spreadsheet/open'
        saveUrl='https://localhost:44341/api/spreadsheet/save'
        ref={(ssObj: any) => { spreadsheet = ssObj; }}
        created={onCreated}
        openComplete={openComplete}
        beforeCellRender={handleBeforeCellRender}
        height='600px'
      >
      </SpreadsheetComponent>
    </div>
  );
}