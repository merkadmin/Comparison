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

var webRoot = builder.Environment.WebRootPath ?? Path.Combine(builder.Environment.ContentRootPath, "wwwroot");

// Ensure image root folders exist so static file serving works from startup
Directory.CreateDirectory(Path.Combine(webRoot, builder.Configuration["Storage:ProductImagesFolder"]!));
Directory.CreateDirectory(Path.Combine(webRoot, builder.Configuration["Storage:CategoryImagesFolder"]!));

app.UseStaticFiles();   // serves wwwroot/** → GET /ProductImages/{itemId}/{filename}

app.UseCors("AngularPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();
