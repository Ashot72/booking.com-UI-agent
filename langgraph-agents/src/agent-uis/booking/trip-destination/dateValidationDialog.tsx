import { useArtifact } from '@/agent-uis/utils/use-artifact';
import React, { useEffect } from 'react';

interface DateValidationDialogProps {
  showDateDialog: boolean;
  setShowDateDialog: (show: boolean) => void;
  errorMessage?: string;
}

const DateValidationDialog: React.FC<DateValidationDialogProps> = ({
  showDateDialog,
  setShowDateDialog,
  errorMessage,
}) => {
  const [, { setOpen }] = useArtifact();

  useEffect(() => {
    if (showDateDialog) {
      setOpen(true);
    }
  }, [showDateDialog, setOpen]);

  if (!showDateDialog) {
    return null;
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1055,
        }}
        onClick={() => setShowDateDialog(false)}
      ></div>

      {/* Modal Content */}
      <div
        className="modal fade show"
        style={{
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1060,
          pointerEvents: 'none',
        }}
        tabIndex={-1}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                Missing Required Information
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDateDialog(false)}
                style={{ cursor: 'pointer' }}
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">
                {errorMessage ||
                  'Please select both Arrival Date and Departure Date before searching for hotels.'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowDateDialog(false)}
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-check me-2"></i>
                OK, I understand
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DateValidationDialog;
