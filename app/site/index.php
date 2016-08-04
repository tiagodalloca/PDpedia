<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=1">
  <link rel="stylesheet" href="../../libraries/bootstrap/css/normalize.css">
  <link rel="stylesheet" href="../../libraries/bootstrap/css/bootstrap.css">
  <link rel="stylesheet" href="css/master.css">
  <title>PDpedia</title>
</head>

<body>
  <script src="../../libraries/jQuery/jquery-2.1.4.js" type="text/javascript"></script>
  <script src="../../libraries/bootstrap/js/bootstrap.js" type="text/javascript"></script>
  <script src="../../api/apiClient.js" type="text/javascript"></script>
  <script src="../../api/formatar.js" type="text/javascript"></script>

  <script type="text/javascript">
    $('.dropdown-menu').find('form').click(function(e) {
      e.stopPropagation();
    });
  </script>

  <?php
  #  Se houver um $_GET["tipo"] válido e um $GET["id"] válido, tem que retirar
  #  tudo da tela e exibir apenas o objeto na tabela "tipo" com id "id"

  if (isset($_GET["tipo"]) && isset($GET["id"]))
  {
    if (trim($_GET["tipo"]) != "" && trim($GET["id"]) != "") # pode juntar os dois IFs ou pode dar bugs?
    {
      # query para selecionar apenas um tipo específico e exibir na tela.
    }
  }
  ?>

  <nav class="navbar navbar-default navbar-fixed-top">
    <div class="container-fluid">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <!--  Esse é um daqueles botões de "hambúrger"-->
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <!-- <a class="navbar-brand" href="#">PDpedia</a> -->
      </div>

      <!-- Collect the nav links, forms, and other content for toggling -->
      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav navbar-right">
          <li><a href="#hero">Home</a></li>
          <li><a href="#artigos">Artigos</a></li>
          <li><a href="#biografias">Biografias</a></li>
          <li><a href="#acontecimentos">Acontecimentos</a></li>
          <li class="dropdown dropdown-large">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
              Login
            </a>
            <ul id="div-form-login" class="dropdown-menu">
              <li>
                <form class="form-horizontal">
                  <div class="form-group">
                    <label for="loginID" class="control-label">ID</label>
                    <input type="text" class="form-control" id="loginID" placeholder="Enter ID">
                  </div>
                  <div class="form-group">
                    <label for="loginPass" class="control-label">Password</label>
                    <input type="password" class="form-control" id="loginPass" placeholder="Enter Password">
                  </div>
                </form>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <!-- /.navbar-collapse -->
    </div>
    <!-- /.container-fluid -->
  </nav>

  <div id="content">

    <div id="hero" class="pagina container-fluid">
      <div class="apresentacao container-fluid col-xs-12 col-sm-12 col-md-6 col-lg-6">
        <div class="row">
          <h1 class="text-center">PDpedia</h1>
        </div>
        <h3 class="text-center col-xs-12 col-sm-12 col-md-12 col-lg-12">
                  Descubra, registre, compartilhe.
        </h3>
      </div>
    </div>
    <div id="artigos" class="pagina container-fluid">
      <div id="artigos-wrapper" class="row">
        <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <div class="list-group">
            <a class="list-group-item list-heading text-center">Últimos artigos</a>
            <script type="text/javascript">tendencias("ARTIGO");</script> <!-- Pegando as últimas tendências -->
            <a href="" id="art1" class="list-group-item"></a>
            <a href="" id="art2" class="list-group-item"></a>
            <a href="" id="art3" class="list-group-item"></a>
            <a href="" id="art4" class="list-group-item"></a>
            <a href="" id="art5" class="list-group-item"></a>
            <a href="" id="art6" class="list-group-item"></a>
            <a href="" id="art7" class="list-group-item"></a>
            <a href="" id="art8" class="list-group-item"></a>
          </div>
        </div>
        <label class="text-center col-xs-12 col-sm-6 col-md-6 col-lg-6">
          Quer escrever o que você pensa?
          <br>
          <a href="">Comece aqui!</a>
        </label>
      </div>
    </div>
    <div id="acont" class="pagina container-fluid">
      <div id="acont-wrapper" class="row">
        <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <div class="list-group">
            <a class="list-group-item list-heading text-center">Últimos Acontecimentos</a>
            <script type="text/javascript">tendencias("ACONTECIMENTO");</script> <!-- Pegando as últimas tendências -->
            <a href="" id="acont1" class="list-group-item"></a>
            <a href="" id="acont2" class="list-group-item"></a>
            <a href="" id="acont3" class="list-group-item"></a>
            <a href="" id="acont4" class="list-group-item"></a>
            <a href="" id="acont5" class="list-group-item"></a>
            <a href="" id="acont6" class="list-group-item"></a>
            <a href="" id="acont7" class="list-group-item"></a>
            <a href="" id="acont8" class="list-group-item"></a>
          </div>
        </div>
        <label class="text-center col-xs-12 col-sm-6 col-md-6 col-lg-6">
          Quer virar um jornalista?
          <br>
          <a href="">Comece aqui!</a>
        </label>
      </div>
    </div>
    <div id="biografia" class="pagina container-fluid">
      <div id="biografia-wrapper" class="row">
        <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <div class="list-group">
            <a class="list-group-item list-heading text-center">Últimas Biografias</a>
            <script type="text/javascript">tendencias("BIOGRAFIA");</script> <!-- Pegando as últimas tendências -->
            <a href="" id="bio1" class="list-group-item"></a>
            <a href="" id="bio2" class="list-group-item"></a>
            <a href="" id="bio3" class="list-group-item"></a>
            <a href="" id="bio4" class="list-group-item"></a>
            <a href="" id="bio5" class="list-group-item"></a>
            <a href="" id="bio6" class="list-group-item"></a>
            <a href="" id="bio7" class="list-group-item"></a>
            <a href="" id="bio8" class="list-group-item"></a>
          </div>
        </div>
        <label class="text-center col-xs-12 col-sm-6 col-md-6 col-lg-6">
          Quer escrever algo sobre alguém?
          <br>
          <a href="">Comece aqui!</a>
        </label>
      </div>
    </div>
  </div>
</body>

</html>
