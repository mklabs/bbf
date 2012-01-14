describe('Backbone.Form', function() {

  beforeEach(function() {
    this.model = new Backbone.Model({
      name: 'BBF',
      description: 'Generates form arbitrary model.attributes',
      alpha: true,
      buggy: true,
      list: ['foo', 'bar', 'baz'],
      nested: {
        support: 'nested object structure'
      }
    });

    this.form = new Backbone.Form({
      model: this.model,
      className: 'bbf-test-view',
      id: 'bbf-test-view'
    });

    this.fixtures = $('<div />', { id: 'fixtures' })
      .append($('<span />', { 'class': 'foo' }))
      .appendTo(document.body);
  });


  afterEach(function() {
    this.model.destroy();
    this.form.remove();

    this.fixtures.remove();
  });

  describe('View: constructor', function() {

    it('should set id / className properly, based on properties provided', function() {
      var view = this.form;
      expect(view.el.id).toBe('bbf-test-view');
      expect(view.el.className).toBe('bbf-test-view');
      expect(view.options.id).toBe('bbf-test-view');
      expect(view.options.className).toBe('bbf-test-view');
    });


    describe('Should be tied to a DOM element when created', function() {

      it('based off the tagName property provided', function() {
        //what html element tag name represents this view?
        expect(new Backbone.Form({ model: this.model, tagName: 'div' }).el.tagName.toLowerCase()).toBe('div');
      });

      it('should tagName be form by default', function() {
        //what html element tag name represents this view?
        expect(this.form.el.tagName.toLowerCase()).toBe('form');
      });

      it('should have a class of "bbf"', function() {
        expect(this.form.el.className).toBe('bbf-test-view');
      });

      it('is backed by a model instance, which provides the data.', function() {

        expect(this.form.model).toBeDefined();
        expect(this.form.model).toBe(this.model);

        expect(this.form.model.get('name')).toBe('BBF');
        expect(this.form.model.get('description')).toBe('Generates form arbitrary model.attributes');
        expect(this.form.model.get('alpha')).toBe(true);
        expect(this.form.model.get('buggy')).toBe(true);
        expect(this.form.model.get('list').length).toEqual(3);
        expect(this.form.model.get('list')).toEqual(['foo', 'bar', 'baz']);
        expect(this.form.model.get('nested')).toEqual({ support: 'nested object structure' });

      });

    });

  });


  describe("View: initialize", function() {

    it('should initialize properly, and override defaults one', function() {
      var View = Backbone.Form.extend({
        initialize: function() {
          this.one = 1;
        }
      });
      var view = new View;
      expect(view.one).toBe(1);
    });

    it('should yell at you if not providing a Backbone.Model to work with', function() {
      expect(function() { new Backbone.Form(); }).toThrow(new Error('Backbone.Form needs a model to work with.'));
    });

  });

  describe("View: delegateEvents", function() {

    it('should delegate events as expected', function() {
      var counter = counter2 = 0,
        view = this.form,
        events = {"click .foo": "increment"},
        el = this.fixtures;

      view.el = el.get(0);
      view.increment = function(){ counter++; };
      view.$('.foo').bind('click', function(){ counter2++; });

      view.delegateEvents(events);

      el.find('.foo').trigger('click');
      expect(counter).toEqual(1);
      expect(counter2).toEqual(1);

      el.find('.foo').trigger('click');
      expect(counter).toEqual(2);
      expect(counter2).toEqual(2);

      view.delegateEvents(events);
      el.find('.foo').trigger('click');
      expect(counter).toEqual(3);
      expect(counter2).toEqual(3);

    });

  });

  describe("View: undelegateEvents", function() {

    it('should undelegate events as expected', function() {
      var counter = counter2 = 0,
        view = this.form,
        events = {"click .foo": "increment"},
        el = this.fixtures;

      view.el = el.get(0);
      view.increment = function(){ counter++; };
      $(view.el).bind('click', function(){ counter2++; });


      view.delegateEvents(events);
      el.find('.foo').trigger('click');
      expect(counter).toEqual(1);
      expect(counter2).toEqual(1);

      // upcomming version of backbone will introduce undelegateEvents
      // for now, doint it here works just fine for our tests
      $(view.el).unbind('.delegateEvents' + view.cid);
      el.find('.foo').trigger('click');
      expect(counter).toEqual(1);
      expect(counter2).toEqual(2);

      view.delegateEvents(events);
      el.find('.foo').trigger('click');
      expect(counter).toEqual(2);
      expect(counter2).toEqual(3);

    });

  });


  describe("View: _ensureElement", function() {

    it('should be ok with DOM node el', function() {
      var ViewClass = Backbone.Form.extend({
        model: this.model,
        el: document.body
      });
      var view = new ViewClass;
      expect(view.el).toBe(document.body);
    });


    it('should be ok with string el', function() {
      var ViewClass = Backbone.Form.extend({
        el: "body",
        model: this.model
      });

      var view = new ViewClass;
      expect(view.el).toBe(document.body);


      ViewClass = Backbone.Form.extend({
        el: "body > div",
        model: this.model
      });
      view = new ViewClass;
      expect(view.el).toBe($('.jasmine_reporter').get(0));

      ViewClass = Backbone.View.extend({
        el: "#nonexistent",
        model: this.model
      });
      view = new ViewClass;

      expect(!view.el).toBe(true);
    });

  });

  describe("View: with attributes", function() {
    it('should have the DOM node el with attributes properly set', function() {
      var view = new Backbone.Form({
        attributes : {'class': 'one', id: 'two'},
        model: this.model
      });

      expect(view.el.className).toBe('one');
      expect(view.el.id).toBe('two');
    });
  });

  describe("View: multiple views per element", function() {

    it('should be ok', function() {

      var count = 0, ViewClass = Backbone.Form.extend({
        el: $("body"),
        model: this.model,
        events: {
          "click": "click"
        },
        click: function() {
          count++;
        }
      });

      var view1 = new ViewClass;
      $("body").trigger("click");
      expect(count).toBe(1);

      var view2 = new ViewClass;
      $("body").trigger("click");
      expect(count).toBe(3);

      view1.delegateEvents();
      $("body").trigger("click");
      expect(count).toBe(5);
    });
  });

  describe("View: custom events, with namespaces", function() {

    it('should be ok', function() {
      var count = 0;
      var ViewClass = Backbone.Form.extend({
        el: $('body'),
        model: this.model,
        events: function() {
          return {"fake$event.namespaced": "run"};
        },
        run: function() {
          count++;
        }
      });

      var view = new ViewClass;
      $('body').trigger('fake$event').trigger('fake$event');
      expect(count).toBe(2);

      $('body').unbind('.namespaced');
      $('body').trigger('fake$event');
      expect(count).toBe(2);

    });

  });


  describe("View: Rendering", function() {

    it("returns the view object", function() {
      expect(this.form.render()).toEqual(this.form);
    });

    it("produces the correct HTML", function() {
      var view = this.form,
        model = this.model,
        inputs;

      view.render();

      expect(view.el.innerHTML).toBeTruthy();

      expect(view.$('label').length).toBeTruthy();
      expect(view.$('input').length).toBeTruthy();

      inputs = view.$(':input');

      inputs.each(function(i, el) {
        expect(el.className).toBe('xlarge');
        expect(el.id.split('-').slice(0, 2).join('-')).toBe('input-' + view.cid);
      });

    });

  });

});
