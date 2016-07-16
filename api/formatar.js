var URLs = {artigo:"index.php?tipo=ARTIGO&id=", acont:"index.php?tipo=ACONTECIMENTO&id=", bio:"index.php?tipo=BIOGRAFIA&id="}; //("id" seria o ID)("tipo" seria a tabela)

if (typeof apiClient === 'undefined')
  console.log("Carregue a apiClient.js");

// "tipo" serve para saber qual é a tabela a ser utilizada
function tendencias(tipo) {
  tipo = tipo.toUpperCase();
  switch (tipo) {
    case "ARTIGO":
      // pegar todos os artigos
      apiClient("Artigo", {}, "GET", null,
        function (obj) {
          //exibindo
          try{
            for (var i = 1; i <= obj.length-1; i++) // pega de trás pra frente
            {
              mudarConteudoDe("art"+i, obj[obj.length-i].Titulo);
              mudarHREF("art"+i, URLs.artigo+obj[obj.length-i].ID);
            }
          }
          catch (e)
          {console.log(e.toString());} // tabela sem itens
        });

      break;

    case "BIOGRAFIA":
      // pegar todos as biografias
      apiClient("Biografia", {}, "GET", null,
        function (obj) {
          //exibindo
          try{
            for (var i = 1; i <= obj.length-1; i++) // pega de trás pra frente
            {
              mudarConteudoDe("bio"+i, obj[obj.length-i].Titulo);
              mudarHREF("bio"+i, URLs.bio+obj[obj.length-i].ID);
            }
          }
          catch (e)
          {} // tabela sem itens
        });
      break;

    case "ACONTECIMENTO":
      // pegar todos os acontecimentos
      apiClient("Acontecimento", {}, "GET", null,
        function (obj) {
          //exibindo
          try{
            for (var i = 1; i <= obj.length-1; i++) // pega de trás pra frente
            {
              mudarConteudoDe("acont"+i, obj[obj.length-i].Titulo);
              mudarHREF("acont"+i, URLs.acont+obj[obj.length-i].ID);
            }
          }
          catch (e)
          {} // tabela sem itens
        });
      break;
  }
}

function mudarConteudoDe(p, valor)
{
  document.getElementById(p).innerHTML = valor;
}

function mudarHREF(p, valor)
{
  document.getElementById(p).href = valor;
}

// "tipo" serve para saber qual é a tabela a ser utilizada
// "id" serve para saber qual é o id que se está procurando
function especifico(tipo, id) {
  tipo = tipo.toUpperCase();
  switch (tipo) {
    case "ARTIGO":
      // pegar artigo com ID = id
      apiClient("Artigo", {ID:id}, "GET", null,
        function (obj) {
          // formatar os artigo
          try{
            // o que fazer com apenas 1 artigo?
          }
          catch (e)
          {} // tabela sem itens
        });

      break;

    case "BIOGRAFIA":
      // pegar biografia com ID = id
      apiClient("Biografia", {ID:id}, "GET", null,
        function (obj) {
          // formatar os biografia
          try{
            // o que fazer com apenas 1 biografia?
          }
          catch (e)
          {} // tabela sem itens
        });
      break;

    case "ACONTECIMENTO":
      // pegar acontecimento com ID = id
      apiClient("Acontecimento", {ID:id}, "GET", null,
        function (obj) {
          // formatar os acontecimento
          try{
            // o que fazer com apenas 1 acontecimento?
          }
          catch (e)
          {} // tabela sem itens
        });
      break;
  }
}
