import DS from 'ember-data';

export default DS.Model.extend({
    temp: DS.attr('string'),
    text: DS.attr('string')
});
