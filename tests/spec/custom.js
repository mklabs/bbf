describe('Backbone.Form with custom class', function() {

  var customTmpl = _.template([
    '<form>',
    ' <div class="form-body">',
    '   <%= html %>',
    ' </div>',
    ' <div class="form-footer">',
    '   <input type="submit" class="btn primary" value="OK" />',
    '   <a href="#" class="btn secondary">Cancel</a>',
    ' </div>',
    '</form>'
  ].join('\n'));

  var SomeForm = Backbone.Form.extend({

    tagName: 'div',

    className: 'fooo bar',

    events: {
      'click .secondary': 'cancel',
      'submit form': 'submit'
    },

    cancel: function cancel(e) {
      console.log('cancel');
      e.preventDefault();
      this.canceled = true;
    },

    submit: function submit(e) {
      console.log('submit');
      e.preventDefault();
      var s = this.serialize();
      this.model.set(s);
    },

    render: function render() {
      $(this.el).html(customTmpl({
        html: this.html()
      }));
      return this;
    }
  });


  beforeEach(function() {
    this.model = new Backbone.Model({
      name: 'BBF',
      description: 'Generates form arbitrary model.attributes',
      alpha: true,
      buggy: true,
      list: ['foo', 'bar', 'baz']
    });

    this.form = new SomeForm({ model: this.model });
  });

  afterEach(function() {
    this.model.destroy();
    this.form.remove();
  });

  describe('View: Extending Forms', function() {

    it('and rendering should produce the correct HTML', function() {
      var view = this.form,
        model = this.model,
        inputs;

      view.render();

      expect(view.el.innerHTML).toBeTruthy();

      expect(view.$('label').length).toBe(7);
      expect(view.$(':input').length).toBe(6);

      expect(view.$('#input-' + view.cid + '-description').length).toBe(1);

      inputs = view.$('.form-body :input');

      inputs.each(function(i, el) {
        expect(el.className).toBe('xlarge');
        expect(el.id.split('-').slice(0, 2).join('-')).toBe('input-' + view.cid);
      });
    });


    it('delegated events should fire accoding methods', function() {
      var view = this.form.render();

      console.log(view);
      expect(view.canceled).toBe(undefined);
      view.$('.secondary').trigger('click');
      console.log(view);
      expect(view.canceled).toBe(true);

      expect(view.model.toJSON()).toEqual({
        name: 'BBF',
        description: 'Generates form arbitrary model.attributes',
        alpha: true,
        buggy: true,
        list: ['foo', 'bar', 'baz']
      });

      view.$('[name="input-' + view.cid + '-name"]').val('changed name value');

      view.$('form').trigger('submit');
      expect(view.model.get('name')).toBe('changed name value');

    });

  });


});
