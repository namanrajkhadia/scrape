// src/components/ui/textarea.tsx
"use client"; // Mark this as a Client Component

const Textarea = ({ ...props }) => {
    return (
        <textarea
            {...props}
            className="border rounded-md p-2" // Add your custom styles
        />
    );
};

export default Textarea;
