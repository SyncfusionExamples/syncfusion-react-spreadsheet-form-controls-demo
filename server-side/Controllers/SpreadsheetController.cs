using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Buttons;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Syncfusion.XlsIO.Implementation.Shapes;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpreadsheetController : ControllerBase
    {
        private readonly ILogger<SpreadsheetController> _logger;
        private readonly IWebHostEnvironment _env;

        public SpreadsheetController(ILogger<SpreadsheetController> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        [HttpPost]
        [Route("Open")]
        public IActionResult Open(IFormCollection openRequest)
        {
            string jsonWorkbook = string.Empty;

            if (openRequest.Files.Count > 0)
            {
                IFormFile excelFormFile = openRequest.Files[0] as IFormFile;

                OpenRequest open = new OpenRequest();
                open.File = excelFormFile;
                // Processing the Excel file and return the Spreadsheet workbook JSON.
                jsonWorkbook = Workbook.Open(open);

                // Process the Excel form controls from each worksheet and generate Spreadsheet form controls.
                var formControls = ProcessFormControlsOnOpen(excelFormFile);

                // Add form control information to the workbook result
                if (formControls != null && !string.IsNullOrEmpty(jsonWorkbook))
                {
                    jsonWorkbook = UpdateWorkbookJson(jsonWorkbook, formControls);
                }
            }

            return Content(jsonWorkbook);
        }

        private static Dictionary<string, object>? ProcessFormControlsOnOpen(IFormFile excelFile)
        {
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Xlsx;
            Stream fileStream = new MemoryStream();
            fileStream = excelFile.OpenReadStream();
            fileStream.Position = 0;
            // Opening the Excel stream to process and load the form controls.
            IWorkbook workbook = excelEngine.Excel.Workbooks.Open(fileStream, ExcelOpenType.Automatic);

            // Check if worksheets have any checkboxes, optionButtons, combo boxes and store the information
            List<CheckBoxShape> allCheckBoxes = new List<CheckBoxShape>();
            List<OptionButtonShape> allOptionButtons = new List<OptionButtonShape>();
            List<ComboBoxShape> allComboBoxes = new List<ComboBoxShape>();

            for (int sheetIdx = 0; sheetIdx < workbook.Worksheets.Count; sheetIdx++)
            {
                IWorksheet worksheet = workbook.Worksheets[sheetIdx];
                var checkBoxes = worksheet.CheckBoxes;
                if (checkBoxes != null && checkBoxes.Count > 0)
                {
                    // Store information about each checkbox with all required properties
                    for (int j = 0; j < checkBoxes.Count; j++)
                    {
                        ICheckBoxShape checkBox = checkBoxes[j];
                        ShapeImpl checkboxShapeImpl = (ShapeImpl)checkBox;
                        CheckBoxShape CheckBoxShape = new CheckBoxShape
                        {
                            RowIndex = (int)checkboxShapeImpl.TopRow - 1,
                            ColIndex = (int)checkboxShapeImpl.LeftColumn - 1,
                            Height = (int)checkBox.Height,
                            Width = (int)checkBox.Width,
                            CheckState = checkBox.CheckState,
                            Text = checkBox.Text ?? string.Empty,
                            SheetIndex = sheetIdx,
                            
                        };

                        allCheckBoxes.Add(CheckBoxShape);
                    }
                }

                var optionButtons = worksheet.OptionButtons;
                if (optionButtons != null && optionButtons.Count > 0)
                {
                    // Store information about each option button with all required properties
                    for (int j = 0; j < optionButtons.Count; j++)
                    {
                        IOptionButtonShape optionButton = optionButtons[j];
                        ShapeImpl optionButtonShapeImpl = (ShapeImpl)optionButton;
                        OptionButtonShape OptionButtonShape = new OptionButtonShape
                        {
                            RowIndex = (int)optionButtonShapeImpl.TopRow - 1,
                            ColIndex = (int)optionButtonShapeImpl.LeftColumn - 1,
                            Height = (int)optionButton.Height,
                            Width = (int)optionButton.Width,
                            CheckState = optionButton.CheckState,
                            Text = optionButton.Text ?? string.Empty,
                            SheetIndex = sheetIdx
                        };

                        allOptionButtons.Add(OptionButtonShape);
                    }
                }

                var comboBoxes = worksheet.ComboBoxes;
                if (comboBoxes != null && comboBoxes.Count > 0)
                {
                    // Store information about each combo box with all required properties
                    for (int j = 0; j < comboBoxes.Count; j++)
                    {
                        IComboBoxShape comboBox = comboBoxes[j];
                        ShapeImpl comboBoxShapeImpl = (ShapeImpl)comboBox;
                        ComboBoxShape ComboBoxShape = new ComboBoxShape
                        {
                            RowIndex = (int)comboBoxShapeImpl.TopRow - 1,
                            ColIndex = (int)comboBoxShapeImpl.LeftColumn - 1,
                            Height = (int)comboBox.Height,
                            Width = (int)comboBox.Width,
                            SelectedIndex = comboBox.SelectedIndex,
                            ListFillRange = comboBox.ListFillRange != null ? comboBox.ListFillRange.Address : string.Empty,
                            LinkedCell = comboBox.LinkedCell != null ? comboBox.LinkedCell.Address : string.Empty,
                            SheetIndex = sheetIdx
                        };

                        allComboBoxes.Add(ComboBoxShape);
                    }
                }
            }

            workbook.Close();
            excelEngine.Dispose();
            fileStream.Close();

            // Add checkbox, option button, and combo box information to the result
            if (allCheckBoxes.Count > 0 || allOptionButtons.Count > 0 || allComboBoxes.Count > 0)
            {
                // Create a formControls object to hold all form control collections
                var formControls = new Dictionary<string, object>();

                // Add checkbox data to formControls object
                if (allCheckBoxes.Count > 0)
                {
                    formControls["checkBoxes"] = allCheckBoxes;
                }

                // Add option button data to formControls object
                if (allOptionButtons.Count > 0)
                {
                    formControls["optionButtons"] = allOptionButtons;
                }

                // Add combo box data to formControls object
                if (allComboBoxes.Count > 0)
                {
                    formControls["comboBoxes"] = allComboBoxes;
                }

                return formControls;
            }

            return null;
        }

        private static string UpdateWorkbookJson(string result, Dictionary<string, object> formControls)
        {
            // Parse the JSON result and modify it to include form controls data
            using (JsonDocument document = JsonDocument.Parse(result))
            {
                // Convert to a JSON object we can modify
                var rootObject = JsonSerializer.Deserialize<Dictionary<string, object>>(result);

                // Navigate to the workbook object
                if (rootObject != null && rootObject.ContainsKey("Workbook") && rootObject["Workbook"] != null)
                {
                    // Handle the workbook object
                    var workbookElement = document.RootElement.GetProperty("Workbook");
                    var workbookJson = workbookElement.GetRawText();
                    var workbookObject = JsonSerializer.Deserialize<Dictionary<string, object>>(workbookJson);
                    if (workbookObject != null)
                    {
                        // Add formControls object to workbook
                        workbookObject["formControls"] = formControls;
                        rootObject["Workbook"] = workbookObject;
                        result = JsonSerializer.Serialize(rootObject);
                    }
                }
            }
            return result;
        }

        [HttpPost]
        [Route("Save")]
        public IActionResult Save([FromForm] SaveSettings saveSettings, [FromForm] Dictionary<string, string> formControls)
        {
            if (formControls != null && (formControls.ContainsKey("checkBoxes") || formControls.ContainsKey("comboBoxes") && formControls.ContainsKey("optionButtons")))
            {
                return ProcessFormControlsOnSave(formControls, saveSettings);
            }
            else
            {
                return Workbook.Save(saveSettings);
            }
        }

        private static FileStreamResult ProcessFormControlsOnSave([FromForm] Dictionary<string, string> formControls, SaveSettings saveSettings)
        {
            // Save Excel as Stream
            Stream fileStream = Workbook.Save<Stream>(saveSettings);
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            // Opening the saved Excel Stream as XLSIO workbook to update the form controls
            IWorkbook workbook = excelEngine.Excel.Workbooks.Open(fileStream, ExcelOpenType.Automatic);
            // Deserialize form controls from the dictionary
            List<CheckBoxShape> checkboxes = new List<CheckBoxShape>();
            // Parse CheckBoxes
            if (formControls.ContainsKey("checkBoxes") && !string.IsNullOrEmpty(formControls["checkBoxes"]))
            {
                checkboxes = JsonSerializer.Deserialize<List<CheckBoxShape>>(formControls["checkBoxes"]) ?? new List<CheckBoxShape>();
            }
            // Add checkboxes to the workbook
            if (checkboxes.Count > 0)
            {
                foreach (var checkbox in checkboxes)
                {
                    IWorksheet sheet = workbook.Worksheets[checkbox.SheetIndex];
                    // Add 1 to rowIndex and colIndex because they are 0-based from client but XLSIO expects 1-based
                    ICheckBoxShape checkBox = sheet.CheckBoxes.AddCheckBox(checkbox.RowIndex + 1, checkbox.ColIndex + 1, checkbox.Height, checkbox.Width);
                    checkBox.Text = checkbox.Text;
                    checkBox.CheckState = checkbox.CheckState;
                }
            }
            List<OptionButtonShape> optionButtons = new List<OptionButtonShape>();
            // Parse OptionButtons
            if (formControls.ContainsKey("optionButtons") && !string.IsNullOrEmpty(formControls["optionButtons"]))
            {
                optionButtons = JsonSerializer.Deserialize<List<OptionButtonShape>>(formControls["optionButtons"]) ?? new List<OptionButtonShape>();
            }
            // Add option buttons to the workbook
            if (optionButtons.Count > 0)
            {
                foreach (var optionButton in optionButtons)
                {
                    IWorksheet sheet = workbook.Worksheets[optionButton.SheetIndex];
                    // Add 1 to rowIndex and colIndex because they are 0-based from client but XLSIO expects 1-based
                    IOptionButtonShape optBtn = sheet.OptionButtons.AddOptionButton(optionButton.RowIndex + 1, optionButton.ColIndex + 1, optionButton.Height, optionButton.Width);
                    optBtn.Text = optionButton.Text;
                    optBtn.CheckState = optionButton.CheckState;
                }
            }
            List<ComboBoxShape> comboBoxes = new List<ComboBoxShape>();
            // Parse ComboBoxes
            if (formControls.ContainsKey("comboBoxes") && !string.IsNullOrEmpty(formControls["comboBoxes"]))
            {
                comboBoxes = JsonSerializer.Deserialize<List<ComboBoxShape>>(formControls["comboBoxes"]) ?? new List<ComboBoxShape>();
            }
            // Add combo boxes to the workbook
            if (comboBoxes.Count > 0)
            {
                foreach (var comboBox in comboBoxes)
                {
                    IWorksheet sheet = workbook.Worksheets[comboBox.SheetIndex];
                    // Add 1 to rowIndex and colIndex because they are 0-based from client but XLSIO expects 1-based
                    IComboBoxShape comboBoxShape = sheet.ComboBoxes.AddComboBox(comboBox.RowIndex + 1, comboBox.ColIndex + 1, comboBox.Height, comboBox.Width);

                    // Set list fill range if available
                    if (!string.IsNullOrEmpty(comboBox.ListFillRange))
                    {
                        comboBoxShape.ListFillRange = sheet[comboBox.ListFillRange];
                    }

                    // Set linked cell if available
                    if (!string.IsNullOrEmpty(comboBox.LinkedCell))
                    {
                        comboBoxShape.LinkedCell = sheet[comboBox.LinkedCell];
                    }

                    // Set selected index
                    comboBoxShape.SelectedIndex = comboBox.SelectedIndex;
                }
            }
            // Save the workbook with the form controls to memory stream
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            ms.Position = 0;
            string contentType = saveSettings.GetContentType();
            var excelFileStream = new FileStreamResult(ms, contentType)
            {
                FileDownloadName = saveSettings.FileName + ".xlsx"
            };
            // Clean up
            workbook.Close();
            excelEngine.Dispose();
            fileStream.Dispose();
            return excelFileStream;
        }

        public class CheckBoxShape
        {
            public int Height { get; set; }
            public int Width { get; set; }
            public ExcelCheckState CheckState { get; set; }
            public string Text { get; set; } = string.Empty;
            public int SheetIndex { get; set; }
            public int RowIndex { get; set; }
            public int ColIndex { get; set; }
        }

        public class OptionButtonShape
        {
            public int Height { get; set; }
            public int Width { get; set; }
            public ExcelCheckState CheckState { get; set; }
            public string Text { get; set; } = string.Empty;
            public int SheetIndex { get; set; }
            public int RowIndex { get; set; }
            public int ColIndex { get; set; }
        }

        public class ComboBoxShape
        {
            public int Height { get; set; }
            public int Width { get; set; }
            public int SelectedIndex { get; set; }
            public string ListFillRange { get; set; } = string.Empty;
            public string LinkedCell { get; set; } = string.Empty;
            public int SheetIndex { get; set; }
            public int RowIndex { get; set; }
            public int ColIndex { get; set; }
        }
    }
}
