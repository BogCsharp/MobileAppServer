
using System.Threading;
using System.Threading.Channels;

namespace MobileAppServer.Queue
{
    public class BackgroundTaskQueue : IBackgroundTaskQueue
    {
        private readonly Channel<Func<CancellationToken, ValueTask>> _queue;
        public BackgroundTaskQueue(int capacity = 100)
        {
            var opt = new BoundedChannelOptions(capacity)
            {
                FullMode = BoundedChannelFullMode.Wait
            };
            _queue=Channel.CreateBounded<Func<CancellationToken, ValueTask>>(opt);
        }
        public async Task<Func<CancellationToken, ValueTask>> DequeueAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }

        public void QueueBackgroundWorkItem(Func<CancellationToken, ValueTask> workItem)
        {
            ArgumentNullException.ThrowIfNull(workItem);
            _queue.Writer.TryWrite(workItem);
        }
    }
}
