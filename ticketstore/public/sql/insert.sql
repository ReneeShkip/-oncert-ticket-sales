INSERT INTO
    `tickets`.`book_genre` (`book_id`, `genre_id`)
VALUES ('12', '21');

INSERT INTO
    `tickets`.`book_genre` (`book_id`, `genre_id`)
VALUES ('12', '20');

INSERT INTO
    `tickets`.`book_genre` (`book_id`, `genre_id`)
VALUES ('12', '1');

INSERT INTO
    `tickets`.`book_genre` (`book_id`, `genre_id`)
VALUES ('12', '13');

ALTER TABLE `tickets`.`book_type`
ADD COLUMN `availability` ENUM("Є", "Нема") NOT NULL AFTER `price`;

UPDATE `tickets`.`book_type`
SET
    `availability` = '2'
WHERE (`ID` = '3');

UPDATE `tickets`.`book_type`
SET
    `availability` = '1'
WHERE (`ID` = '6');

UPDATE `tickets`.`book_type`
SET
    `availability` = '1'
WHERE (`ID` = '12');

UPDATE `tickets`.`book_type`
SET
    `availability` = '2'
WHERE (`ID` = '11');

UPDATE `tickets`.`book_type`
SET
    `availability` = '1'
WHERE (`ID` = '17');

UPDATE `tickets`.`book_type`
SET
    `availability` = '2'
WHERE (`ID` = '18');

UPDATE `tickets`.`book_type`
SET
    `availability` = '2'
WHERE (`ID` = '7');

UPDATE `tickets`.`book_type`
SET
    `availability` = '2'
WHERE (`ID` = '16');