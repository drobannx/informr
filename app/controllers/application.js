import Ember from 'ember';

export default Ember.Controller.extend(Ember.Evented, {
  //adminBinding: 'Config.admin',
  //previewBinding: Ember.Binding.oneWay('admin'),
  message: "",
  error: false,
  editTitle: false,

  //newsIndex: window.Config.admin ? -1 : 0,
  toRemove: [],

  uiNewsIndex: function(){ return this.get('newsIndex') + 1; }.property('newsIndex'),

  init: function(){
    var that = this;
    this._super();

    this.fetchNews();

    that.updateConfig();
  },

  updateConfig: function() {
    var that = this;

    $.get('/api/config', function(config){
      var updateInterval = Ember.get(config, 'intervals.fetchConfig') || (1000 * 60 * 60);
      that.set('config', config);

      // Cheating...
      if(config && config.backgrounds){
        $('.bg-rotate').append($('<img>').attr('src', config.backgrounds[0]));
      }

      setTimeout($.proxy(that.updateConfig, that), updateInterval);
      that.trigger('updateUIIntervals');
    });
  },

  fetchNews: function(){
    var that = this;
    that.get('store').findQuery('news').then(function(news){
      that.set('news', news);
      Ember.run.next(function(){
        that.trigger('renderNews');
      });
    });
  },

  clearUpdate: function() {
    this.set('error', false);
    this.set('message', '');
  },

  updateMessage: function(note, error) {
    var that = this;

    return function(){
      if(error){ that.set('error', true); }

      var msg = that.get('message');
      msg += note + '<br />';
      that.set('message', msg);
    };
  },

  updateNews: function(news) {
    news.save().then(this.updateMessage('News Saved'), this.updateMessage('News Failed', true));
  },

  updateItemsToRemove: function(toRemove) {
    var that = this;
    if(toRemove) {
      toRemove.forEach(function (obj) {
        if (obj.id) {
          obj.deleteRecord();
          obj.save().then(that.updateMessage('News Item Deleted'), that.updateMessage('News Item Failed to Delete', true));
        }
      });

      toRemove.clear();
    }
  },

  actions: {
    update: function(){
      var that = this,
        news = this.get('news'),
        floors = this.get('floors'),
        toRemove = this.get('toRemove');

      that.clearUpdate();

      that.updateNews(news);

      that.updateItemsToRemove(toRemove);
    },

    togglePreview: function(){
      this.toggleProperty('preview');
    },

    toggleEditTitle: function(){
      this.toggleProperty('editTitle');
    },

    removeNews: function(){
      var index = this.get('newsIndex'),
        news = this.get('news'),
        item;

      if(index > -1 && index < news.get('length')){
        item = news.objectAt(index);
        this.get('toRemove').pushObject(item);

        news.removeAt(index);

        if(index >= news.get('length')){
          this.set('newsIndex', --index);
        } else {
          for (i = index; i < news.get('length'); i++) {
            news.objectAt(i).set('sort', i);
          }
        }

        Em.run.next(function(){
          $('.news .panel:nth('+(index)+')').addClass('in').css('z-index', 3);
        });
      }
    },

    addNews: function(){
      var news = this.get('news');
      news.pushObject(this.store.createRecord(I.News, {
        title: "New Event/News " + (1+news.get('length')),
        body: "What is the purpose of the event?",
        time: "When is the event?",
        location: "Where will it take place?",
        sort: news.get('length')
      }));
    },

    shiftPrev: function(){
      var index = this.get('newsIndex'),
        news = this.get('news'), item;

      if(index > 0 && index < news.get('length')){
        this.decrementProperty('newsIndex');
        item = news.objectAt(index);
        news.removeAt(index);
        news.insertAt(index-1, item);

        // Update sort order
        item.decrementProperty('sort');
        news.objectAt(index).incrementProperty('sort');

        Em.run.next(function(){
          $('.news .panel:nth('+(index-1)+')').addClass('in').css('z-index', 3);
        });
      }
    },

    shiftNext: function(){
      var index = this.get('newsIndex'),
        news = this.get('news'), item;

      if(index > -1 && index < news.get('length') - 1){
        this.incrementProperty('newsIndex');
        item = news.objectAt(index);
        news.removeAt(index);
        news.insertAt(index+1, item);

        // Update sort order
        item.incrementProperty('sort');
        news.objectAt(index).decrementProperty('sort');

        Em.run.next(function(){
          $('.news .panel:nth('+(index+1)+')').addClass('in').css('z-index', 3);
        });
      }
    },

    startNewsEdit: function(item){
      item.set('edit', this.get('preview'));
    },

    endNewsEdit: function(){
      var index = this.get('newsIndex'),
        news = this.get('news'), item, file;

      if(index > -1 && index < news.get('length')){
        item = news.objectAt(index);
        item.set('edit', false);

        if(item.get('removeFile')) {
          item.set('image', null);
          item.set('removeFile', false);
        }
      }
    },

    clearMsg: function(){
      this.set('message', '');
    }
  }
});
