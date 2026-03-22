import { useEffect } from "react";

export default function ErrorModal({ isOpen, onClose, message, title = "Error" }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-8.02 14A2 2 0 004 21h16a2 2 0 001.73-3.14l-8.02-14a2 2 0 00-3.46 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-800 text-center mb-2">{title}</h3>
        <p className="text-sm text-stone-600 text-center mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-stone-800 text-white font-semibold rounded-lg hover:bg-stone-900 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
