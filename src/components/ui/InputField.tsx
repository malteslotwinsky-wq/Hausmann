'use client';

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}

export function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text'
}: InputFieldProps) {
    return (
        <div className="card-mobile">
            <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-base"
            />
        </div>
    );
}
