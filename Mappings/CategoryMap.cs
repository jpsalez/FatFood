using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lanchonete.Mappings;

public class CategoryMap : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).UseIdentityColumn().ValueGeneratedOnAdd().HasColumnType("int");
        builder.Property(x => x.Name).IsRequired().HasMaxLength(80).HasColumnType("nvarchar");
        builder.Property(x => x.Color).IsRequired().HasMaxLength(20).HasColumnType("nvarchar").HasDefaultValue("#888888");
    }
}
