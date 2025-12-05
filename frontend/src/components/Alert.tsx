import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert = ({ type, title, message, isOpen, onClose, autoClose = true, duration = 4000 }: AlertProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Aguarda a animação terminar
  };

  if (!isOpen) return null;

  const getAlertStyles = () => {
    const baseStyles = "fixed top-4 right-4 max-w-md w-full shadow-2xl rounded-lg border-l-4 transform transition-all duration-300 ease-in-out z-50";
    
    const typeStyles = {
      success: "bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-800",
      error: "bg-gradient-to-r from-red-50 to-red-100 border-red-500 text-red-800",
      warning: "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500 text-yellow-800",
      info: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 text-blue-800"
    };

    const visibilityStyles = isVisible 
      ? "translate-x-0 opacity-100 scale-100" 
      : "translate-x-full opacity-0 scale-95";

    return `${baseStyles} ${typeStyles[type]} ${visibilityStyles}`;
  };

  const getIcon = () => {
    const iconProps = { size: 24 };
    
    const icons = {
      success: <CheckCircle {...iconProps} className="text-green-600" />,
      error: <XCircle {...iconProps} className="text-red-600" />,
      warning: <AlertCircle {...iconProps} className="text-yellow-600" />,
      info: <Info {...iconProps} className="text-blue-600" />
    };

    return icons[type];
  };

  const getProgressBarColor = () => {
    const colors = {
      success: "bg-green-600",
      error: "bg-red-600", 
      warning: "bg-yellow-600",
      info: "bg-blue-600"
    };
    return colors[type];
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isVisible ? 'bg-opacity-10' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Alert */}
      <div className={getAlertStyles()}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold leading-5">
                  {title}
                </h3>
                {message && (
                  <p className="mt-1 text-sm opacity-90">
                    {message}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
            >
              <X size={16} className="opacity-60 hover:opacity-100" />
            </button>
          </div>
        </div>
        
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="h-1 bg-black bg-opacity-10">
            <div 
              className={`h-full ${getProgressBarColor()}`}
              style={{ 
                animation: `progressShrink ${duration}ms linear`,
                transformOrigin: 'left',
                width: '100%'
              }}
            />
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </>
  );
};

export default Alert;