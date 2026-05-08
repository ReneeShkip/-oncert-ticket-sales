require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://-oncert-ticket-sales.onrender.com'
        : 'http://localhost:3000',
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

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../ticketstore/public/img/covers/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

app.post('/upload_photo', upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ filename: req.file.filename });
});

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
                    subject: `Квиток — ${event.title}`,
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

app.post('/validation', async (req, res) => {
    const { email, code } = req.body;

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        await transporter.sendMail({
            from: `"EVENT//ERA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Підтвердження пошти`,
            html: `<h2>Підтвердіть свою пошту</h2><br><p>Дякуємо, що обираєте наш сайт!<h2></h2>Для завершення реєстрації, вам потрібно ввести код.</p><h3>${code}</h3>`,
        });
        await browser.close();
        res.json({ success: true, message: 'Email надіслано!' });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: error.message });
    }
});

const notify = async (userId, isConfirmed) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
            if (err) return reject(err);

            const user = results[0];
            if (!user) return reject(new Error("User not found"));

            try {
                await transporter.sendMail({
                    from: `"EVENT//ERA" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `Ваша заявка була переглянута`,
                    html: isConfirmed
                        ? `<h2>Дякуємо за бажання співпраці</h2><p>Раді вас повідомити, що адміністрація готова надати вам можливість продавати свої квитки на нашій платформі</p>`
                        : `<h2>Дякуємо за бажання співпраці</h2><p>Але, на жаль, ми мусимо відмовити вам у співпраці</p>`,
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
};

const cancelEvent = async (date_id, eventTitle = "подія") => {
    const [results] = await db.promise().query(
        'SELECT u.email, c.id FROM cart c JOIN users u ON c.user_id = u.id WHERE ticket_date_id = ?',
        [date_id]
    );

    if (!results.length) return;

    const ids = results.map(r => r.id);
    const emails = results.map(r => r.email);

    await db.promise().query('DELETE FROM cart WHERE id IN (?)', [ids]);

    await Promise.all(emails.map(email =>
        transporter.sendMail({
            from: `"EVENT//ERA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Скасування події`,
            html: `<h2>Нам дуже шкода</h2><p>На жаль, подія "${eventTitle}" була скасована.</p>`,
        })
    ));
};

const RejectDeleteRequest = async (id) => {
    const [results] = await db.promise().query(
        'SELECT u.email, o.name_ukr FROM organization o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
        [id]
    );

    if (!results.length) return;

    const names = results.map(r => r.name_ukr);
    const emails = results.map(r => r.email);

    await Promise.all(emails.map(email =>
        transporter.sendMail({
            from: `"EVENT//ERA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Відмова у видаленні виконавця`,
            html: `<h2>На жаль, ми не можемо зупини співпрацю</h2><p>На даний момент ви моєте незакінчені умови з платформою, тому виконавець "${names[0]}" не може бути видалений. Будь ласка, зв'яжіться з адміністрацією для подальших інструкцій.</br>Але щоб мати доступ до редагування виконавця, увійдіть на платформу заново.</p>`,
        })
    ));
};

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
    dates.status,
    location.address_ukr,
    location.address_eng,
    country.id as country_id,
    country.name_ukr as country_ukr,
    country.name_eng as country_eng,
    type.type_ukr,
    type.type_eng,
    sub_authors.sub_organization as org_id,
	genres.id as genre_id,
    genres.genre_ukr,
    genres.genre_eng
        FROM dates
        RIGHT JOIN tickets ON tickets.id = dates.ticket_id
        LEFT JOIN location ON location.id = dates.location_id
        LEFT JOIN country ON country.id = location.country_id
        LEFT JOIN ticket_genre ON ticket_genre.ticket_id = tickets.id
        LEFT JOIN genres ON genres.id = ticket_genre.genre_id
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
    SELECT
    o.id as org_id,
    o.*,
    sa.ticket_id as event_id
FROM organization o
LEFT JOIN sub_authors sa ON sa.sub_organization = o.id
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

app.post("/user", (req, res) => {
    const { id } = req.body;
    const query = "SELECT * FROM users WHERE id = ?";

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch user" });
        res.json(results[0]);
    });
});

