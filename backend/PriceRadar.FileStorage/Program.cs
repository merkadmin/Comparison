var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!;
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();

var app = builder.Build();

// Ensure the ProductImages root exists so static file serving works from startup
var imagesRoot = Path.Combine(
    builder.Environment.WebRootPath ?? Path.Combine(builder.Environment.ContentRootPath, "wwwroot"),
    builder.Configuration["Storage:ProductImagesFolder"]!);
Directory.CreateDirectory(imagesRoot);

app.UseStaticFiles();   // serves wwwroot/** → GET /ProductImages/{itemId}/{filename}

app.UseCors("AngularPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();
