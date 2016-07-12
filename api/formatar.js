if (typeof apiClient === 'undefined')
  console.log("Carregue a apiClient.js");

// "tipo" serve para saber qual é o tipo de tendência a ser formatada
function tendencias(tipo) {
  tipo = tipo.toUpperCase();
  switch (tipo) {
    case "ARTIGO":
      // pegar todos os artigos
      apiClient("Artigo", {}, "GET", null,
        function (artigosNFormatados) {
          // formatar os artigos
          // altos codes...
        });

      break;

    case "BIOGRAFIA":
      // pegar todos as biografias
      apiClient("Biografia", {}, "GET", null,
        function (biografiasNFormatadas) {
          // formatar os biografias
          // altos codes...
        });
      break;

    case "ACONTECIMENTO":
      // pegar todos os acontecimentos
      apiClient("Acontecimento", {}, "GET", null,
        function (acontecimentosNFormatados) {
          // formatar os acontecimentos
          // altos codes...
        });
      break;
  }
}

// "tipo" serve para saber qual é a tabela a ser utilizada
// "id" serve para saber qual é o id que se está procurando
function especifico(tipo, id) {
  tipo = tipo.toUpperCase();
  switch (tipo) {
    case "ARTIGO":
      // pegar artigo com ID = id
      apiClient("Artigo", {ID:id}, "GET", null,
        function (artigosNFormatados) {
          // formatar os artigo
          // altos codes...
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
