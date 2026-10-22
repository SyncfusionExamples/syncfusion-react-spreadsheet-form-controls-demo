import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <div className="app-header">Spreadsheet Form Controls</div>
      <div className='container'>
        <SpreadsheetComponent
          openUrl='https://appservice-267100-e9c8cxaab6a2dfeu.centralindia-01.azurewebsites.net/api/spreadsheet/open'
          saveUrl='https://appservice-267100-e9c8cxaab6a2dfeu.centralindia-01.azurewebsites.net/api/spreadsheet/save'
        >
        </SpreadsheetComponent>
      </div>
    </div>
  );
}