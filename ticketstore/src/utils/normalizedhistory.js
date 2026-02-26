export const normalizeHistory = (rows) => {
    if (!rows || rows.length === 0) return [];

    const orders = {};

    rows.forEach(r => {
        if (!orders[r.id]) {
            orders[r.id] = {
                id: r.id,
                date: r.date_and_time,
                status: r.name_status,
                books: []
            };
        }
        orders[r.id].books.push({
            book_id: r.cart_id,
            title: r.title,
            author: r.author,
            price: r.price * r.quantity,
            type: r.type,
            quantity: r.quantity
        })
    });
    return Object.values(orders);
};
