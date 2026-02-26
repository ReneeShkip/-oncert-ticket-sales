create database Bookstore;
use Bookstore;

create table author(
	ID tinyint primary key auto_increment,
    first_name char(50) not null,
    last_name char(50) not null,
    biography text
);

create table books(
	ID tinyint primary key auto_increment,
    title char(30) not null,
    cover VARCHAR(255) not null,
    author tinyint not null,
    price decimal not null,
	annotation text,
    rate decimal(2,1) not null,
    type ENUM('Паперова', 'Електронна')  NOT NULL DEFAULT 'Паперова'
);

create table users(
	ID tinyint primary key auto_increment,
    first_name char(50) not null,
    last_name char(50) not null,
    login char(50) not null,
    `password` char(50) not null,
    phone_number char(10) not null
);

create table comments(
	ID tinyint primary key auto_increment,
    user_id tinyint,
    book_id tinyint,
    caption text,
    sub_rate decimal(2,1) not null,
    foreign key(user_id) REFERENCES users (ID) ON DELETE CASCADE,
    foreign key(book_id) REFERENCES books (ID) ON DELETE CASCADE
);

create table genres(
	ID tinyint primary key auto_increment,
    genre VARCHAR(50)
);

CREATE TABLE book_genre (
    book_id tinyint NOT NULL,
    genre_id tinyint NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    FOREIGN KEY (book_id) REFERENCES books(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(ID)
        ON DELETE CASCADE
);

CREATE TABLE type (
	ID tinyint primary key auto_increment,
    `type` VARCHAR(20)
);

CREATE TABLE book_type (
	book_id tinyint NOT NULL,
    type_id tinyint NOT NULL,
    PRIMARY KEY (book_id, type_id),
    FOREIGN KEY (book_id) REFERENCES books(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES `type`(ID)
        ON DELETE CASCADE
);

CREATE OR REPLACE VIEW ukr_mod_books AS
SELECT 
    bt.ID,
    b.title,
    b.year,
    a.first_name,
    a.last_name,
    bt.price,
    b.cover
FROM book_type bt
JOIN books b ON b.id = bt.book_id
JOIN author a ON a.id = b.author
WHERE b.id IN (
    SELECT bg.book_id
    FROM book_genre bg
    WHERE bg.genre_id IN (20, 21)
    GROUP BY bg.book_id
    HAVING COUNT(DISTINCT bg.genre_id) = 2
);

CREATE OR REPLACE VIEW thriller_books AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.year,
    b.annotation,
    bt.price
FROM books b
JOIN book_genre bg ON b.id = bg.book_id
JOIN book_type bt ON b.id = bt.book_id
WHERE bg.genre_id = 6;