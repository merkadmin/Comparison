using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PriceRadar.API.Seeder;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Repositories;

var builder = WebApplication.CreateBuilder(args);

// MongoDB
var mongoConnectionString = builder.Configuration["MongoDB:ConnectionString"]!;
var mongoDatabaseName = builder.Configuration["MongoDB:DatabaseName"]!;
builder.Services.AddSingleton(new MongoDbContext(mongoConnectionString, mongoDatabaseName));

// Repositories (DAL) — auto-registered via reflection
var baseRepoType = typeof(IBaseRepository<>);
bool IsOrExtendsBaseRepo(Type i) =>
	(i.IsGenericType && i.GetGenericTypeDefinition() == baseRepoType) ||
	i.GetInterfaces().Any(ii => ii.IsGenericType && ii.GetGenericTypeDefinition() == baseRepoType);

foreach (var impl in typeof(ItemCategoryRepository).Assembly.GetTypes()
	.Where(t => t is { IsClass: true, IsAbstract: false, DeclaringType: null } &&
				t.Namespace == "PriceRadar.DAL.Repositories"))
{
	// Interfaces declared directly on this class (not inherited from its base)
	var ownInterfaces = impl.GetInterfaces()
		.Except(impl.BaseType?.GetInterfaces() ?? Array.Empty<Type>())
		.ToList();

	if (ownInterfaces.Count > 0)
		foreach (var iface in ownInterfaces)
			builder.Services.AddScoped(iface, impl);
	else if (impl.GetInterfaces().FirstOrDefault(IsOrExtendsBaseRepo) is { } baseService)
		builder.Services.AddScoped(baseService, impl);
}

// CORS for Angular dev server
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!;
builder.Services.AddCors(options =>
{
	options.AddPolicy("AngularPolicy", policy =>
		policy.WithOrigins(allowedOrigins)
			  .AllowAnyHeader()
			  .AllowAnyMethod());
});

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer           = true,
			ValidateAudience         = true,
			ValidateLifetime         = true,
			ValidateIssuerSigningKey = true,
			ValidIssuer              = builder.Configuration["Jwt:Issuer"],
			ValidAudience            = builder.Configuration["Jwt:Audience"],
			IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
		};
	});

builder.Services.AddSingleton<JwtService>();
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

if (!app.Environment.IsDevelopment())
{
	app.UseHttpsRedirection();
}
app.UseCors("AngularPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
