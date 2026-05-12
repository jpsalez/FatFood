using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lanchonete.Mappings;

public class UserMap : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).UseIdentityColumn().ValueGeneratedOnAdd().IsRequired().HasColumnName("Id").HasColumnType("int");
        
        builder.Property(x => x.Name).IsRequired().HasColumnName("Name").HasColumnType("nvarchar").HasMaxLength(50);
        
        builder.HasMany(x => x.Orders).WithOne(x => x.User).HasForeignKey(x => x.UserId);
        
        builder.Property(x => x.hashPassword).IsRequired().HasColumnName("hashPassword").HasColumnType("nvarchar").HasMaxLength(100);

        builder.HasMany(x => x.Roles).WithOne(x => x.User).HasForeignKey(x => x.UserId);

        builder.Property(x => x.Email).IsRequired().HasColumnName("Email").HasColumnType("nvarchar").HasMaxLength(150);
    }
}