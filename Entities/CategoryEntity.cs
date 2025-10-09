namespace MobileAppServer.Entities
{
    public class CategoryEntity:BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<ServiceEntity> Services { get; set; } = new();
    }
}
