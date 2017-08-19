CREATE DATABASE `forum` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `forum`;

CREATE TABLE `category` (
  `intCategoryID` int(11) NOT NULL AUTO_INCREMENT,
  `categoryname` varchar(100) NOT NULL,
  `categorydes` varchar(200) DEFAULT NULL,
  `isMod` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intCategoryID`),
  UNIQUE KEY `categoryname_UNIQUE` (`categoryname`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;


CREATE TABLE `sub` (
  `intSubID` int(11) NOT NULL AUTO_INCREMENT,
  `intSubCategoryID` int(11) NOT NULL,
  `subname` varchar(100) NOT NULL,
  `subdescription` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`intSubID`),
  UNIQUE KEY `subname_UNIQUE` (`subname`),
  KEY `intSubCategoryID_idx` (`intSubCategoryID`),
  CONSTRAINT `intSubCategoryID` FOREIGN KEY (`intSubCategoryID`) REFERENCES `category` (`intCategoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1254 DEFAULT CHARSET=utf8;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(15) NOT NULL,
  `email` varchar(45) NOT NULL,
  `pw` varchar(45) NOT NULL,
  `bday` date NOT NULL,
  `type` varchar(6) NOT NULL DEFAULT 'normal',
  `isBan` int(11) NOT NULL DEFAULT '0',
  `image` varchar(100) DEFAULT NULL,
  `isMod` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `password_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8;

CREATE TABLE `message` (
  `intMesID` int(11) NOT NULL AUTO_INCREMENT,
  `messageContent` longtext,
  `sender` varchar(45) NOT NULL,
  `receiver` varchar(45) NOT NULL,
  PRIMARY KEY (`intMesID`),
  KEY `sender_idx` (`sender`),
  KEY `receiver_idx` (`receiver`),
  CONSTRAINT `receiver` FOREIGN KEY (`receiver`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sender` FOREIGN KEY (`sender`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;


CREATE TABLE `post` (
  `intPostID` int(11) NOT NULL AUTO_INCREMENT,
  `intPostSubID` int(11) NOT NULL,
  `author` varchar(15) NOT NULL,
  `title` text NOT NULL,
  `content` longtext NOT NULL,
  `postdate` date NOT NULL,
  `isdeleted` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intPostID`),
  KEY `intPostSubID_idx` (`intPostSubID`),
  KEY `author_idx` (`author`),
  CONSTRAINT `author` FOREIGN KEY (`author`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `intPostSubID` FOREIGN KEY (`intPostSubID`) REFERENCES `sub` (`intSubID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;



INSERT INTO `forum`.`user` (`username`, `email`, `pw`, `bday`, `type`, `isBan`, `image`, `isMod`) VALUES ('admin', 'admin@example.com', 'password', '1998-12-11', 'admin', '0', 'admin.jpg', '1');


