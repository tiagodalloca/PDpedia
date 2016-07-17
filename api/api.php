<?php
  header('Content-Type: application/json; charset=utf-8');
  // Transforma Warnings do SQLite em Exceptions to PHP
  set_error_handler(function($errno, $errstr, $errfile, $errline, array $errcontext) {
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return false;
    }
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
  });
  if (isset($_SERVER['PATH_INFO']) && is_ajax())
  {
    $db = new SQLite3("banco/banquinho.db");
    $metodo = strtolower($_SERVER['REQUEST_METHOD']);
    $request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
    $token = null;
    $tabela = $request[0];
    $args = null;
    if(sizeof($request) > 1)
      $args = json_decode($request[1], true);
    if(sizeof($request) > 2)
      $token = $request[2];
    $ret = lidarComRequest($metodo, $tabela, $args, $token, $db);
    echo json_encode($ret, JSON_UNESCAPED_UNICODE);
  }
  function lidarComRequest($metodo, $tabela, $args, $token, $db){
    if ($tabela == "")
      return array();
    $HORAS_DE_VALIDADE_TOKEN = 4;
    $ret = array();
    $hue = prepararQuery($token, $metodo, $tabela, $args, $db);
    $comandos = $hue["comandos"];
    $comandosParaRealizarFetchArray = $hue["comandosParaRealizarFetchArray"];
    foreach ($comandos as $key => $value) {
      try {
        $coisa = $value->execute();
        if (in_array($key, $comandosParaRealizarFetchArray))
          while ($arr = $coisa->fetchArray(SQLITE3_ASSOC)) {
            $ret[] = $arr;
          }
      }
      catch(ErrorException $e){
        // Não vai executar os outros comandos
        break;
      }
    }
    switch ($tabela) {
      case 'Usuario':
        if ($metodo == 'get')
          foreach ($ret as $key => $arr) {
            unset($arr["Senha"]);
            $ret[$key] = $arr;
          }
        else if (sizeof($ret) > 0){
          $ret = $ret[0];
          unset($ret["Senha"]);
        }
        break;
      case 'Token':
      if ($metodo == 'get')
        foreach ($ret as $key => $arr) {
          unset($arr["Valor"]);
          $ret[$key] = $arr;
        }
      else if (sizeof($ret) > 0)
        $ret = $ret[0];
      break;
    }
    return $ret;
  }
  function prepararQuery($token, $metodo, $tabela, $args, $db)
  {
    // Não é necessário token para um método get
    if ($metodo == 'get')
      return queryGenerica($metodo, $tabela, null, $args, $db);
    else
    {
      if ($tabela == 'Usuario'){
        if ($metodo == "post"){
          $tokenValido = validarToken($token, $db);
          if ($tokenValido){
            unset($args["ID"]);
            return queryGenerica($metodo, $tabela, $tokenValido["fk_IDUsuario"], $args, $db);
          }
        }
      }
      else if ( $tabela == 'Artigo' ||
                $tabela == 'Acontecimento' ||
                $tabela == 'Biografia'){
        if ($metodo == "post")
        {
          $tokenValido = validarToken($token, $db);
          if ($tokenValido)
          {
            unset($args["ID"]);
            unset($args["fk_IDUsuario"]);
            return queryGenerica($metodo, $tabela, $tokenValido["fk_IDUsuario"], $args, $db);
          }
        }
        else if ($metodo == "put")
        {
          $tokenValido = validarToken($token, $db);
          if ($tokenValido)
          {
            unset($args["ID"]);
            $args["fk_IDUsuario"] = $tokenValido["fk_IDUsuario"];
            $args["Data"] = date('Y-m-d H:i:s');
            return queryGenerica($metodo, $tabela, null, $args, $db);
          }
        }
      }
      else if ($tabela == 'Token'){
        if ($metodo == "put")
        {
          $args["fk_IDUsuario"] = $args["IDUsuario"];
          unset($args["IDUsuario"]);
          unset($args["Senha"]);
          $args["DataCriacao"] = date('Y-m-d H:i:s');
          $args["HorasDeValidade"] = 4;
          $args["Chave"] = md5(uniqid(rand(), true));
          return queryGenerica($metodo, $tabela, null, $args, $db);
        }
        else if ($metodo == "delete")
        {
          unset($args["DataCriacao"]);
          unset($args["HorasDeValidade"]);
          unset($args["fk_IDUsuario"]);
          if ($args["Chave"])
            return queryGenerica($metodo, $tabela, null, $args, $db);
        }
      }
    }
    return array("comandos" => array(), "comandosParaRealizarFetchArray" => array());
  }
  function queryGenerica($metodo, $tabela, $first_key, $args, $db)
  {
    if ($args && $first_key == null){
      reset($args);
      // poderá ser usada para ordenação
      // {"ID" : 2, "Nome": "João"} => first_key = "ID"
      $first_key = key($args);
    }
    $comandos = array();
    $comandosParaRealizarFetchArray = array();
    switch ($metodo) {
      case 'get':
        if ($first_key){
          $comandos[] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");
          $comandos[0]->bindValue(':valor', $args[$first_key], SQLITE3_TEXT);
        }
        else
          $comandos[] = $db->prepare("SELECT * FROM `$tabela`");
          $comandosParaRealizarFetchArray[] = 0;
        break;
      case 'post':
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
      case 'put':
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
      case 'delete':
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
