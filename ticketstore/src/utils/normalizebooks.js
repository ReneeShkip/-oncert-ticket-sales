export const normalizeBook = (rows) => {
    if (!rows || rows.length === 0) return null;

    const base = rows[0];

    return {
        id: base.book_id,
        title: base.title,
        annotation: base.annotation,
        cover: base.cover,
        year: base.year,
        publisher: base.publisher,
        language: base.lang,
        author: {
            id: base.author_id,
            first_name: base.first_name,
            last_name: base.last_name,
            biography: base.biography,
            photo: base.photo,
            links: base.links
        },
        types: rows.map(r => ({
            book_type_id: r.book_type_id,
            type_id: r.type_id,
            type: r.type,
            price: r.price,
            availability: r.availability
        }))
    };
};
