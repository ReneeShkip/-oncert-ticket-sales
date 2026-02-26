INSERT INTO `bookstore`.`book_genre` (`book_id`, `genre_id`) VALUES ('12', '21');
INSERT INTO `bookstore`.`book_genre` (`book_id`, `genre_id`) VALUES ('12', '20');
INSERT INTO `bookstore`.`book_genre` (`book_id`, `genre_id`) VALUES ('12', '1');
INSERT INTO `bookstore`.`book_genre` (`book_id`, `genre_id`) VALUES ('12', '13');

ALTER TABLE `bookstore`.`book_type` 
ADD COLUMN `availability` ENUM("Є", "Нема") NOT NULL AFTER `price`;

UPDATE `bookstore`.`book_type` SET `availability` = '2' WHERE (`ID` = '3');
UPDATE `bookstore`.`book_type` SET `availability` = '1' WHERE (`ID` = '6');
UPDATE `bookstore`.`book_type` SET `availability` = '1' WHERE (`ID` = '12');
UPDATE `bookstore`.`book_type` SET `availability` = '2' WHERE (`ID` = '11');
UPDATE `bookstore`.`book_type` SET `availability` = '1' WHERE (`ID` = '17');
UPDATE `bookstore`.`book_type` SET `availability` = '2' WHERE (`ID` = '18');
UPDATE `bookstore`.`book_type` SET `availability` = '2' WHERE (`ID` = '7');
UPDATE `bookstore`.`book_type` SET `availability` = '2' WHERE (`ID` = '16');
