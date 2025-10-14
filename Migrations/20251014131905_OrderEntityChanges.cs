using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileAppServer.Migrations
{
    /// <inheritdoc />
    public partial class OrderEntityChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderServices_Cars_CarEntityId",
                table: "OrderServices");

            migrationBuilder.DropIndex(
                name: "IX_OrderServices_CarEntityId",
                table: "OrderServices");

            migrationBuilder.DropColumn(
                name: "CarEntityId",
                table: "OrderServices");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "CarEntityId",
                table: "OrderServices",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderServices_CarEntityId",
                table: "OrderServices",
                column: "CarEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderServices_Cars_CarEntityId",
                table: "OrderServices",
                column: "CarEntityId",
                principalTable: "Cars",
                principalColumn: "Id");
        }
    }
}
