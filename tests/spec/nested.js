describe('Backbone.Form with nested object structure', function() {

  beforeEach(function() {
    this.model = new Backbone.Model({
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

    this.form = new Backbone.Form({
      model: this.model,
      className: 'bbf-test-view',
      id: 'bbf-test-view'
    });
  });


  afterEach(function() {
    this.model.destroy();
    this.form.remove();
  });

  describe('View: Rendering with nested objects', function() {

    it('produces the correct HTML', function() {
      var view = this.form,
        model = this.model,
        inputs;

      view.render();

      expect(view.el.innerHTML).toBeTruthy();

      expect(view.$('label').length).toBe(12);
      expect(view.$(':input').length).toBe(7);

      expect(view.$('#input-' + view.cid + '-people-nb').length).toBe(1);

      inputs = view.$(':input');

      inputs.each(function(i, el) {
        expect(el.className).toBe('xlarge');
        expect(el.id.split('-').slice(0, 2).join('-')).toBe('input-' + view.cid);
      });
    });

    describe('and generate nested objects as well', function() {
      it('produces the correct HTML for each model attributes', function() {
        var view = this.form;
        _.each(this.model.attributes.hobbies, function(item, key) {
          var el = view.$('[name="input-' + view.cid + '-hobbies-' + key + '"]]');

          expect(el.length).toBe(1);
          expect(el.attr('type')).toBe('checkbox');
          expect(el.val()).toBe('true');
          expect(el.get(0).id).toBe('input-' + view.cid + '-hobbies-foo');
        });
      });
    });

  });


});
