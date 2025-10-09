
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpLogging;
using MobileAppServer.Extensions;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpLogging(_ => { });
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });


builder
    .AddData()
    .AddServices();


var app = builder.Build();

app.UseHttpLogging();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseRouting();


app.MapControllers();

app.MapGet("/", () => Results.Ok("MobileAppServer is running"));
app.Run();
