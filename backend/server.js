require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { use } = require("react");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root1",
    database: "bookstore",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/categories", (req, res) => {
    const query = "SELECT id, name, view_name FROM categories ORDER BY name";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch categories" });
        }
        res.json(results);
    });
});

app.get("/genres", (req, res) => {
    const query = "select id, genre from genres";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch genres" });
        }
        res.json(results);
    });
});

app.get("/types", (req, res) => {
    const query = "select id, type from type";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch type" });
        }
        res.json(results);
    });
});

app.get("/price", (req, res) => {
    const query = "select max(bt.price) as max, min(bt.price) as min  from book_type bt";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch type" });
        }
        res.json(results);
    });
});

app.get("/langs", (req, res) => {
    const query = "select id, name from langs";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch languages" });
        }
        res.json(results);
    });
});

app.get("/books", (req, res) => {
    const categoryIdentifier = req.query.category;
    const limit = parseInt(req.query.limit) || 7;
    const offset = parseInt(req.query.offset) || 0;

    if (!categoryIdentifier) {
        return res.status(400).json({ error: "Category is required" });
    }

    const getCategoryQuery = `
        SELECT view_name, name 
        FROM categories 
        WHERE id = ? OR name = ? OR view_name = ?
    `;

    db.query(getCategoryQuery, [categoryIdentifier, categoryIdentifier, categoryIdentifier], (err, categoryResults) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (categoryResults.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        const viewName = categoryResults[0].view_name;

        const query = `SELECT * FROM ${mysql.escapeId(viewName)} ORDER BY price DESC LIMIT ? OFFSET ?`;

        db.query(query, [limit, offset], (err, results) => {
            if (err) {
                console.error("SQL error:", err);
                return;
            }
            res.json(results);
        });
    });
});

app.get("/authors", (req, res) => {
    const id = req.query.id;
    let query = "SELECT id, first_name, last_name, biography, photo FROM authors";
    const params = [];

    if (id) {
        query += " WHERE id = ?";
        params.push(id);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch authors" });
        }
        res.json(results);
    });
});

app.get("/publishers", (req, res) => {

    const id = req.query.id;

    let query = "SELECT ID, name, photo FROM publishers";
    let params = [];

    if (id) {
        query += " WHERE ID = ?";
        params.push(id);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch publishers" });
        }
        res.json(results);
    });

});

app.get("/authors_books", (req, res) => {
    const { book_id, authorId, PublisherId, limit = 20, offset = 0 } = req.query;

    let query = `
        SELECT DISTINCT
            bt.id AS book_type_id,
            b.id AS book_id,
            b.title,
            p.name AS publisher,
            p.id as publisher_id,
            p.photo as logo,
            bt.type_id,
            t.type,
            bt.price,
            b.annotation,
            bt.availability,
            b.cover,
            b.year,
            a.id AS author_id,
            a.first_name,
            a.last_name,
            a.biography,
            a.photo,
            a.links,            
            l.name as lang
        FROM book_type bt
        JOIN books b ON b.id = bt.book_id
        JOIN authors a ON a.id = b.author
        JOIN publishers p ON p.id = b.publisher_id
        JOIN type t ON t.id = bt.type_id
        JOIN langs l ON l.id = b.lang_id
    `;

    const conditions = [];
    const params = [];

    if (book_id) {
        conditions.push("bt.book_id = (SELECT book_id FROM book_type WHERE id = ?)");
        params.push(book_id);
    }

    if (authorId) {
        conditions.push("a.id = ?");
        params.push(authorId);
    }
    if (PublisherId) {
        conditions.push("p.id = ?");
        params.push(PublisherId);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY bt.id LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch books" });
        }
        res.json(results);
    });
});

