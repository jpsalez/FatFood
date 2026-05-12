using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lanchonete.Mappings;

public class ProductMap : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id).UseIdentityColumn().IsRequired().ValueGeneratedOnAdd().HasColumnType("int");

        builder.Property(x => x.Name).IsRequired().HasMaxLength(100).HasColumnType("nvarchar").IsRequired();
        
        builder.Property(x => x.StockQuantity).IsRequired().HasColumnType("int");
        
        builder.Property(x => x.Price).IsRequired().HasColumnType("decimal(18,2)");

        builder.Property(x => x.Description).HasColumnType("text");

        builder.Property(x => x.Img).HasColumnType("nvarchar(max)");
    }
}
