CREATE TABLE Imagem(
	nome VARCHAR(100) primary key,
	bytes  VARBINARY(MAX) not null,
	url VARCHAR(200) not null
)

SELECT *  FROM Imagem