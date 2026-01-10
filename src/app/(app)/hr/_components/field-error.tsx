export function FieldError({ id, message }: { id?: string; message?: string | string[] }) {
    if (!message || (Array.isArray(message) && message.length === 0)) {
        return null;
    }

    const text = Array.isArray(message) ? message.join(' ') : message;

    return (
        <p id={id} role="alert" className="text-xs text-destructive">
            {text}
        </p>
    );
}
