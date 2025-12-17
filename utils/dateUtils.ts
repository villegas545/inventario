export const formatDate = (timestamp: number): { fullDate: string, time: string } => {
    const date = new Date(timestamp);
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit'
    };

    const datePart = date.toLocaleDateString('es-ES', dateOptions);
    const capitalizedDate = datePart.charAt(0).toUpperCase() + datePart.slice(1);
    const timePart = date.toLocaleTimeString('es-ES', timeOptions);

    return { fullDate: capitalizedDate, time: timePart };
};
