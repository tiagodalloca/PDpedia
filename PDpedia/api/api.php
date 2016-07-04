<script src="http://localhost/COTUCA/PDpedia/template/lib/jquery-2.1.4.js" charset="utf-8"></script>

<?php

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
      echo "INSERT INTO `$tabela` $colunas VALUES $valores";
      $comandos[0] = $db->prepare("INSERT INTO `$tabela` $colunas VALUES $valores");

      $cont = 1;
      foreach ($args as $key => $value) {
        $comandos[0]->bindValue($cont, $value, SQLITE3_TEXT);
        $cont++;
      }

      break;

    case 'delete':
      $query = "DELETE FROM `$tabela` WHERE `$first_key`=:valor";
      $comandos[] = $db->prepare($query);
      $comandos[0]->bindValue(":valor", $args->$first_key, SQLITE3_TEXT);
      break;

    default:
      # altos codes...
      break;
  }

  foreach ($comandos as $key => $value) {
    $coisa = $value->execute();
    $ret = array();
    try {
      while ($arr = $coisa->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $arr;
      }
      echo json_encode($ret);
    } catch (Exception $e) {
      echo "[]";
    }
  }

 ?>
