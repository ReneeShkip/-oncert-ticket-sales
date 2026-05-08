export const normalizeOrderStatuses = (rows) => {
    if (!rows?.length) return [];

    const usersMap = new Map();

    rows.forEach(r => {
        if (!usersMap.has(r.user_id)) {
            usersMap.set(r.user_id, {
                id: r.user_id,
                firstName: r.first_name,
                lastName: r.last_name,
                phone_number: r.phone_number,
                role: r.role,
                email: r.email,
                orders: new Map()
            });
        }

        const user = usersMap.get(r.user_id);

        if (r.order_id && !user.orders.has(r.order_id)) {
            user.orders.set(r.order_id, {
                id: r.order_id,
                date: r.date_and_time,
                cart: []
            });
        }

        if (r.order_id && r.cart_id) {
            const order = user.orders.get(r.order_id);
            if (!order.cart.some(c => c.id === r.cart_id)) {
                order.cart.push({
                    id: r.cart_id,
                    ticket_date_id: r.ticket_date_id,
                    quantity: r.quantity,
                    reserved_until: r.reserved_until
                });
            }
        }
    });

    return [...usersMap.values()].map(user => ({
        ...user,
        orders: [...user.orders.values()]
    }));
};