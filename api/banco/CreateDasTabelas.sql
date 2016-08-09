CREATE TABLE `Usuario` (
    `ID`    TEXT NOT NULL UNIQUE,
    `Nome`    TEXT NOT NULL,
    `Senha`    TEXT NOT NULL,
    `Suspenso`    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(ID)
)

CREATE TABLE `Requisicao` (
    `ID`    TEXT NOT NULL UNIQUE,
    `Nome`    TEXT NOT NULL,
    `Senha`    TEXT NOT NULL,
    `Data`     TEXT NOT NULL,
    PRIMARY KEY(ID)
)

CREATE TABLE `Artigo` (
    `ID`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `Texto`    TEXT,
    `Titulo`    TEXT,
    `fk_IDUsuario`    INTEGER NOT NULL,
    `Data`    TEXT NOT NULL,
    FOREIGN KEY(fk_IDUsuario) REFERENCES Usuario(ID)
)

CREATE TABLE `Biografia` (
    `ID`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `Texto`    TEXT,
    `Nome`    TEXT,
    `fk_IDUsuario`    INTEGER NOT NULL,
    `Data`    TEXT NOT NULL,
    FOREIGN KEY(fk_IDUsuario) REFERENCES Usuario(ID)
)

CREATE TABLE `Acontecimento` (
    `ID`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `Texto`    TEXT,
    `Titulo`    TEXT,
    `DataAcontecimento` TEXT,
    `fk_IDUsuario`    INTEGER NOT NULL,
    `Data`    TEXT NOT NULL,
    FOREIGN KEY(fk_IDUsuario) REFERENCES Usuario(ID)
)

CREATE TABLE `Edicao_Artigo` (
    `ID`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `fk_ID`    INTEGER NOT NULL,
    `Data`    TEXT NOT NULL,
    FOREIGN KEY(fk_ID) REFERENCES Artigo(ID)
)

CREATE TABLE `Edicao_Biografia` (
    `ID`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `fk_ID`    INTEGER NOT NULL,
    `Data`    TEXT NOT NULL,
    FOREIGN KEY(fk_ID) REFERENCES Biografia(ID)
)

CREATE TABLE `Edicao_Acontecimento` (
    `ID`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `fk_ID`    INTEGER NOT NULL,
    `Data`    TEXT NOT NULL,
    FOREIGN KEY(fk_ID) REFERENCES Acontecimento(ID)
)

CREATE TABLE `Token` (
    `Chave`    TEXT NOT NULL,
    `DataCriacao`    TEXT NOT NULL,
    `HorasDeValidade`    INTEGER NOT NULL,
    `fk_IDUsuario`    INTEGER NOT NULL,
    PRIMARY KEY(Chave),
    FOREIGN KEY(`fk_IDUsuario`) REFERENCES `Usuario`(`ID`)
)
