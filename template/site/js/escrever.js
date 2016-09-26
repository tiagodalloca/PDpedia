window.onload = () => {

  var ver_texto = $("#ver-texto");
  var ver_html = $("#ver-html");
  var lugar_onde_escreve = $("#lugar-onde-escreve");
  var html_preview = $("#html-preview");
  var remarkable = new Remarkable({
    highlight: function(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (err) {}
      }

      try {
        return hljs.highlightAuto(str).value;
      } catch (err) {}

      return ''; // use external default escaping
    }
  });

  remarkable.options.langPrefix = "hljs lang-"

  $("#lugar-onde-escreve").val(
    "# Título h1\n## Título h2\n### Título h3\n#### Título h4\n\n- item 1\n- item 2\n- item 3\n- item 4\n- item 5\n- item 6\n  * sub-item 1\n  * sub-item 2\n  * sub-item 3\n\n --- \n   ```c\n  int main (void){\n    printf(\"Hello world!\");\n  }\n  ```"
  );

  ver_html.click((e) => {
    ver_html.addClass("active");
    ver_texto.removeClass("active");

    html_preview.html(remarkable.render(lugar_onde_escreve.val()));


    html_preview.show();
    lugar_onde_escreve.hide();
  });

  ver_texto.click((e) => {
    ver_texto.addClass("active");
    ver_html.removeClass("active");
    lugar_onde_escreve.show();
    html_preview.hide();
  });
};

/* insere um campo na tabela para 'montá-la' (visualizar após pronta) */
function aumentarTabelaMontar(IDTabela, campo) {
  var tab = document.getElementById(IDTabela).tBodies[0];
  var x = tab.innerHTML.split("  ");
  x.push("<tr><td>" + campo.nome + "</td><td>" + campo.valor + "</td></tr>  ");
  tab.innerHTML = "";
  for (var i = 0; i <= x.length - 1; i++) {
    tab.innerHTML += x[i];
  }
}

/* insere um campo na tabela para criar um artigo, acont, ou bio (adicionar os campos) */
/*
IDTabela       = ID da tabela em questão
IDs            = IDs dos inputs header e valor 
headerAndValue = valor default dos inputs
*/
function aumentarTabelaCriar(IDTabela, IDs, headerAndValue) {
  var tab = document.getElementById(IDTabela).tBodies[0];
  var x = tab.innerHTML.split("  ");
  if (headerAndValue == null)
    x.push("<tr><td><label for='" + IDs[0] + "'>Header:</label><input type='text' class='form-control' id='" + IDs[0] + "'></td><td><label for='" + IDs[1] + "'>Valor:</label><input type='text' class='form-control' id='" + IDs[1] + "'></td></tr>  ");
  else
    x.push("<tr><td><label for='" + IDs[0] + "'>Header:</label><input type='text' class='form-control' id='" + IDs[0] + "' value='"+headerAndValue[0]+"'></td><td><label for='" + IDs[1] + "'>Valor:</label><input type='text' class='form-control' id='" + IDs[1] + "' value='"+headerAndValue[1]+"'></td></tr>  ");
  tab.innerHTML = "";
  for (var i = 0; i <= x.length - 1; i++) {
    tab.innerHTML += x[i];
  }
}