import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  type = 'warning',
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(onConfirm, 200);
  };

  const getTypeStyles = () => {
    const styles = {
      danger: {
        icon: <AlertTriangle className="text-red-600" size={48} />,
        confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        accent: "text-red-600"
      },
      warning: {
        icon: <AlertTriangle className="text-yellow-600" size={48} />,
        confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        accent: "text-yellow-600"
      },
      success: {
        icon: <CheckCircle className="text-green-600" size={48} />,
        confirmBtn: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
        accent: "text-green-600"
      },
      info: {
        icon: <CheckCircle className="text-blue-600" size={48} />,
        confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        accent: "text-blue-600"
      }
    };
    return styles[type];
  };

  if (!isOpen) return null;

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-lg transform transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {title}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {typeStyles.icon}
                </div>
                <div className="flex-1">
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {message}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-6 py-2 text-sm font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 ${typeStyles.confirmBtn}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;