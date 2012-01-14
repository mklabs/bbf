(function(Backbone, _, exports) {


  // inline template ftw
  //
  // precompiled underscore template function, this is the default template
  // forms will use. Can be overriden by passing in a `template` property.
  var tmpl = _.template([
    '<% _.each(items, function(item) { %>',
    ' <div class="clearfix">',
    '   <label for="input-<%= item.cid %>-<%= item.label %>"><%= item.label %></label>',
    '   <div class="input">',
    '     <%= item.html %>',
    '   </div>',
    ' </div>',
    '<% }); %>'
  ].join('\n'));


  // some regex helpers borrowed to jQuery (namely to impl our custom serializeArray)
  var rCRLF = /\r?\n/g,
    rselectTextarea = /^(?:select|textarea)/i,
    rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;


  // ## Form
  //
  // Super simplified version of Backbone-forms
  // with the bare minimum functionnality I need.

  // Actually, this is just a simple form html generation
  // from given model attributes. The resulting html is designed
  // to fit well with bootstrap's form layout.
  //
  // This is still a Backbone.View, so it's expected that it should
  // work in very much the same way (events delegation should work,
  // extending and so fourth)

  // Expose stuff to the real world as `Backbone.Form`.
  var Form = Backbone.Form = Backbone.View.extend({

    // the default tag name for the creation of the form element
    tagName: 'form',

    // optional list of properties to exclude. Won't be generated.
    exclude: [],

    options: {

      // the default template that can be overriden by passing in another compiled function as a `template` property.
      template: tmpl
    },

    // init all that jazz
    initialize: function initialize() {
      if(!this.model) throw new Error('Backbone.Form needs a model to work with.');
      if(!(this.model instanceof Backbone.Model)) throw new Error("'Backbone.Form's model should be a Backbone.Model instance");
    },

    // #### html
    //
    // Returns the html representation.. or w/e.
    //
    // This is where all the magic happens. `model.attributes`
    // (that is the internal object that Backbone use to `get`
    // or `set` things) is used to generate the whole.
    //
    // `options.template` precompiled function is used to generate the form,
    // and is passed an array of items the template should iterate through.
    //
    // Each item get the following values:
    //
    // * `type`: the "form" type returned by `getType` method
    // * `html`: the unescaped html representation for that particular type
    // * `label`: the attributes key
    // * `value`: the attribute value
    // * `cid`: the form view cid property
    html: function html(attrs, level) {
      attrs = attrs || this.model.attributes;
      level = level ? level + '-': '';

      var self = this,
        keys = _.keys(attrs),
        items = [];

      _.each(keys, function(key, i) {
        var value = attrs[key],
          type = self.getType(value),
          exclude = !!~_.indexOf(self.exclude, key);

        if(exclude) return;

        items.push({
          type: type,
          html: self.getHtml(key, value, type, level),
          label: key,
          value: value,
          cid: self.cid
        });
      });

      return this.options.template({
        items: items
      });
    },

    // #### getType
    //
    // Basic mapping from JavaScript types to input types.
    //
    // String / Numbers results in `<input type="text" />`,
    // arrays in `<select />`, booleans in checkboxes.
    //
    // Objects are a special case where the html is generated recursively.
    getType: function getType(val) {
      if(typeof val === 'string') return 'text';
      if(typeof val === 'number') return 'text';
      if(_.isArray(val)) return 'select';
      if(typeof val === 'object') return 'object';
      if(typeof val === 'boolean') return 'checkbox';

      // todo: etc.
    },

    // #### getHtml
    //
    // Returns the html string representation for each handled type. 
    //
    // `key` is used to generate labels. `value` is used to either set the value
    // attribute of text inputs, to generate the corresponding list of select options
    // (in case of `value` beeing an array), or to set the `checked` state of checkboxes
    //
    // In case of `<select />` elements, the optional mapping for the key is used to
    // setup the `selected` state of according options. Usually, select elements are
    // managed through two model properties, one for the list of options, the second to 
    // hold the selected values.
    //
    // *todo here: collection of templates (for each handled type), instead of inlined html.*
    getHtml: function getHtml(key, value, type, level) {
      var fragment,
        mapping = this.mapping || {},
        mapped = mapping[key] && this.model.get(mapping[key]);

      key = level + key;

      if(type === 'text') {
        return '<input class="xlarge" id="input-:cid-:label" name="input-:cid-:label" size="30" type="text" value=":value" />'
          .replace(/:cid/g, this.cid)
          .replace(/:label/g, key)
          .replace(/:value/g, value);
      }

      if(type === 'select') {
        if(!Array.isArray(value)) throw new Error('values should be an array with select type');
        fragment = ['<select id="input-:cid-:label" name="input-:cid-:label">'];
        fragment = fragment.concat(value.map(function(val) {
          return '<option value="' + val + '"' + (mapped && mapped === val ? 'selected="selected"': '')+ '>' + val + '</option>'
        }));
        fragment.push('</select>');
        return fragment.join('\n')
          .replace(/:cid/g, this.cid)
          .replace(/:label/g, key)
          .replace(/:value/g, value)
      }


      if(type === 'checkbox') {
        fragment = [
          '<div class="input-prepend">',
          '  <label class="add-on activ">',
          '    <input type="checkbox" name="input-:cid-:label" id="input-:cid-:label" ' + (value ? 'checked="checked"' : '') + '/>',
          '  </label>',
          '</div>'
        ];

        return fragment.join('\n')
          .replace(/:cid/g, this.cid)
          .replace(/:label/g, key)
          .replace(/:value/g, value);
      }

      // In case of `object` type, recursively call the `html`
      // method to generate the form. The current key is then used as
      // a new "level".
      //
      // `name` and `id` attributes are set depending on the level / key
      // combination (prefixed by `input-viewid`, where `viewid` refers to the
      // view's `cid` prop.)
      if(type === 'object') {
        return this.html(value, key);
      }

      // Otherwise, this is an unknown or not yet handled type. Make it clear and obvious.
      throw new Error('Unknown field type ' + type);
    },

    // #### render
    // render the form and all fields.. or w/e
    render: function render() {
      $(this.el).html(this.html());
      return this;
    },

    // #### serialize
    //
    // Returns the mapping object for each defined attributes in the generated form.
    //
    // This should works with any level of nested object, and it should map checkboxes
    // value to either true / false value (instead of not serializing it). Finally,
    // basic type coercion are done on different kind of string output. The serialized
    // object should be usable as is to set the new model state.
    serialize: function serialize(el) {
      var form = this.tagName === 'form' ? this.el : this.el.find('form'),
        self = this,
        cid = this.cid,
        o = {},
        arr;

      if(!form.length) throw new Error('Serialize must operate on a form element');

      _.each(this.serializeArray(form), function(a, i) {
        var name = a.name.replace('input-' + cid + '-', ''),
          lvls = name.split('-'),
          ln = lvls.length,
          tmp = o;

        if(ln === 1) return o[name] = self.value(a.value);

        _.each(lvls, function(lvl, i) {
          if(!tmp[lvl] && (i + 1) !== ln) tmp = tmp[lvl] = {};
          else if(tmp[lvl] && (i + 1) !== ln) tmp = tmp[lvl];
          else if(!tmp[lvl]) {
            tmp[lvl] = self.value(a.value);
          }
        });
      });

      return o;
    },

    // #### serializeArray
    //
    // Reimpl a (simpler) version of jQuery's serialize array, cause we
    // need to get values for checkbox as either true / false.
    // $.fn.serializeArray by default doesn't return anything when a
    // checkbox.checked is set to false. I just want the element.checked
    // value.
    //
    // Another difference is that we only operate on top of a single form.
    serializeArray: function serializeArray(el) {
      return el.map(function(){
        return this.elements ? jQuery.makeArray( this.elements ) : this;
      }).filter(function() {
        return this.name && !this.disabled &&
          ( this.checked != null || rselectTextarea.test( this.nodeName ) || rinput.test( this.type ) );
      }).map(function( i, elem ){
        var val = jQuery( this ).val();
        val = val === 'on' ? this.checked + '' : val;

        return val == null ? null :
          jQuery.isArray( val ) ? jQuery.map( val, function( val, i ){
            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
          }) :
          { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
      }).get();
    },

    // #### value
    //
    // Conversion helper, courtesy of jQuery. Part of `dataAttr` function used
    // to grab the `data-*` attributes values. `"true"`, `"false"` and `"null"`
    // strings are mapped to their JavaScript couterparts and number-like strings
    // are `parseFloat`-ed.
    value: function value(val) {
      return val === 'true' ? true :
        val === 'false' ? false :
        val === 'null' ? null :
        (!isNaN(parseFloat(val)) && isFinite(val)) ? parseFloat(val) :
        val;
    }
  });

})(this.Backbone, this._, this);
