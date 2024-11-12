import React from 'react';
import './modal.css';

type ModalProps = {
    onClose: () => void;
    children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
    return (
        // inset-0 flex items-center justify-center bg-black bg-opacity-50
        <div className="modal-frame fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="modal-content bg-white rounded-lg shadow-lg p-4"
                style={{ borderRadius: '5px'}}
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500">
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;