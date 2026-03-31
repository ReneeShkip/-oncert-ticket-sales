export const normalizeAuthor = (rows) => {
    if (!rows?.length) return [];

    const authorsMap = new Map();

    rows.forEach(r => {
        if (!authorsMap.has(r.org_id)) {
            authorsMap.set(r.org_id, {
                id: r.org_id,
                type_id: r.type_id,
                ukr: {
                    name: r.name_ukr,
                    biography: r.biography_ukr,
                    type: r.type_ukr,
                },
                eng: {
                    name: r.name_eng,
                    biography: r.biography_eng,
                    type: r.type_eng,
                },
                photo: r.photo,
                links: r.links,
                events: [],
            });
        }

        const author = authorsMap.get(r.org_id);
        if (r.event_id && !author.events.some(e => e.id === r.event_id)) {
            author.events.push({ id: r.event_id });
        }
    });

    return [...authorsMap.values()];
};