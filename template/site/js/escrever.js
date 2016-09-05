window.onload = () => {

  var ver_texto = $("#ver-texto");
  var ver_html = $("#ver-html");
  var lugar_onde_escreve = $("#lugar-onde-escreve");
  var html_preview = $("#html-preview");
  var remarkable = new Remarkable({
    highlight: function (str, lang) {
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

  ver_html.click((e) =>{
    ver_html.addClass("active");
    ver_texto.removeClass("active");

    html_preview.html(remarkable.render(lugar_onde_escreve.val()));


    html_preview.show();
    lugar_onde_escreve.hide();
  });

  ver_texto.click((e) =>{
    ver_texto.addClass("active");
    ver_html.removeClass("active");
    lugar_onde_escreve.show();
    html_preview.hide();
  });
};
