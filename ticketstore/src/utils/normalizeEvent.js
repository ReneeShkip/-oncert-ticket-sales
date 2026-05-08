export const normalizeEvents = (rows) => {
    if (!rows?.length) return [];

    const events = new Map();

    rows.forEach(r => {

        if (!events.has(r.ID)) {
            events.set(r.ID, {
                id: r.ID,
                title: r.title,
                type_id: r.type_id,
                description: r.description,
                ukr: {
                    type: r.type_ukr,
                },
                eng: {
                    type: r.type_eng,
                },
                cover: r.cover,
                duration: r.duration,
                price: r.price,
                tickets: [],
                genres: [],
                organizations: []
            });
        }

        const event = events.get(r.ID);

        if (!event.tickets.some(t => t.date_id === r.date_id)) {
            event.tickets.push({
                date_id: r.date_id,
                date: r.date,
                quantity: r.quantity,
                status: r.status,
                location: {
                    country_id: r.country_id,
                    ukr: {
                        country: r.country_ukr,
                        address: r.address_ukr
                    },
                    eng: {
                        country: r.country_eng,
                        address: r.address_eng
                    }
                }
            });
        }

        if (r.org_id && !event.organizations.some(o => o.id === r.org_id)) {
            event.organizations.push({
                id: r.org_id
            });
        }

        if (!event.genres.some(g => g.id === r.genre_id)) {
            event.genres.push({
                id: r.genre_id,
                ukr: r.genre_ukr,
                eng: r.genre_eng
            });
        }

    });

    return [...events.values()];
};