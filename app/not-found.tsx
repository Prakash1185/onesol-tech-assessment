'use client';

export default function GlobalError() {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Application Error</h2>
            <p className="text-gray-600">Something went wrong with the application</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}