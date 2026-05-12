using Lanchonete.Mappings;
using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;

namespace Lanchonete.Data;

public class DataContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(
            "server=localhost,15433;User Id=SA;PASSWORD=Senha123!;Initial Catalog=FatFoodTest;Encrypt=True;TrustServerCertificate=True;");
    
    
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new OrderItemMap());
        modelBuilder.ApplyConfiguration(new ProductMap());
        modelBuilder.ApplyConfiguration(new UserMap());
        modelBuilder.ApplyConfiguration(new RoleMap());
        modelBuilder.ApplyConfiguration(new UserRoleMap());
        modelBuilder.ApplyConfiguration(new OrderMap());

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "User" }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Hambúrguer Clássico", Description = "Pão brioche, carne 180g, queijo cheddar, alface e tomate.", Price = 25.00m, StockQuantity = 100 },
            new Product { Id = 2, Name = "Batata Frita G", Description = "Batatas crocantes com sal e alecrim.", Price = 12.00m, StockQuantity = 200 },
            new Product { Id = 3, Name = "Refrigerante Lata", Description = "Coca-Cola ou Guaraná 350ml.", Price = 7.00m, StockQuantity = 500 }
        );
    }
}
