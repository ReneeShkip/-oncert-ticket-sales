-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bookstore
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `thriller_view`
--

DROP TABLE IF EXISTS `thriller_view`;
/*!50001 DROP VIEW IF EXISTS `thriller_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `thriller_view` AS SELECT 
 1 AS `ID`,
 1 AS `title`,
 1 AS `year`,
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `price`,
 1 AS `cover`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `fantasy_view`
--

DROP TABLE IF EXISTS `fantasy_view`;
/*!50001 DROP VIEW IF EXISTS `fantasy_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `fantasy_view` AS SELECT 
 1 AS `ID`,
 1 AS `title`,
 1 AS `year`,
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `price`,
 1 AS `cover`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `ukraine_modern_view`
--

DROP TABLE IF EXISTS `ukraine_modern_view`;
/*!50001 DROP VIEW IF EXISTS `ukraine_modern_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ukraine_modern_view` AS SELECT 
 1 AS `ID`,
 1 AS `title`,
 1 AS `year`,
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `price`,
 1 AS `cover`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `thriller_view`
--

/*!50001 DROP VIEW IF EXISTS `thriller_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `thriller_view` AS select `bt`.`ID` AS `ID`,`b`.`title` AS `title`,`b`.`year` AS `year`,`a`.`first_name` AS `first_name`,`a`.`last_name` AS `last_name`,`bt`.`price` AS `price`,`b`.`cover` AS `cover` from ((`book_type` `bt` join `books` `b` on((`b`.`ID` = `bt`.`book_id`))) join `author` `a` on((`a`.`ID` = `b`.`author`))) where `b`.`ID` in (select `bg`.`book_id` from `book_genre` `bg` where (`bg`.`genre_id` = 6)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `fantasy_view`
--

/*!50001 DROP VIEW IF EXISTS `fantasy_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `fantasy_view` AS select `bt`.`ID` AS `ID`,`b`.`title` AS `title`,`b`.`year` AS `year`,`a`.`first_name` AS `first_name`,`a`.`last_name` AS `last_name`,`bt`.`price` AS `price`,`b`.`cover` AS `cover` from (((`book_type` `bt` join `books` `b` on((`b`.`ID` = `bt`.`book_id`))) join `author` `a` on((`a`.`ID` = `b`.`author`))) join `book_genre` `bg` on((`bg`.`book_id` = `b`.`ID`))) where (`bg`.`genre_id` = 3) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ukraine_modern_view`
--

/*!50001 DROP VIEW IF EXISTS `ukraine_modern_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ukraine_modern_view` AS select `bt`.`ID` AS `ID`,`b`.`title` AS `title`,`b`.`year` AS `year`,`a`.`first_name` AS `first_name`,`a`.`last_name` AS `last_name`,`bt`.`price` AS `price`,`b`.`cover` AS `cover` from ((`book_type` `bt` join `books` `b` on((`b`.`ID` = `bt`.`book_id`))) join `author` `a` on((`a`.`ID` = `b`.`author`))) where `b`.`ID` in (select `bg`.`book_id` from `book_genre` `bg` where (`bg`.`genre_id` in (20,21)) group by `bg`.`book_id` having (count(distinct `bg`.`genre_id`) = 2)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 19:13:19
