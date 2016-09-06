# API PHP

[Veja no diretório](https://github.com/MrDallOca/PDpedia/tree/dev/PDpedia/api)

Se trata do modo como as informações guardadas no banco de dados vão ser "consumidas".

O protocolo usado é o HTTP e o modelo de é [REST](https://pt.wikipedia.org/wiki/REST)

## Como usar

URL genérica de requisição:
`...api.php/tabela/json`

Se atente ao **método** da requisição.

### GET

| Tabela | Campos retornados | Detalhes | Requer _token_ |
| --- | --- | --- | --- |
| Usuario | ID, Nome, Suspenso | `Senha` não é retornado | ✗ |
| Requisicao | ID, Nome, Data | `Senha` não é retornado | ✗ |
| Artigo | ID, Texto, Titulo, fk_IDUsuario, Data | - | ✗ |
| Acontecimento | ID, Texto, Titulo, fk_IDUsuario, DataAcontecimento, Data | - | ✗ |
| Biografia | ID, Texto, Nome, fk_IDUsuario, Data | - | ✗ |
| Edicao_[Artigo, Acontecimento, Biografia] | ID, fk_ID,  Data | - | ✗ |
| Token | DataCriacao, HorasDeValidade, fk_IDUsuario | `Chave` não é retornado | ✗ |

### PUT

| Tabela | Campos fornecidos | Campos retornados | Detalhes | Requer _token_ |
| --- | --- | --- | --- | --- |
| Requisicao | ID, Nome, Data, Senha | ID, Nome, Data | `Senha` não é retornado | ✗ |
| Artigo | Texto, Titulo | ID, Texto, Titulo, fk_IDUsuario, Data | `fk_IDUsuario` é preenchido através do token fornecido e `Data` é do sistema | ✓ |
| Acontecimento | Texto, Titulo, DataAcontecimento | ID, Texto, Titulo, fk_IDUsuario, DataAcontecimento, Data | `fk_IDUsuario` é preenchido através do token fornecido e `Data` é do sistema | ✓ |
| Biografia | Texto, Nome | ID, Texto, Nome, fk_IDUsuario, Data | `fk_IDUsuario` é preenchido através do token fornecido e `Data` é do sistema | ✓ |
| Token | IDUsuario, Senha | Chave, DataCriacao, HorasDeValidade, fk_IDUsuario | "Senha" deve corresponder à `Senha` do usuario com o IDUsuario | ✗ |

### POST

| Tabela | Campos fornecidos | Campos retornados | Detalhes | Requer _token_ |
| --- | --- | --- | --- | --- |
| Usuario | Nome, Senha | ID, Nome, Suspenso | Não é possível alterar o campo `Suspenso`; <br> ID usado na query é o do token fornecido; <br> `Senha` não é retornado. | ✓ |
| Artigo | ID, Texto, Titulo | ID, Texto, Titulo, fk_IDUsuario, Data | `ID` e `fk_IDUsuario` não são alterados | ✓ |
| Acontecimento | ID, Texto, Titulo, DataAcontecimento | ID, Texto, Titulo, fk_IDUsuario, DataAcontecimento, Data | `ID` e `fk_IDUsuario` não são alterados | ✓ |
| Biografia | ID, Texto, Nome | ID, Texto, Nome, fk_IDUsuario, Data | `ID` e `fk_IDUsuario` não são alterados | ✓ |

### DELETE

| Tabela | Campos fornecidos | Campos retornados | Detalhes | Requer _token_ |
| --- | --- | --- | --- | --- |
| Token | Chave | Chave, DataCriacao, HorasDeValidade, fk_IDUsuario | Se `Chave` fornecida não existir, retorna objeto vazio `{}` | ✗ |


## _Token_

O _token_ é uma forma de validar ações executadas por usuários.

### Gerar novo _token_

Para conseguir um novo token, basta enviar uma requisição `PUT` para a tabela Token.

**Exemplo:**

`...api.php/Token/{"IDUsuario":15194, "Senha":"patinho"}`

Retorno: <br>
`{"Chave": "asdglkj2345lkjhscw35340324985", "DataCriacao":"2016-07-11 15:02:43", "HorasDeValidade":4, "fk_IDUsuario":"15194"}`

Lembrando que a `Senha` fornecida no JSON da URL deve corresponder ao usuario com o `ID` de `IDUsuario`.

### Como usar o _token_

URL genérica: <br>
`...api.php/tabela/json/token`

**Exemplo:**

Método `POST`

`...api.php/Usuario/{"Nome":"Fernando", "Senha":"cocosinho"}/asdglkj2345lkjhscw35340324985`
```SQL
UPDATE `Usuario` SET `Nome`= "Fernando" WHERE `ID`= 15194
UPDATE `Usuario` SET `Senha`= "cocosinho" WHERE `ID`= 15194
SELECT * FROM `Usuario` WHERE `ID`= 15194
```
Retorno: <br>
```json
{"ID":15194, "Nome":"Fernando", "Suspenso":0}
```

Note que `Senha` não é retornado.

## Tabelas

Essa é uma lista com todas as tabelas:

#### Usuario

| Campo | Detalhes |
| --- | --- |
| **ID** | TEXT NOT NULL UNIQUE |
| Nome | TEXT NOT NULL |
| Senha |	TEXT NOT NULL |
| Suspenso | INTEGER NOT NULL DEFAULT 0 |

#### Requisicao

| Campo | Detalhes |
| --- | --- |
| **ID** | TEXT NOT NULL UNIQUE |
| Nome | TEXT NOT NULL |
| Senha |	TEXT NOT NULL |

#### Artigo

| Campo | Detalhes |
| --- | --- |
| **ID** | INTEGER NOT NULL AUTOINCREMENT UNIQUE |
| Texto | TEXT |
| Titulo | TEXT |
| *fk_IDUsuario* | INTEGER NOT NULL |
| Data | TEXT NOT NULL |

#### Biografia

| Campo | Detalhes |
| --- | --- |
| **ID** | INTEGER NOT NULL AUTOINCREMENT UNIQUE |
| Texto | TEXT |
| Nome | TEXT |
| *fk_IDUsuario* | INTEGER NOT NULL |
| Data | TEXT NOT NULL |

#### Acontecimento

| Campo | Detalhes |
| --- | --- |
| **ID** | INTEGER NOT NULL AUTOINCREMENT UNIQUE |
| Texto | TEXT |
| Titulo | TEXT |
| DataAcontecimento | TEXT |
| *fk_IDUsuario* | INTEGER NOT NULL |
| Data | TEXT NOT NULL |

#### Token

| Campo | Detalhes |
| --- | --- |
| **Chave** | TEXT NOT NULL|
| DataCriacao | TEXT NOT NULL|
| HorasDeValidade | INTEGER NOT NULL |
| *fk_IDUsuario* | INTEGER NOT NULL |

Edicao_Artigo, Edicao_Biografia e Edicao_Acontecimento não inclusos.

Ver [arquivo](banco/CreateDasTabelas.sql) com os comandos de criação das tabelas
