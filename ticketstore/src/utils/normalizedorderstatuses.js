export const normalizedOStatuses = (rows) => {
    if (!rows || rows.length === 0) return [];

    const users = {};

    rows.forEach(r => {
        if (!users[r.user_id]) {
            users[r.user_id] = {
                id: r.user_id,
                userer: r.userer,
                isActive: r.isActive,
                orders: {}
            };
        }

        if (!users[r.user_id].orders[r.id]) {
            users[r.user_id].orders[r.id] = {
                id: r.id,
                status: r.status,
                date: r.date_and_time,
                books: []
            };
        }

        users[r.user_id].orders[r.id].books.push({
            book_id: r.cart_id,
            title: r.title,
            author: r.author,
            price: r.price * r.quantity,
            type: r.type,
            quantity: r.quantity
        });
    });

    return Object.values(users).map(user => ({
        ...user,
        orders: Object.values(user.orders)
    }));
};
