import DS from 'ember-data';

export default DS.Model.extend({
    title:          DS.attr('string'),
    body:           DS.attr('string'),
    location:       DS.attr('string'),
    time:           DS.attr('string'),
    image:          DS.attr('string'),
    removeFile:     DS.attr('boolean'),
    sort:           DS.attr('number')
});
