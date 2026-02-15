import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'check_circle' : 'error';

    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${bgColor} transition-all animate-in fade-in slide-in-from-top-4`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    );
};

export default Toast;