app.post("/log_in", (req, res) => {
    const { email, password } = req.body;
    db.query(
        `SELECT id, first_name, last_name, password, phone_number, role, email
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
            });
        }
    );
});

app.put("/cancel_event", async (req, res) => {
    const { ticket_date_id, event } = req.body;

    try {
        await cancelEvent(ticket_date_id, event.title);
        await db.promise().query('UPDATE dates SET status = 3 WHERE id = ?', [ticket_date_id]);
        res.json({ message: "Event cancelled" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
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
                    console.error("DB ERROR:", err);
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
        console.error("HASH ERROR:", err);
        res.status(500).json({ error: "Password hashing failed" });
    }
});

app.get("/all_orders", async (req, res) => {
    const query = `
    SELECT 
        c.id as cart_id,
        c.quantity,
        c.ticket_date_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.role,
        u.phone_number,
        u.email,
        o.id as order_id,
        o.date_and_time
    FROM cart c
    JOIN orders o ON o.id = c.in_order
    JOIN users u ON u.id = c.user_id
`;
    db.query(query, [], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch users" });
        }
        res.json(results);
    });
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
    const { user_id, role } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: "No user_id provided" });
    }

    let query = `SELECT cart.* FROM cart`;
    const params = [];

    if (role != "admin") {
        query += " WHERE in_order IS NULL AND user_id = ?";
        params.push(user_id);
    }


    db.query(query, params, (err, results) => {
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

app.get("/applications", async (req, res) => {
    const [applications] = await db.promise().query("select s.id as status_the_status_id, s.status_ukr, s.status_eng, a.*, u.first_name, u.last_name, u.phone_number, u.email, a.id as apply_id from applications a join users u on u.id = a.user_id join apply_statuses s on s.id = a.status");
    const [questions] = await db.promise().query("SELECT * FROM application_questions ORDER BY id");
    res.json({ applications, questions });
});

app.post("/add_cart", (req, res) => {
    const { user_id, ticket_date_id, quantity } = req.body;

    if (!user_id || !ticket_date_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    db.query(
        `SELECT id, quantity FROM dates WHERE id = ?`,
        [ticket_date_id],
        (err, dateResults) => {
            if (err) return res.status(500).json({ error: "Server error" });
            if (!dateResults.length || dateResults[0].quantity < 1) {
                return res.status(400).json({ error: "No tickets available" });
            }

            db.query(
                `SELECT * FROM cart WHERE user_id = ? AND ticket_date_id = ? AND in_order IS NULL`,
                [user_id, ticket_date_id],
                (err, cartResults) => {
                    if (err) return res.status(500).json({ error: "Server error" });

                    const cartQuery = cartResults.length > 0
                        ? [`UPDATE cart SET quantity = ? WHERE id = ?`,
                            [cartResults[0].quantity + (quantity || 1), cartResults[0].id]]
                        : [`INSERT INTO cart (user_id, ticket_date_id, quantity, reserved_until) VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL 15 MINUTE)`,
                            [user_id, ticket_date_id, quantity || 1]];

                    db.query(...cartQuery, (err) => {
                        if (err) return res.status(500).json({ error: "Server error" });
                        db.query(
                            `UPDATE dates SET quantity = quantity - 1 WHERE id = ?`,
                            [ticket_date_id],
                            (err) => {
                                if (err) return res.status(500).json({ error: "Server error" });
                                res.json({ message: "Added to cart" });
                            }
                        );
                    });
                }
            );
        }
    );
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

setInterval(async () => {
    try {
        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();
            const [results] = await connection.query(
                'SELECT id, ticket_date_id, quantity FROM cart WHERE reserved_until < UTC_TIMESTAMP() AND in_order IS NULL'
            );
            if (!results.length) return connection.release();
            const ids = results.map(r => r.id);
            await connection.query('DELETE FROM cart WHERE id IN (?)', [ids]);
            await restoreQuantities(connection, results);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            console.error("Interval error:", err);
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Connection error:", err);
    }
}, 60 * 1000);

const restoreQuantities = async (connection, rows) => {
    for (const row of rows) {
        await connection.query(
            "UPDATE dates SET quantity = quantity + ? WHERE id = ?",
            [row.quantity, row.ticket_date_id]
        );
    }
};

app.delete("/cart", async (req, res) => {
    const { user_id, id, isReturn } = req.body;

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT ticket_date_id, quantity FROM cart 
             WHERE user_id = ? ${!isReturn ? "AND in_order IS NULL" : ""}
             ${id ? "AND id = ?" : ""}`,
            id ? [user_id, id] : [user_id]
        );

        await restoreQuantities(connection, rows);

        await connection.query(
            `DELETE FROM cart 
             WHERE user_id = ? ${!isReturn ? "AND in_order IS NULL" : ""}
             ${id ? "AND id = ?" : ""}`,
            id ? [user_id, id] : [user_id]
        );

        await connection.commit();
        res.json({ message: id ? "Item removed" : "Cart cleared" });

    } catch (err) {
        await connection.rollback();
        console.error("SQL error:", err);
        res.status(500).json({ error: "Server error" });

    } finally {
        connection.release();
    }
});

