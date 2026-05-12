using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lanchonete.Mappings;

public class UserRoleMap : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");
        
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Id).ValueGeneratedOnAdd().HasColumnType("int").IsRequired();
        
        builder.Property(x => x.UserId).HasColumnName("UserId").IsRequired().HasColumnType("int");

        builder.Property(x => x.RoleId).HasColumnName("RoleId").IsRequired().HasColumnType("int");



    }
}