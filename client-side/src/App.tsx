import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <div className="app-header">Spreadsheet Form Controls</div>
      <div className='container'>
        <SpreadsheetComponent
          openUrl='https://services.syncfusion.com/angular/production/api/spreadsheet/open'
          saveUrl='https://services.syncfusion.com/angular/production/api/spreadsheet/save'
        >
        </SpreadsheetComponent>
      </div>
    </div>
  );
}