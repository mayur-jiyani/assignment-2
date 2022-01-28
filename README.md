# assignment-2

- To create table

```bash
CREATE TABLE IF NOT EXISTS `inventoryData` (
`inventory_id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'primary key',
  `inventory_name` varchar(255) NOT NULL COMMENT 'inventory name',
`inventory_category` varchar(255) NOT NULL COMMENT 'inventory category',
`expiry_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'expiry time',
`quantity` int(11) NOT NULL COMMENT 'quantity',
`manufacturing_time` DATETIME NOT NULL COMMENT 'manufacturing time',
`inventory_image` LONGBLOB NOT NULL COMMENT 'inventory image',
PRIMARY KEY (`inventory_id`)
) ENGINE=InnoDB COMMENT='datatable demo table';
```
