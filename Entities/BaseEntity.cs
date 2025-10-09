namespace MobileAppServer.Entities
{
    public class BaseEntity
    {
        public long Id {  get; set; }
        public DateTime CreatedAt { get; set; }=DateTime.Now;
    }
}
