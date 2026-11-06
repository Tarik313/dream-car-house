"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white p-8 font-sans">
        <div className="max-w-xl mx-auto my-20 p-6 border border-red-500/30 rounded-lg bg-red-950/20">
          <h2 className="text-xl font-bold text-red-400 mb-2">Application Error</h2>
          <p className="text-sm text-gray-300 mb-4">{error.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Retry Connection
          </button>
        </div>
      </body>
    </html>
  );
}
