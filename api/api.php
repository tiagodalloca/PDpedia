<?php

  ini_set('display_errors', 1);
  header('Content-Type: application/json; charset=utf-8');
  // Transforma Warnings do SQLite em Exceptions to PHP
  set_error_handler(function($errno, $errstr, $errfile, $errline, array $errcontext) {
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return false;
    }
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
  });

  $config_file = fopen("config.json", "r");
  $config = json_decode(fread($config_file, filesize("config.json")), true);

  $infos = getURLArgs();
  $ret = lidarComRequest(
    $infos["metodo"],
    $infos["tabela"],
    $infos["args"],
    $infos["token"],
    $infos["db"],
    $config
  );
  echo json_encode($ret, JSON_UNESCAPED_UNICODE);

  function getURLArgs()
  {
    // if (isset($_SERVER['PATH_INFO']) && is_ajax())
    if (isset($_SERVER['PATH_INFO']))
    {
      $db = new SQLite3("banco/banquinho.db");
      $metodo = strtoupper($_SERVER['REQUEST_METHOD']);
      $request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
      $token = null;
      $tabela = $request[0];
      $args = array();
      if(sizeof($request) > 1)
        $args = json_decode($request[1], true);
      if(sizeof($request) > 2)
        $token = $request[2];

      return array(
        "metodo"  => $metodo,
        "tabela"  => $tabela,
        "args"    => $args,
        "token"   => $token,
        "db"      => $db
      );
    }
  }

  function lidarComRequest($metodo, $tabela, $args, $token, $db, $config){
    // A tabela existe? (ver config.json)
    if (! array_key_exists($tabela, $config))
      return null;
    // O método para aquela tabela é valido?
    else if (! array_key_exists($metodo, $config[$tabela]))
      return null;

    $HORAS_DE_VALIDADE_TOKEN = 4;

    $realArgs = array();
      foreach ($args as $arg => $value) {
        // Argumento existe em config?
        if (in_array($arg, $config[$tabela][$metodo]["args"]))
          $realArgs[$arg] = $args[$arg];
      }

    $hue = prepararQuery($token, $metodo, $tabela, $realArgs, $db, $config);

    $comandos = $hue["comandos"];
    $comandosParaRealizarFetchArray = $hue["comandosParaRealizarFetchArray"];

    $oQVoltouDoBD = array();
    $ret = array();

    foreach ($comandos as $posicaoComando => $comando) {
      try {
        $coisa = $comando->execute();
        if (in_array($posicaoComando, $comandosParaRealizarFetchArray))
          while ($arr = $coisa->fetchArray(SQLITE3_ASSOC)) {
            $oQVoltouDoBD[] = $arr; // tipo push (empilhar)
          }
      }
      catch(ErrorException $e){
        // Não vai executar os outros comandos
        break;
      }
    }

    foreach ($oQVoltouDoBD as $key => $voltado) {
      $obj = array();
      foreach ($config[$tabela][$metodo]["return"] as $key2 => $attr) {
        $obj[$attr] = $voltado[$attr];
      }
      $ret[] = $obj;
    }

    if ("$metodo" == "GET")
      return $ret;

    else
      return $ret[0];
  }
  function prepararQuery($token, $metodo, $tabela, $args, $db, $config)
  {
    $tokenValido = false;

    // É necessário um token?
    if ($config[$tabela][$metodo]["token"]){

      $tokenValido = validarToken($token, $db);

      if ($tokenValido)
      {
        // Caso especial
        if (($tabela == "Artigo" ||
            $tabela == "Acontecimento" ||
            $tabela == "Biografia")
            && $metodo == "PUT")
        {
          $args["fk_IDUsuario"] = $tokenValido["fk_IDUsuario"];
          $args["Data"] = date('Y-m-d H:i:s');
          return queryGenerica($metodo, $tabela, null, $args, $db);
        }

        else
          return queryGenerica($metodo, $tabela, $tokenValido["fk_IDUsuario"], $args, $db);
      }

      // Se não for caso especial, realiza uma query genérica
      else
        return array("comandos" => array(), "comandosParaRealizarFetchArray" => array());
    }

    else {
      // Token/PUT é um caso especial
      if ($tabela == 'Token' && $metodo == "PUT"){
          $args["fk_IDUsuario"] = $args["IDUsuario"];
          $args["DataCriacao"] = date('Y-m-d H:i:s');
          $args["HorasDeValidade"] = 4;
          $args["Chave"] = md5(uniqid(rand(), true));
        }

      elseif ($tabela == 'Requisicao' && $metodo == "PUT") {
        $args["IP"] = $_SERVER['REMOTE_ADDR'];
        $args["Data"] = date('Y-m-d H:i:s');
      }

      // Realiza uma query genérica
      return queryGenerica($metodo, $tabela, null, $args, $db);
    }

  }

  function queryGenerica($metodo, $tabela, $first_key, $args, $db)
  {
    if ($args && $first_key == null){
      reset($args);
      // poderá ser usada para ordenação por ID
      // {"ID" : 2, "Nome": "João"} onde first_key = "ID"
      $first_key = key($args);
    }
    $comandos = array();
    $comandosParaRealizarFetchArray = array();
    switch ($metodo) {
      case 'GET':
        if ($first_key){
          $comandos[] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");
          $comandos[0]->bindValue(':valor', $args[$first_key], SQLITE3_TEXT);
        }
        else
          $comandos[] = $db->prepare("SELECT * FROM `$tabela`");
          $comandosParaRealizarFetchArray[] = 0;
        break;
      case 'POST':
        $cont = 0;
        foreach ($args as $key => $value) {
          if ($key == $first_key){
            $primeiroValor = $value;
            continue;
          }
          $query = "UPDATE `$tabela` SET `$key`=:novo WHERE `$first_key`=:valor";
          $comandos[$cont] = $db->prepare($query);
          $comandos[$cont]->bindValue(":novo", $value, SQLITE3_TEXT);
          $comandos[$cont]->bindValue(":valor", $primeiroValor, SQLITE3_TEXT);
          $cont++;
        }
        $comandos[$cont] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");
        $comandos[$cont]->bindValue(':valor', $args[$first_key], SQLITE3_TEXT);
        $comandosParaRealizarFetchArray[] = $cont;
        break;
      case 'PUT':
        $colunas = "(";
        $valores = "(";
        foreach ($args as $key => $value) {
          $colunas = $colunas."`".$key."` ,";
          $valores = $valores."?,";
        }
        $colunas = rtrim($colunas, ",").")";
        $valores = rtrim($valores, ",").")";
        $comandos[0] = $db->prepare("INSERT OR FAIL INTO `$tabela` $colunas VALUES $valores");
        $cont = 1;
        foreach ($args as $key => $value) {
          $comandos[0]->bindValue($cont, $value, SQLITE3_TEXT);
          $cont++;
        }
        $comandos[] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");
        $comandos[1]->bindValue(':valor', $args[$first_key], SQLITE3_TEXT);
        $comandosParaRealizarFetchArray[] = 1;
        break;
      case 'DELETE':
        $comandos[] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");
        $comandos[0]->bindValue(':valor', $args[$first_key], SQLITE3_TEXT);
        $comandosParaRealizarFetchArray[] = 0;
        $comandos[] = $db->prepare("DELETE FROM `$tabela` WHERE `$first_key`=:valor");
        $comandos[1]->bindValue(":valor", $args[$first_key], SQLITE3_TEXT);
        break;
    }
    return array( "comandos" => $comandos,
                  "comandosParaRealizarFetchArray" => $comandosParaRealizarFetchArray);
  }
  function validarToken($token, $db)
  {
    if ($token != null)
    {
      $comando = $db->prepare("SELECT * FROM Token WHERE `Chave`= :valor");
      $comando->bindValue(':valor', $token, SQLITE3_TEXT);
      try {
        $coisa = $comando->execute();
        $linha = $coisa->fetchArray(SQLITE3_ASSOC);
        if ($linha){
          $agora = new DateTime();
          $criacaoToken = new DateTime($linha["DataCriacao"]);
          $intervalo = $agora->diff($criacaoToken, true);
          if ($intervalo->h < $linha["HorasDeValidade"])
            return $linha;
          else
            return null;
        }
      }
      catch(ErrorException $e){
        echo $e;
        return null;
      }
    }
    return null;
  }

  $pass = 'bestSenha123'; // pode colocar qualquer coisa...
  $method = 'aes128'; // deixa isso mesmo

  function cript($string)
  {
      // retorna uma string contendo a $string criptografada
      return openssl_encrypt($string, $method, $pass);
  }

  function deCript($string)
  {
      // retorna uma string contendo a $string descriptografada
      return openssl_decrypt($string, $method, $pass);
  }


  function is_ajax() {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
  }
?>
