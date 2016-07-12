var API_PATH = "api.php/"

if (typeof $ !== 'undefined')
  console.log("Carregue o JQuery");

/**
 * Faz uma requisição à API
 * @param  {String} tabela
 * @param  {Object} 	args   	Vai ser convertido para JSON e adicionado à url
 * da requisição
 * @param  {String} 	metodo 	GET, POST, PUT, DELETE
 * @param  {String} 	token  	Deve ter sido fornecido pela API
 * @param  {function} succes
 * @param  {function} error 	
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


/**
 * Fornece um novo token para posteriores operações
 * @return {Objeto} Novo token fornecido pela API
 */
apiClient.NewToken =
  function() {
    var ret = null;

    $.ajax(API_PATH + "Token", {
      method: "POST",
      success: (responseText) => {
        ret = JSON.parse(responseText);
      }
    });

    return ret;
  }

/**
 * Invalida token já existente
 * @param  {String} token String previamente devolvida por NewToken
 * @return {Token}       	Dados do token invalidado
 */
apiClient.DestroyToken =
  function(token) {
    $.ajax(API_PATH + "Token/" + JSON.stringify({
      Chave: token
    }), {
      method: "DELETE",
      success: (responseText) => {
        return JSON.parse(responseText);
      }
    });
  }


/**
 * Retorna um novo token
 * @class
 * @property {String} Chave
 * @property {String} DataCriacao
 * @property {Number} HorasDeValidade
 * @property {Number} fk_IDUsuario
 */
apiClient.Token =
  function() {

    var token = apiClient.NewToken()
    for (variable of token) {
      this[variable] = token[variable];
    }

    this.destroy = () => {
      return apiClient.DestroyToken(this.Chave);
    }
  }
