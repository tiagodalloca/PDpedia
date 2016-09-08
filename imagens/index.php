<?php

  set_error_handler(function($errno, $errstr, $errfile, $errline, array $errcontext) {
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return false;
    }
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
  });

  $config_file = fopen("config.json", "r");
	$conteudo = fread($config_file, filesize("config.json"));
  $config = json_decode($conteudo, true);
  fclose($config_file);

  $infos = getURLArgs($config);
  lidarComRequest(
    $infos["metodo"],
    $infos["URLargs"],
    $infos["db"],
    $config
  );

  function getURLArgs($dbconfig){
    if (isset($_SERVER['PATH_INFO']))
    {
      $db = sqlsrv_connect("regulus", $dbconfig);
      $metodo = strtoupper($_SERVER['REQUEST_METHOD']);
      $URLargs = explode("---", trim($_SERVER['PATH_INFO'], "---"));
      return array(
        "metodo"    => $metodo,
        "URLargs"  => $URLargs,
        "db"        => $db
      );
    }

		die("0");
  }

  function lidarComRequest($metodo, $URLargs, $db){
		if(!$db){
			die("Não se conectou com o db");
		}

    switch ($metodo) {
      case 'GET':
        $nome = $URLargs[0];
        $cmd = sqlsrv_prepare($db, "SELECT bytes FROM Imagem WHERE nome = ?", array( &$nome));
				if(!$cmd)
          die("0");
				$imagemBytes = sqlsrv_execute($cmd);
				if ($imagemBytes != false){
					$image = imagecreatefromstring($imagemBytes);
					header('Content-Type: image/jpeg');
		      imagejpeg($image);
		      imagedestroy($image);
				}
      	else
        	die("0");
        break;

      case 'POST':
				$nome = $URLargs[0];
        $bytes = getImageData($URLargs[1]);
        $cmd = sqlsrv_prepare($db, "INSERT INTO Imagem VALUES(?, ?, ?)", array( &$nome, &$bytes, &$URLargs[1]));
        if (sqlsrv_execute($cmd))
        	echo "1";
      	else
					die("0");
        break;
    }
  }

  function getImageData($url){
    $fp = fopen("$sFilePath", 'rb') or die("404! Deu ruim!");
    $buf = "";
    while(!feof($fp)){
        $buf .= fgets($fp, 4096);
    }
    fclose($fp);
    return $buf; //retorna False se deu ruim, se não o conteúdo daquela imagem
  }

?>
