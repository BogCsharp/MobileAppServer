namespace MobileAppServer.Abstracts
{
    public interface IPasswordRepository
    {
        string CreatePasswordHash(string password);
        string GenerateRefreshToken();
    }
}
