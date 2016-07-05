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
    $metodo = $_SERVER['REQUEST_METHOD'];
    $request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
    $tabela = $request[0];
    $args = null;
    $first_key = null;

    if(sizeof($request) > 1){
      $args = json_decode($request[1]);
      reset($args);
      // poderá ser usada para ordenação
      // {"ID" : 2, "Nome": "João"} => first_key = "ID"
      $first_key = key($args);

      // Evita SQL injection
      // $first_key = str_replace("'", "", $first_key);
    }

    $comandos = array();
    $comandosParaRealizarFetchArray = array();

    switch (strtolower($metodo)) {
      case 'get':
        if ($first_key){
          $comandos[] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");

          // O SQLite vai tentar converter o texto inserido em uma string na
          // execução dessa query.
          $comandos[0]->bindValue(':valor', $args->$first_key, SQLITE3_TEXT);
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
        $comandos[$cont]->bindValue(':valor', $args->$first_key, SQLITE3_TEXT);
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
        $comandos[1]->bindValue(':valor', $args->$first_key, SQLITE3_TEXT);
        $comandosParaRealizarFetchArray[] = 1;
        break;

      case 'delete':
        $comandos[] = $db->prepare("SELECT * FROM `$tabela` WHERE `$first_key`=:valor");
        $comandos[0]->bindValue(':valor', $args->$first_key, SQLITE3_TEXT);
        $comandosParaRealizarFetchArray[] = 0;

        $comandos[] = $db->prepare("DELETE FROM `$tabela` WHERE `$first_key`=:valor");
        $comandos[1]->bindValue(":valor", $args->$first_key, SQLITE3_TEXT);
        break;

      default:
        # altos codes...
        break;
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

    // array_walk_recursive($ret, function(&$item){
    //   if(mb_detect_encoding($item) != "UTF-8"){
    //     $item = utf8_encode($item);
    //   }
    // });

    echo json_encode($ret, JSON_UNESCAPED_UNICODE);
  }

  else {
    echo "[]";
  }

 ?>
