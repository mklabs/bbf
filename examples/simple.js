(function($, exports) {

  var target = $('.form-simple');

  var m = new Backbone.Model({
    name: 'BBF',
    description: 'Generates form arbitrary model.attributes',
    alpha: true,
    buggy: true,
    list: ['foo', 'bar', 'baz'],
    nested: {
      support: 'nested object structure'
    }
  });

  // Generates the form and append of the `el` property to our target element
  //
  //    target.append(new Backbone.Form({ model: m }).render().el);

  // Create our form instance, pass in the model to work with.
  var form = new Backbone.Form({ model: m });

  // make sure to call the render method, and have the el
  // property content generated.
  form.render();

  // Now that, we're good we can use `form.el` and have fun
  target.append(form.el);

  // or might prefer to use use the html string directly
  console.log(form.html());


})(this.jQuery, this);