app.post("/log_in", (req, res) => {
    const { login, password } = req.body;
    db.query(
        `SELECT id, login, first_name, last_name, phone_number, password, role, email, city
         FROM users
         WHERE login = ? AND isActive = "T"
         LIMIT 1`,
        [login],
        async (err, results) => {
            if (err) return res.status(500).send("Server error");
            if (!results || results.length === 0) {
                return res.status(401).json({ error: "Невірний логін або пароль" });
            }
            const user = results[0];
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: "Невірний логін або пароль" });
            }

            res.json({
                id: user.id,
                login: user.login,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                role: user.role,
                email: user.email,
                city: user.city
            });
        }
    );
});

app.post("/sign_up", async (req, res) => {
    const { login, password, first_name, last_name, phone_number, role } = req.body || {};

    if (!login || !password) {
        return res.status(400).json({ error: "Login or password missing" });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        const query = `
            INSERT INTO users(first_name, last_name, login, password, phone_number, role)
            VALUES(?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [first_name, last_name, login, passwordHash, phone_number, role],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: "Server error", details: err.message });
                }

                res.json({
                    id: results.insertId,
                    login,
                    first_name,
                    last_name,
                    phone_number,
                    role
                });
            }
        );
    } catch (err) {
        res.status(500).json({ error: "Password hashing failed" });
    }
});

app.get("/filteredbooks", (req, res) => {
    const isSearch = req.query.search === "true";
    const q = req.query.q?.trim() || "";

    const genres = req.query.genres
        ? req.query.genres.split(",").map(Number)
        : [];

    const types = req.query.types
        ? req.query.types.split(",").map(Number)
        : [];

    const langs = req.query.langs
        ? req.query.langs.split(",").map(Number)
        : [];

    const minPrice = req.query.minPrice
        ? Number(req.query.minPrice)
        : null;

    const maxPrice = req.query.maxPrice
        ? Number(req.query.maxPrice)
        : null;

    let sql = `
        SELECT DISTINCT
            bt.ID AS ID,
            b.ID AS book_id,
            b.title AS title,
            b.year AS year,
            a.first_name AS first_name,
            a.last_name AS last_name,
            bt.price AS price,
            b.cover AS cover,
            t.type AS type,
            bt.availability,
            l.name AS lang
        FROM book_type bt
        JOIN books b ON b.ID = bt.book_id
        JOIN authors a ON a.ID = b.author
        JOIN book_genre bg ON bg.book_id = b.ID
        JOIN type t ON t.ID = bt.type_id
        JOIN langs l ON l.id = b.lang_id
        WHERE 1=1
    `;

    const values = [];

    if (q) {
        sql += `
            AND (
                b.title LIKE ?
                OR a.first_name LIKE ?
                OR a.last_name LIKE ?
            )
        `;
        values.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (genres.length) {
        sql += ` AND bg.genre_id IN (${genres.map(() => "?").join(",")})`;
        values.push(...genres);
    }

    if (types.length) {
        sql += ` AND bt.type_id IN (${types.map(() => "?").join(",")})`;
        values.push(...types);
    }

    if (langs.length) {
        sql += ` AND b.lang_id IN (${langs.map(() => "?").join(",")})`;
        values.push(...langs);
    }

    if (minPrice !== null) {
        sql += ` AND bt.price >= ?`;
        values.push(minPrice);
    }

    if (maxPrice !== null) {
        sql += ` AND bt.price <= ?`;
        values.push(maxPrice);
    }

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch books" });
        }
        res.json(results);
    });
});

app.get("/comments/:bookType", (req, res) => {
    const { bookType } = req.params;

    const sql = `
        SELECT c.id, c.date_post, c.caption, c.sub_rate, c.user_id, u.login
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.book_id = (SELECT book_id FROM book_type WHERE id = ?)
        ORDER BY c.date_post DESC
    `;

    db.query(sql, [bookType], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

app.post("/new_comm", (req, res) => {

    const { user_id, book_id, caption, sub_rate, date_post } = req.body || {};

    if (!user_id || !book_id || !caption || !sub_rate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let mysqlDate;
    if (date_post) {
        mysqlDate = new Date(date_post).toISOString().slice(0, 19).replace('T', ' ');
    } else {
        mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const query = `
        INSERT INTO comments(user_id, book_id, caption, sub_rate, date_post)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [user_id, book_id, caption, sub_rate, mysqlDate], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ message: "Comment added!", comment: { caption, sub_rate } });
    });
});

