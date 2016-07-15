var API_PATH = "api.php/"

if (typeof $ === 'undefined')
  console.log("Carregue o JQuery");

/**
 * Faz uma requisição à API
 * @param  {String}   tabela
 * @param  {Object} 	args   	Vai ser convertido para JSON e adicionado à url
 * da requisição
 * @param  {String} 	metodo 	GET, POST, PUT, DELETE
 * @param  {String} 	token  	Deve ter sido fornecido pela API
 * @param  {function} success função que é executada caso a requisição tenha
 * sucesso
 * @param  {function} error   função que é executada casa a requisição sofra
 * algum erro
 * @return {?}        				Retorno da API
 */
var apiClient =
  (tabela, args, metodo, token, success, error) => {

    var url = API_PATH + tabela + "/" + JSON.stringify(args)

    if (token != null)
      url += "/" + token;

    var ret = null;
    $.ajax(url, {
      method: metodo.toUpperCase(),
      success: success,
      error : error
    });
}