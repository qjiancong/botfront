const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../app');
chai.config.includeStack = true;
const { Responses } = require('../../models/models');

before(function(done) {
    const fs = require('fs');
    const responsesFile = __dirname + '/test_data/responses.json';
    const responses = JSON.parse(fs.readFileSync(responsesFile, 'utf8'));
    Responses.insertMany(responses).then(function() {
        done();
    });
});

describe('## NLG API', () => {
    describe('# POST /project/{projectId}/nlg', function() {
        it('should find a response for utter_yes', function(done) {
            const body = {
                template: 'utter_yes',
                arguments: { language: 'en' },
                channel: 'webchat',
                tracker: {},
            };

            request(app)
                .post('/project/bf/nlg')
                .send(body)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body[0].text).to.equal('yes');
                    done();
                })
                .catch(done);
        });

        it('should return an error when language is not set', function(done) {
            const body = {
                template: 'utter_yes',
                arguments: {},
                channel: 'webchat',
                tracker: {},
            };

            request(app)
                .post('/project/bf/nlg')
                .send(body)
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .then(() => done())
                .catch(done);
        });

        it('should return an error when arguments is not set', function(done) {
            const body = {
                template: 'utter_yes',
                channel: 'webchat',
                tracker: {},
            };

            request(app)
                .post('/project/bf/nlg')
                .send(body)
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .then(() => done())
                .catch(done);
        });

        it('should return an error when template does not start with utter', function(done) {
            const body = {
                template: 'yes',
                arguments: { language: 'en' },
                channel: 'webchat',
                tracker: {},
            };

            request(app)
                .post('/project/bf/nlg')
                .send(body)
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .then(() => done())
                .catch(done);
        });
    });
});

describe('## Bot responses API', () => {
    describe('# GET /project/{projectId}/response/{name}/lang/{lang}', () => {
        it('should succeed retrieving existing key', done => {
            request(app)
                .get('/project/bf/response/name/utter_english_only/lang/en')
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body).to.deep.equal([{
                        'text': 'English only',
                    }]);
                    done();
                })
                .catch(done);
        });

        it('should return correct error when language not found', done => {
            request(app)
                .get('/project/bf/response/name/utter_english_only/lang/fr')
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.error).to.equal('not_found');
                    done();
                })
                .catch(done);
        });

        it('should only retrieve values for the given language EN', done => {
            request(app)
                .get('/project/bf/response/name/utter_english_french/lang/en')
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body).to.deep.equal([{
                        'text': 'English message',
                    }]);
                    done();
                })
                .catch(done);
        });

        it('should only retrieve values for the given language FR', done => {
            request(app)
                .get('/project/bf/response/name/utter_english_french/lang/fr')
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body).to.deep.equal([{
                        'text': 'French message',
                    }]);
                    done();
                })
                .catch(done);
        });

        it('should return not found when name does not exist', done => {
            request(app)
                .get('/project/bf/response/name/utter_does_not_exist/lang/fr')
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.error).to.equal('not_found');
                    done();
                })
                .catch(done);
        });

        it('should return not found when no templates', done => {
            request(app)
                .get('/project/bf/response/name/utter_does_not_exist/lang/fr')
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.error).to.equal('not_found');
                    done();
                })
                .catch(done);
        });

        it('should return not found when empty templates', done => {
            request(app)
                .get('/project/bf/response/name/utter_does_not_exist/lang/fr')
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.error).to.equal('not_found');
                    done();
                })
                .catch(done);
        });

        it('should return not found when receiving empty sequences', done => {
            request(app)
                .get('/project/bf/response/name/utter_empty_sequence/lang/fr')
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.error).to.equal('not_found');
                    done();
                })
                .catch(done);
        });
    });
});
