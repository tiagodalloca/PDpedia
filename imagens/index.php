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
    $infos["db"],
    $config
  );

  function getURLArgs($dbconfig){
    $metodo = strtoupper($_SERVER['REQUEST_METHOD']);
    $db = sqlsrv_connect("regulus", $dbconfig);

    return array(
      "metodo"    => $metodo,
      "db"        => $db
    );
  }

  function lidarComRequest($metodo, $db){
    if(!$db){
      die("Não se conectou com o db");
    }

    switch ($metodo) {
      case 'GET':
        $nome = $_GET["nome"];
        $cmd = sqlsrv_prepare($db, "SELECT * FROM Imagem WHERE nome = ?", array( &$nome));

        if(!$cmd)
          die("0");

        if (sqlsrv_execute($cmd) != false){
          $ret = sqlsrv_fetch_array($cmd, SQLSRV_FETCH_ASSOC);
          $bytes = base64_decode($ret["bytes"]);
          $url = $ret["url"];
          if ($bytes != ""){
            $image = imagecreatefromstring($bytes);
            printImagem($url, $image);
            imagedestroy($image);
          }
        }
        if( ($errors = sqlsrv_errors() ) != null){
          foreach( $errors as $error ) {
              echo "SQLSTATE: ".$error[ 'SQLSTATE']."<br />";
              echo "code: ".$error[ 'code']."<br />";
              echo "message: ".$error[ 'message']."<br />";
          }
        }
        break;

      case 'POST':
        $nome = $_GET["nome"];
        $bytes = getImageData($_GET["url"]);
        $bytes = base64_encode($bytes);
        $cmd = sqlsrv_prepare($db, "INSERT INTO Imagem VALUES(?, ?, ?)", array(&$nome, &$bytes, &$_GET["url"]));
        if (sqlsrv_execute($cmd))
          echo "1";
        else{
          if( ($errors = sqlsrv_errors() ) != null)
            foreach( $errors as $error ) {
                echo "SQLSTATE: ".$error[ 'SQLSTATE']."<br />";
                echo "code: ".$error[ 'code']."<br />";
                echo "message: ".$error[ 'message']."<br />";
            }
        }

        break;
    }
  }

  function getImageData($url){
    $fp = fopen($url, 'rb') or die("404! Deu ruim!");
    $raw = "";
    while(!feof($fp)){
        $raw .= fgets($fp, 4096);
    }
    fclose($fp);

    // $process = curl_init($url);
    // curl_setopt($process, CURLOPT_HEADER, 0);
    // curl_setopt($process, CURLOPT_RETURNTRANSFER, 1);
    // curl_setopt($process, CURLOPT_BINARYTRANSFER, 1);
    // $raw = curl_exec($process);
    // curl_close($process);


    // $raw = file_get_contents($url);

    return $raw;
  }

  function printImagem($url, $image){
    $ext = pathinfo($url, PATHINFO_EXTENSION);
    switch ($ext) {
      case 'gif':
      header('Content-Type: image/gif');
      imagegif($image);
        break;

      case 'jpeg':
      header('Content-Type: image/jpg');
      imagejpeg($image);
        break;

      case 'jpg':
      header('Content-Type: image/jpg');
      imagejpeg($image);
        break;

      case 'png':
      header('Content-Type: image/png');

      $height = ImageSY($image);
      $width = ImageSX($image);
      $maxWidth = 250;
      $maxHeight = 250;
      $quality = 9;

      $canvas = imagecreatetruecolor($width, $height);
      imagealphablending($canvas, false);
      $background = imagecolorallocatealpha($canvas, 255, 255, 255, 127);
      imagefilledrectangle($canvas, 0, 0, $width, $height, $background);
      imagealphablending($canvas, true);

      $leftOffset = 0;
      $topOffset = 0;

      imagecopyresampled($canvas, $image, $leftOffset, $topOffset, 0, 0, $width, $height, $width, $height);
      imagealphablending($canvas, true);
      imagesavealpha($canvas, true);
      imagepng($canvas);
        break;

      case 'bmp':
      header('Content-Type: image/bmp');
      imagewbmp($image);
        break;

      default:
        # code...
        break;
    }
  }

?>
