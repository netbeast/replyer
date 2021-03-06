/* global describe, after, before, it */

var chai = require('chai')
var expect = chai.expect

var replyer = require('../replyer')
var client

describe('Replyer', function () {
  before('client must connect to test server', function (done) {
    client = replyer.connect('mqtt://test.mosquitto.org')
    client.on('connect', () => done())
  })

  after('client must end its connection', function () {
    client.end()
  })

  it('should emit event on subscribed topics', function (done) {
    client.on('replyer/test/@issuer', function reqHandler (data) {
      expect(data).to.equal('!')
      client.removeListener('replyer/test/@issuer', reqHandler)
      done()
    })
    client.publish('replyer/test/@issuer', '!')
  })

  it('should emit event on nested topics', function (done) {
    client.on('replyer/#', function reqHandler (data) {
      expect(data).to.equal('!')
      client.removeListener('replyer/#', reqHandler)
      done()
    })
    client.publish('replyer/test/@issuer', '!')
  })

  it('should be able to request bare objects', function (done) {
    client.on('replyer/test/#', function reqHandler (data) {
      expect(data.device).to.equal('sensor')
      client.removeListener('replyer/test/#', reqHandler)
      done()
    })
    client.request('replyer/test', { device: 'sensor' })
  })

  it('should be able to reply a request', function (done) {
    client.on('replyer/test/#', function reqHandler (data, topic) {
      expect(data.device).to.equal('sensor')
      client.removeListener('replyer/test/#', reqHandler)
      client.reply(topic, { status: 'OK' })
    })

    client.request('replyer/test', { device: 'sensor' }, function response (err, answer) {
      if (err) throw err
      expect(answer.status).to.equal('OK')
      done()
    })
  })
})
