import { ShoppingBag } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Fast pulse animation with bounce */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0056D2] rounded-2xl mb-6 animate-[bounce_0.8s_ease-in-out_infinite] shadow-lg">
          <ShoppingBag className="w-10 h-10 text-white animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
        <h2 className="text-2xl mb-3 text-gray-800">Urban Wear Retail</h2>
        {/* Fast smooth progress bar */}
        <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-[#0056D2] to-[#0070F0] rounded-full animate-[fastLoading_0.8s_ease-in-out_infinite]"></div>
        </div>
        <p className="text-sm text-gray-500 mt-3">Loading your shopping experience...</p>
      </div>
      <style>{`
        @keyframes fastLoading {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 80%;
            margin-left: 20%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}