// src/components/ui/button.tsx
"use client"; // Mark this as a Client Component

const Button = ({ children, ...props }) => {
    return (
        <button
            {...props}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
            {children}
        </button>
    );
};

export default Button;
