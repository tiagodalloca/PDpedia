//aqui fica aqueles códigos em javascript bem lokos

const formatar = function()
{
	function constructor() // parâmetros (???)
	{

	}

	// "tipo" serve para saber qual é o tipo de tendência a ser formatada
	function tendencias(tipo)
	{
		if (tipo.toUpperCase() == "ARTIGO")
		{
			// pegar todos os artigos
			var artigosNFormatados = dadosDoBanco("Artigo");
			// formatar os artigos
			// altos codes...
		}
		else if (tipo.toUpperCase() == "ACONTECIMENTO")
		{
			// pegar todos os acontecimentos
			var acontecimentosNFormatados = dadosDoBanco("Acontecimento");
			// formatar os acontecimentos
			// altos codes...
		}
		else if (tipo.toUpperCase() == "BIOGRAFIA")
		{
			// pegar todos as biografias
			var biografiasNFormatadas = dadosDoBanco("Biografia");
			// formatar as biografias
			// altos codes...
		}
	}

	// "tipo" serve para saber qual é a tabela a ser utilizada
	// "id" serve para saber qual é o id que se está procurando
	function especifico(tipo, id)
	{
		if (tipo.toUpperCase() == "ARTIGO")
		{
			// pegar o artigo
			var artigoNFormatado = dadosDoBanco("Artigo", id);
			// formatar o artigo
			// altos codes...
		}
		else if (tipo.toUpperCase() == "ACONTECIMENTO")
		{
			// pegar o acontecimento
			var acontecimentoNFormatado = dadosDoBanco("Acontecimento", id);
			// formatar o acontecimento
			// altos codes...
		}
		else if (tipo.toUpperCase() == "BIOGRAFIA")
		{
			// pegar a biografia
			var biografiaNFormatada = dadosDoBanco("Biografia", id);
			// formatar a biografia
			// altos codes...
		}
	}

	// "tipo" serve para saber qual é a tabela a ser utilizada
	function dadosDoBanco(tipo)
	{
		$.ajax(
			{
				url: '../../../api/api.php/'+tipo,
	            success: function(resultText, trem1, trem2)
	            {
	            	return resultText;
	            },
	            error: function(XMLHttpRequest, textStatus, errorThrown)
	            {
	            	return "";
	            }
			});
		// não bota return aqui, porque ou dará certo, ou dará errado.
	}

	// "tipo" serve para saber qual é a tabela a ser utilizada
	function dadosDoBanco(tipo, id)
	{
		$.ajax(
			{
				url: '../../../api/api.php/'+tipo+'{"ID":'+id+'}',// já tentei bugar e não deu, hehehe
	            success: function(resultText, trem1, trem2)
	            {
	            	return resultText;
	            },
	            error: function(XMLHttpRequest, textStatus, errorThrown)
	            {
	            	return "";
	            }
			});
		// não bota return aqui, porque ou dará certo, ou dará errado.
	}
}