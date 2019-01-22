export const byteSize = str => new Blob([str]).size;

export const fromCamelCase = (str, separator = '_') =>
  str
  .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
  .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
  .toLowerCase();

fromCamelCase('someDatabaseFieldName', ' '); // 'some database field name'
fromCamelCase('someLabelThatNeedsToBeCamelized', '-'); // 'some-label-that-needs-to-be-camelized'
fromCamelCase('someJavascriptProperty', '_'); // 'some_javascript_property'

const URLJoin = (...args) =>
  args
  .join('/')
  .replace(/[\/]+/g, '/')
  .replace(/^(.+):\//, '$1://')
  .replace(/^file:/, 'file:/')
  .replace(/\/(\?|&|#[^!])/g, '$1')
  .replace(/\?/g, '&')
  .replace('&', '?');

URLJoin('http://www.google.com', 'a', '/b/cd', '?foo=123', '?bar=foo'); // 'http://www.google.com/a/b/cd?foo=123&bar=foo'