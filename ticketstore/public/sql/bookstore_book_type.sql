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
-- Table structure for table `book_type`
--

DROP TABLE IF EXISTS `book_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_type` (
  `ID` tinyint NOT NULL AUTO_INCREMENT,
  `book_id` tinyint NOT NULL,
  `type_id` tinyint NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `availability` enum('Є','Нема') NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `book_id` (`book_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `book_type_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `book_type_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `type` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_type`
--

LOCK TABLES `book_type` WRITE;
/*!40000 ALTER TABLE `book_type` DISABLE KEYS */;
INSERT INTO `book_type` VALUES (1,1,1,500,'Є'),(2,1,2,350,'Є'),(3,2,1,510,'Нема'),(4,3,1,315,'Є'),(5,4,1,360,'Є'),(6,4,2,270,'Є'),(7,5,1,342,'Нема'),(8,6,1,320,'Є'),(9,7,1,351,'Є'),(10,7,2,290,'Є'),(11,8,1,549,'Нема'),(12,8,2,457,'Є'),(13,9,1,370,'Є'),(14,9,2,210,'Є'),(15,10,1,471,'Є'),(16,11,1,390,'Нема'),(17,11,2,241,'Є'),(18,12,1,479,'Нема');
/*!40000 ALTER TABLE `book_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 19:13:18