app.get("/cart", (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ error: "No user_id provided" });
    }

    const query = `
              SELECT
        c.id,
        bt.id AS id,
        b.title,
        b.cover,
        bt.price,
        a.first_name,
        a.last_name,
        c.quantity,
        t.type
        FROM cart c
        JOIN book_type bt ON bt.id = c.book_id
        JOIN books b ON b.id = bt.book_id
        JOIN authors a ON a.id = b.author
        JOIN type t ON t.id = bt.type_id
        WHERE c.in_order IS NULL and c.user_id = ?
        ORDER BY c.id DESC;
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

app.post("/add_cart", (req, res) => {

    const { user_id, book_id, quantity } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({
            error: "Missing required fields",
            received: { user_id, book_id }
        });
    }

    const checkQuery = `
        SELECT * FROM cart 
        WHERE user_id = ? AND book_id = ? AND in_order IS NULL;
    `;

    db.query(checkQuery, [user_id, book_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }

        if (results.length > 0) {
            const newQuantity = results[0].quantity + (quantity || 1);

            db.query(
                `UPDATE cart SET quantity = ? WHERE id = ?`,
                [newQuantity, results[0].id],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: "Server error" });
                    }
                    res.json({ message: "Quantity updated" });
                }
            );
        } else {
            db.query(
                `INSERT INTO cart (user_id, book_id, quantity)
                 VALUES (?, ?, ?)`,
                [user_id, book_id, quantity || 1],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: "Server error" });
                    }
                    res.json({ message: "Added to cart" });
                }
            );
        }
    });
});

app.put("/cart/:id", (req, res) => {
    const { id } = req.params;
    const { user_id, quantity } = req.body;

    const query = `
        UPDATE cart 
        SET quantity = ? 
        WHERE book_id = ? AND user_id = ?
    `;

    db.query(query, [quantity, id, user_id], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json({ message: "Quantity updated" });
    });
});

app.delete("/cart/:id", (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;

    const query = `DELETE FROM cart
            WHERE book_id = ? and user_id = ?
            AND in_order IS NULL
`;

    db.query(query, [id, user_id], (err) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json({ message: "Item removed" });
    });
});

app.delete("/cart", (req, res) => {
    const { user_id } = req.query;

    const query = `DELETE FROM cart
        WHERE user_id = ?
        AND in_order IS NULL`;

    db.query(query, [user_id], (err, result) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Server error" });
        }

        res.json({ deleted: result.affectedRows });
    });
});

app.get("/history", (req, res) => {
    const user_id = Number(req.query.user_id);
    const params = [];

    let query = `
        SELECT
        o.id as id,
        u.id AS user_id,
        u.first_name as userer,
        u.isActive,
        c.id AS cart_id,
        bt.id AS ID,
        b.title,
        bt.price,
        concat(a.first_name, ' ', a.last_name) as author,
        c.quantity,
        t.type,
        s.id as status,
        s.status as name_status,
        o.date_and_time
    FROM orders o
    JOIN cart c ON c.in_order = o.id
    JOIN book_type bt ON bt.id = c.book_id
    JOIN books b ON b.id = bt.book_id
    JOIN authors a ON a.id = b.author
    JOIN users u ON u.id = c.user_id
    JOIN type t ON t.id = bt.type_id
    JOIN statuses s ON s.id = o.status_id
    `;

    if (user_id) {
        query += "WHERE u.id = ? ORDER BY s.id;"
        params.push(user_id);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

app.post("/edit_info", (req, res) => {
    const { id, first_name, last_name, login, phone_number, email, city } = req.body;

    if (!id) {
        return res.status(400).json({ error: "User id is required" });
    }

    db.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, login = ?, phone_number = ?, email = ?, city = ?
         WHERE id = ?`,
        [first_name, last_name, login, phone_number, email, city, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Server error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ message: "User info updated" });
        }
    );
});

