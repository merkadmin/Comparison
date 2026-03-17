using PriceRadar.API.Seeder;
using PriceRadar.Core.Interfaces;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Repositories;

var builder = WebApplication.CreateBuilder(args);

// MongoDB
var mongoConnectionString = builder.Configuration["MongoDB:ConnectionString"]!;
var mongoDatabaseName = builder.Configuration["MongoDB:DatabaseName"]!;
builder.Services.AddSingleton(new MongoDbContext(mongoConnectionString, mongoDatabaseName));

// Repositories (DAL)
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IStoreRepository, StoreRepository>();
builder.Services.AddScoped<IPriceListingRepository, PriceListingRepository>();
builder.Services.AddScoped<IPriceHistoryRepository, PriceHistoryRepository>();
builder.Services.AddScoped<IItemCategoryRepository, ItemCategoryRepository>();
builder.Services.AddScoped<IItemBrandRepository, ItemBrandRepository>();
builder.Services.AddScoped<IItemRepository, ItemRepository>();
builder.Services.AddScoped<IItemPackageRepository, ItemPackageRepository>();

// CORS for Angular dev server
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!;
builder.Services.AddCors(options =>
{
	options.AddPolicy("AngularPolicy", policy =>
		policy.WithOrigins(allowedOrigins)
			  .AllowAnyHeader()
			  .AllowAnyMethod());
});

builder.Services.AddSingleton<DataSeeder>();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
}

// Auto-seed on startup (skips if data already exists)
using (var scope = app.Services.CreateScope())
{
	var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
	await seeder.SeedAsync();
}

// Manual re-seed endpoint (dev only) — POST /api/seed
app.MapPost("/api/seed", async (DataSeeder seeder) =>
{
	await seeder.SeedAsync();
	return Results.Ok(new { message = "Seeding complete." });
}).WithTags("Seed");

app.UseHttpsRedirection();
app.UseCors("AngularPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();
