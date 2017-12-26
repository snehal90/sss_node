var mongojs = require( 'mongojs' );

exports.connectToServer = function( callback ) {
    // return mongojs( "mongodb://localhost:27017/sss_latest_16_02_17");
    return mongojs( "mongodb://heroku_783879j6:99bh0d7ck7nu239cve4k2ajffc@ds163806.mlab.com:63806/heroku_783879j6");
};