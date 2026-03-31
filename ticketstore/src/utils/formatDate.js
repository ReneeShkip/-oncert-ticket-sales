export const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
};