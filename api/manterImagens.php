<?php

if (isset($_POST("nomeImg")) && !is_null(($_POST("nomeImg")))
{
	if (existeNoBanco($_POST("nomeImg")))
	{
		$imagemBin = catarDoBancoBinario($_POST("nomeImg")); // pode ser que sejam adicionados mais métodos futuramente
		echo $imagemBin;
	}
	else
	{
		echo "[]"; // não tem no banco
	}
}   // formatação necessária em javascript(já disponível em formatar.js)

function catarDoBancoBinario($nomeDaImagem)
{
	//... catar do banco da escola utilizando SQL Server
	return "01100001";
}

function existeNoBanco($nomeDaImagem)
{
	//... fazer count pra ver se existe e retornar
	return true;
}

?>