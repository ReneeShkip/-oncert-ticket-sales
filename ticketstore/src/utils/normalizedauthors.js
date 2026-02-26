export const normalizeAurhor = (rows) => {
    if (!rows || rows.length === 0) return null;

    const base = rows[0];

    const booksMap = new Map();

    rows.forEach(r => {
        if (!booksMap.has(r.book_id)) {
            booksMap.set(r.book_id, {
                id: r.book_id,
                title: r.title,
                year: r.year,
                types: []
            });
        }

        if (r.book_type_id) {
            booksMap.get(r.book_id).types.push({
                book_type_id: r.book_type_id,
                type: r.type,
                price: r.price
            });
        }
    });

    return {
        id: base.author_id,
        first_name: base.first_name,
        last_name: base.last_name,
        biography: base.biography,
        photo: base.photo,
        links: base.links || "Відсутні",
        books: Array.from(booksMap.values())
    };
};
