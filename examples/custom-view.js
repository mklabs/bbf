(function($, exports) {

  var target = $('.form-custom'),
    templateForms = _.template(target.find('script').html());

  var m = new Backbone.Model({
    name: 'BBF',
    description: 'Generates form arbitrary model.attributes',
    alpha: true,
    buggy: true,
    list: ['foo', 'bar', 'baz']
  });

  var SomeForm = Backbone.Form.extend({

    tagName: 'div',

    className: 'fooo bar',

    events: {
      'click .secondary': 'cancel',
      'submit form': 'submit'
    },

    cancel: function cancel(e) {
      e.preventDefault();
      alert('Sad panda :(');
    },

    submit: function submit(e) {
      e.preventDefault();
      var s = this.serialize();
      console.log('serialized form: ', s);
      this.model.set(s);

      console.log('new model state: ', this.model.toJSON());
    },

    render: function render() {
      $(this.el).html(templateForms({
        html: this.html()
      }));
      return this;
    }
  });


  new SomeForm({ model: m, el: target }).render();


})(this.jQuery, this);
