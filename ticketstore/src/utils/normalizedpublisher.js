export const normalizePublisher = (rows) => {
    if (!rows || rows.length === 0) {
        return {
            id: null,
            name: "",
            logo: null,
            books: []
        };
    }

    const base = rows[0];
    const booksMap = new Map();

    rows.forEach(r => {
        if (r.book_id && !booksMap.has(r.book_id)) {
            booksMap.set(r.book_id, {
                id: r.book_id,
                title: r.title,
                year: r.year,
                types: []
            });
        }

        if (r.book_id && r.book_type_id) {
            booksMap.get(r.book_id).types.push({
                book_type_id: r.book_type_id,
                type: r.type,
                price: r.price
            });
        }
    });

    return {
        id: base.publisher_id,
        name: base.publisher,
        logo: base.logo,
        books: Array.from(booksMap.values())
    };
};
