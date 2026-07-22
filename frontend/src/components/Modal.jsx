import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;
    const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-[var(--color-surface-200)]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-[var(--color-border-color)] transform transition-all max-h-[90vh] flex flex-col`}>
                <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border-color)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="px-8 py-6 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
            </div>
        </div>
    );
}
