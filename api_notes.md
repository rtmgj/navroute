# NavRoute — ASP.NET Core 8 Web API Structure

## Project Setup

```bash
dotnet new webapi -n NavRoute.Api --framework net8.0
cd NavRoute.Api
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package BCrypt.Net-Next
dotnet add package Microsoft.AspNetCore.Session
```

---

## Folder Structure

```
NavRoute.Api/
├── Controllers/
│   ├── AuthController.cs
│   ├── RotalarController.cs
│   ├── KonumlarController.cs
│   ├── FavorilerController.cs
│   └── TrafikController.cs
├── Data/
│   └── NavRouteDbContext.cs
├── Models/
│   ├── Kullanici.cs
│   ├── Konum.cs
│   ├── Rota.cs
│   ├── TrafikDurumu.cs
│   └── Favori.cs
├── DTOs/
│   ├── LoginDto.cs
│   ├── RotaDto.cs
│   └── KonumDto.cs
├── Middleware/
│   └── SessionAuthMiddleware.cs
└── Program.cs
```

---

## Program.cs (key config)

```csharp
builder.Services.AddDbContext<NavRouteDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(opt => {
    opt.IdleTimeout = TimeSpan.FromHours(8);
    opt.Cookie.HttpOnly = true;
    opt.Cookie.IsEssential = true;
});

builder.Services.AddCors(opt => opt.AddPolicy("FrontendPolicy", p =>
    p.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));

app.UseCors("FrontendPolicy");
app.UseSession();
app.UseMiddleware<SessionAuthMiddleware>();
```

---

## API Endpoints

### Auth — `POST /api/auth/login`
```json
// Request
{ "email": "admin@navroute.com", "password": "123456" }
// Response 200
{ "kullaniciId": 1, "ad": "Admin", "soyad": "User", "email": "admin@navroute.com" }
// Response 401
{ "message": "Geçersiz kimlik bilgileri" }
```

### Auth — `POST /api/auth/logout`
Clears session. Returns `200 OK`.

---

### Routes — `GET /api/rotalar` *(Protected)*
Returns all routes for the logged-in user, ordered by `Tarih DESC`.

### Routes — `POST /api/rotalar` *(Protected)*
```json
{ "baslangicKonum": "Ankara", "bitisKonum": "İstanbul", "mesafe": "454 km", "sure": "4 sa 30 dk" }
```

### Routes — `DELETE /api/rotalar/{id}` *(Protected)*
Deletes a route (ownership validated).

---

### Locations — `GET /api/konumlar` *(Protected)*
Returns user's saved locations.

### Locations — `POST /api/konumlar` *(Protected)*
```json
{ "konumAdi": "Ev", "enlem": 41.01, "boylam": 28.97, "kategori": "star" }
```

### Locations — `DELETE /api/konumlar/{id}` *(Protected)*

---

### Favorites — `POST /api/favoriler` *(Protected)*
```json
{ "konumId": 3 }
```

### Favorites — `DELETE /api/favoriler/{konumId}` *(Protected)*

---

### Traffic — `GET /api/trafik`
Returns all `TrafikDurumu` records (public, refreshed every 5 min by a background service).

---

## SessionAuthMiddleware.cs

```csharp
public class SessionAuthMiddleware(RequestDelegate next)
{
    private static readonly string[] _publicPaths = ["/api/auth/login"];

    public async Task Invoke(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? "";
        if (_publicPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        { await next(ctx); return; }

        var userId = ctx.Session.GetInt32("KullaniciID");
        if (userId is null) { ctx.Response.StatusCode = 401; return; }

        ctx.Items["KullaniciID"] = userId;
        await next(ctx);
    }
}
```

---

## NavRouteDbContext.cs

```csharp
public class NavRouteDbContext(DbContextOptions<NavRouteDbContext> options) : DbContext(options)
{
    public DbSet<Kullanici>     Kullanicilar  { get; set; }
    public DbSet<Konum>         Konumlar      { get; set; }
    public DbSet<Rota>          Rotalar       { get; set; }
    public DbSet<TrafikDurumu>  TrafikDurumu  { get; set; }
    public DbSet<Favori>        Favoriler     { get; set; }

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Favori>()
          .HasIndex(f => new { f.KullaniciID, f.KonumID })
          .IsUnique();
    }
}
```

---

## appsettings.json (key section)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=NavRouteDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

---

## EF Core Migrations

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```
