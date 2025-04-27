import React from "react";

export const PayPalButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      PayPal ile Öde
    </button>
  );
}; 