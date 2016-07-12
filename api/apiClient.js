// TODAS AS VARIÁVEIS "tipo" SIGNIFICAM A TABELA NO BANCO DE DADOS QUE SERÁ UTILIZADA, p.e. "Biografia"

// Caso passe dois objetos(tipo e o ID)
function apiClient(tipo, meuID)
{
	// variável private(pode ser útil no futuro)
	var that = {};

	 // Caso o Dall'Oca não tenha lido o meu comentário sobre objetos
	if (typeof meuID === "object")
	{
		if (tipo.toUpperCase() == "ARTIGO")
		{
			var NaoFormatado = catarDoBanco("Artigo", meuID.ID);
		}
		else if (tipo.toUpperCase() == "ACONTECIMENTO")
		{
			var NaoFormatado = catarDoBanco("Acontecimento", meuID.ID);
		}
		else if (tipo.toUpperCase() == "BIOGRAFIA")
		{
			var NaoFormatado = catarDoBanco("Biografia", meuID.ID);
		}
	}
	else // o Dall'Oca viu meu comentário
	{
		if (tipo.toUpperCase() == "ARTIGO")
		{
			var NaoFormatado = catarDoBanco("Artigo", meuID);
		}
		else if (tipo.toUpperCase() == "ACONTECIMENTO")
		{
			var NaoFormatado = catarDoBanco("Acontecimento", meuID);
		}
		else if (tipo.toUpperCase() == "BIOGRAFIA")
		{
			var NaoFormatado = catarDoBanco("Biografia", meuID);
		}
	}

	return {}; // se chegar aqui, o tipo está errado ou tem algo estranho(ou nada foi implementado, hehehehe)
}

// Caso passe apenas um objeto contendo o tipo e o ID
function apiClient(obj)
{
	if (typeof obj === "object")
	{
		if (obj.tipo.toUpperCase() == "ARTIGO")
		{
			var NaoFormatado = catarDoBanco("Artigo", obj.ID);
		}
		else if (obj.tipo.toUpperCase() == "ACONTECIMENTO")
		{
			var NaoFormatado = catarDoBanco("Acontecimento", obj.ID);
		}
		else if (obj.tipo.toUpperCase() == "BIOGRAFIA")
		{
			var NaoFormatado = catarDoBanco("Biografia", obj.ID);
		}
	}

	return {}; // se chegar aqui, o tipo está errado ou tem algo estranho(ou nada foi implementado, hehehehe)
}

// Função básica para evitar repetições de código
function catarDoBanco(tipo, ID)
{
	$.ajax(
	{
		url: '../../../api/api.php/'+tipo+'/{\"ID\":'+ID+'}',
        success: function(resultText, trem1, trem2)
        {
        	return resultText;
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
        {
        	return "";
        	// Se occorer um erro, o usuário está tentando hackear!
        }
	});
}