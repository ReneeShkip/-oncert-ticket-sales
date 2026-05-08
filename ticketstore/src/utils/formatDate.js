export const formatDate = (dateStr, lang = 'ukr') => {
    const locale = lang === 'ukr' ? 'uk-UA' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
};