app.get("/history", (req, res) => {
    const user_id = Number(req.query.user_id);
    const params = [];

    let query = `
        SELECT * FROM tickets.cart
    `;

    if (user_id) {
        query += "WHERE user_id = ?"
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
    const { id, first_name, last_name, phone_number, email } = req.body;

    if (!id) {
        return res.status(400).json({ error: "User id is required" });
    }

    db.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, phone_number = ?, email = ?
         WHERE id = ?`,
        [first_name, last_name, phone_number, email, id],
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

app.post("/edit_performer", (req, res) => {
    const { id, name_ukr, name_eng, biography_ukr, biography_eng, photo, links } = req.body;

    if (!id) {
        return res.status(400).json({ error: "User id is required" });
    }

    db.query(
        `UPDATE organization
         SET name_ukr = ?, name_eng = ?, biography_ukr = ?, biography_eng = ?, photo = ?, links = ?
         WHERE id = ?`,
        [name_ukr, name_eng, biography_ukr, biography_eng, photo, links, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Server error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ message: "performer info updated" });
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
                [orderId, cart_ids],
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

const updateExpiredDates = () => {
    db.query(
        'UPDATE dates SET status = 2 WHERE status = 1 AND date < NOW()',
        (err, result) => {
            if (err) return console.error('Update error:', err);
        }
    );
};

updateExpiredDates();

setInterval(updateExpiredDates, 24 * 60 * 60 * 1000);

app.delete("/account", async (req, res) => {
    const { user_id } = req.body;

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            "DELETE FROM cart WHERE user_id = ? AND in_order IS NULL",
            [user_id]
        );

        await connection.query(
            "UPDATE chat SET user_id = 23 WHERE user_id = ?",
            [user_id]
        );

        await connection.query(
            "UPDATE cart SET user_id = 23 WHERE user_id = ?",
            [user_id]
        );

        await connection.query(
            "DELETE FROM users WHERE id = ?",
            [user_id]
        );

        await connection.commit();
        res.json({ message: "Account deleted" });

    } catch (err) {
        await connection.rollback();
        console.error("SQL error:", err);
        res.status(500).json({ error: "Server error" });

    } finally {
        connection.release();
    }
});

app.get("/questions", (req, res) => {
    const query = `
        SELECT * FROM application_questions
    `;

    db.query(query, [], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch chats" });
        }
        res.json(results);
    });
});

app.post("/apply", (req, res) => {
    const { user_id, name, description, event_type, why_us, events_count, events_scale, online_experience, important, personal_website, expected_sales, additional_info
    } = req.body;

    db.query(
        `INSERT INTO applications(user_id, name, description, event_type, why_us, events_count, events_scale, online_experience, important, personal_website, expected_sales, additional_info)
 VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, name, description, event_type, why_us, events_count, events_scale, online_experience, important, personal_website, expected_sales, additional_info],
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

app.put("/responce", (req, res) => {
    const { id, isConfirmed } = req.body;
    const newStatus = isConfirmed ? 3 : 2;

    db.query('UPDATE applications SET status = ? WHERE id = ?', [newStatus, id], (err) => {
        if (err) return res.status(500).json({ error: "DB error" });

        db.query('SELECT * FROM applications WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).json({ error: "DB error" });

            const application = results[0];

            if (isConfirmed) {

                db.query('UPDATE users SET role = ? WHERE id = ?', [3, application.user_id], (err) => {
                    if (err) return res.status(500).json({ error: "DB error" });

                    db.query(
                        'INSERT INTO organization(name_ukr, biography_ukr, links, user_id) VALUES(?, ?, ?, ?)',
                        [application.name, application.description, application.personal_website, application.user_id],
                        (err) => {
                            if (err) return res.status(500).json({ error: "DB error" });
                            res.json({ success: true, application });
                        }
                    );
                    notify(application.user_id, isConfirmed);
                });
            } else {
                res.json({ success: true, application });
            }
        });
    });
});

app.get("/locations", (req, res) => {
    const query = "select * from location";
    db.query(query, [], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch chats" });
        }
        res.json(results);
    });
});