app.get("/posta", (req, res) => {
    const query = `select id, posta from posta`;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
})

app.post("/departments", async (req, res) => {
    const { ref } = req.body;

    try {
        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "apiKey": process.env.NOVA_POSHTA_API_KEY,
                "modelName": "AddressGeneral",
                "calledMethod": "getWarehouses",
                "methodProperties": {
                    "CityRef": ref
                }
            })
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({ error: data.errors });
        }

        res.json(data.data);
    } catch (err) {
        res.status(500).json({ error: "Nova Poshta API error" });
    }
});

app.post("/city", async (req, res) => {
    const { city } = req.body;

    try {
        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "apiKey": process.env.NOVA_POSHTA_API_KEY,
                "modelName": "AddressGeneral",
                "calledMethod": "getCities",
                "methodProperties": {
                    "FindByString": city
                }
            })
        });
        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({ error: data.errors });
        }

        res.json(data.data);
    } catch (err) {
        res.status(500).json({ error: "Nova Poshta API error" });
    }
});

app.post("/make_order", (req, res) => {
    const { date_and_time, posta_id, post_address, cart_ids, user_id } = req.body;

    if (!posta_id || !post_address || !date_and_time || !user_id || !cart_ids?.length) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }

    const mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.query(
        `INSERT INTO orders (date_and_time, posta_id, post_address, status_id)
         VALUES (?, ?, ?, 1)`,
        [mysqlDate, posta_id, post_address],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Insert order failed" });
            }

            const orderId = result.insertId;
            db.query(
                `UPDATE cart SET in_order = ? WHERE book_id IN (?) and user_id = ?`,
                [orderId, cart_ids, user_id],
                (err2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({ error: "Update cart failed" });
                    }
                    res.json({
                        success: true,
                        order_id: orderId
                    });
                }
            );
        }
    );
});

app.get("/chatmsg", (req, res) => {
    let query = `
        SELECT
        ch.id,
        ch.chat_id,
        u.id AS user_id,
        u.first_name,
        ch.text
    FROM chat ch
    JOIN users u ON u.id = ch.user_id    
    `;

    const user_id = Number(req.query.user_id);

    const params = [];

    if (user_id) {
        query += "WHERE ch.chat_id = (select chat_id from chat where user_id = ? order by id desc limit 1)";
        params.push(user_id);
    }

    query += "ORDER BY ch.id ASC";

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch chats" });
        }
        res.json(results);
    });
});

app.post("/new_msg", (req, res) => {
    const { chat_id, user_id, text } = req.body;

    if (!user_id || !text) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const createMessage = (finalChatId) => {
        db.query(
            "INSERT INTO chat (chat_id, user_id, text) VALUES (?, ?, ?)",
            [finalChatId, user_id, text],
            (err, result) => {
                if (err) return res.status(500).json(err);

                res.json({
                    message_id: result.insertId,
                    chat_id: finalChatId
                });
            }
        );
    };

    if (!chat_id) {
        db.query(
            "SELECT IFNULL(MAX(chat_id), 0) + 1 AS newChatId FROM chat",
            (err, result) => {
                if (err) return res.status(500).json(err);
                createMessage(result[0].newChatId);
            }
        );
    } else {
        createMessage(chat_id);
    }
});

app.post("/stat", (req, res) => {
    const { order_id, status_id } = req.body;

    if (!order_id || !status_id) {
        return res.status(400).json({ error: "Missing fields" });
    }

    db.query(
        "update orders SET status_id = ? where id = ?",
        [status_id, order_id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                success: true
            });
        }
    );
});

app.post("/del_ac", (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "Missing fields" });
    }

    db.query(
        "update users SET isActive = 2 where id = ?",
        [user_id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                success: true
            });
        }
    );
});

app.listen(5000, () => console.log("Server running on port 5000"));