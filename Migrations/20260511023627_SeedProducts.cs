using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Lanchonete.Migrations
{
    /// <inheritdoc />
    public partial class SeedProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Description", "Name", "Price", "StockQuantity" },
                values: new object[,]
                {
                    { 1, "Pão brioche, carne 180g, queijo cheddar, alface e tomate.", "Hambúrguer Clássico", 25.00m, 100 },
                    { 2, "Batatas crocantes com sal e alecrim.", "Batata Frita G", 12.00m, 200 },
                    { 3, "Coca-Cola ou Guaraná 350ml.", "Refrigerante Lata", 7.00m, 500 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