app.post("/edit_event", async (req, res) => {
    const { id, title, cover, description, duration, price, type_id, dates, genres } = req.body;

    try {
        await db.promise().query(
            `UPDATE tickets SET title=?, cover=?, description=?, duration=?, price=?, type_id=? WHERE id=?`,
            [title, cover, description, duration, price, type_id, id]
        );

        await db.promise().query(`DELETE FROM ticket_genre WHERE ticket_id = ?`, [id]);
        if (genres && genres.length) {
            for (const g of genres) {
                if (!g || g === 'null') continue;
                await db.promise().query(
                    `INSERT INTO ticket_genre(ticket_id, genre_id) VALUES(?, ?)`,
                    [id, g]
                );
            }
        }

        await db.promise().query(`DELETE FROM dates WHERE ticket_id = ?`, [id]);
        if (dates && dates.length) {
            for (const d of dates) {
                let locationId = d.location_id;

                if (d.newLocation) {
                    const [locResult] = await db.promise().query(
                        `INSERT INTO address(country_id, address_ukr, address_eng) VALUES(?, ?, ?)`,
                        [d.country_id, d.address_ukr, d.address_eng]
                    );
                    locationId = locResult.insertId;
                }

                await db.promise().query(
                    `INSERT INTO dates(ticket_id, date, quantity, status, location_id) VALUES(?, ?, ?, 1, ?)`,
                    [id, d.date, d.quantity, locationId]
                );
            }
        }

        res.json({ message: "Event updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/create_event", async (req, res) => {
    const { title, cover, description, duration, price, type_id, sub_organization, dates, genres } = req.body;

    try {
        const [ticketResult] = await db.promise().query(
            `INSERT INTO tickets(title, cover, description, duration, price, type_id) VALUES(?, ?, ?, ?, ?, ?)`,
            [title, cover, description, duration, price, type_id]
        );
        const ticket_id = ticketResult.insertId;

        await db.promise().query(
            `INSERT INTO sub_authors(ticket_id, sub_organization) VALUES(?, ?)`,
            [ticket_id, sub_organization]
        );
        if (genres && genres.length) {
            for (const g of genres) {
                if (!g || g === 'null') continue;
                await db.promise().query(
                    `INSERT INTO ticket_genre(ticket_id, genre_id) VALUES(?, ?)`,
                    [ticket_id, g]
                );
            }
        }

        if (dates && dates.length) {
            for (const d of dates) {
                let locationId = d.location_id;

                if (d.newLocation) {
                    const [locResult] = await db.promise().query(
                        `INSERT INTO address(country_id, address_ukr, address_eng) VALUES(?, ?, ?)`,
                        [d.country_id, d.address_ukr, d.address_eng]
                    );
                    locationId = locResult.insertId;
                }

                await db.promise().query(
                    `INSERT INTO dates(ticket_id, date, quantity, status, location_id) VALUES(?, ?, ?, 1, ?)`,
                    [ticket_id, d.date, d.quantity, locationId]
                );
            }
        }

        res.json({ message: "Event created", id: ticket_id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/want_delete", async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "User id is required" });
    }
    const connection = await db.promise().getConnection();
    try {
        const [rows] = await connection.query(
            'SELECT id FROM organization WHERE user_id = ?',
            [user_id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Organization not found" });
        }

        await connection.query('UPDATE users SET role = 5 WHERE id = ?', [user_id]);
        await connection.query('INSERT INTO apply_to_delete(organization_id) VALUES(?)', [rows[0].id]);
        res.json({ message: "Request sent" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.post("/reject_delete", async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({
            error: "Application id is required"
        });
    }

    const connection = await db.promise().getConnection();

    try {
        const [userRows] = await connection.query(
            'SELECT organization_id, o.user_id FROM apply_to_delete join organization o ON apply_to_delete.organization_id = o.id WHERE apply_to_delete.id = ?',
            [id]
        );

        if (!userRows.length) {
            return res.status(404).json({
                error: "Application not found"
            });
        }

        const organization_id = userRows[0].organization_id;
        const user_id = userRows[0].user_id;

        await connection.query(
            'UPDATE users SET role = 3 WHERE id = ?',
            [user_id]
        );

        await connection.query(
            'DELETE FROM apply_to_delete WHERE id = ?',
            [id]
        );

        await RejectDeleteRequest(organization_id);

        res.json({
            message: "Delete request rejected"
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });

    } finally {
        connection.release();
    }
});

app.get("/delete_requests", async (req, res) => {
    const query = `
        SELECT atd.id, atd.organization_id, o.name_ukr, o.name_eng, u.first_name, u.last_name, u.email, u.phone_number
        FROM apply_to_delete atd
        JOIN organization o ON o.id = atd.organization_id
        JOIN users u ON u.id = o.user_id
    `;
    db.query(query, [], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch delete requests" });
        }
        res.json(results);
    });
});

app.delete("/delete_performer", async (req, res) => {
    const { id } = req.query;
    console.log("id:", id);
    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM apply_to_delete WHERE organization_id = ?', [id]);

        const [rows] = await connection.query(
            'SELECT d.id as date_id, s_a.ticket_id FROM sub_authors s_a JOIN dates d ON d.ticket_id = s_a.ticket_id WHERE sub_organization = ?',
            [id]
        );

        if (rows.length) {
            const dateIds = rows.map(r => r.date_id);

            const [cartRows] = await connection.query(
                'SELECT u.email FROM cart c JOIN users u ON c.user_id = u.id WHERE c.ticket_date_id IN (?)',
                [dateIds]
            );

            await connection.query('DELETE FROM cart WHERE ticket_date_id IN (?)', [dateIds]);

            await Promise.all(cartRows.map(r =>
                transporter.sendMail({
                    from: `"EVENT//ERA" <${process.env.EMAIL_USER}>`,
                    to: r.email,
                    subject: `Скасування події`,
                    html: `<h2>Нам дуже шкода</h2><p>На жаль, подія була скасована.</p>`,
                })
            ));

            await connection.query('DELETE FROM dates WHERE id IN (?)', [dateIds]);
        }

        const ticketIds = [...new Set(rows.map(r => r.ticket_id))];

        if (ticketIds.length) {
            await connection.query('DELETE FROM ticket_genre WHERE ticket_id IN (?)', [ticketIds]);
            await connection.query('DELETE FROM sub_authors WHERE sub_organization = ?', [id]);
            await connection.query('DELETE FROM tickets WHERE id IN (?)', [ticketIds]);
        }

        const [userRows] = await connection.query(
            'SELECT user_id FROM organization WHERE id = ?', [id]
        );
        const user_id = userRows[0]?.user_id;

        await connection.query('DELETE FROM organization WHERE id = ?', [id]);

        if (user_id) {
            await connection.query('UPDATE users SET role = 1 WHERE id = ?', [user_id]);
        }

        await connection.commit();
        res.json({ message: "Performer deleted" });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../ticketstore/dist')));
    app.get('/{*path}', (req, res) => {
        res.sendFile(path.join(__dirname, '../ticketstore/dist/index.html'));
    });
}

app.listen(5000, () => console.log("Server running on port 5000"));