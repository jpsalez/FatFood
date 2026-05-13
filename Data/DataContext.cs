using Lanchonete.Enums;
using Lanchonete.Mappings;
using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;
using SecureIdentity.Password;

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
    public DbSet<Category> Categories { get; set; }
    public DbSet<ProductCategory> ProductCategories { get; set; }

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new OrderItemMap());
        modelBuilder.ApplyConfiguration(new ProductMap());
        modelBuilder.ApplyConfiguration(new UserMap());
        modelBuilder.ApplyConfiguration(new RoleMap());
        modelBuilder.ApplyConfiguration(new UserRoleMap());
        modelBuilder.ApplyConfiguration(new OrderMap());
        modelBuilder.ApplyConfiguration(new CategoryMap());
        modelBuilder.ApplyConfiguration(new ProductCategoryMap());

        modelBuilder.Entity<Role>().HasData(
            new Role {  Name = "Admin" },
            new Role {  Name = "User" }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product {  Name = "Hambúrguer Clássico", Description = "Pão brioche, carne 180g, queijo cheddar, alface e tomate.", Price = 25.00m, StockQuantity = 100 },
            new Product {  Name = "Batata Frita G", Description = "Batatas crocantes com sal e alecrim.", Price = 12.00m, StockQuantity = 200 },
            new Product { Id = 3, Name = "Refrigerante Lata", Description = "Coca-Cola ou Guaraná 350ml.", Price = 7.00m, StockQuantity = 500 }
        );

        modelBuilder.Entity<Category>().HasData(
            new Category { Name = "Lanches", Color = "#d63031" },
            new Category {  Name = "Acompanhamentos", Color = "#e17055" },
            new Category { Name = "Bebidas", Color = "#0984e3" },
            new Category { Name = "Sobremesas", Color = "#a29bfe" }
        );

        modelBuilder.Entity<ProductCategory>().HasData(
            new ProductCategory {  ProductId = 1, CategoryId = 1 },
            new ProductCategory {  ProductId = 2, CategoryId = 2 },
            new ProductCategory {  ProductId = 3, CategoryId = 3 }
        );

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Name = "Admin",
                Email = "admin@fatfood.com",
                hashPassword = PasswordHasher.Hash("Admin@123")
            },
            new User
            {
                Name = "User",
                Email = "user@fatfood.com",
                hashPassword = PasswordHasher.Hash("User@123")
            }
        );

        modelBuilder.Entity<UserRole>().HasData(
            new UserRole {  UserId = 1, RoleId = 1 },
            new UserRole {  UserId = 2, RoleId = 2 }
        );

        modelBuilder.Entity<Order>().HasData(
            new Order
            {
                UserId = 2,
                CreatedAt = new DateTime(2024, 5, 12, 0, 0, 0, DateTimeKind.Utc),
                Status = OrderStatus.COMPLETED,
                TotalPrice = 56.00m
            }
        );

        modelBuilder.Entity<OrderItem>().HasData(
            new OrderItem {  OrderId = 1, ProductId = 1, Quantity = 1 },
            new OrderItem {  OrderId = 1, ProductId = 2, Quantity = 2 },
            new OrderItem {  OrderId = 1, ProductId = 3, Quantity = 1 }
        );
    }
}
