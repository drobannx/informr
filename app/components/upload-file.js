import Ember from 'ember';

export default Ember.TextField.extend({
    tagName: 'input',
    attributeBindings: ['name'],
    type: 'file',
    file: null,
    change: function (e) {
      var reader = new FileReader(),
        that = this;

      reader.onload = function (e) {
        var fileToUpload = e.target.result;
        Ember.run(function() {
          that.set('file', fileToUpload);
        });
      };

      return reader.readAsDataURL(e.target.files[0]);
    }
});
