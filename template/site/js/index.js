function goToByScroll(id){
      // Remove "link" from the ID
    id = id.replace("link", "");
      // Scroll
    $('html,body').animate({
        scrollTop: $("#"+id).offset().top},
        'slow');
}

$("a").click(function(e) {
      // Prevent a page reload when a link is pressed
    e.preventDefault();
      // Call the scroll function
    goToByScroll(this.id);
});


/*
  Contante que armazena os métodos de cada uma das páginas separadamente
*/
const GLOBAL = {
    TIPO_PAGINA : "Artigo",

    Acontecimento: {
        inicializar: function () {
          return 0;
        },

        ajustarDivs: function () {
          if($(".apresentacaoAcont2").height() > $(".apresentacaoAcont3").height())
            $(".apresentacaoAcont3").height($(".apresentacaoAcont2").height());
          else
            $(".apresentacaoAcont2").height($(".apresentacaoAcont3").height());

        }
    },

    Artigo: {
        inicializar: function () {
          return 0;
        }
    },

    Biografia: {
        inicializar: function () {
          return 0;
        }
    }
};

/*
  Método feito para executar funções situadas na contante GLOBAL

  funcao - Nome da função a ser executada */
var exec = function(funcao) {
  GLOBAL[GLOBAL.TIPO_PAGINA][funcao]();
}

/*
  Método feito para identificar o tipo da página utilizada

  PAGE_TYPE - (Artigo, Acontecimento, Biografia) Página sendo utilizada
*/
var iniciar = function(PAGE_TYPE) {
  GLOBAL.TIPO_PAGINA = PAGE_TYPE;
  exec("inicializar");
}
