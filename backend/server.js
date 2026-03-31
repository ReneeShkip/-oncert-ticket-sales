require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { use } = require("react");
const bcrypt = require("bcrypt");
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://-oncert-ticket-sales.onrender.com'
        : 'http://localhost:5174',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const { buildTicketHTML } = require('./templates/ticketTemplate');

app.post('/send-email', async (req, res) => {
    const { user, order } = req.body;

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

        for (const event of order) {
            for (const ticket of event.tickets) {
                const qrDataUrl = await QRCode.toDataURL(
                    `https://yoursite.com/verify/${ticket.date_id}`,
                    { width: 250, errorCorrectionLevel: 'H' }
                );

                const ticketHTML = buildTicketHTML(user, event, ticket, qrDataUrl);
                const page = await browser.newPage();
                await page.setContent(ticketHTML, { waitUntil: 'networkidle0' });
                const pdfBuffer = await page.pdf({ format: 'A5', printBackground: true });
                await page.close();

                await transporter.sendMail({
                    from: `"EVENT//ERA" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `Квиток — ${event.ukr.title}`,
                    html: `<p>Ваш квиток у вкладенні.</p>`,
                    attachments: [{
                        filename: `ticket-${ticket.date_id}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }]
                });
            }
        }
        await browser.close();
        res.json({ success: true, message: 'Email надіслано!' });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/webhook/payment-success', async (req, res) => {
    const order = await Order.findById(req.body.orderId);

    for (const tickets of order.tickets) {
        await sendTicketEmail(tickets);
    }

    res.json({ ok: true });
});

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root1",
    database: "tickets",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/tickets", (req, res) => {

    const query = `
       SELECT
    tickets.*,
    dates.id AS date_id,
    dates.date,
    dates.quantity,
    location.address_ukr,
    location.address_eng,
    country.id as country_id,
    type.type_ukr,
    type.type_eng,
    country.name_ukr,
    country.name_eng,
    sub_authors.sub_organization as org_id,
	genres.id as genre_id,
    genres.genre_ukr,
    genres.genre_eng
        FROM dates
        JOIN tickets ON tickets.id = dates.ticket_id
        JOIN location ON location.id = dates.location_id
        JOIN country ON country.id = location.country_id
        LEFT JOIN tickets_genre ON tickets_genre.ticket_id = tickets.id
        LEFT JOIN genres ON genres.id = tickets_genre.genre_id
        LEFT JOIN sub_authors ON tickets.id = sub_authors.ticket_id
        JOIN type ON type.id = tickets.type_id
`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch tickets" });
        }
        res.json(results);
    });
});

app.get("/genres", (req, res) => {
    const query = "select * from genres";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch genres" });
        }
        res.json(results);
    });
});

app.get("/types", (req, res) => {
    const query = "select * from type";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch type" });
        }
        res.json(results);
    });
});

app.get("/organizations", (req, res) => {
    const query = `
    SELECT sa.ticket_id as event_id, o.id as org_id, o.*
    FROM organization o
    RIGHT JOIN sub_authors sa ON sa.sub_organization = o.id
`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch type" });
        }
        res.json(results);
    });
});

app.get("/country", (req, res) => {
    const query = "select * from country";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch languages" });
        }
        res.json(results);
    });
});

/*app.get("/books", (req, res) => {
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
});*/

app.post("/log_in", (req, res) => {
    const { email, password } = req.body;
    db.query(
        `SELECT id, first_name, last_name, password, phone_number, role, email, city
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [email],
        async (err, results) => {
            if (err) return res.status(500).send("Server error");
            if (!results || results.length === 0) {
                return res.status(401).json({ error: "Невірна пошта або пароль" });
            }
            const user = results[0];
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: "Невірна пошта або пароль" });
            }

            res.json({
                id: user.id,
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
    const { email, password, first_name, last_name, phone_number, role } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: "Email or password missing" });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        const query = `
            INSERT INTO users(first_name, last_name, email, password, phone_number, role)
            VALUES(?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [first_name, last_name, email, passwordHash, phone_number, role],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: "Server error", details: err.message });
                }

                res.json({
                    id: results.insertId,
                    email,
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

app.get("/cart", (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ error: "No user_id provided" });
    }

    const query = `
             SELECT cart.* FROM cart WHERE in_order is null;
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        const mapped = results.map(item => ({
            ...item,
            seconds_left: item.reserved_until
                ? Math.max(
                    0,
                    Math.floor(
                        (new Date(item.reserved_until + 'Z') - Date.now()) / 1000
                    )
                )
                : null
        }));
        res.json(mapped);
    });
});

app.post("/add_cart", (req, res) => {

    const { user_id, ticket_date_id, quantity } = req.body;

    if (!user_id || !ticket_date_id) {
        return res.status(400).json({
            error: "Missing required fields",
            received: { user_id, ticket_date_id },
            reserved_until: new Date(Date.now() + 15 * 60 * 1000)
        });
    }

    const checkQuery = `
        SELECT * FROM cart 
        WHERE user_id = ? AND ticket_date_id = ? AND in_order IS NULL;
    `;

    db.query(checkQuery, [user_id, ticket_date_id], (err, results) => {
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
                `INSERT INTO cart (user_id, ticket_date_id, quantity, reserved_until)
                 VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL 15 MINUTE)`,
                [user_id, ticket_date_id, quantity || 1],
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
        WHERE ticket_date_id = ? AND user_id = ?
    `;

    db.query(query, [quantity, id, user_id], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json({ message: "Quantity updated" });
    });
});

setInterval(() => {
    db.query('DELETE FROM cart WHERE reserved_until < UTC_TIMESTAMP() AND in_order IS NULL');
}, 60 * 1000);

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
    const { id, first_name, last_name, phone_number, email, city } = req.body;

    if (!id) {
        return res.status(400).json({ error: "User id is required" });
    }

    db.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, phone_number = ?, email = ?, city = ?
         WHERE id = ?`,
        [first_name, last_name, phone_number, email, city, id],
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
app.post("/make_order", (req, res) => {
    const { cart_ids, user_id } = req.body;

    if (!user_id || !cart_ids?.length) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }
    db.query(
        `INSERT INTO orders (date_and_time)
         VALUES (UTC_TIMESTAMP())`,
        [],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Insert order failed" });
            }

            const orderId = result.insertId;
            db.query(
                `UPDATE cart SET in_order = ? WHERE id IN (?)`,
                [orderId, cart_ids, user_id],
                (err2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({ error: "Update cart failed" });
                    }
                    res.json({
                        success: true
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

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../ticketstore')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../ticketstore/index.html'));
    });
}


app.listen(5000, () => console.log("Server running on port 5000"));