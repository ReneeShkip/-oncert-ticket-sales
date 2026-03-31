export const normalizeEvents = (rows) => {
    if (!rows?.length) return [];

    const events = new Map();

    rows.forEach(r => {

        if (!events.has(r.ID)) {
            events.set(r.ID, {
                id: r.ID,
                ukr: {
                    title: r.title_ukr,
                    description: r.description_ukr,
                    type: r.type_ukr,
                },
                eng: {
                    title: r.title_eng,
                    description: r.description_eng,
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

        // tickets
        event.tickets.push({
            date_id: r.date_id,
            date: r.date,
            quantity: r.quantity,
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

        // organizations
        if (r.org_id && !event.organizations.some(o => o.id === r.org_id)) {
            event.organizations.push({
                id: r.org_id
            });
        }

        // genres
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