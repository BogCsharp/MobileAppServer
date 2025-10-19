using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileAppServer.Migrations
{
    /// <inheritdoc />
    public partial class UserEntityDeleteCar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarModel",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CarNumber",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "CarNumber",
                table: "Cars",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarNumber",
                table: "Cars");

            migrationBuilder.AddColumn<string>(
                name: "CarModel",
                table: "Users",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "CarNumber",
                table: "Users",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
