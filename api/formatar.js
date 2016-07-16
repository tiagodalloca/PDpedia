var URL_SITE_PARA_FALAR_DE_ALGO_ESPECIFICO_ARTIGO = "index.php?tipo=ARTIGO&id=";//(???)
var URL_SITE_PARA_FALAR_DE_ALGO_ESPECIFICO_ACONT = "index.php?tipo=ACONTECIMENTO&id=";//(???)
var URL_SITE_PARA_FALAR_DE_ALGO_ESPECIFICO_BIO = "index.php?tipo=BIOGRAFIA&id=";//(???)("c" seria o ID)

if (typeof apiClient === 'undefined')
  console.log("Carregue a apiClient.js");

// "tipo" serve para saber qual é a tabela a ser utilizada
function tendencias(tipo) {
  tipo = tipo.toUpperCase();
  switch (tipo) {
    case "ARTIGO":
      // pegar todos os artigos
      apiClient("Artigo", {}, "GET", null,
        function (artigosNFormatados) {
          // formatar os artigos
          var str = JSON.stringify(artigosNFormatados);
          var obj = JSON.parse(str);
          try{
            for (var i = 1; i <= obj.length-1; i++) // pega de trás pra frente
            {
              mudarConteudoDe("art"+i, obj[obj.length-i].Titulo);
              mudarHREF("art"+i, URL_SITE_PARA_FALAR_DE_ALGO_ESPECIFICO_ARTIGO+obj[obj.length-i].ID);
            }
          }
          catch (e)
          {} // caso não tenho o suficiente
        });

      break;

    case "BIOGRAFIA":
      // pegar todos as biografias
      apiClient("Biografia", {}, "GET", null,
        function (biografiasNFormatadas) {
          // formatar os biografias
          var str = JSON.stringify(biografiasNFormatadas);
          var obj = JSON.parse(str);
          try{
            for (var i = 1; i <= obj.length-1; i++) // pega de trás pra frente
            {
              mudarConteudoDe("bio"+i, obj[obj.length-i].Titulo);
              mudarHREF("bio"+i, URL_SITE_PARA_FALAR_DE_ALGO_ESPECIFICO_ACONT+obj[obj.length-i].ID);
            }
          }
          catch (e)
          {} // caso não tenho o suficiente
        });
      break;

    case "ACONTECIMENTO":
      // pegar todos os acontecimentos
      apiClient("Acontecimento", {}, "GET", null,
        function (acontecimentosNFormatados) {
          // formatar os acontecimentos
          var str = JSON.stringify(artigosNFormatados);
          var obj = JSON.parse(str);
          try{
            for (var i = 1; i <= obj.length-1; i++) // pega de trás pra frente
            {
              mudarConteudoDe("acont"+i, obj[obj.length-i].Titulo);
              mudarHREF("acont"+i, URL_SITE_PARA_FALAR_DE_ALGO_ESPECIFICO_ACONT+obj[obj.length-i].ID);
            }
          }
          catch (e)
          {} // caso não tenho o suficiente
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
        function (artigosNFormatados, t2, t3) {
          // formatar os artigo
          var str = JSON.stringify(artigosNFormatados);
          var obj = JSON.parse(str);
          alert(obj.length);
        });

      break;

    case "BIOGRAFIA":
      // pegar biografia com ID = id
      apiClient("Biografia", {ID:id}, "GET", null,
        function (biografiasNFormatadas) {
          // formatar os biografia
          // altos codes...
        });
      break;

    case "ACONTECIMENTO":
      // pegar acontecimento com ID = id
      apiClient("Acontecimento", {ID:id}, "GET", null,
        function (acontecimentosNFormatados) {
          // formatar os acontecimento
          // altos codes...
        });
      break;
  }
}
