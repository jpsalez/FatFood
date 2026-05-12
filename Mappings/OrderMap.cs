using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lanchonete.Mappings;

public class OrderMap : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.Property(x => x.Id).UseIdentityColumn().IsRequired().ValueGeneratedOnAdd().HasColumnType("int");

        builder.HasMany(x => x.Items).WithOne(x => x.Order).HasForeignKey(x => x.OrderId);
        
        builder.Property(x => x.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("GETDATE()");

        builder.Property(x => x.Status).HasConversion<string>().IsRequired();

    builder.Property(x => x.TotalPrice).HasColumnType("decimal(18,2)").IsRequired();


    }
}
