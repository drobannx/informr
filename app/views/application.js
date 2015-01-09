import Ember from 'ember';
import moment from 'moment';

export default Ember.View.extend({
  didInsertElement: function(){
    this._super();

    var that = this,
      clock = $('#clock'),
      today = $('#date'),
      controller = this.get('controller'),
      intervalIds = [];

    setInterval(function(){
      clock.html(moment().format('h:mm A'));
      today.html(moment().format('dddd, MMMM D, YYYY'));
    }, 1000);

    //if(window.Config.admin){
    //  $('body').css('overflow', 'auto');
    //}

    controller.on('renderNews', function(){ that.send('renderNews'); });
    controller.on('updateUIIntervals', $.proxy(function(){
      var id;
      while(id = intervalIds.pop()){
        clearInterval(id);
      }

      intervalIds.push(setInterval($.proxy(that.rotateBg, that),     controller.get('config.intervals.rotateBackground') || (1000 * 60 * 10)));
      //if(!window.Config.admin){
      //  intervalIds.push(setInterval($.proxy(that.rotateNews, that),   controller.get('config.intervals.rotateNews')             || (1000 * 15)));
      //  intervalIds.push(setInterval($.proxy(controller.fetchNews, controller),   controller.get('config.intervals.fetchNews')   || (1000 * 60 * 60)));
      //}
    }, that));
  },

  backgroundIndex: 0,
  rotateBg: function(diff){
    diff = diff < 1 ? -1 : 1;

    if(this.get('state') === 'inDOM'){
      var backgrounds = this.get('controller.config.backgrounds'),
        container = this.$('.bg-rotate'),
        oldImg = container.find('img'),
        newImg = $('<img>'),
        index = (this.get('backgroundIndex') + diff) % backgrounds.length;

      oldImg.css('z-index', 2);
      newImg.css('z-index', 1).on('load', function(){
        oldImg.addClass('bg-fade');
        setTimeout(function(){
          oldImg.remove();
        }, 15000);
      }).attr('src', backgrounds[index]).appendTo(container);
      this.set('backgroundIndex', index);
    }
  },

  rotateNews: function(diff){
    var index = this.get('controller.newsIndex');

    if(index !== null && this.get('state') === 'inDOM'){
      var news = this.$('.news .panel');
      diff = diff < 1 ? -1 : 1;

      if(news.length){
        index = (index + diff) % news.length;
        if(index < 0){ index = news.length - 1; }
        this.set('controller.newsIndex', index);

        this.renderNews();
      }
    }
  },

  renderNews: function(){
    var news = this.$('.news .panel'),
      index = this.get('controller.newsIndex'),
      selectedNews = news.filter('[data-index="' + index + '"]');

    news.removeClass('in').css('z-index', 1);

    if(selectedNews) { selectedNews.addClass('in'); }
    else { $(news[index]).addClass('in').css('z-index', 2); }
  },

  actions: {
    nextBg: function(){
      this.rotateBg(1);
    },

    prevNews: function(){
      this.rotateNews(-1);
    },

    nextNews: function(){
      this.rotateNews(1);
    }
  }
});
