using Microsoft.EntityFrameworkCore;
using ApiTP.Models;

namespace ApiTP.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Auto> Auto { get; set; }
    }
}