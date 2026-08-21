using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;

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
        public IActionResult Open([FromBody] FileOptions options)
        {
            OpenRequest open = new OpenRequest();
            string filePath = _env.ContentRootPath.ToString() + "\\Files\\" + options.FileName + ".xlsx";
            // Getting the file stream from the file path.
            FileStream fileStream = new FileStream(filePath, FileMode.Open);
            // Converting "MemoryStream" to "IFormFile".
            IFormFile formFile = new FormFile(fileStream, 0, fileStream.Length, "", options.FileName + ".xlsx");
            open.File = formFile;
            // Processing the Excel file and return the workbook JSON.
            var result = Workbook.Open(open);

            fileStream.Position = 0;
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Xlsx;
            IWorkbook workbook = excelEngine.Excel.Workbooks.Open(fileStream, ExcelOpenType.Automatic);

            // Check if worksheets have any checkboxes, optionButtons, combo boxes and store the information
            List<CheckBoxShape> allCheckBoxes = new List<CheckBoxShape>();
            List<OptionButtonShape> allOptionButtons = new List<OptionButtonShape>();
            List<ComboBoxShape> allComboBoxes = new List<ComboBoxShape>();
            for (int i = 0; i < workbook.Worksheets.Count; i++)
            {
                IWorksheet worksheet = workbook.Worksheets[i];
                
                // Store information about each checkbox with all required properties
                for (int j = 0; j < worksheet.CheckBoxes.Count; j++)
                {
                    ICheckBoxShape checkBox = worksheet.CheckBoxes[j];
                    CheckBoxShape CheckBoxShape = new CheckBoxShape
                    {
                        Top = (int)checkBox.Top,
                        Left = (int)checkBox.Left,
                        Height = (int)checkBox.Height,
                        Width = (int)checkBox.Width,
                        CheckState = checkBox.CheckState,
                        Text = checkBox.Text ?? string.Empty,
                        SheetIndex = i
                    };

                    allCheckBoxes.Add(CheckBoxShape);
                }
                
                // Store information about each option button with all required properties
                for (int j = 0; j < worksheet.OptionButtons.Count; j++)
                {
                    IOptionButtonShape optionButton = worksheet.OptionButtons[j];
                    OptionButtonShape OptionButtonShape = new OptionButtonShape
                    {
                        Top = (int)optionButton.Top,
                        Left = (int)optionButton.Left,
                        Height = (int)optionButton.Height,
                        Width = (int)optionButton.Width,
                        CheckState = optionButton.CheckState,
                        Text = optionButton.Text ?? string.Empty,
                        SheetIndex = i
                    };

                    allOptionButtons.Add(OptionButtonShape);
                }
                
                // Store information about each combo box with all required properties
                for (int j = 0; j < worksheet.ComboBoxes.Count; j++)
                {
                    IComboBoxShape comboBox = worksheet.ComboBoxes[j];
                    ComboBoxShape ComboBoxShape = new ComboBoxShape
                    {
                        Top = (int)comboBox.Top,
                        Left = (int)comboBox.Left,
                        Height = (int)comboBox.Height,
                        Width = (int)comboBox.Width,
                        SelectedIndex = comboBox.SelectedIndex,
                        ListFillRange = comboBox.ListFillRange != null ? comboBox.ListFillRange.Address : string.Empty,
                        LinkedCell = comboBox.LinkedCell != null ? comboBox.LinkedCell.Address : string.Empty,
                        SheetIndex = i
                    };

                    allComboBoxes.Add(ComboBoxShape);
                }
            }

            fileStream.Close();
            
            // Add checkbox, option button, and combo box information to the result
            if (allCheckBoxes.Count > 0 || allOptionButtons.Count > 0 || allComboBoxes.Count > 0)
            {
                try
                {
                    // Parse the JSON result and modify it to include form controls data
                    using (JsonDocument document = JsonDocument.Parse(result))
                    {
                        // Convert to a JSON object we can modify
                        var rootObject = JsonSerializer.Deserialize<Dictionary<string, object>>(result);
                        
                        // Navigate to the workbook object
                        if (rootObject.ContainsKey("Workbook") && rootObject["Workbook"] != null)
                        {
                            // Handle the workbook object
                            var workbookElement = document.RootElement.GetProperty("Workbook");
                            var workbookJson = workbookElement.GetRawText();
                            var workbookObject = JsonSerializer.Deserialize<Dictionary<string, object>>(workbookJson);
                            
                            // Create a formControls object to hold all form control collections
                            var formControlsObject = new Dictionary<string, object>();
                            
                            // Add checkbox data to formControls object
                            if (allCheckBoxes.Count > 0)
                            {
                                formControlsObject["checkboxCol"] = allCheckBoxes;
                            }
                            
                            // Add option button data to formControls object
                            if (allOptionButtons.Count > 0)
                            {
                                formControlsObject["optionButtonCol"] = allOptionButtons;
                            }
                            
                            // Add combo box data to formControls object
                            if (allComboBoxes.Count > 0)
                            {
                                formControlsObject["comboBoxCol"] = allComboBoxes;
                            }
                            
                            // Add formControls object to workbook
                            workbookObject["formControls"] = formControlsObject;
                            
                            rootObject["Workbook"] = workbookObject;
                        }
                        
                        result = JsonSerializer.Serialize(rootObject);
                    }
                }
                catch (Exception ex)
                {
                    throw(ex);
                }
            }
            
            return Content(result);
        }

        public class FileOptions
        {
            public string FileName { get; set; } = string.Empty;
        }

        public class CheckBoxShape
        {
            public int Top { get; set; }
            public int Left { get; set; }
            public int Height { get; set; }
            public int Width { get; set; }
            public ExcelCheckState CheckState { get; set; }
            public string Text { get; set; } = string.Empty;
            public int SheetIndex { get; set; }
        }

        public class OptionButtonShape
        {
            public int Top { get; set; }
            public int Left { get; set; }
            public int Height { get; set; }
            public int Width { get; set; }
            public ExcelCheckState CheckState { get; set; }
            public string Text { get; set; } = string.Empty;
            public int SheetIndex { get; set; }
        }

        public class ComboBoxShape
        {
            public int Top { get; set; }
            public int Left { get; set; }
            public int Height { get; set; }
            public int Width { get; set; }
            public int SelectedIndex { get; set; }
            public string ListFillRange { get; set; } = string.Empty;
            public string LinkedCell { get; set; } = string.Empty;
            public int SheetIndex { get; set; }
        }

        [HttpPost]
        [Route("Save")]
        public FileStreamResult Save([FromForm] SaveSettings saveSettings,
                            [FromForm] Dictionary<string, string> formControls)
        {
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            var form = formControls;
            Stream fileStream = Workbook.Save<Stream>(saveSettings);
            IWorkbook workbook = excelEngine.Excel.Workbooks.Open(fileStream, ExcelOpenType.Automatic);



            var saveType = saveSettings.SaveType.ToString().ToLower();
            string basePath = _env.ContentRootPath + "\\Files\\" + saveSettings.FileName + '.' + saveType;
            var file = System.IO.File.Create(basePath);
            fileStream.Seek(0, SeekOrigin.Begin);
            // To convert the stream to file options.
            fileStream.CopyTo(file);
            file.Dispose();
            fileStream.Dispose();
            return Workbook.Save(saveSettings);
        }
    }
}
