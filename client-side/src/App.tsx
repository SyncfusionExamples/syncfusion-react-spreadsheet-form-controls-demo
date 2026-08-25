import { SpreadsheetComponent, setCell, getCell, getRangeIndexes, getSheetIndexFromAddress } from '@syncfusion/ej2-react-spreadsheet';
import type { CellModel, SheetModel, BeforeSaveEventArgs } from '@syncfusion/ej2-spreadsheet';
import { RadioButton } from '@syncfusion/ej2-buttons';
import { select, createElement, isNullOrUndefined, getUniqueID } from '@syncfusion/ej2-base';
import { createCheckBox } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';

import './App.css';

export default function App() {
  let spreadsheet: any;
  let isSaveJson: boolean;

  const openCompleteHandler = (args: any) => {
    const formControls = args.response.data && args.response.data.formControls;
    if (formControls) {
      updateFormControls(formControls);
    }
    // Updating formControl flag to retain during save action
    spreadsheet.isFormControlsAdded = !!formControls;
  }

  const updateFormControls = (formControls: { checkBoxes?: object[], optionButtons?: object[], comboBoxes?: object[] }) => {
    // Processing Checkboxes
    if (formControls.checkBoxes) {
      formControls.checkBoxes.forEach((checkBox: any) => updateFormControlToCell('checkBox', checkBox));
    }

    // Processing option Button
    if (formControls.optionButtons) {
      formControls.optionButtons.forEach((optionButton: any) => {
        if (optionButton.CheckState) {
          const sheet: any = spreadsheet.sheets[optionButton.SheetIndex];
          if (sheet) {
            spreadsheet.setSheetPropertyOnMute(sheet, 'activeOptionBtn', optionButton.Text);
          }
        }
        delete optionButton.CheckState;
        updateFormControlToCell('optionButton', optionButton);
      });
    }

    // Processing Combo Box
    if (formControls.comboBoxes) {
      formControls.comboBoxes.forEach((comboBox: any) => updateFormControlToCell('comboBox', comboBox));
    }
  }

  const updateFormControlToCell = (template: string, model: { RowIndex: number, ColIndex: number, SheetIndex: number, CheckState?: boolean | number }): void => {
    const sheet: SheetModel = spreadsheet.sheets[model.SheetIndex];
    setCell(model.RowIndex, model.ColIndex, sheet, { template: template, formControl: model } as any, true);
  };

  // To render the Radio button.
  const addOptionButton = (element: any, cellModel: any) => {
    const inputEle = document.createElement('input');
    element.appendChild(inputEle);
    const sheet: any = spreadsheet.getActiveSheet();
    if (!cellModel.formControl.Text) {
      cellModel.formControl.Text = getUniqueID('Option Button');
    }
    // Initializing Syncfusion radio button
    const radioButton = new RadioButton({
      label: cellModel.formControl.Text,
      name: 'radioButton' + sheet.id,
      checked: sheet.activeOptionBtn === cellModel.formControl.Text,
      change: () => {
        spreadsheet.setSheetPropertyOnMute(spreadsheet.getActiveSheet(), 'activeOptionBtn', radioButton.label);
      }
    });
    // element.radioButtonInstance = radioButton;
    radioButton.createElement = spreadsheet.createElement;
    radioButton.appendTo(inputEle);
  }

  // To render the Check box.
  const addCheckBox = (element: HTMLElement, cellModel: any) => {
    const checked = !!cellModel.formControl.CheckState;

    // Creating Syncfusion checkbox
    const checkboxWrapper: HTMLElement = createCheckBox(spreadsheet.createElement, false, { checked, label: cellModel.formControl.Text }) as HTMLElement;
    element.appendChild(checkboxWrapper);

    // For maintaining the checkbox state
    checkboxWrapper.onclick = () => {
      const input = select('.e-frame', checkboxWrapper);
      const newChecked = !input.classList.contains('e-check');
      if (newChecked) {
        input.classList.add('e-check');
      } else {
        input.classList.remove('e-check');
      }
      // Update the CheckState directly in the formControl object
      // Convert boolean to numeric value (0 or 1) for server compatibility
      if (cellModel.formControl) {
        cellModel.formControl.CheckState = newChecked ? 1 : 0;
      }
    };
  }

  // To render combo Box dropdown
  const addComboBox = (element: any, cellModel: any) => {
    // Gets the value from all the cells within the given dropdown fill range
    const dataRange: string = cellModel.formControl.ListFillRange;
    const comboBoxData: string[] = [];
    const sheetIdx: number = getSheetIndexFromAddress(spreadsheet, dataRange);
    const sheet: SheetModel = spreadsheet.sheets[sheetIdx];
    const rangeIndexes = getRangeIndexes(dataRange);
    for (let i = rangeIndexes[0]; i <= rangeIndexes[2]; i++) {
      for (let j = rangeIndexes[1]; j <= rangeIndexes[3]; j++) {
        const cell: CellModel = getCell(i, j, sheet);
        if (cell && !isNullOrUndefined(cell.value)) {
          comboBoxData.push(cell.value as string);
        }
      }
    }
    const inputEle = document.createElement('input');
    element.appendChild(inputEle);
    // Initializing Syncfusion Dropdown list
    const dropdownInst: DropDownList = new DropDownList({
      dataSource: comboBoxData,
      cssClass: 'e-dropdown-list',
      value: comboBoxData[cellModel.formControl.SelectedIndex - 1] || null,
      change: (event) => {
        // Update the SelectedIndex in the formControl object
        if (cellModel.formControl && event.value) {
          const selectedIndex = comboBoxData.indexOf(event.value);
          cellModel.formControl.SelectedIndex = selectedIndex >= 0 ? selectedIndex + 1 : 0;
          dropdownInst.value = comboBoxData[cellModel.formControl.SelectedIndex - 1] || null;
          dropdownInst.dataBind();
        }
      }
    });
    dropdownInst.createElement = spreadsheet.createElement;
    dropdownInst.appendTo(inputEle);
  }

  const beforeCellRenderHandler = (args: any) => {
    if (args.cell && args.cell.template && args.element) {
      while (args.element.firstChild) {
        args.element.removeChild(args.element.firstChild);
      }
      args.element.textContent = '';
      if (args.cell.template === 'checkBox') { // Adding checkbox
        addCheckBox(args.element, args.cell);
      } else if (args.cell.template === 'comboBox') { // Adding dropdown
        addComboBox(args.element, args.cell);
      } else if (args.cell.template === 'optionButton') { // Adding radio button
        addOptionButton(args.element, args.cell);
      }
    }
  }

  const beforeSaveHandler = (args: BeforeSaveEventArgs): void => {
    if (!isSaveJson) {
      if (spreadsheet.isFormControlsAdded && args.saveType === 'Xlsx') {
        // Canceling the default save action.
        args.cancel = true;
        // Performing custom save to process form controls and include form controls duing save action.
        performCustomSave(args);
      } else {
        args.isFullPost = false;
      }
    }
  };

  const performCustomSave = (saveArgs: BeforeSaveEventArgs) => {
    isSaveJson = true;
    spreadsheet.showSpinner();
    spreadsheet.saveAsJson().then((res: any) => {
      isSaveJson = false;
      const workbookJson = res.jsonObject.Workbook;
      const formData: FormData = new FormData();
      // Add the JSON data to the formData object
      formData.append('JSONData', JSON.stringify(workbookJson));
      // Specify the file name and save type as Excel (Xlsx)
      formData.append('fileName', saveArgs.fileName as string);
      formData.append('saveType', 'Xlsx');
      // Process form controls from workbook
      const formControls: { checkBoxes: object[], optionButtons: object[], comboBoxes: object[] } = processFormControlsOnSave(workbookJson);
      // Add form controls data - sending each collection separately for better server processing
      formData.append('formControls[checkBoxes]', JSON.stringify(formControls.checkBoxes));
      formData.append('formControls[optionButtons]', JSON.stringify(formControls.optionButtons));
      formData.append('formControls[comboBoxes]', JSON.stringify(formControls.comboBoxes));
      // Add PDF layout settings, even though this is for Excel export
      formData.append('pdfLayoutSettings', JSON.stringify({ fitSheetOnOnePage: false, orientation: 'Portrait' }));
      // Send a POST request to Syncfusion's save API
      fetch(saveArgs.url as string, { method: 'POST', body: formData }).then((response) => {
        response.blob().then((data) => {
          // Saving the file in the local machine inside default download location.
          const anchor: any = createElement('a', { attrs: { download: saveArgs.fileName + '.xlsx' } });
          const url = URL.createObjectURL(data);
          anchor.href = url;
          document.body.appendChild(anchor);
          anchor.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(anchor);
          spreadsheet.hideSpinner();
        });
      })
    });
  }

  const processFormControlsOnSave = (workbook: any): { checkBoxes: object[], optionButtons: object[], comboBoxes: object[] } => {
    // Initialize formControls object
    const formControls: { checkBoxes: object[], optionButtons: object[], comboBoxes: object[] } = { checkBoxes: [], optionButtons: [], comboBoxes: [] };
    workbook.sheets.forEach((sheet: any, sheetIndex: number) => {
      // Loop through each row
      if (sheet.rows && Array.isArray(sheet.rows)) {
        sheet.rows.forEach((row: any, rowIndex: number) => {
          // Loop through each cell
          if (row.cells && Array.isArray(row.cells)) {
            row.cells.forEach((cell: any, colIndex: number) => {
              // Check if the cell has formControl property
              if (cell.template && cell.formControl) {
                // Add row and column indices
                cell.formControl.RowIndex = rowIndex;
                cell.formControl.ColIndex = colIndex;
                cell.formControl.SheetIndex = sheetIndex;
                // Perform separate action based on the form control type
                switch (cell.template) {
                  // Add formControl to checkBoxes array
                  case 'checkBox':
                    // Ensure CheckState is numeric value (0 or 1) for server compatibility
                    if (typeof cell.formControl.CheckState === 'boolean') {
                      cell.formControl.CheckState = cell.formControl.CheckState ? 1 : 0;
                    }
                    formControls.checkBoxes.push(cell.formControl);
                    break;
                  // Add formControl to optionButtons array
                  case 'optionButton':
                    {
                      const sheetModel: any = spreadsheet.sheets[sheetIndex];
                      // Updating option button checked state.
                      if (sheetModel && cell.formControl.Text === sheetModel.activeOptionBtn) {
                        cell.formControl.CheckState = 1;
                      }
                      formControls.optionButtons.push(cell.formControl);
                    }
                    break;
                  // Add formControl to comboBoxes array
                  case 'comboBox':
                    formControls.comboBoxes.push(cell.formControl);
                    break;
                }
                // Remove form control properties from the cell
                delete cell.formControl;
                delete cell.template;
              }
            });
          }
        });
      }
    });
    return formControls;
  }

  return (
    <div className="app-container">
      <div className="app-header">Spreadsheet Form Controls</div>
      <div className='container'>
        <SpreadsheetComponent
          openUrl='https://localhost:44341/api/spreadsheet/open'
          saveUrl='https://localhost:44341/api/spreadsheet/save'
          ref={(ssObj: any) => { spreadsheet = ssObj; }}
          openComplete={openCompleteHandler}
          beforeCellRender={beforeCellRenderHandler}
          beforeSave={beforeSaveHandler}
        >
        </SpreadsheetComponent>
      </div>
    </div>
  );
}