using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Localization;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue; // or set a custom larger value
    options.KeyLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = long.MaxValue; // if you're uploading files
});


builder.Services.AddControllers();

var MyAllowSpecificOrigins = "AllowAllOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins, builder => {
        builder.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

//Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("Your license key");

app.UseCors(MyAllowSpecificOrigins);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Enable static files middleware
app.UseStaticFiles();

app.MapControllers();

app.Run();
