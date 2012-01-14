(function($, exports) {

  var target = $('.form-nested');

  var m = new Backbone.Model({
    example: 'using a deeply nested object structure',
    people: {
      list: ['John Doe', 'Jane Doe'],
      nb: 2,
      hobbies: {
        foo: true,
        bar: true,
        baz: false,
        yay: ['y', 'a', 'y']
      }
    }
  });

  // Generates the form and append of the `el` property to our target element
  target.append(new Backbone.Form({ model: m }).render().el);

})(this.jQuery, this);
