'use client';

export default function Error() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground">Please try refreshing the page</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}