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

  if (isset($_SERVER['PATH_INFO']))
  {
    $db = new SQLite3("banco\banquinho.db");
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

    $HORAS_DE_VALIDADE_TOKEN = 4;

    $first_key = null;
    if ($args){
      reset($args);
      // poderá ser usada para ordenação
      // {"ID" : 2, "Nome": "João"} => first_key = "ID"
      $first_key = key($args);
    }

    if ($tabela == 'Logoff' && $args != null)
    {
      $metodo = "delete";
      $tabela = "Token";
      $token = $args["Valor"];
    }

    $tokenValido = validarToken($token, $db);

    $ret = array();

    if ($tabela == 'Login' && $args != null)
    {
      $comando = $db->prepare("SELECT * FROM Usuario WHERE `ID` = :id AND `Senha` = :senha");
      $comando->bindValue(':id', $args["ID"], SQLITE3_TEXT);
      $comando->bindValue(':senha', $args["Senha"], SQLITE3_TEXT);

      try {
        $coisa = $comando->execute();
        //Usuario com aquele nome e com aquela senha existe?
        if($coisa->fetchArray(SQLITE3_ASSOC)){
          $data = date('Y-m-d H:i:s');
          $token = md5(uniqid(rand(), true));
          $comando = $db->prepare("INSERT INTO Token VALUES (:token, :dataCriacao, :validade, :usuario_id)");
          $comando->bindValue(':token',$token, SQLITE3_TEXT);
          $comando->bindValue(':dataCriacao',$data, SQLITE3_TEXT);
          $comando->bindValue(':validade', $HORAS_DE_VALIDADE_TOKEN, SQLITE3_TEXT);
          $comando->bindValue(':usuario_id', $args["ID"], SQLITE3_TEXT);
          $comando->execute();

          $ret["Valor"] = $token;
          $ret["DataCriacao"] = $data;
          $ret["HorasDeValidade"] = $HORAS_DE_VALIDADE_TOKEN;
          $ret["fk_UsuarioID"] = $args["ID"];
          return $ret;
        }
        else
          return $ret;
      }
      catch(ErrorException $e){
        echo $e;
        return $ret;
      }
    }

    // Array que contém os comandos a serem executados
    $comandos = array();

    // Array de números que contém os índices dos comandos que necessitam
    // realizar fetchArray
    $comandosParaRealizarFetchArray = array();

    // Não é necessário token para um método get
    if ($metodo == 'get'){
      if ($first_key){
        $comandos[] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");
        $comandos[0]->bindValue(':valor', $args[$first_key], SQLITE3_TEXT);
      }
      else
        $comandos[] = $db->prepare("SELECT * FROM `$tabela`");
        $comandosParaRealizarFetchArray[] = 0;
    }

    else if ($tokenValido){
      switch ($metodo) {
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
    }

    $ret = array();

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
        foreach ($ret as $key => $arr) {
          unset($arr["Senha"]);
          $ret[$key] = $arr;
        }
        break;

      case 'Token':
      foreach ($ret as $key => $arr) {
        unset($arr["Valor"]);
        $ret[$key] = $arr;
      }
      break;
    }

    return $ret;
  }

  function validarToken($token, $db)
  {
    if ($token != null)
    {
      $comando = $db->prepare("SELECT * FROM Token WHERE `Valor`= :valor");
      $comando->bindValue(':valor', $token, SQLITE3_TEXT);

      try {
        $coisa = $comando->execute();
        $linhas = $coisa->fetchArray(SQLITE3_ASSOC);

        if ($linhas){
          $agora = new DateTime();
          $criacaoToken = new DateTime($linhas["DataCriacao"]);
          $intervalo = $agora->diff($criacaoToken, true);

          if ($intervalo->h < $linhas["HorasDeValidade"])
            return true;

          else
            return false;
        }
      }
      catch(ErrorException $e){
        echo $e;
        return false;
      }
    }

    return false;
  }

 ?>
