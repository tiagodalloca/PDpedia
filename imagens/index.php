<?php

// if (isset($_POST("nomeImg")) && !is_null(($_POST("nomeImg")))
{
	// if (existeNoBanco($_POST("nomeImg")))
	{
		// pode ser que sejam adicionados mais métodos futuramente
		$imagemBin = catarDoBancoBinario("../template/site/images/hero-wallpaper.jpg");
		$im = imagecreatefromstring($imagemBin);
		if ($im !== false) {
		    header('Content-Type: image/jpeg');
		    imagejpeg($im);
		    imagedestroy($im);
		}
		else {
		    echo 'An error occurred.';
		}
	}
		// formatação necessária em javascript(já disponível em formatar.js) ->
		// talvez não necessite de formatação do javascript
}

function catarDoBancoBinario($nomeDaImagem){
	return GetFileData($nomeDaImagem); // ao invés disso, catar no banco
}

function GetFileData($sFilePath){
  $fp = fopen($sFilePath, 'rb') or die('404! Unable to open file!');
  $buf = '';
  while(!feof($fp)){
      $buf .= fgets($fp, 4096);
  }
  fclose($fp);
	return $buf; //returns False if failed, else the contents up to FileSize bytes.
}

function existeNoBanco($nomeDaImagem){
	//... fazer count pra ver se existe e retornar
	return true;
}

?>
