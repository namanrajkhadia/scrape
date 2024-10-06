// src/components/ui/input.tsx
"use client"; // Mark this as a Client Component

const Input = ({ ...props }) => {
    return (
        <input
            {...props}
            className="border rounded-md p-2" // Add your custom styles
        />
    );
};

export default Input;