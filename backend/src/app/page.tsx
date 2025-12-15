export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Easy UX Backend is Running</h1>
        <p className="text-gray-600 mb-4">The API endpoints are active.</p>
        <div className="flex flex-col gap-2 text-sm text-gray-500">
          <p>POST /api/chat</p>
          <p>POST /api/match</p>
        </div>
        <p className="mt-6 text-sm text-gray-400">Please access the application via the Frontend URL.</p>
      </div>
    </div>
  );
}
