using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lanchonete.Mappings;

public class OrderItemMap : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");
        
        builder.Property(x => x.Id).UseIdentityColumn().IsRequired().ValueGeneratedOnAdd().HasColumnType("int").IsRequired();
        

        builder.Property(x => x.Quantity).HasColumnType("int")
            .IsRequired();

        builder.HasOne(x => x.Product).WithMany( x => x.OrderItems).HasForeignKey(x => x.ProductId);
        
        

    }
        
        
        
    
}
